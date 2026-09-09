/**
 * Importa los catálogos PDF del sitio actual.
 *
 * Copia cada PDF a public/catalogos/ y convierte a WebP la portada que
 * WordPress ya había generado, escribiendo src/data/catalogs.json.
 *
 * Los PDF se copian tal cual: comprimirlos es trabajo de preprensa, no de
 * este script, y recomprimir un catálogo de producto degrada justo lo que
 * el cliente quiere enseñar. El script avisa cuáles pasan de 10 MB para que
 * se manden a optimizar.
 *
 *   node scripts/import-catalogs.mjs
 */
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const UPLOADS = path.resolve(
  ROOT,
  "../u238895611.ofifitted-com.20260908234358/domains/ofifitted.com/public_html/wp-content/uploads"
);
const OUT_PDF = path.join(ROOT, "public/catalogos");
const OUT_JSON = path.join(ROOT, "src/data/catalogs.json");

/** Umbral a partir del cual conviene optimizar antes de publicar. */
const HEAVY_MB = 10;

/**
 * Los títulos del origen vienen en mayúsculas y con guiones. Aquí se les da
 * el nombre con el que se van a presentar, y se agrupan por tema.
 */
const CATALOGS = [
  {
    slug: "general-2022",
    title: "Catálogo general",
    summary: "La línea completa: escritorios, sillería, recepciones y archivo.",
    file: "2022/05/OFFIHO-Catálogo-2022.pdf",
    cover: "2022/05/OFFIHO-Catálogo-2022-pdf.jpg",
    featured: true,
  },
  {
    slug: "distribuidores",
    title: "Catálogo para distribuidores",
    summary: "Condiciones y línea disponible para reventa y proyectos.",
    file: "2022/06/CATALOGODISTRIBUIDORES_OFIFITTED.pdf",
    cover: "2022/06/CATALOGODISTRIBUIDORES_OFIFITTED-pdf.jpg",
  },
  {
    slug: "sillas-versa",
    title: "Sillas de oficina · Versa",
    summary: "Sillería operativa y ejecutiva de la línea Versa.",
    file: "2022/05/SILLAS-DE-OFICINA-VERSA-OFIFITTED.pdf",
    cover: "2022/05/SILLAS-DE-OFICINA-VERSA-OFIFITTED-pdf.jpg",
  },
  {
    slug: "sillones",
    title: "Sillones",
    summary: "Sillones directivos, ejecutivos y de sala de espera.",
    file: "2022/06/CATALOGO-SILLONES-REQ-1.pdf",
    cover: "2022/06/CATALOGO-SILLONES-REQ-1-pdf.jpg",
  },
  {
    slug: "muebles-metalicos",
    title: "Muebles metálicos",
    summary: "Lockers, archiveros, anaqueles y guardado en lámina.",
    file: "2022/06/CATALOGO-PO3-MUEBLES-METALICOS-OFIFITTED-2018.pdf",
    cover: "2022/06/CATALOGO-PO3-MUEBLES-METALICOS-OFIFITTED-2018-pdf.jpg",
  },
  {
    slug: "linea-wood",
    title: "Línea Wood",
    summary: "Acabados en madera para dirección y salas de junta.",
    file: "2022/05/CATALOGO-WOOD.pdf",
    cover: "2022/05/CATALOGO-WOOD-pdf.jpg",
  },
  {
    slug: "linea-9",
    title: "Línea 9",
    summary: "Estaciones y centros de trabajo modulares.",
    file: "2022/05/OFIFITTED-Linea-9-SP.pdf",
    cover: "2022/05/OFIFITTED-Linea-9-SP-pdf.jpg",
  },
  {
    slug: "gcm-2022",
    title: "Línea GCM",
    summary: "Mobiliario ejecutivo y de dirección.",
    file: "2022/06/CATALOGO-PO1-OFI-FITTED-GCM-2022.pdf",
    cover: "2022/06/CATALOGO-PO1-OFI-FITTED-GCM-2022-pdf.jpg",
  },
  {
    slug: "vandsk",
    title: "Vandsk",
    summary: "Colección de diseño escandinavo para oficina.",
    file: "2022/06/CATALOGO-VANDSK.pdf",
    cover: "2022/06/CATALOGO-VANDSK-pdf.jpg",
  },
  {
    slug: "sivant",
    title: "Sivant",
    summary: "Sillería de visita y colectiva.",
    file: "2022/06/Sivant_Catalogo_2021.pdf",
    cover: "2022/06/Sivant_Catalogo_2021-pdf.jpg",
  },
  {
    slug: "divetro",
    title: "Divetro",
    summary: "Mamparas y divisiones de cristal.",
    file: "2022/06/DIVETRO.pdf",
    cover: "2022/06/DIVETRO-pdf.jpg",
  },
];

