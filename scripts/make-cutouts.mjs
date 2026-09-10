/**
 * Recorta los productos de su fondo blanco para el visualizador "Pruébalo en
 * tu oficina".
 *
 * El visualizador pega el mueble sobre la foto que sube el cliente, así que
 * necesita una imagen con transparencia. Las fotos del catálogo son de estudio
 * sobre blanco en su mayoría; este script separa el fondo y guarda:
 *
 *   public/products/<slug>/cutout.webp   (WebP con canal alfa)
 *   src/data/cutouts.json                (qué productos tienen recorte)
 *
 * Trabaja sobre las imágenes ya importadas en public/products, no sobre el
 * backup: se puede correr en cualquier máquina.
 *
 *   node scripts/make-cutouts.mjs [--force] [--only <slug>]
 *
 * Cómo decide el fondo
 * ────────────────────
 * 1. Solo intenta con fotos cuyo borde es casi todo blanco. Una foto de
 *    ambiente —una oficina completa— no tiene un "fondo" que quitar, y se salta.
 * 2. Rellena desde los bordes hacia dentro por píxeles claros y sin color. Así
 *    el blanco que forma parte del mueble, si no toca el borde, se conserva.
 * 3. No corta en seco: los grises muy claros —la sombra suave que el estudio
 *    deja bajo el mueble— quedan semitransparentes y se les quita el blanco
 *    mezclado. Sobre la foto del cliente, eso se lee como una sombra real.
 * 4. Recorta al contorno del mueble y descarta el resultado si quedó casi vacío,
 *    que es lo que pasa cuando el mueble es blanco sobre fondo blanco.
 */
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const CATALOG = path.join(ROOT, "src/data/catalog.json");
const OUT_JSON = path.join(ROOT, "src/data/cutouts.json");

/** Fracción mínima del borde que debe ser blanca para intentar el recorte. */
const MIN_WHITE_BORDER = 0.9;
/** Un píxel es candidato a fondo si su canal más oscuro pasa de aquí… */
const BG_MIN = 205;
/** …y si casi no tiene color (diferencia entre canales). */
const BG_MAX_CHROMA = 22;
/** A partir de este valor el fondo es totalmente transparente. */
const FULLY_CLEAR = 240;
/** Opacidad máxima de la sombra (la zona más oscura que todavía es fondo). */
const MAX_SHADOW = 0.5;
/** El mueble debe ocupar al menos esta parte de su propio recuadro. */
const MIN_FILL = 0.08;
/** Y el recuadro, al menos esta parte de la imagen. */
const MIN_BOX = 0.04;
/** Tamaño mínimo de una bolsa encerrada, como fracción de la imagen. */
const MIN_POCKET = 0.0012;
/** Cuánto más oscura que el fondo real puede ser una bolsa y seguir siéndolo. */
const POCKET_TONE_MARGIN = 10;

/**
 * Productos a los que no se les ofrece el visualizador aunque el recorte pase
 * los filtros. El punto débil conocido son los muebles blancos o gris claro
 * sobre fondo blanco: el relleno se come parte de sus caras. Si al revisar el
 * sitio uno se ve mal, su slug va aquí y se vuelve a correr el script.
 */
const EXCLUDE_SLUGS = new Set([
  // "cajonera-fija-de-1-cajon-papelero-y-un-cajon-archivero-2",
]);

const args = process.argv.slice(2);
const force = args.includes("--force");
const onlyIdx = args.indexOf("--only");
const only = onlyIdx >= 0 ? args[onlyIdx + 1] : null;

function isBackground(r, g, b) {
  const lo = Math.min(r, g, b);
  const hi = Math.max(r, g, b);
  return lo >= BG_MIN && hi - lo <= BG_MAX_CHROMA;
}

function whiteBorderRatio(data, w, h) {
  let total = 0;
  let white = 0;
  const check = (x, y) => {
    const i = (y * w + x) * 4;
    total++;
    if (data[i] > 232 && data[i + 1] > 232 && data[i + 2] > 232) white++;
  };
  for (let x = 0; x < w; x++) {
    check(x, 0);
    check(x, h - 1);
  }
  for (let y = 1; y < h - 1; y++) {
    check(0, y);
    check(w - 1, y);
  }
  return white / total;
}

/**
 * Relleno desde los bordes. Devuelve una máscara: 1 = fondo alcanzable.
 * Iterativo con pila explícita: una recursión reventaría con 1.4 M de píxeles.
 */
