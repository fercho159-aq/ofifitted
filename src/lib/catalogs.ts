import catalogsData from "@/data/catalogs.json";

export type CatalogPdf = {
  slug: string;
  title: string;
  summary: string;
  pdf: string;
  sizeBytes: number;
  featured: boolean;
  cover: {
    src: string;
    width: number;
    height: number;
    blurDataURL: string;
  } | null;
};

const catalogs = catalogsData as CatalogPdf[];

/** El general primero; el resto en el orden en que se importaron. */
export function getCatalogs(): CatalogPdf[] {
  return [...catalogs].sort(
    (a, b) => Number(b.featured) - Number(a.featured)
  );
}

/** Peso legible, para avisarle a quien está en datos móviles. */
export function formatSize(bytes: number): string {
  const mb = bytes / 1048576;
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}