async function readLongPath(absPath) {
  try {
    return await fs.readFile(absPath);
  } catch (err) {
    if (process.platform !== "win32") throw err;
    return fs.readFile(`\\\\?\\${path.resolve(absPath)}`);
  }
}

/**
 * Resuelve una ruta probando las dos normalizaciones Unicode.
 *
 * Los nombres con acento del backup («OFFIHO-Catálogo-2022.pdf») pueden estar
 * en disco con la á descompuesta (NFD, a + acento combinante) mientras el
 * literal de este archivo la trae compuesta (NFC). Son cadenas distintas
 * byte a byte, así que existsSync falla con el archivo delante.
 */
function resolveVariant(relative) {
  for (const form of ["NFC", "NFD"]) {
    const candidate = path.join(UPLOADS, relative.normalize(form));
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

async function main() {
  await fs.mkdir(OUT_PDF, { recursive: true });

  const out = [];
  const heavy = [];
  const missing = [];
  let total = 0;

  for (const entry of CATALOGS) {
    const pdfSrc = resolveVariant(entry.file);
    if (!pdfSrc) {
      missing.push(entry.file);
      continue;
    }

    const pdfDest = path.join(OUT_PDF, `${entry.slug}.pdf`);
    await fs.copyFile(pdfSrc, pdfDest);
    const { size } = await fs.stat(pdfDest);
    total += size;
    if (size > HEAVY_MB * 1048576) {
      heavy.push({ slug: entry.slug, mb: size / 1048576 });
    }

    // Portada
    let cover = null;
    const coverSrc = resolveVariant(entry.cover);
    if (coverSrc) {
      const buf = await sharp(await readLongPath(coverSrc))
        .resize({ width: 800, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      const coverRel = `catalogos/${entry.slug}.webp`;
      await fs.writeFile(path.join(ROOT, "public", coverRel), buf);
      const meta = await sharp(buf).metadata();
      const tiny = await sharp(buf).resize(16).webp({ quality: 40 }).toBuffer();
      cover = {
        src: `/${coverRel}`,
        width: meta.width,
        height: meta.height,
        blurDataURL: `data:image/webp;base64,${tiny.toString("base64")}`,
      };
    }

    out.push({
      slug: entry.slug,
      title: entry.title,
      summary: entry.summary,
      pdf: `/catalogos/${entry.slug}.pdf`,
      sizeBytes: size,
      featured: Boolean(entry.featured),
      cover,
    });
  }

  await fs.writeFile(OUT_JSON, JSON.stringify(out, null, 2), "utf8");

  const mb = (b) => (b / 1048576).toFixed(1);
  console.log(`Importados ${out.length} catálogos · ${mb(total)} MB en total`);
  if (missing.length) {
    console.log(`\nNo encontrados en el backup:`);
    for (const f of missing) console.log(`  ${f}`);
  }
  if (heavy.length) {
    console.log(`\nPesan más de ${HEAVY_MB} MB — mandar a optimizar antes de publicar:`);
    for (const h of heavy) console.log(`  ${h.slug}  ${h.mb.toFixed(1)} MB`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
