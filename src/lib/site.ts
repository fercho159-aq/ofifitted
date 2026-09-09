/**
 * Datos de la empresa. Todo lo que aparece más de una vez en el sitio
 * (teléfonos, direcciones, WhatsApp) vive aquí y en ningún otro lado.
 *
 * Los datos vienen del sitio actual de ofifitted.com. Los marcados con
 * TODO están pendientes de confirmar con el cliente.
 */

export const site = {
  name: "Ofifitted",
  legalName: "Ofifitted",
  tagline: "Fabricantes de mobiliario para oficina",
  description:
    "Fabricamos muebles de oficina sobre medida: escritorios, sillas ejecutivas, recepciones y centros de trabajo. Envíos a toda la República Mexicana.",
  url: "https://ofifitted.com",
  locale: "es-MX",
} as const;

/** Número de WhatsApp en formato internacional, sin signos. */
export const WHATSAPP_NUMBER = "5215634439123";

export const contact = {
  phones: [
    { label: "CDMX", value: "56 3443 9123", tel: "+525634439123" },
    { label: "CDMX", value: "55 2842 5662", tel: "+525528425662" },
  ],
  office: [
    { label: "Oficina", value: "71 59 51 08", tel: "+525571595108" },
    { label: "Oficina", value: "71 59 51 11", tel: "+525571595111" },
  ],
  locations: [
    {
      kind: "Fábrica",
      address:
        "Cda. de Adolfo López Mateos 13, col. Bosques de México, Estado de México",
    },
    {
      kind: "Showroom",
      address:
        "Plaza Maya, De Los Maestros 7, Leandro Valle, 54040 Tlalnepantla de Baz, Méx.",
    },
  ],
  // TODO(cliente): confirmar correo de contacto público. El de WordPress es
  // una cuenta de la agencia, no sirve para publicarlo.
  email: null as string | null,
  hours: "Lunes a viernes de 9:00 a 18:00 h · Sábado de 10:00 a 14:00 h",
} as const;

/**
 * Construye el enlace de WhatsApp con el mensaje ya escrito.
 * Un mensaje prellenado sube muchísimo la tasa de respuesta: el cliente
 * solo presiona enviar, y el vendedor recibe el contexto en el primer turno.
 */
export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

/** Mensajes prellenados por contexto. */
export const waMessages = {
  general: "Hola Ofifitted, quiero información sobre sus muebles de oficina.",
  quote: (productTitle: string) =>
    `Hola Ofifitted, me interesa cotizar: ${productTitle}. ¿Me pueden dar precio y tiempo de entrega?`,
  category: (categoryName: string) =>
    `Hola Ofifitted, quiero cotizar mobiliario de la línea ${categoryName}.`,
  project: "Hola Ofifitted, quiero amueblar una oficina completa. ¿Me apoyan con una propuesta?",
  visualizer: (productTitle: string) =>
    `Hola Ofifitted, acabo de ver el ${productTitle} en 3D y me interesa cotizarlo.`,
} as const;

export const socials = {
  facebook: "https://www.facebook.com/ofifitted",
  instagram: "https://www.instagram.com/ofifitted",
} as const;
