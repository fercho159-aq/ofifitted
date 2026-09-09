/**
 * Normalización de la taxonomía heredada de WordPress y definición del
 * mega menú.
 *
 * El catálogo real trae nombres inconsistentes (mayúsculas sueltas, un typo,
 * dos categorías llamadas igual bajo padres distintos y dos "LINEA PRESTIGE"
 * duplicadas). En vez de tocar los datos de origen —que siguen viviendo en
 * WordPress mientras dure la migración— los corregimos aquí, en un solo
 * lugar y de forma reversible.
 */

/** Slug de categoría -> nombre a mostrar. Solo los que hay que corregir. */
const DISPLAY_NAME_OVERRIDES: Record<string, string> = {
  "linea-de-restaruante": "Línea Restaurante", // typo en el origen
  "interiorismo-otros-muebles": "Interiorismo",
  "linea-prestige-2": "Línea Prestige",
  "linea-prestige": "Línea Prestige",
  "linea-miami": "Línea Miami",
  fitness: "Fitness",
  gondola: "Góndola",
  "ejecutivo-sillas": "Ejecutivas",
  operativas: "Operativas",
  "de-visita": "De visita",
  directivo: "Directivas",
  "directivo-escritorios": "Directivos",
  directivos: "Directivos",
  ejecutivos: "Ejecutivos",
  ejecutivo: "Ejecutivos",
  "caja-fuerte": "Cajas fuertes",
  "linea-escolar": "Línea Escolar",
  "mesas-de-trabajo": "Mesas de trabajo",
  "muebles-en-general": "Muebles en general",
  "muebles-metalicos": "Muebles metálicos",
  "otros-muebles": "Otros muebles",
  "centros-de-trabajo": "Centros de trabajo",
  "sala-de-espera": "Sala de espera",
};

export function displayName(slug: string, fallback: string): string {
  return DISPLAY_NAME_OVERRIDES[slug] ?? fallback;
}

/**
 * Categorías que no deben aparecer en navegación: quedaron vacías en el
 * origen. Si el cliente les carga producto, se quitan de esta lista.
 */
export const HIDDEN_CATEGORY_SLUGS = new Set(["linea-prestige", "linea-miami"]);

/* ────────────────────────────────────────────────────────────────────
   Mega menú

   La jerarquía real de WordPress no sirve tal cual para navegar: "Otros
   muebles" no le dice nada a nadie y el archivado está repartido entre tres
   ramas. Aquí se reagrupa por intención de compra, sin perder ninguna
   categoría del catálogo.
   ──────────────────────────────────────────────────────────────────── */

export type MegaColumn = {
  /** Título de la columna dentro del panel. */
  title: string;
  /** Slug de la categoría a la que apunta el título, si aplica. */
  href?: string;
  items: { label: string; slug: string }[];
};

export type MegaGroup = {
  /** Etiqueta en la barra de navegación. */
  label: string;
  /** Ruta del listado completo del grupo. */
  href: string;
  /** Frase corta que encabeza el panel: es espacio de venta, no decoración. */
  blurb: string;
  columns: MegaColumn[];
  /** Producto destacado del panel, resuelto por slug al renderizar. */
  featuredCategorySlug: string;
};

export const megaMenu: MegaGroup[] = [
  {
    label: "Sillas",
    href: "/catalogo/sillas",
    blurb:
      "361 modelos. De la operativa de uso diario a la directiva de piel. Todas se pueden tapizar en el color de tu marca.",
    featuredCategorySlug: "ejecutivo-sillas",
    columns: [
      {
        title: "Por puesto",
        items: [
          { label: "Directivas", slug: "directivo" },
          { label: "Ejecutivas", slug: "ejecutivo-sillas" },
          { label: "Operativas", slug: "operativas" },
          { label: "De visita", slug: "de-visita" },
        ],
      },
      {
        title: "Por espacio",
        items: [
          { label: "Línea Restaurante", slug: "linea-de-restaruante" },
          { label: "Línea Escolar", slug: "linea-escolar" },
          { label: "Industriales", slug: "industriales" },
          { label: "Interiorismo", slug: "interiorismo" },
        ],
      },
    ],
  },
  {
    label: "Escritorios",
    href: "/catalogo/escritorios",
    blurb:
      "Escritorios y estaciones fabricados a la medida de tu planta. Mándanos el plano y te devolvemos la distribución.",
    featuredCategorySlug: "directivo-escritorios",
    columns: [
      {
        title: "Escritorios",
        href: "escritorios",
        items: [
          { label: "Directivos", slug: "directivo-escritorios" },
          { label: "Ejecutivos", slug: "ejecutivo" },
          { label: "Mesas de trabajo", slug: "mesas-de-trabajo" },
        ],
      },
      {
        title: "Espacio de trabajo",
        items: [
          { label: "Centros de trabajo", slug: "centros-de-trabajo" },
          { label: "Línea Prestige", slug: "linea-prestige-2" },
        ],
      },
    ],
  },
  {
    label: "Recepción y espera",
    href: "/catalogo/recepciones",
    blurb:
      "Lo primero que ve tu cliente. Recepciones a medida y salas de espera que aguantan uso rudo.",
    featuredCategorySlug: "recepciones",
    columns: [
      {
        title: "Recepción",
        items: [{ label: "Recepciones", slug: "recepciones" }],
      },
      {
        title: "Sillones",
        href: "sillones",
        items: [
          { label: "Sala de espera", slug: "sala-de-espera" },
          { label: "Directivos", slug: "directivos" },
          { label: "Ejecutivos", slug: "ejecutivos" },
        ],
      },
    ],
  },
  {
    label: "Almacenamiento",
    href: "/catalogo/muebles-metalicos",
    blurb:
      "Archivo, resguardo y guardado. Lámina calibre comercial con acabado electrostático.",
    featuredCategorySlug: "lockers",
    columns: [
      {
        title: "Metálicos",
        href: "muebles-metalicos",
        items: [
          { label: "Lockers", slug: "lockers" },
          { label: "Archiveros", slug: "archiveros" },
          { label: "Cajas fuertes", slug: "caja-fuerte" },
        ],
      },
      {
        title: "Complementos",
        href: "otros-muebles",
        items: [
          { label: "Libreros", slug: "libreros" },
          { label: "Credenzas", slug: "credenza" },
          { label: "Cajoneras", slug: "cajoneras" },
          { label: "Muebles en general", slug: "muebles-en-general" },
        ],
      },
    ],
  },
  {
    label: "Líneas especiales",
    href: "/catalogo",
    blurb:
      "Proyectos que salen del mobiliario de oficina: gimnasios corporativos, punto de venta e interiorismo completo.",
    featuredCategorySlug: "interiorismo-otros-muebles",
    columns: [
      {
        title: "Líneas",
        items: [
          { label: "Interiorismo", slug: "interiorismo-otros-muebles" },
          { label: "Fitness", slug: "fitness" },
          { label: "Góndola", slug: "gondola" },
        ],
      },
    ],
  },
];

/** Enlaces sueltos de la barra, a la derecha del mega menú. */
export const navLinks = [
  { label: "Catálogos", href: "/catalogos" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Contacto", href: "/contacto" },
] as const;