function floodBackground(data, w, h) {
  const mask = new Uint8Array(w * h);
  const stack = new Int32Array(w * h);
  let top = 0;

  const seed = (x, y) => {
    const p = y * w + x;
    if (mask[p]) return;
    const i = p * 4;
    if (!isBackground(data[i], data[i + 1], data[i + 2])) return;
    mask[p] = 1;
    stack[top++] = p;
  };

  for (let x = 0; x < w; x++) {
    seed(x, 0);
    seed(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    seed(0, y);
    seed(w - 1, y);
  }

  while (top > 0) {
    const p = stack[--top];
    const x = p % w;
    const y = (p - x) / w;
    if (x > 0) seed(x - 1, y);
    if (x < w - 1) seed(x + 1, y);
    if (y > 0) seed(x, y - 1);
    if (y < h - 1) seed(x, y + 1);
  }
  return mask;
}

/**
 * Segunda pasada: bolsas de fondo encerradas por el propio mueble.
 *
 * El relleno desde el borde no alcanza el blanco que queda dentro de una pata
 * en A, entre una cruceta y la cubierta, o en el respaldo calado de una silla:
 * esas zonas están cerradas por todos lados. Se buscan componentes conexos
 * que pasen el mismo criterio de fondo y cuyo tono medio coincida con el del
 * fondo real.
 *
 * El tamaño mínimo protege los brillos del cromo y de la melamina, que también
 * son blanco puro pero ocupan pocos píxeles; sin ese piso, las bases cromadas
 * saldrían perforadas.
 */
function clearEnclosedPockets(data, mask, w, h) {
  // Tono de referencia: el fondo limpio que ya alcanzó el relleno.
  let refSum = 0;
  let refCount = 0;
  for (let p = 0; p < mask.length; p++) {
    if (!mask[p]) continue;
    const i = p * 4;
    const lo = Math.min(data[i], data[i + 1], data[i + 2]);
    if (lo >= 240) {
      refSum += lo;
      refCount++;
    }
  }
  if (refCount === 0) return 0;
  const reference = refSum / refCount;
  const minArea = Math.max(60, Math.round(w * h * MIN_POCKET));

  const seen = new Uint8Array(w * h);
  const stack = new Int32Array(w * h);
  const component = new Int32Array(w * h);
  let cleared = 0;

  for (let start = 0; start < mask.length; start++) {
    if (mask[start] || seen[start]) continue;
    const si = start * 4;
    if (!isBackground(data[si], data[si + 1], data[si + 2])) continue;

    // Recorre la bolsa completa.
    let top = 0;
    let size = 0;
    let toneSum = 0;
    seen[start] = 1;
    stack[top++] = start;

    while (top > 0) {
      const p = stack[--top];
      component[size++] = p;
      const i = p * 4;
      toneSum += Math.min(data[i], data[i + 1], data[i + 2]);

      const x = p % w;
      const y = (p - x) / w;
      const neighbours = [
        x > 0 ? p - 1 : -1,
        x < w - 1 ? p + 1 : -1,
        y > 0 ? p - w : -1,
        y < h - 1 ? p + w : -1,
      ];
      for (const q of neighbours) {
        if (q < 0 || seen[q] || mask[q]) continue;
        const qi = q * 4;
        if (!isBackground(data[qi], data[qi + 1], data[qi + 2])) continue;
        seen[q] = 1;
        stack[top++] = q;
      }
    }

    if (size >= minArea && toneSum / size >= reference - POCKET_TONE_MARGIN) {
      for (let k = 0; k < size; k++) mask[component[k]] = 1;
      cleared += size;
    }
  }
  return cleared;
}

/**
 * Convierte el fondo en transparencia.
 *
 * El blanco del fondo desaparece. Los grises claros —la sombra suave que el
 * estudio deja bajo el mueble— se convierten en **negro semitransparente**, con
 * más opacidad cuanto más oscuros eran.
 *
 * Primera versión: se conservaba el tono gris de la sombra quitándole el blanco
 * mezclado. Sobre fondo claro se veía bien, pero un gris claro semitransparente
 * *aclara* un piso de madera o una alfombra oscura, y la sombra quedaba como
 * una mancha lechosa. Una sombra real solo puede oscurecer lo que tiene debajo:
 * negro con alfa hace exactamente eso sobre cualquier piso.
 */
function applyAlpha(data, mask) {
  const span = FULLY_CLEAR - BG_MIN;
  for (let p = 0; p < mask.length; p++) {
    if (!mask[p]) continue;
    const i = p * 4;
    const lo = Math.min(data[i], data[i + 1], data[i + 2]);
    // 0 en FULLY_CLEAR (fondo limpio), 1 en BG_MIN (lo más oscuro que aún es fondo)
    const t = Math.max(0, Math.min(1, (FULLY_CLEAR - lo) / span));
    const alpha = MAX_SHADOW * t;
    if (alpha < 0.02) {
      data[i + 3] = 0;
      continue;
    }
    data[i] = 0;
    data[i + 1] = 0;
    data[i + 2] = 0;
    data[i + 3] = Math.round(alpha * 255);
  }
}

function opaqueBox(data, w, h) {
  let x0 = w;
  let y0 = h;
  let x1 = -1;
  let y1 = -1;
  let solid = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = data[(y * w + x) * 4 + 3];
      if (a > 12) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
      if (a > 200) solid++;
    }
  }
  if (x1 < 0) return null;
  return { x0, y0, x1, y1, solid };
}

