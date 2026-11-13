import Image from "next/image";
import Link from "next/link";

import type { Category, ProductImage } from "@/lib/catalog";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";

export type CatalogCard = {
  category: Category;
  cover: ProductImage | null;
};

/**
 * Catálogo general, en segundo plano.
 *
 * Desde el pivote a proyectos B2B, la pieza suelta sigue disponible pero no
 * compite con el servicio principal: tarjetas pequeñas, fondo neutro, sin
 * CTA roja. Es un atajo para quien ya sabe qué mueble busca.
 */
export function CatalogShortcut({
  cards,
  productCount,
}: {
  cards: CatalogCard[];
  productCount: number;
}) {
  return (
    <section className="border-t border-ink-200 bg-paper">
      <div className="container-page py-16 md:py-20">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <p className="eyebrow text-ink-400">Catálogo general</p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-medium text-ink-900 md:text-3xl">
              ¿Necesitas piezas individuales?
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-600">
              {productCount} modelos de fabricación propia para reposición,
              crecimiento de plantilla o compras puntuales.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
              <Link
                href="/catalogo"
                className="border-b border-ink-900 pb-0.5 text-ink-900 transition-colors hover:border-brand-600 hover:text-brand-600"
              >
                Ver catálogo de productos
              </Link>
              <Link
                href="/catalogos"
                className="border-b border-ink-300 pb-0.5 text-ink-600 transition-colors hover:border-brand-600 hover:text-brand-600"
              >
                Catálogos PDF
              </Link>
            </div>
          </Reveal>
        </div>

        <RevealGroup
          className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
          step={0.05}
        >
          {cards.map(({ category, cover }) => (
            <RevealItem key={category.slug}>
              <Link
                href={`/catalogo/${category.slug}`}
                className="group block border border-ink-200 bg-white transition-colors hover:border-ink-400"
              >
                <div className="relative aspect-square">
                  {cover ? (
                    <Image
                      src={cover.src}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      placeholder="blur"
                      blurDataURL={cover.blurDataURL}
                      className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-ink-100" />
                  )}
                </div>
                <div className="border-t border-ink-100 px-3 py-2.5">
                  <h3 className="text-sm font-medium text-ink-900">
                    {category.name}
                  </h3>
                  <p className="text-xs text-ink-500">
                    {category.productCount} modelos
                  </p>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
