import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { ScrollRevealText } from "@/components/ui/ScrollFx";

/**
 * PASTOR · Problema + Amplificación.
 *
 * Nombra lo que ya le pasó a quien está leyendo, y después le pone precio.
 *
 * Primera versión descartada por el cliente: en móvil era una pila de cuatro
 * bloques de texto separados por rayas negras gruesas, y se leía como un
 * documento. Esta versión mantiene el argumento pero lo vuelve visual:
 * titular más corto, tarjetas con ícono, y en móvil un carrusel horizontal
 * para que la sección ocupe una pantalla en lugar de cuatro.
 */

const PROBLEMS = [
  {
    title: "Llegó y no cabía",
    body: "Medidas de catálogo que no contaban con la columna ni con el pasillo real.",
    icon: (
      <path d="M3 17L17 3l4 4L7 21H3v-4zM7.5 12.5l2 2M10.5 9.5l2 2M13.5 6.5l2 2" />
    ),
  },
  {
    title: "Se venció en un año",
    body: "Sillería armada para la foto, no para ocho horas diarias de uso.",
    icon: <path d="M12 7v5l3 2M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z" />,
  },
  {
    title: "Nadie contestó después",
    body: "Pediste cinco piezas más del mismo modelo y el modelo ya no existía.",
    icon: (
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2zM9.5 8.5l5 5M14.5 8.5l-5 5" />
    ),
  },
  {
    title: "Pagaste de más",
    body: "Entre la fábrica y tú hubo dos o tres manos, y cada una cobró su parte.",
    icon: (
      <path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8zM7.5 7.5h.01" />
    ),
  },
];

export function ProblemSection() {
  return (
    <section className="overflow-hidden py-20 md:py-28">
      <div className="container-page">
        <div className="max-w-3xl">
          <Reveal>
            <p className="eyebrow text-accent-600">Por qué estás buscando otra vez</p>
          </Reveal>

          {/* Única frase del sitio que se revela palabra por palabra. */}
          <ScrollRevealText
            text="Nadie cambia de proveedor por el precio. Lo cambia porque le falló."
            className="heading-section mt-4 text-ink-900"
          />
        </div>
      </div>

      {/* Móvil: carrusel con snap que asoma la siguiente tarjeta, para que se
          note que hay más. Escritorio: cuatro columnas.
          `scroll-px-5` hace que el snap respete el margen lateral: sin él, el
          navegador alinea la primera tarjeta contra el borde de la pantalla. */}
      <RevealGroup
        as="ul"
        step={0.08}
        className="mt-12 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none] md:container-page md:grid md:grid-cols-2 md:overflow-visible md:px-8 lg:grid-cols-4 xl:px-12 [&::-webkit-scrollbar]:hidden"
      >
        {PROBLEMS.map((problem) => (
          <RevealItem
            key={problem.title}
            as="li"
            className="w-[78%] shrink-0 snap-start sm:w-[45%] md:w-auto"
          >
            <article className="group h-full rounded-sm bg-white p-6 shadow-[var(--shadow-lift)] ring-1 ring-ink-200/70 transition-shadow duration-300 hover:shadow-[var(--shadow-float)]">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-50 text-accent-600 transition-colors duration-300 group-hover:bg-accent-600 group-hover:text-white">
                <svg
                  width="21"
                  height="21"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  {problem.icon}
                </svg>
              </span>
              <h3 className="mt-5 font-[family-name:var(--font-display)] text-xl font-medium text-ink-900">
                {problem.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{problem.body}</p>
            </article>
          </RevealItem>
        ))}
      </RevealGroup>

      <p className="container-page mt-1 text-xs text-ink-400 md:hidden" aria-hidden>
        Desliza para ver más →
      </p>

      {/* Amplificación: el costo real de repetir la compra. */}
      <div className="container-page">
        <Reveal delay={0.1}>
          <div className="mt-12 flex flex-col gap-4 bg-ink-900 p-7 text-white md:flex-row md:items-center md:gap-10 md:p-10">
            <p className="font-[family-name:var(--font-display)] text-4xl font-medium text-accent-500 md:text-5xl">
              ×2
            </p>
            <p className="max-w-2xl leading-relaxed text-white/80 md:text-lg">
              Y el costo no es el mueble. Es volver a cotizar, volver a hacer la
              orden de compra y volver a justificar el gasto ante dirección{" "}
              <span className="text-white">por el mismo escritorio.</span>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