async function cutout(srcAbs) {
  const { data, info } = await sharp(srcAbs)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;

  if (whiteBorderRatio(data, w, h) < MIN_WHITE_BORDER) {
    return { ok: false, reason: "foto de ambiente" };
  }

  const mask = floodBackground(data, w, h);
  clearEnclosedPockets(data, mask, w, h);
  applyAlpha(data, mask);

  const box = opaqueBox(data, w, h);
  if (!box) return { ok: false, reason: "quedó vacía" };

  const pad = 4;
  const left = Math.max(0, box.x0 - pad);
  const top = Math.max(0, box.y0 - pad);
  const right = Math.min(w - 1, box.x1 + pad);
  const bottom = Math.min(h - 1, box.y1 + pad);
  const bw = right - left + 1;
  const bh = bottom - top + 1;

  if ((bw * bh) / (w * h) < MIN_BOX || box.solid / (bw * bh) < MIN_FILL) {
    return { ok: false, reason: "mueble claro sobre fondo claro" };
  }

  const buffer = await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .extract({ left, top, width: bw, height: bh })
    .webp({ quality: 82, alphaQuality: 90, effort: 4 })
    .toBuffer();

  return { ok: true, buffer, width: bw, height: bh };
}

async function main() {
  const catalog = JSON.parse(await fs.readFile(CATALOG, "utf8"));
  const previous = existsSync(OUT_JSON)
    ? JSON.parse(await fs.readFile(OUT_JSON, "utf8"))
    : {};

  const result = only ? { ...previous } : {};
  const skipped = {};
  let made = 0;
  let reused = 0;

  const products = catalog.products.filter(
    (p) => p.images.length > 0 && (!only || p.slug === only)
  );

  // Los excluidos pierden su recorte aunque existiera de una corrida anterior.
  for (const slug of EXCLUDE_SLUGS) {
    delete result[slug];
    const f = path.join(ROOT, "public/products", slug, "cutout.webp");
    if (existsSync(f)) await fs.rm(f);
  }

  for (const [n, product] of products.entries()) {
    if (EXCLUDE_SLUGS.has(product.slug)) {
      skipped["excluido a mano"] = (skipped["excluido a mano"] ?? 0) + 1;
      continue;
    }
    const destRel = `products/${product.slug}/cutout.webp`;
    const destAbs = path.join(ROOT, "public", destRel);

    if (!force && previous[product.slug] && existsSync(destAbs)) {
      result[product.slug] = previous[product.slug];
      reused++;
      continue;
    }

    // Prueba las fotos en orden: a veces la principal es de ambiente y una de
    // la galería es de estudio.
    let lastReason = "sin imágenes";
    for (const [index, image] of product.images.entries()) {
      const srcAbs = path.join(ROOT, "public", image.src);
      if (!existsSync(srcAbs)) continue;

      const out = await cutout(srcAbs);
      if (!out.ok) {
        lastReason = out.reason;
        continue;
      }
      await fs.writeFile(destAbs, out.buffer);
      result[product.slug] = {
        src: `/${destRel}`,
        width: out.width,
        height: out.height,
        fromImage: index,
      };
      made++;
      break;
    }

    if (!result[product.slug]) {
      skipped[lastReason] = (skipped[lastReason] ?? 0) + 1;
      if (existsSync(destAbs)) await fs.rm(destAbs);
    }

    if ((n + 1) % 100 === 0) {
      process.stdout.write(`  ${n + 1}/${products.length}\n`);
    }
  }

  await fs.writeFile(OUT_JSON, JSON.stringify(result, null, 2), "utf8");

  const total = Object.keys(result).length;
  console.log(`\nRecortes: ${total} de ${catalog.products.filter((p) => p.images.length).length} productos`);
  console.log(`  nuevos: ${made}   reutilizados: ${reused}`);
  if (Object.keys(skipped).length) {
    console.log(`  sin recorte:`);
    for (const [reason, count] of Object.entries(skipped)) {
      console.log(`    ${count}  ${reason}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
