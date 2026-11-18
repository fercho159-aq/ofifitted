/**
 * Contenido del servicio de proyectos integrales (B2B).
 *
 * El sitio vende primero proyectos llave en mano —oficinas, salas de juntas,
 * lobbies y áreas comunes completas— y después la pieza suelta. Todo lo que
 * describe ese servicio vive aquí para que la home y /proyectos digan lo
 * mismo con las mismas palabras.
 *
 * Las fotos son del propio catálogo (fotos de ambiente de producto), no de
 * instalaciones terminadas: por eso los textos describen el espacio que se
 * equipa, nunca "un proyecto que hicimos para X". Cuando el cliente entregue
 * fotos reales de obra, se cambian en `image` sin tocar los componentes.
 */
import { getProductBySlug, type ProductImage } from "./catalog";

export type Space = {
  id: string;
  title: string;
  body: string;
  /** Qué incluye el equipamiento de ese espacio. Tres o cuatro piezas. */
  includes: string[];
  /** Foto: producto del catálogo y número de imagen. */
  image: { product: string; index: number };
  /** Línea del catálogo relacionada, para quien quiera ver las piezas. */
  catalogHref: string;
};

export const SPACES: Space[] = [
  {
    id: "direccion",
    title: "Oficinas gerenciales y de dirección",
    body: "Privados que comunican el nivel de la empresa: escritorio, credenza y área de visita en el mismo acabado.",
    includes: ["Escritorios directivos", "Credenzas y libreros", "Sillería ejecutiva"],
    image: { product: "centuria-directivo-2", index: 0 },
    catalogHref: "/catalogo/directivo-escritorios",
  },
  {
    id: "open-space",
    title: "Open spaces y áreas operativas",
    body: "Estaciones de trabajo modulares para equipos de 10 a cientos de personas, con cableado y privacidad resueltos.",
    includes: ["Estaciones y benching", "Mamparas y divisiones", "Sillas operativas", "Cajoneras"],
    image: { product: "caballerizas-2", index: 0 },
    catalogHref: "/catalogo/centros-de-trabajo",
  },
  {
    id: "juntas",
    title: "Salas de juntas",
    body: "Mesas a la medida de la sala, con electrificación integrada y sillería que aguanta jornadas largas.",
    includes: ["Mesas de juntas a medida", "Electrificación y conectividad", "Sillería de juntas"],
    image: { product: "mesa-de-juntas-armonia-2", index: 0 },
    catalogHref: "/catalogo/linea-prestige-2",
  },
  {
    id: "recepcion",
    title: "Lobbies y recepción",
    body: "La primera impresión de tu marca: mostradores a medida y salas de espera para alto tránsito.",
    includes: ["Recepciones a medida", "Salas de espera", "Sillones y mesas de centro"],
    image: { product: "recepcion-6-2", index: 0 },
    catalogHref: "/catalogo/recepciones",
  },
  {
    id: "colaborativas",
    title: "Zonas colaborativas y cafeterías",
    body: "Comedores, barras y áreas de descanso que la gente sí usa. Materiales para uso intensivo.",
    includes: ["Mesas altas y comedores", "Bancos y sillas de cafetería", "Mobiliario lounge"],
    image: { product: "banco-soqo-2", index: 2 },
    catalogHref: "/catalogo/linea-de-restaruante",
  },
];

export function getSpaceImage(space: Space): ProductImage | null {
  const product = getProductBySlug(space.image.product);
  return product?.images[space.image.index] ?? product?.images[0] ?? null;
}

/** Ventajas para arquitectos, interioristas, constructoras y desarrolladores. */
export const PARTNER_BENEFITS = [
  {
    title: "Cumplimiento de tiempos de obra",
    body: "Calendario de fabricación y entrega amarrado a tu programa de obra, con fechas comprometidas por partida.",
    icon: <path d="M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  },
  {
    title: "Asesoría técnica sobre planos",
    body: "Trabajamos sobre tus planos: propuesta de layout, dimensiones ajustadas y fichas técnicas para tu especificación.",
    icon: <path d="M3 3h18v18H3zM3 9h18M9 21V9" />,
  },
  {
    title: "Capacidad para volumen",
    body: "Fabricación propia para proyectos de cientos de puestos, con acabados consistentes de la primera a la última pieza.",
    icon: <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
  },
  {
    title: "Precios especiales por proyecto",
    body: "Precio de planta, sin intermediarios, con condiciones por volumen y por cartera de proyectos recurrentes.",
    icon: <path d="M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0L2 12V2h10l8.6 8.6a2 2 0 010 2.8zM7 7h.01" />,
  },
] as const;

/** Proceso llave en mano, de la primera llamada a la entrega. */
export const PROJECT_STEPS = [
  {
    step: "01",
    title: "Diagnóstico y levantamiento",
    body: "Revisamos planos, croquis o fotos con medidas, número de puestos y uso de cada área.",
  },
  {
    step: "02",
    title: "Propuesta técnica y layout",
    body: "Distribución, selección de mobiliario y acabados, con cotización desglosada por partida.",
  },
  {
    step: "03",
    title: "Ajustes y aprobación",
    body: "Iteramos medidas, líneas o cantidades hasta que la propuesta cuadre con el presupuesto.",
  },
  {
    step: "04",
    title: "Fabricación en planta",
    body: "Producción propia con fecha comprometida y seguimiento del avance.",
  },
  {
    step: "05",
    title: "Entrega e instalación",
    body: "Logística coordinada con tu obra y armado en sitio. Una sola entrega, un solo responsable.",
  },
] as const;

/**
 * Videos ilustrativos de espacios, generados con IA.
 *
 * NO son instalaciones de Ofifitted ni muebles exactos del catálogo: la
 * sección que los muestra lo dice en pantalla. Cuando haya video real de
 * obra, se agrega aquí sin esa etiqueta (`illustrative: false`).
 *
 * Verticales 540×960, H.264 sin audio, ~0.5 MB cada uno, en public/videos.
 */
export const SPACE_VIDEOS = [
  { slug: "direccion", title: "Oficina de dirección", href: "/catalogo/directivo-escritorios" },
  { slug: "open-space", title: "Open space operativo", href: "/catalogo/centros-de-trabajo" },
  { slug: "benching", title: "Estaciones de trabajo", href: "/catalogo/centros-de-trabajo" },
  { slug: "cajoneras", title: "Cajoneras móviles", href: "/catalogo/cajoneras" },
  { slug: "gabinetes", title: "Guardado y archivo", href: "/catalogo/muebles-metalicos" },
  { slug: "lockers-industriales", title: "Lockers para personal", href: "/catalogo/lockers" },
  { slug: "lockers-color", title: "Lockers en color", href: "/catalogo/lockers" },
].map((video) => ({
  ...video,
  src: `/videos/${video.slug}.mp4`,
  poster: `/videos/${video.slug}.webp`,
  illustrative: true,
}));
