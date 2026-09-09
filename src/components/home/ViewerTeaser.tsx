import Image from "next/image";
import Link from "next/link";

import type { Product } from "@/lib/catalog";
import { Reveal } from "@/components/ui/Reveal";
import { Parallax } from "@/components/ui/ScrollFx";

/**
 * Anuncio del visor 3D.
 *
 * Solo se dibuja si hay al menos un producto con modelo. Mientras Ofifitted
 * no entregue los GLB, la home no promete una función que no existe.
 */
export function ViewerTeaser({ product }: { product: Product | null }) {
  if (!product) return null;

  const cover = product.images[0];

  return (
    <section className="relative overflow-hidden border-y border-ink-200 bg-ink-50">
      <div className="container-page grid gap-12 py-20 md:py-28 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <Reveal>
            <p className="eyebrow text-accent-600">Nuevo</p>
            <h2 className="heading-section mt-3">
              Míralo en tu oficina antes de pedirlo.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-600">
              Los modelos con visor 3D se pueden girar, acercar y —desde el
              celular— colocar a escala real en tu propio espacio con la
              cámara. Deja de imaginarte si cabe: compruébalo.
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <Link
              href={`/producto/${product.slug}`}
              className="mt-8 inline-flex items-center gap-2 bg-brand-600 px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-brand-700"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden>
                <path
                  d="M12 2l9 5v10l-9 5-9-5V7l9-5zM3 7l9 5 9-5M12 12v10"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  fill="none"
                  strokeLinejoin="round"
                />
              </svg>
              Probar el visor 3D
            </Link>
          </Reveal>
        </div>

        <Parallax distance={40}>
          <div className="relative aspect-4/3 bg-white">
            {cover && (
              <Image
                src={cover.src}
                alt={product.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                placeholder="blur"
                blurDataURL={cover.blurDataURL}
                className="object-contain p-10"
              />
            )}
            <span className="absolute top-4 left-4 flex items-center gap-1.5 bg-brand-600 px-3 py-1.5 text-[10px] font-medium tracking-wide text-white uppercase">
              <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden>
                <path
                  d="M12 2l9 5v10l-9 5-9-5V7l9-5zM3 7l9 5 9-5M12 12v10"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  fill="none"
                  strokeLinejoin="round"
                />
              </svg>
              Ver en 3D
            </span>
          </div>
        </Parallax>
      </div>
    </section>
  );
}
