import Link from "next/link";

import { AutoplayVideo } from "@/components/ui/AutoplayVideo";
import { Reveal } from "@/components/ui/Reveal";
import { SPACE_VIDEOS } from "@/lib/projects";

/**
 * Tira de videos verticales, estilo reels, que se reproducen solos.
 *
 * Son ilustrativos (generados con IA) y se dice en pantalla, no en letra
 * escondida: mismo criterio que los testimonios. Muestran el tipo de
 * espacio, no una obra entregada.
 */
export function VideoReel() {
  const anyIllustrative = SPACE_VIDEOS.some((v) => v.illustrative);

  return (
    <section className="overflow-hidden bg-ink-900 text-white">
      <div className="container-page pt-20 md:pt-24">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <p className="eyebrow text-accent-400">Espacios en movimiento</p>
            <h2 className="heading-section mt-3 max-w-2xl text-white">
              Así se ve un espacio resuelto de punta a punta.
            </h2>
          </Reveal>
          {anyIllustrative && (
            <Reveal delay={0.08}>
              <p className="max-w-xs text-xs leading-relaxed text-white/50">
                Recorridos ilustrativos generados con IA, como referencia de
                estilo y distribución. Cada proyecto se diseña sobre tu plano.
              </p>
            </Reveal>
          )}
        </div>
      </div>

      {/* Carrusel con snap: el scroll-padding iguala el padding del
          contenedor, si no la primera tarjeta queda pegada a la orilla. */}
      <div className="mt-10 pb-20 md:pb-24">
        <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-4 [scrollbar-width:thin] md:scroll-px-8 md:px-8 xl:scroll-px-[max(3rem,calc((100vw-88rem)/2+3rem))] xl:px-[max(3rem,calc((100vw-88rem)/2+3rem))]">
          {SPACE_VIDEOS.map((video) => (
            <li
              key={video.slug}
              className="relative w-[62vw] max-w-[15rem] shrink-0 snap-start sm:w-[13rem]"
            >
              <Link href={video.href} className="group block">
                <div className="relative aspect-9/16 overflow-hidden bg-ink-800">
                  <AutoplayVideo
                    src={video.src}
                    poster={video.poster}
                    label={`${video.title}, video ilustrativo`}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-ink-900/90 to-transparent"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="font-[family-name:var(--font-display)] text-lg leading-tight font-medium text-white">
                      {video.title}
                    </p>
                    <p className="mt-1 text-xs text-white/60 transition-colors group-hover:text-white">
                      Ver mobiliario →
                    </p>
                  </div>
                  {video.illustrative && (
                    <span className="absolute top-3 left-3 bg-ink-900/70 px-2 py-0.5 text-[10px] tracking-wide text-white/80 uppercase backdrop-blur-sm">
                      Ilustrativo · IA
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
