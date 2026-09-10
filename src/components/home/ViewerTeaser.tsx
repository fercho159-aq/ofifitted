import Image from "next/image";
import Link from "next/link";

import type { Product } from "@/lib/catalog";
import { Reveal } from "@/components/ui/Reveal";
import { Parallax } from "@/components/ui/ScrollFx";

/**
 * Anuncio de "Pruébalo en tu oficina".
 *
 * La ilustración explica la función sin palabras: una escena genérica —muro
 * y piso dibujados con CSS— con el mueble recortado apoyado en ella y el
 * marco de una foto de celular encima. No se usa una foto de oficina real
 * porque todas las del catálogo ya traen muebles.
 *
 * Solo se dibuja si hay algún producto con recorte o modelo.
 */
export function ViewerTeaser({
  product,
  total,
}: {
  product: Product | null;
  total: number;
}) {
  if (!product?.cutout) return null;
  const { cutout } = product;

  return (
    <section className="relative overflow-hidden border-y border-ink-200 bg-ink-50">
      <div className="container-page grid gap-12 py-20 md:py-28 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <Reveal>
            <p className="eyebrow text-accent-600">Nuevo · Pruébalo en tu oficina</p>
            <h2 className="heading-section mt-3">
              Toma una foto de tu espacio. Pon el mueble. Decide.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-600">
              Sube una foto de tu oficina, coloca el mueble donde lo imaginas y
              ajústalo al tamaño. Deja de adivinar si combina: mándanos la
              imagen y cotizamos sobre eso.
            </p>
            <p className="mt-3 text-sm text-ink-500">
              Disponible en {total} modelos del catálogo. Tu foto no se sube a
              ningún servidor.
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <Link
              href={`/producto/${product.slug}`}
              className="mt-8 inline-flex items-center gap-2 bg-brand-600 px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-brand-700"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                <path
                  d="M4 8h3l2-3h6l2 3h3v11H4zM12 17a4 4 0 100-8 4 4 0 000 8z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  fill="none"
                  strokeLinejoin="round"
                />
              </svg>
              Probarlo con un escritorio
            </Link>
          </Reveal>
        </div>

        <Parallax distance={36}>
          <div className="relative mx-auto aspect-4/3 w-full max-w-xl overflow-hidden rounded-sm shadow-[var(--shadow-float)]">
            {/* Escena: muro y piso */}
            <div aria-hidden className="absolute inset-0 bg-linear-to-b from-[#ebe6df] to-[#ddd6cc]" />
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-[34%] bg-linear-to-b from-[#b89877] to-[#9c7b5b]"
            />
            <div aria-hidden className="absolute inset-x-0 bottom-[34%] h-px bg-black/10" />

            {/* El mueble, apoyado en el piso */}
            <div className="absolute bottom-[12%] left-1/2 w-[52%] -translate-x-1/2 drop-shadow-[0_6px_10px_rgba(0,0,0,0.3)]">
              <Image
                src={cutout.src}
                alt={product.title}
                width={cutout.width}
                height={cutout.height}
                sizes="(max-width: 1024px) 50vw, 300px"
                className="h-auto w-full"
              />
            </div>

            {/* Marco de "foto": esquinas de visor de cámara */}
            <div aria-hidden className="pointer-events-none absolute inset-4">
              {[
                "top-0 left-0 border-t-2 border-l-2",
                "top-0 right-0 border-t-2 border-r-2",
                "bottom-0 left-0 border-b-2 border-l-2",
                "bottom-0 right-0 border-b-2 border-r-2",
              ].map((corner) => (
                <span key={corner} className={`absolute h-6 w-6 border-white/90 ${corner}`} />
              ))}
            </div>

            <span className="absolute top-6 left-6 flex items-center gap-1.5 bg-ink-900/80 px-2.5 py-1 text-[10px] font-medium tracking-wide text-white uppercase backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-500" aria-hidden />
              Tu foto
            </span>
          </div>
        </Parallax>
      </div>
    </section>
  );
}
