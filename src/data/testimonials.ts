/**
 * Testimonios y prueba social.
 *
 * ⚠️ TODO EL CONTENIDO DE ESTE ARCHIVO ES DE MUESTRA.
 *
 * Está aquí para poder diseñar y revisar la sección con textos de longitud
 * realista, no para publicarse. Son personas y empresas que no existen:
 * publicarlas como reseñas reales sería publicidad engañosa —en México,
 * artículo 32 de la Ley Federal de Protección al Consumidor— y además
 * cualquiera que llame a "verificar" al cliente descubre el invento.
 *
 * Por eso `placeholder: true` en cada entrada y por eso `getTestimonials()`
 * los oculta en producción salvo que se pida explícitamente. Para publicar:
 * sustituir por testimonios reales y quitar la bandera.
 *
 * Lo que hay que pedirle a Ofifitted:
 *   · Testimonio con nombre, puesto y empresa de quien lo da.
 *   · Autorización por escrito para usar nombre y logo.
 *   · Fotos de la instalación terminada (venden más que el texto).
 *   · Si tienen reseñas en Google Business, conviene leerlas por API en vez
 *     de transcribirlas: se actualizan solas y son verificables.
 */

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  /** Qué se les fabricó. Ancla el testimonio en algo concreto. */
  project: string;
  /** true = contenido de muestra, no publicable. */
  placeholder: boolean;
};

export const testimonials: Testimonial[] = [
  {
    id: "muestra-1",
    quote:
      "Nos entregaron 40 estaciones de trabajo en tres semanas y todas entraron al milímetro en el plano que les mandamos. El proveedor anterior nos había dado ocho semanas y medidas estándar que no cuadraban con las columnas del piso.",
    author: "Nombre de muestra",
    role: "Coordinación de Servicios Generales",
    company: "Empresa de muestra",
    project: "40 estaciones de trabajo · Santa Fe, CDMX",
    placeholder: true,
  },
  {
    id: "muestra-2",
    quote:
      "Lo que nos convenció fue que son la fábrica. Pedimos el tapiz en el color exacto de nuestra marca y no fue un extra ni un problema, fue simplemente cómo lo hacen.",
    author: "Nombre de muestra",
    role: "Dirección de Operaciones",
    company: "Empresa de muestra",
    project: "Recepción y sala de espera · Monterrey",
    placeholder: true,
  },
  {
    id: "muestra-3",
    quote:
      "Compramos 120 sillas operativas hace tres años y seguimos sin reemplazar una sola. Antes cambiábamos lote completo cada dos años y ya lo teníamos presupuestado como gasto recurrente.",
    author: "Nombre de muestra",
    role: "Compras",
    company: "Empresa de muestra",
    project: "120 sillas operativas · Tlalnepantla",
    placeholder: true,
  },
];

/**
 * Cifras de la empresa.
 *
 * ⚠️ También de muestra, con la misma regla: son afirmaciones sobre una
 * empresa real y no se publican sin que Ofifitted las confirme por escrito.
 * Las cifras verificables que sí se están usando hoy —número de modelos,
 * líneas de producto— salen del catálogo, no de aquí.
 */
export type Figure = {
  value: string;
  label: string;
  placeholder: boolean;
};

export const figures: Figure[] = [
  { value: "—", label: "Años fabricando", placeholder: true },
  { value: "—", label: "Oficinas equipadas", placeholder: true },
  { value: "—", label: "m² de planta", placeholder: true },
  { value: "—", label: "Estados con entrega", placeholder: true },
];

/**
 * En desarrollo se ve todo, para poder diseñar. En producción, el contenido
 * de muestra no se renderiza salvo que alguien active la bandera a propósito
 * para enseñar un preview al cliente.
 */
export const SHOW_PLACEHOLDER_CONTENT =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_SHOW_PLACEHOLDER_CONTENT === "1";

export function getTestimonials(): Testimonial[] {
  if (SHOW_PLACEHOLDER_CONTENT) return testimonials;
  return testimonials.filter((t) => !t.placeholder);
}

export function getFigures(): Figure[] {
  if (SHOW_PLACEHOLDER_CONTENT) return figures;
  return figures.filter((f) => !f.placeholder);
}
