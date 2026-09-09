import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import {
  catalogStats,
  getCategoryCover,
  getChildren,
  getRootCategories,
} from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Todo el mobiliario de oficina que fabricamos: sillas, escritorios, recepciones, almacenamiento y líneas especiales.",
};

export default function CatalogPage() {
  const roots = getRootCategories();

  return (
    <>
      <section className="border-b border-ink-200 bg-white">
        <div className="container-page py-14 md:py-20">
          <Reveal>
            <p className="eyebrow text-accent-600">Catálogo completo</p>
            <h1 className="heading-section mt-3 max-w-3xl">
              {catalogStats.products} modelos, todos fabricados por nosotros.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-600">
              Lo que ves aquí es lo que sale de nuestra planta. Cualquier
              modelo se puede ajustar en medida, acabado y tapiz: mándanos tu
              requerimiento y lo fabricamos.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container-page py-14 md:py-20">
        <RevealGroup
          className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
          step={0.06}
        >
          {roots.map((category) => {
            const cover = getCategoryCover(category);
            const children = getChildren(category).slice(0, 5);

            return (
              <RevealItem key={category.slug}>
                <article>
                  <Link href={`/catalogo/${category.slug}`} className="group block">
                    <div className="relative aspect-4/3 overflow-hidden bg-white">
                      {cover ? (
                        <Image
                          src={cover.src}
                          alt={category.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          placeholder="blur"
                          blurDataURL={cover.blurDataURL}
                          className="object-contain p-6 transition-transform duration-700 ease-[var(--ease-brand)] group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-ink-100" />
                      )}
                    </div>

                    <div className="mt-4 flex items-baseline justify-between gap-3">
                      <h2 className="text-lg font-medium text-ink-900 transition-colors group-hover:text-brand-600">
                        {category.name}
                      </h2>
                      <span className="text-xs tabular-nums text-ink-400">
                        {category.productCount}
                      </span>
                    </div>
                  </Link>

                  {children.length > 0 && (
                    <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                      {children.map((child) => (
                        <li key={child.slug}>
                          <Link
                            href={`/catalogo/${child.slug}`}
                            className="text-sm text-ink-500 transition-colors hover:text-brand-600"
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </section>
    </>
  );
}
