import Image from "next/image";
import Link from "next/link";

import type { Category, ProductImage } from "@/lib/catalog";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";

export type CategoryCard = {
  category: Category;
  cover: ProductImage | null;
};

/**
 * PASTOR · Transformación.
 *
 * Aquí se pasa del argumento al producto. Las categorías van por volumen de
 * catálogo, que es también el orden en que la gente las busca.
 */
export function CategoriesSection({ cards }: { cards: CategoryCard[] }) {
  const [lead, ...rest] = cards;

  return (
    <section className="container-page py-20 md:py-28">
      <Reveal>
        <p className="eyebrow text-accent-600">Qué fabricamos</p>
        <h2 className="heading-section mt-3 max-w-2xl">
          Una oficina completa sale de la misma planta.
        </h2>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-600">
          Del escritorio de dirección al locker del área de producción. Mismo
          acabado, mismo proveedor, una sola entrega.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {/* Categoría principal, a doble alto */}
        {lead && (
          <Reveal preset="zoom" className="lg:col-span-2 lg:row-span-2">
            <CategoryTile card={lead} large />
          </Reveal>
        )}

        <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1" step={0.07}>
          {rest.slice(0, 2).map((card) => (
            <RevealItem key={card.category.slug}>
              <CategoryTile card={card} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>

      <RevealGroup
        className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        step={0.06}
      >
        {rest.slice(2, 6).map((card) => (
          <RevealItem key={card.category.slug}>
            <CategoryTile card={card} />
          </RevealItem>
        ))}
      </RevealGroup>

      <Reveal delay={0.1}>
        <Link
          href="/catalogo"
          className="mt-10 inline-flex items-center gap-2 border-b border-ink-900 pb-1 text-sm font-medium text-ink-900 transition-colors hover:border-brand-600 hover:text-brand-600"
        >
          Ver el catálogo completo
          <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden>
            <path
              d="M5 12h14M13 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </Reveal>
    </section>
  );
}

function CategoryTile({
  card,
  large = false,
}: {
  card: CategoryCard;
  large?: boolean;
}) {
  const { category, cover } = card;

  return (
    <Link
      href={`/catalogo/${category.slug}`}
      className="group relative block h-full overflow-hidden bg-white"
    >
      <div className={large ? "aspect-4/3 lg:aspect-16/10" : "aspect-4/3"}>
        {cover ? (
          <Image
            src={cover.src}
            alt=""
            fill
            sizes={large ? "(max-width: 1024px) 100vw, 66vw" : "(max-width: 640px) 100vw, 33vw"}
            placeholder="blur"
            blurDataURL={cover.blurDataURL}
            className="object-contain p-8 transition-transform duration-700 ease-[var(--ease-brand)] group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-ink-100" />
        )}
      </div>

      {/* Velo que sube al pasar el mouse: mantiene el producto limpio en
          reposo y da contraste al texto solo cuando hace falta. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-ink-900/70 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />

      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3
          className={`font-medium text-ink-900 transition-colors duration-500 group-hover:text-white ${
            large ? "text-2xl" : "text-lg"
          }`}
        >
          {category.name}
        </h3>
        <p className="text-sm text-ink-500 transition-colors duration-500 group-hover:text-white/70">
          {category.productCount} modelos
        </p>
      </div>
    </Link>
  );
}
