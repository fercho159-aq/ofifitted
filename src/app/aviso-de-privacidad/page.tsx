import type { Metadata } from "next";

import { contact, site } from "@/lib/site";
import { SHOW_PLACEHOLDER_CONTENT } from "@/data/testimonials";

export const metadata: Metadata = {
  title: "Aviso de privacidad",
  description:
    "Aviso de privacidad de Ofifitted conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.",
  robots: { index: false, follow: true },
};

/**
 * Aviso de privacidad.
 *
 * Es un borrador técnico, no un documento legal terminado: describe con
 * exactitud lo que este sitio hace con los datos —que es casi nada, porque
 * el formulario no guarda nada y todo se va por WhatsApp— pero la razón
 * social, el domicilio fiscal y el responsable de datos los tiene que
 * completar y revisar Ofifitted antes de publicar.
 */
export default function PrivacyPage() {
  return (
    <section className="container-page max-w-3xl py-14 md:py-20">
      <h1 className="heading-section">Aviso de privacidad</h1>

      {SHOW_PLACEHOLDER_CONTENT && (
        <div className="mt-8 border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium">Borrador — revisión legal pendiente</p>
          <p className="mt-1 text-amber-800">
            El contenido técnico es correcto: describe lo que el sitio hace
            realmente. Falta que Ofifitted complete razón social, domicilio
            fiscal y responsable de datos personales, y que lo revise su
            abogado antes de publicar.
          </p>
        </div>
      )}

      <div className="mt-10 space-y-8 text-ink-700">
        <Block title="Responsable">
          <p>
            {site.legalName} (en adelante, «Ofifitted»), con domicilio en{" "}
            {contact.locations[0].address}, es responsable del tratamiento de
            los datos personales que nos proporciones a través de este sitio.
          </p>
        </Block>

        <Block title="Qué datos recabamos">
          <p>
            Este sitio <strong>no almacena datos personales</strong>. El
            formulario de cotización funciona en tu propio navegador: arma un
            mensaje de texto con lo que escribes y abre WhatsApp para que tú
            decidas si lo envías. Si no lo envías, esa información no sale de
            tu dispositivo y no llega a ningún servidor nuestro.
          </p>
          <p>
            Cuando decides enviarlo, los datos que hayas incluido —nombre,
            empresa, ciudad, requerimiento— quedan en la conversación de
            WhatsApp, sujeta además a las políticas de privacidad de WhatsApp
            y de Meta Platforms.
          </p>
        </Block>

        <Block title="Para qué los usamos">
          <p>
            Únicamente para elaborar la cotización que solicitaste, dar
            seguimiento a esa solicitud y, en su caso, coordinar la
            fabricación y entrega del mobiliario.
          </p>
        </Block>

        <Block title="Con quién los compartimos">
          <p>
            No vendemos, rentamos ni compartimos tus datos con terceros con
            fines comerciales. Solo se comparten con quien sea estrictamente
            necesario para cumplir tu pedido, como la empresa de transporte
            que realiza la entrega.
          </p>
        </Block>

        <Block title="Cookies y medición">
          <p>
            Este sitio no utiliza cookies de publicidad ni de seguimiento entre
            sitios. Tu navegador puede guardar preferencias mínimas de la
            propia página, como recordar que cerraste un aviso; esa información
            se queda en tu equipo.
          </p>
        </Block>

        <Block title="Tus derechos ARCO">
          <p>
            Puedes solicitar el acceso, rectificación, cancelación u oposición
            al tratamiento de tus datos personales, así como revocar tu
            consentimiento, escribiendo a los medios de contacto publicados en
            este sitio. Responderemos tu solicitud en los plazos que marca la
            Ley Federal de Protección de Datos Personales en Posesión de los
            Particulares.
          </p>
        </Block>

        <Block title="Cambios a este aviso">
          <p>
            Cualquier modificación se publicará en esta misma página. Te
            recomendamos revisarla periódicamente.
          </p>
        </Block>
      </div>
    </section>
  );
}

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-lg font-medium text-ink-900">{title}</h2>
      <div className="mt-2 space-y-3 leading-relaxed">{children}</div>
    </div>
  );
}
