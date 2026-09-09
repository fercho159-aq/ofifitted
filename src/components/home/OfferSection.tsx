import Link from "next/link";

import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { waMessages, whatsappUrl } from "@/lib/site";

/**
 * PASTOR · Oferta y Respuesta.
 *
 * La oferta no es un descuento: es quitar la fricción de pedir. Se explica
 * exactamente qué pasa después de mandar el mensaje, porque la duda que
 * frena a quien cotiza es "¿y luego me van a estar hablando?".
 */

const STEPS = [
  {
    step: "01",
    title: "Nos mandas el espacio",
    body: "Plano, croquis o hasta una foto con las medidas anotadas. Lo que tengas a la mano sirve.",
  },
  {
    step: "02",
    title: "Te proponemos la distribución",
    body: "Qué mueble va dónde, cuántas piezas y en qué acabado. Con precio por partida, no un total sin desglose.",
  },
  {
    step: "03",
    title: "Ajustamos hasta que cuadre",
    body: "Cambias medidas, cantidades o línea las veces que haga falta. Todavía no hay compromiso.",
  },
  {
    step: "04",
    title: "Fabricamos y entregamos",
    body: "Con fecha comprometida y envío a toda la República.",
  },
];

export function OfferSection() {
  return (
    <section className="bg-ink-900 text-white">
      <div className="container-page py-20 md:py-28">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <Reveal>
              <p className="eyebrow text-accent-400">Cómo se cotiza</p>
              <h2 className="heading-section mt-3 text-white">
                Mándanos el plano. Te devolvemos la oficina resuelta.
              </h2>
              <p className="mt-5 max-w-md leading-relaxed text-white/70">
                Sin costo, sin compromiso y sin que nadie te esté hablando
                después. Si no te sirve la propuesta, ahí queda.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href={whatsappUrl(waMessages.project)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-accent-600 px-8 py-4 text-sm font-medium text-white transition-colors hover:bg-accent-700"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M12.05 21.79h-.01a9.87 9.87 0 01-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 01-1.51-5.26c0-5.45 4.44-9.89 9.89-9.89a9.82 9.82 0 016.99 2.9 9.83 9.83 0 012.89 6.99c0 5.45-4.44 9.89-9.88 9.89m8.41-18.3A11.82 11.82 0 0012.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 005.69 1.45c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 00-3.48-8.4" />
                  </svg>
                  Enviar por WhatsApp
                </a>
                <Link
                  href="/contacto"
                  className="inline-flex items-center justify-center border border-white/25 px-8 py-4 text-sm font-medium text-white transition-colors hover:border-white/60 hover:bg-white/5"
                >
                  Ver otras formas de contacto
                </Link>
              </div>
            </Reveal>
          </div>

          <RevealGroup className="space-y-8" step={0.09}>
            {STEPS.map((item) => (
              <RevealItem key={item.step}>
                <div className="flex gap-5 border-t border-white/15 pt-5">
                  <span className="font-[family-name:var(--font-display)] text-sm tabular-nums text-accent-400">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="font-medium text-white">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-white/60">
                      {item.body}
                    </p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
