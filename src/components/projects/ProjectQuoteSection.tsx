import { Reveal } from "@/components/ui/Reveal";
import { contact, waMessages, whatsappUrl } from "@/lib/site";

import { ProjectBriefForm } from "./ProjectBriefForm";

const DELIVERABLES = [
  "Propuesta de distribución sobre tu plano",
  "Selección de mobiliario y acabados",
  "Cotización desglosada por partida",
  "Calendario de fabricación y entrega",
];

/** Cierre de la página: brief de proyecto. Ancla `#cotizar`. */
export function ProjectQuoteSection({ id = "cotizar" }: { id?: string }) {
  return (
    <section id={id} className="scroll-mt-24 bg-ink-900 text-white">
      <div className="container-page grid gap-12 py-20 md:py-28 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
        <Reveal>
          <p className="eyebrow text-accent-400">Cotiza tu proyecto</p>
          <h2 className="heading-section mt-3 text-white">
            Cuéntanos del espacio. Te devolvemos el proyecto resuelto.
          </h2>
          <p className="mt-5 max-w-md leading-relaxed text-white/70">
            Un especialista revisa tu brief y te contacta para afinar
            alcance. La propuesta no tiene costo ni compromiso.
          </p>

          <p className="eyebrow mt-10 mb-4 text-white/50">Qué recibes</p>
          <ul className="space-y-3">
            {DELIVERABLES.map((item) => (
              <li key={item} className="flex gap-3 text-sm text-white/85">
                <span aria-hidden className="mt-2 h-px w-5 shrink-0 bg-accent-400" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-10 border-t border-white/15 pt-6 text-sm text-white/60">
            <p>¿Prefieres hablar primero?</p>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
              <a
                href={whatsappUrl(waMessages.consult)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-white underline-offset-4 hover:underline"
              >
                Agendar asesoría por WhatsApp
              </a>
              {contact.office.slice(0, 1).map((phone) => (
                <a
                  key={phone.tel}
                  href={`tel:${phone.tel}`}
                  className="tabular-nums text-white underline-offset-4 hover:underline"
                >
                  {phone.label} {phone.value}
                </a>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="bg-paper p-6 text-ink-900 md:p-10">
            <ProjectBriefForm />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
