import Image from "next/image";
import Link from "next/link";

import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { getSpaceImage, SPACES } from "@/lib/projects";
import { cn } from "@/lib/utils";

/**
 * Áreas de aplicación: los espacios que se equipan de forma integral.
 *
 * Es la sección que traduce "proyecto llave en mano" a algo que el
 * comprador reconoce en su propio plano. La primera tarjeta va a doble
 * ancho para que la retícula no se lea como un catálogo de productos.
 */
export function SpacesSection({
  id = "espacios",
  quoteHref = "#cotizar",
}: {
  id?: string;
  quoteHref?: string;
}) {
  return (
    <section id={id} className="scroll-mt-24 bg-white">
      <div className="container-page py-20 md:py-28">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <p className="eyebrow text-accent-600">Áreas de aplicación</p>
            <h2 className="heading-section mt-3 max-w-2xl">
              Equipamos cada espacio del proyecto, con un solo responsable.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-sm text-base leading-relaxed text-ink-600">
              Diseño, fabricación, entrega e instalación coordinados por un
              mismo equipo, con acabados consistentes en todo el inmueble.
            </p>
          </Reveal>
        </div>

        <RevealGroup
          className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
          step={0.07}
        >
          {SPACES.map((space, i) => {
            const image = getSpaceImage(space);
            const wide = i === 0;
            return (
              <RevealItem
                key={space.id}
                className={cn(wide && "md:col-span-2 lg:col-span-2")}
              >
                <article className="group flex h-full flex-col border border-ink-200 bg-paper">
                  <div
                    className={cn(
                      "relative overflow-hidden bg-ink-100",
                      wide ? "aspect-4/3 md:aspect-[8/3]" : "aspect-4/3"
                    )}
                  >
                    {image && (
                      <Image
                        src={image.src}
                        alt=""
                        fill
                        sizes={wide ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
                        placeholder="blur"
                        blurDataURL={image.blurDataURL}
                        className="object-cover transition-transform duration-700 ease-[var(--ease-brand)] group-hover:scale-[1.04]"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6 md:p-7">
                    <span className="font-[family-name:var(--font-display)] text-sm tabular-nums text-accent-600">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3
                      className={cn(
                        "mt-1 font-[family-name:var(--font-display)] font-medium text-ink-900",
                        wide ? "text-2xl" : "text-xl"
                      )}
                    >
                      {space.title}
                    </h3>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-600">
                      {space.body}
                    </p>
                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {space.includes.map((item) => (
                        <li
                          key={item}
                          className="border border-ink-200 bg-white px-2.5 py-1 text-xs text-ink-600"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-6 text-sm">
                      <Link
                        href={quoteHref}
                        className="font-medium text-brand-600 underline-offset-4 hover:underline"
                      >
                        Cotizar este espacio →
                      </Link>
                      <Link
                        href={space.catalogHref}
                        className="text-ink-500 underline-offset-4 hover:text-ink-900 hover:underline"
                      >
                        Ver mobiliario
                      </Link>
                    </div>
                  </div>
                </article>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
