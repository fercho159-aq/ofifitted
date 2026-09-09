/**
 * Importa las imágenes del catálogo desde el backup de WordPress.
 *
 * Lee src/data/catalog.raw.json (extraído del dump), convierte cada imagen a
 * WebP con un ancho máximo razonable y escribe:
 *   - public/products/<slug>/<n>.webp
 *   - src/data/catalog.json   (mismo catálogo, con rutas web + placeholders)
 *
 * Es idempotente: si el .webp ya existe con el mismo mtime de origen, lo salta.
 *
 *   node scripts/import-media.mjs [--limit N] [--force]
 */
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");

/** Carpeta uploads del backup de WordPress. */
const UPLOADS = path.resolve(
  ROOT,
  "../u238895611.ofifitted-com.20260908234358/domains/ofifitted.com/public_html/wp-content/uploads"
);

const RAW = path.join(ROOT, "src/data/catalog.raw.json");
const OUT_JSON = path.join(ROOT, "src/data/catalog.json");
const OUT_DIR = path.join(ROOT, "public/products");

const MAX_WIDTH = 1400;
const QUALITY = 78;
/** Cuántas imágenes de galería conservamos por producto. */
const MAX_IMAGES = 6;

const args = process.argv.slice(2);
const force = args.includes("--force");
const limitArg = args.indexOf("--limit");
const limit = limitArg >= 0 ? Number(args[limitArg + 1]) : Infinity;

/** WebP diminuto en base64 para el placeholder de next/image. */
async function blurPlaceholder(buffer) {
  const tiny = await sharp(buffer)
    .resize(16, 16, { fit: "inside" })
    .webp({ quality: 40 })
    .toBuffer();
  return `data:image/webp;base64,${tiny.toString("base64")}`;
}

/**
 * Lee un archivo tolerando rutas largas de Windows.
 *
 * Varias imágenes del backup superan el MAX_PATH de 260 caracteres; libvips
 * no las abre por ruta, así que leemos el binario nosotros —con el prefijo
 * extendido `\\?\` como respaldo— y le pasamos el buffer a sharp.
 */
async function readSource(absPath) {
  try {
    return await fs.readFile(absPath);
  } catch (err) {
    if (process.platform !== "win32") throw err;
    return fs.readFile(`\\\\?\\${path.resolve(absPath)}`);
  }
}

async function convert(srcRel, destAbs) {
  const srcAbs = path.join(UPLOADS, srcRel);

  if (!force && existsSync(destAbs)) {
    // Ya convertida: solo necesitamos las dimensiones y el placeholder.
    const buf = await fs.readFile(destAbs);
    const meta = await sharp(buf).metadata();
    return {
      width: meta.width,
      height: meta.height,
      blurDataURL: await blurPlaceholder(buf),
    };
  }

  const source = await readSource(srcAbs);
  const image = sharp(source, { failOn: "none" });
  const meta = await image.metadata();
  const width = Math.min(meta.width ?? MAX_WIDTH, MAX_WIDTH);

  const buf = await image
    .rotate() // respeta la orientación EXIF
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 4 })
    .toBuffer();

  await fs.mkdir(path.dirname(destAbs), { recursive: true });
  await fs.writeFile(destAbs, buf);

  const outMeta = await sharp(buf).metadata();
  return {
    width: outMeta.width,
    height: outMeta.height,
    blurDataURL: await blurPlaceholder(buf),
  };
}

async function main() {
  if (!existsSync(UPLOADS)) {
    console.error(`No encuentro la carpeta uploads del backup:\n  ${UPLOADS}`);
    process.exit(1);
  }

  const raw = JSON.parse(await fs.readFile(RAW, "utf8"));
  const products = raw.products.slice(0, limit);

  let converted = 0;
  let skipped = 0;
  const failed = [];
  let bytesIn = 0;
  let bytesOut = 0;

  const out = [];
  for (const [i, p] of products.entries()) {
    const images = [];
    for (const [n, rel] of p.images.slice(0, MAX_IMAGES).entries()) {
      const destRel = `products/${p.slug}/${n}.webp`;
      const destAbs = path.join(ROOT, "public", destRel);
      const srcAbs = path.join(UPLOADS, rel);

      const existedBefore = existsSync(destAbs);
      let info;
      try {
        info = await convert(rel, destAbs);
      } catch (err) {
        // Una imagen ilegible no debe tumbar la importación completa.
        failed.push({ product: p.slug, file: rel, reason: err.message });
        continue;
      }
      if (!info) continue;

      if (existedBefore && !force) {
        skipped++;
      } else {
        converted++;
        if (existsSync(srcAbs)) bytesIn += (await fs.stat(srcAbs)).size;
        bytesOut += (await fs.stat(destAbs)).size;
      }

      images.push({
        src: `/${destRel}`,
        width: info.width,
        height: info.height,
        blurDataURL: info.blurDataURL,
      });
    }

    out.push({ ...p, images });

    if ((i + 1) % 50 === 0) {
      process.stdout.write(`  ${i + 1}/${products.length} productos\n`);
    }
  }

  await fs.mkdir(path.dirname(OUT_JSON), { recursive: true });
  await fs.writeFile(
    OUT_JSON,
    JSON.stringify({ categories: raw.categories, products: out }, null, 2),
    "utf8"
  );

  const mb = (b) => (b / 1048576).toFixed(1);
  console.log(`\nListo.`);
  console.log(`  convertidas: ${converted}   ya existían: ${skipped}`);
  if (bytesIn > 0) {
    console.log(
      `  peso: ${mb(bytesIn)} MB -> ${mb(bytesOut)} MB  (${(
        (1 - bytesOut / bytesIn) *
        100
      ).toFixed(0)}% menos)`
    );
  }
  console.log(`  catálogo: ${path.relative(ROOT, OUT_JSON)}`);
  if (failed.length) {
    console.log(`
  ${failed.length} imágenes ilegibles (se omitieron):`);
    for (const f of failed.slice(0, 10)) {
      console.log(`    ${f.product} -> ${f.file}`);
    }
    if (failed.length > 10) console.log(`    ...y ${failed.length - 10} más`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
