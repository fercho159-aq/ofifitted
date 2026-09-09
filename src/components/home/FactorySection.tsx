import Image from "next/image";

import type { ProductImage } from "@/lib/catalog";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { ScrollZoom } from "@/components/ui/ScrollFx";

/**
 * PASTOR · Solución e historia.
 *
 * La respuesta a los cuatro problemas anteriores es una sola: no hay
 * intermediario. Cada punto de esta sección contesta a uno de ellos, en el
 * mismo orden, aunque no se diga en voz alta.
 */

const ANSWERS = [
  {
    title: "Se fabrica a tu medida",
    body: "Mándanos el plano o las medidas. El mueble se hace para ese espacio, no se elige del que más se le parezca.",
  },
  {
    title: "Se arma para uso diario",
    body: "Estructura metálica, herrajes y tapiz elegidos para jornada completa. Si algo falla, tenemos la refacción porque tenemos el molde.",
  },
  {
    title: "Seguimos aquí después",
    body: "Dentro de dos años podemos fabricarte cinco piezas más del mismo modelo, con el mismo acabado y el mismo tapiz.",
  },
  {
    title: "Pagas la fábrica, no la cadena",
    body: "El precio sale de nuestra planta directo a tu orden de compra. No hay una comisión en medio.",
  },
];

export function FactorySection({ image }: { image: ProductImage | null }) {
  return (
    <section className="border-y border-ink-200 bg-white">
      <div className="container-page grid gap-12 py-20 md:py-28 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <Reveal>
            <p className="eyebrow text-accent-600">Somos la planta</p>
            <h2 className="heading-section mt-3">
              El mueble que te entregamos se hizo aquí.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-600">
              Ofifitted fabrica en la Ciudad de México. Eso no es un dato de
              marketing: es lo que hace posible cambiar una medida sin cambiar
              el precio, sostener un modelo en el tiempo y contestar cuando
              algo se necesita.
            </p>
          </Reveal>

          <RevealGroup className="mt-10 space-y-7" step={0.09}>
            {ANSWERS.map((answer) => (
              <RevealItem key={answer.title}>
                <div className="flex gap-4">
                  <span
                    aria-hidden
                    className="mt-2 h-px w-8 shrink-0 bg-accent-600"
                  />
                  <div>
                    <h3 className="font-medium text-ink-900">{answer.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-600">
                      {answer.body}
                    </p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>

        {image && (
          <ScrollZoom className="relative aspect-4/5 bg-ink-50 lg:aspect-square">
            <Image
              src={image.src}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              placeholder="blur"
              blurDataURL={image.blurDataURL}
              className="object-cover"
            />
          </ScrollZoom>
        )}
      </div>
    </section>
  );
}
