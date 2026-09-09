import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { ScrollRevealText } from "@/components/ui/ScrollFx";

/**
 * PASTOR · Problema + Amplificación.
 *
 * Nombra lo que ya le pasó a quien está leyendo, y después le pone precio.
 * Va antes que cualquier producto: nadie compara escritorios hasta que
 * reconoce que la compra anterior le salió mal.
 */

const PROBLEMS = [
  {
    title: "Llegó y no cabía",
    body: "Compraste medidas estándar de catálogo. La columna, el registro eléctrico o el ancho real del pasillo no estaban en ese catálogo.",
  },
  {
    title: "Se venció en un año",
    body: "Sillería armada para foto, no para ocho horas diarias. El pistón cede, la malla se deforma y acabas reponiendo el lote completo.",
  },
  {
    title: "Nadie contestó después",
    body: "El intermediario vendió y desapareció. Cuando necesitas una refacción o cinco piezas más del mismo modelo, ya no existe el modelo.",
  },
  {
    title: "Pagaste el sobreprecio",
    body: "Entre la fábrica y tú hubo dos o tres manos. Cada una cobró su parte, y ninguna fabricó nada.",
  },
];

export function ProblemSection() {
  return (
    <section className="container-page py-20 md:py-28">
      <div className="max-w-3xl">
        <Reveal>
          <p className="eyebrow text-accent-600">Por qué estás buscando otra vez</p>
        </Reveal>

        {/* Única frase del sitio que se revela palabra por palabra: es la
            promesa central y merece que se lea despacio. */}
        <ScrollRevealText
          text="Casi nadie cambia de proveedor de mobiliario porque el anterior fuera caro. Cambia porque le falló."
          className="heading-section mt-4 text-ink-900"
        />
      </div>

      <RevealGroup
        className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4"
        step={0.08}
      >
        {PROBLEMS.map((problem, i) => (
          <RevealItem key={problem.title}>
            <article className="border-t-2 border-ink-900 pt-5">
              <span className="text-xs tabular-nums text-ink-400">
                0{i + 1}
              </span>
              <h3 className="mt-2 text-lg font-medium text-ink-900">
                {problem.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                {problem.body}
              </p>
            </article>
          </RevealItem>
        ))}
      </RevealGroup>

      {/* Amplificación: el costo real de repetir la compra. */}
      <Reveal preset="up" delay={0.1}>
        <div className="mt-16 border-l-2 border-accent-600 pl-6 md:pl-8">
          <p className="max-w-2xl text-lg leading-relaxed text-ink-800 md:text-xl">
            Y el costo no es el mueble. Es volver a cotizar, volver a levantar
            la orden de compra, volver a coordinar la entrega y volver a
            justificar el gasto ante dirección{" "}
            <span className="text-ink-900">por el mismo escritorio.</span>
          </p>
        </div>
      </Reveal>
    </section>
  );
}
