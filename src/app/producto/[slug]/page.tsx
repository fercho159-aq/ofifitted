import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductMedia } from "@/components/product/ProductMedia";
import { ProductCard } from "@/components/ui/ProductCard";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import {
  getProductBySlug,
  getProductCategories,
  getProducts,
  getRelatedProducts,
} from "@/lib/catalog";
import { contact, waMessages, whatsappUrl } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};

  const description =
    product.excerpt ||
    product.description.slice(0, 155) ||
    `${product.title}, fabricado por Ofifitted. Cotización a medida y envíos a toda la República Mexicana.`;

  return {
    title: product.title,
    description,
    openGraph: {
      title: product.title,
      description,
      images: product.images[0] ? [{ url: product.images[0].src }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const categories = getProductCategories(product);
  const related = getRelatedProducts(product);
  const primaryCategory = categories[0];

  return (
    <>
      <article className="container-page py-8 md:py-12">
        {/* Migas */}
        <nav aria-label="Ruta" className="mb-6 flex flex-wrap items-center gap-2 text-xs">
          <Link href="/catalogo" className="text-ink-500 hover:text-brand-600">
            Catálogo
          </Link>
          {primaryCategory && (
            <>
              <span className="text-ink-300" aria-hidden>
                /
              </span>
              <Link
                href={`/catalogo/${primaryCategory.slug}`}
                className="text-ink-500 hover:text-brand-600"
              >
                {primaryCategory.name}
              </Link>
            </>
          )}
          <span className="text-ink-300" aria-hidden>
            /
          </span>
          <span className="text-ink-900">{product.title}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <ProductMedia product={product} />

          {/* Columna de decisión */}
          <div className="lg:pt-2">
            <Reveal>
              <h1 className="heading-section text-3xl! md:text-4xl!">
                {product.title}
              </h1>

              {categories.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <li key={category.slug}>
                      <Link
                        href={`/catalogo/${category.slug}`}
                        className="inline-flex border border-ink-200 px-3 py-1 text-xs text-ink-600 transition-colors hover:border-brand-600 hover:text-brand-600"
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              {product.description && (
                <div className="mt-6 border-t border-ink-200 pt-6">
                  <p className="leading-relaxed whitespace-pre-line text-ink-700">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Cotización: es la única conversión del sitio, así que ocupa
                  el lugar que en una tienda tendría el precio. */}
              <div className="mt-8 border border-ink-200 bg-white p-6">
                <p className="eyebrow text-accent-600">Precio a medida</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">
                  Fabricamos sobre pedido: el precio depende de las medidas, el
                  acabado y el tapiz. Mándanos el modelo y te contestamos con
                  precio y tiempo de entrega.
                </p>

                <a
                  href={whatsappUrl(waMessages.quote(product.title))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 flex w-full items-center justify-center gap-2 bg-accent-600 py-4 text-sm font-medium text-white transition-colors hover:bg-accent-700"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M12.05 21.79h-.01a9.87 9.87 0 01-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 01-1.51-5.26c0-5.45 4.44-9.89 9.89-9.89a9.82 9.82 0 016.99 2.9 9.83 9.83 0 012.89 6.99c0 5.45-4.44 9.89-9.88 9.89m8.41-18.3A11.82 11.82 0 0012.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 005.69 1.45c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 00-3.48-8.4" />
                  </svg>
                  Cotizar por WhatsApp
                </a>

                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
                  {contact.phones.map((phone) => (
                    <a
                      key={phone.tel}
                      href={`tel:${phone.tel}`}
                      className="tabular-nums hover:text-brand-600"
                    >
                      o llama al {phone.value}
                    </a>
                  ))}
                </div>
              </div>

              {/* Razones para no dudar */}
              <ul className="mt-6 space-y-3">
                {[
                  "Fabricación propia: sin intermediarios en el precio",
                  "Medidas, acabado y tapiz ajustables a tu proyecto",
                  "Envíos a toda la República Mexicana",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-ink-700">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      className="mt-0.5 shrink-0 text-brand-600"
                      aria-hidden
                    >
                      <path
                        d="M4 12.5l5 5L20 6.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-ink-200 bg-white">
          <div className="container-page py-14">
            <Reveal>
              <h2 className="heading-section text-2xl! md:text-3xl!">
                También te puede servir
              </h2>
            </Reveal>

            <RevealGroup
              className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4"
              step={0.05}
            >
              {related.map((item) => (
                <RevealItem key={item.slug}>
                  <ProductCard product={item} />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}
    </>
  );
}
