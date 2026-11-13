import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { PROJECT_STEPS } from "@/lib/projects";

/** Proceso llave en mano en cinco pasos. Fondo claro, numeración roja. */
export function ProcessSection() {
  return (
    <section className="border-y border-ink-200 bg-ink-50">
      <div className="container-page py-20 md:py-28">
        <Reveal>
          <p className="eyebrow text-accent-600">Proyecto llave en mano</p>
          <h2 className="heading-section mt-3 max-w-2xl">
            Del plano al espacio listo para operar.
          </h2>
        </Reveal>

        <RevealGroup
          className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5"
          step={0.08}
        >
          {PROJECT_STEPS.map((item) => (
            <RevealItem key={item.step}>
              <div className="border-t-2 border-ink-900 pt-6">
                <span className="font-[family-name:var(--font-display)] text-sm tabular-nums text-accent-600">
                  {item.step}
                </span>
                <h3 className="mt-3 font-medium text-ink-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">
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
