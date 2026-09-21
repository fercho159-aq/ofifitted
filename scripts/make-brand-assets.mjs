/**
 * Genera los archivos de marca a partir del logo original de Ofifitted.
 *
 * El original (`public/brand/logo-ofifitted-badge.jpeg`) es un JPEG: trae
 * artefactos de compresión y un recuadro interior de un rojo ligeramente
 * distinto, que se nota al ampliarlo. Aquí se separa el arte blanco del fondo
 * y se vuelve a componer sobre un rojo plano, así que todo lo que publica el
 * sitio sale limpio y del mismo color.
 *
 *   node scripts/make-brand-assets.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SOURCE = path.join(ROOT, "public/brand/logo-ofifitted-badge.jpeg");

/** Rojo del logo, medido sobre el original. */
const RED = { r: 228, g: 51, b: 45 };

/** El arte es blanco sobre rojo: la opacidad sale de qué tan claro es el píxel. */
const ALPHA_FLOOR = 70;
const ALPHA_CEIL = 235;

/** Separa el arte blanco del fondo y lo recorta a su contorno. */
async function whiteArtwork() {
  const { data, info } = await sharp(SOURCE)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, o = 0; i < data.length; i += info.channels, o += 4) {
    const min = Math.min(data[i], data[i + 1], data[i + 2]);
    const alpha = Math.round(
      255 * Math.min(1, Math.max(0, (min - ALPHA_FLOOR) / (ALPHA_CEIL - ALPHA_FLOOR)))
    );
    out[o] = out[o + 1] = out[o + 2] = 255;
    out[o + 3] = alpha;
  }

  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim({ threshold: 8 })
    .png()
    .toBuffer();
}

/** Arte blanco centrado sobre el rojo del logo, en un lienzo de `w × h`. */
async function badge(art, w, h, coverage = 0.78) {
  const box = Math.round(Math.min(w, h) * coverage);
  const scaled = await sharp(art)
    .resize(box, box, { fit: "inside", withoutEnlargement: false })
    .toBuffer();

  return sharp({
    create: { width: w, height: h, channels: 4, background: { ...RED, alpha: 1 } },
  }).composite([{ input: scaled, gravity: "center" }]);
}

const art = await whiteArtwork();
const meta = await sharp(art).metadata();

const targets = [
  // Logo del header, del footer y del menú móvil.
  { file: "public/brand/logo-ofifitted.png", w: 512, h: 512, coverage: 0.9, format: "png" },
  // Ícono de la pestaña del navegador y de la pantalla de inicio en iOS.
  { file: "src/app/icon.png", w: 512, h: 512, coverage: 0.9, format: "png" },
  { file: "src/app/apple-icon.png", w: 180, h: 180, coverage: 0.88, format: "png" },
  // Imagen que se ve al compartir el sitio en WhatsApp o redes.
  { file: "public/brand/og-default.jpg", w: 1200, h: 630, coverage: 0.62, format: "jpeg" },
];

for (const t of targets) {
  const image = await badge(art, t.w, t.h, t.coverage);
  const buf =
    t.format === "jpeg"
      ? await image.jpeg({ quality: 88, chromaSubsampling: "4:4:4" }).toBuffer()
      : await image.png({ compressionLevel: 9 }).toBuffer();
  await fs.writeFile(path.join(ROOT, t.file), buf);
  console.log(`  ${t.file.padEnd(34)} ${t.w}×${t.h}  ${(buf.length / 1024).toFixed(0)} KB`);
}

// El arte suelto, en blanco y con transparencia, para fondos oscuros.
await fs.writeFile(
  path.join(ROOT, "public/brand/logo-ofifitted-blanco.png"),
  await sharp(art).resize(512, 512, { fit: "inside" }).png({ compressionLevel: 9 }).toBuffer()
);

console.log(`\nArte recortado del original: ${meta.width}×${meta.height} px`);
