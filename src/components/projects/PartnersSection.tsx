import Link from "next/link";

import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { PARTNER_BENEFITS } from "@/lib/projects";
import { waMessages, whatsappUrl } from "@/lib/site";

/**
 * Mensaje para socios comerciales: arquitectos, interioristas,
 * constructoras y desarrolladores. Son quienes especifican el mobiliario
 * de muchos proyectos al año, así que se les habla en sus términos:
 * tiempos de obra, planos, volumen y precio por proyecto.
 */
export function PartnersSection({ id = "socios" }: { id?: string }) {
  return (
    <section id={id} className="scroll-mt-24 bg-brand-700 text-white">
      <div className="container-page grid gap-12 py-20 md:py-28 lg:grid-cols-[1fr_1.35fr] lg:gap-20">
        <Reveal>
          <p className="eyebrow text-white/60">
            Arquitectos · Constructoras · Desarrolladores
          </p>
          <h2 className="heading-section mt-3 text-white">
            Tu socio de mobiliario para cada obra.
          </h2>
          <p className="mt-5 max-w-md leading-relaxed text-white/75">
            Especificas el proyecto; nosotros lo fabricamos y lo entregamos a
            tiempo. Trabajamos con despachos de arquitectura, interioristas,
            constructoras y desarrolladores inmobiliarios en proyectos de
            cualquier escala.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row lg:flex-col 2xl:flex-row">
            <a
              href={whatsappUrl(waMessages.partner)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-white px-7 py-4 text-sm font-medium text-brand-700 transition-colors hover:bg-white/90"
            >
              Solicitar condiciones para socios
            </a>
            <Link
              href="/catalogos"
              className="inline-flex items-center justify-center border border-white/30 px-7 py-4 text-sm font-medium text-white transition-colors hover:border-white/70 hover:bg-white/5"
            >
              Descargar catálogos técnicos
            </Link>
          </div>
        </Reveal>

        <RevealGroup className="grid gap-px bg-white/15 sm:grid-cols-2" step={0.08}>
          {PARTNER_BENEFITS.map((item) => (
            <RevealItem key={item.title} className="bg-brand-700">
              <div className="h-full p-6 md:p-8">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-accent-400"
                  aria-hidden
                >
                  {item.icon}
                </svg>
                <h3 className="mt-5 font-[family-name:var(--font-display)] text-lg font-medium text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  {item.body}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
