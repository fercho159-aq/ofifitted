import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import {
  getTestimonials,
  SHOW_PLACEHOLDER_CONTENT,
} from "@/data/testimonials";

/**
 * Prueba social (PASTOR · Testimonio).
 *
 * Si no hay testimonios publicables, la sección entera no se renderiza. Es
 * deliberado: una sección de reseñas vacía —o peor, con textos inventados—
 * hace más daño que no tenerla.
 */
export function Testimonials() {
  const items = getTestimonials();
  if (items.length === 0) return null;

  const hasPlaceholders = items.some((t) => t.placeholder);

  return (
    <section className="border-y border-ink-200 bg-white">
      <div className="container-page py-16 md:py-24">
        {hasPlaceholders && <PlaceholderNotice />}

        <Reveal>
          <p className="eyebrow text-accent-600">Lo que dicen quienes ya compraron</p>
          <h2 className="heading-section mt-3 max-w-2xl">
            El mueble se juzga a los tres años, no el día que llega.
          </h2>
        </Reveal>

        <RevealGroup
          className="mt-12 grid gap-x-8 gap-y-10 md:grid-cols-3"
          step={0.1}
        >
          {items.map((item) => (
            <RevealItem key={item.id}>
              <figure className="flex h-full flex-col">
                <Quote />
                <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-ink-700">
                  {item.quote}
                </blockquote>
                <figcaption className="mt-6 border-t border-ink-200 pt-4">
                  <p className="text-sm font-medium text-ink-900">{item.author}</p>
                  <p className="text-sm text-ink-500">
                    {item.role} · {item.company}
                  </p>
                  <p className="mt-2 text-xs text-brand-600">{item.project}</p>
                </figcaption>
              </figure>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

function Quote() {
  return (
    <svg
      width="28"
      height="22"
      viewBox="0 0 28 22"
      className="text-ink-200"
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M11.6 0v6.2c-2 .3-3.4 1-4.2 2-.8 1-1.2 2.5-1.2 4.4h5.4V22H0v-8.6C0 9 1 5.7 2.9 3.5 4.8 1.4 7.7.2 11.6 0zm16.4 0v6.2c-2 .3-3.4 1-4.2 2-.8 1-1.2 2.5-1.2 4.4H28V22H16.4v-8.6c0-4.4 1-7.7 2.9-9.9C21.2 1.4 24.1.2 28 0z"
      />
    </svg>
  );
}

/**
 * Aviso visible sobre el contenido de muestra.
 *
 * Va dentro de la propia sección, no en la consola: si alguien manda un
 * screenshot al cliente o abre un preview, tiene que ser imposible confundir
 * estos textos con reseñas reales.
 */
function PlaceholderNotice() {
  return (
    <div className="mb-10 flex items-start gap-3 border border-amber-300 bg-amber-50 p-4">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        className="mt-0.5 shrink-0 text-amber-600"
        aria-hidden
      >
        <path
          d="M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"
          stroke="currentColor"
          strokeWidth="1.7"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="text-sm text-amber-900">
        <p className="font-medium">Contenido de muestra — no publicable</p>
        <p className="mt-1 text-amber-800">
          Estos testimonios son ficticios y están aquí solo para revisar el
          diseño. No se renderizan en producción. Sustituir en{" "}
          <code className="bg-amber-100 px-1 text-[13px]">
            src/data/testimonials.ts
          </code>{" "}
          por testimonios reales de Ofifitted, con autorización de uso.
        </p>
      </div>
    </div>
  );
}

/** Bandera reexportada para que la home decida si dibuja la sección. */
export { SHOW_PLACEHOLDER_CONTENT };
