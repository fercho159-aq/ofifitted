import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/ui/ProductCard";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import {
  getCategories,
  getCategoryBySlug,
  getChildren,
  getProductsByCategory,
} from "@/lib/catalog";
import { waMessages, whatsappUrl } from "@/lib/site";
import { HIDDEN_CATEGORY_SLUGS } from "@/lib/taxonomy";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getCategories()
    .filter((c) => !HIDDEN_CATEGORY_SLUGS.has(c.slug))
    .map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};

  return {
    title: category.name,
    description:
      category.description ||
      `${category.name} de fabricación propia. ${category.productCount} modelos disponibles, cotización a medida y envíos a toda la República.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const products = getProductsByCategory(category);
  const children = getChildren(category);

  return (
    <>
      {/* Encabezado */}
      <section className="border-b border-ink-200 bg-white">
        <div className="container-page py-12 md:py-16">
          <Reveal preset="up">
            <nav aria-label="Ruta" className="mb-5 flex items-center gap-2 text-xs">
              <Link href="/catalogo" className="text-ink-500 hover:text-brand-600">
                Catálogo
              </Link>
              <span className="text-ink-300" aria-hidden>
                /
              </span>
              <span className="text-ink-900">{category.name}</span>
            </nav>

            <h1 className="heading-section max-w-3xl">{category.name}</h1>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-600">
              {category.description ||
                `${products.length} modelos fabricados en nuestra planta. Todos se pueden ajustar en medidas, acabado y tapiz según tu proyecto.`}
            </p>
          </Reveal>

          {children.length > 0 && (
            <RevealGroup className="mt-8 flex flex-wrap gap-2" step={0.04}>
              {children.map((child) => (
                <RevealItem key={child.slug}>
                  <Link
                    href={`/catalogo/${child.slug}`}
                    className="inline-flex items-baseline gap-2 border border-ink-200 bg-paper px-4 py-2 text-sm text-ink-700 transition-colors hover:border-brand-600 hover:text-brand-600"
                  >
                    {child.name}
                    <span className="text-xs tabular-nums text-ink-400">
                      {child.productCount}
                    </span>
                  </Link>
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </div>
      </section>

      {/* Rejilla de producto */}
      <section className="container-page py-12 md:py-16">
        <p className="mb-8 text-sm text-ink-500">
          {products.length}{" "}
          {products.length === 1 ? "modelo" : "modelos"} en esta línea
        </p>

        {products.length > 0 ? (
          <RevealGroup
            className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4"
            step={0.04}
          >
            {products.map((product, i) => (
              <RevealItem key={product.slug}>
                <ProductCard product={product} priority={i < 4} />
              </RevealItem>
            ))}
          </RevealGroup>
        ) : (
          <div className="border border-dashed border-ink-200 py-16 text-center">
            <p className="text-ink-600">
              Todavía no hay modelos publicados en esta línea.
            </p>
            <a
              href={whatsappUrl(waMessages.category(category.name))}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex bg-accent-600 px-6 py-3 text-sm font-medium text-white hover:bg-accent-700"
            >
              Pregúntanos por WhatsApp
            </a>
          </div>
        )}
      </section>

      {/* Cierre */}
      <section className="border-t border-ink-200 bg-white">
        <div className="container-page flex flex-col items-start gap-6 py-14 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="heading-section">¿No encuentras la medida?</h2>
            <p className="mt-2 max-w-lg text-ink-600">
              Fabricamos sobre pedido. Mándanos las medidas y el acabado que
              necesitas y te cotizamos el mueble exacto.
            </p>
          </div>
          <a
            href={whatsappUrl(waMessages.category(category.name))}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 bg-accent-600 px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-accent-700"
          >
            Cotizar a medida
          </a>
        </div>
      </section>
    </>
  );
}
