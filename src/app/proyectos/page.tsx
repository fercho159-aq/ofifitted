import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import {
  getCategoryBySlug,
  getCategoryCover,
  getRootCategories,
} from "@/lib/catalog";
import { waMessages, whatsappUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Proyectos Integrales",
  description:
    "Amueblamos oficinas completas: salas, pisos y edificios enteros. Un solo proveedor, fabricación propia y precio de planta.",
};

const AUDIENCES = [
  {
    title: "Empresas",
    body: "Desde una sala de juntas hasta una nave completa. Unificamos acabados, coordinamos entregas y facturamos en una sola orden.",
    icon: (
      <path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16" />
    ),
  },
  {
    title: "Arquitectos e interioristas",
    body: "Fabricamos sobre plano. Ajustamos medidas, acabados y materiales al proyecto sin que cambien tus tiempos de obra.",
    icon: (
      <path d="M2 20h20M5 20V8.5L12 3l7 5.5V20M9 20v-4a3 3 0 016 0v4" />
    ),
  },
  {
    title: "Contratistas",
    body: "Producción en volumen con precio de planta. Un solo proveedor para sillas, escritorios, recepciones y almacenamiento.",
    icon: (
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    ),
  },
];

const STEPS = [
  {
    step: "01",
    title: "Mándanos tu espacio",
    body: "Plano, croquis o fotos con medidas. Evaluamos el espacio y te proponemos la distribución.",
  },
  {
    step: "02",
    title: "Diseñamos la propuesta",
    body: "Selección de mobiliario, distribución, acabados y cotización desglosada por partida.",
  },
  {
    step: "03",
    title: "Ajustamos juntos",
    body: "Cambias líneas, medidas o cantidades las veces que necesites. Sin compromiso hasta que apruebes.",
  },
  {
    step: "04",
    title: "Fabricamos y entregamos",
    body: "Producción en nuestra planta, con fecha comprometida y entrega coordinada en sitio.",
  },
];

const ADVANTAGES = [
  {
    title: "Precio de fábrica",
    body: "Sin distribuidores ni intermediarios. El precio sale de la planta directo a tu orden de compra.",
  },
  {
    title: "Fabricación a medida",
    body: "Ajustamos dimensiones al plano sin modificar el precio. El mueble se hace para tu espacio.",
  },
  {
    title: "Un solo proveedor",
    body: "Escritorios, sillas, recepciones y almacenamiento de la misma planta. Una factura, una entrega.",
  },
  {
    title: "Soporte a largo plazo",
    body: "Tenemos el molde. Dentro de dos años fabricamos piezas adicionales con el mismo acabado.",
  },
];

export default function ProyectosPage() {
  const heroCategory =
    getCategoryBySlug("recepciones") ?? getCategoryBySlug("centros-de-trabajo");
  const heroImage = heroCategory ? getCategoryCover(heroCategory) : null;

  const categories = getRootCategories()
    .slice(0, 8)
    .map((category) => ({ category, cover: getCategoryCover(category) }));

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-900 py-24 md:py-32">
        {heroImage && (
          <div className="absolute inset-0">
            <Image
              src={heroImage.src}
              alt=""
              fill
              priority
              sizes="100vw"
              placeholder="blur"
              blurDataURL={heroImage.blurDataURL}
              className="object-cover opacity-30"
            />
          </div>
        )}
        <div className="container-page relative z-10">
          <Reveal>
            <p className="eyebrow text-accent-400">Proyectos integrales</p>
            <h1 className="heading-hero mt-4 max-w-3xl text-white">
              Amueblamos tu oficina de piso a techo.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">
              Un solo proveedor, fabricación propia y precio de planta. Desde
              una sala de juntas hasta un edificio corporativo completo.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappUrl(waMessages.project)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-accent-600 px-8 py-4 text-sm font-medium text-white transition-colors hover:bg-accent-700"
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M12.05 21.79h-.01a9.87 9.87 0 01-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 01-1.51-5.26c0-5.45 4.44-9.89 9.89-9.89a9.82 9.82 0 016.99 2.9 9.83 9.83 0 012.89 6.99c0 5.45-4.44 9.89-9.88 9.89m8.41-18.3A11.82 11.82 0 0012.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 005.69 1.45c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 00-3.48-8.4" />
                </svg>
                Solicitar propuesta
              </a>
              <Link
                href="/contacto"
                className="inline-flex items-center justify-center border border-white/25 px-8 py-4 text-sm font-medium text-white transition-colors hover:border-white/60 hover:bg-white/5"
              >
                Otras formas de contacto
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Para quien */}
      <section className="container-page py-20 md:py-28">
        <Reveal>
          <p className="eyebrow text-accent-600">
            ¿Para quién es este servicio?
          </p>
          <h2 className="heading-section mt-3 max-w-2xl">
            Quien necesite amueblar un espacio completo.
          </h2>
        </Reveal>

        <RevealGroup className="mt-12 grid gap-6 md:grid-cols-3" step={0.1}>
          {AUDIENCES.map((item) => (
            <RevealItem key={item.title}>
              <article className="h-full border border-ink-200 p-8">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    {item.icon}
                  </svg>
                </span>
                <h3 className="mt-5 font-[family-name:var(--font-display)] text-xl font-medium text-ink-900">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-600">
                  {item.body}
                </p>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* Catálogo por línea */}
      <section className="border-t border-ink-200 bg-white">
        <div className="container-page py-20 md:py-28">
          <Reveal>
            <p className="eyebrow text-accent-600">
              Todo sale de la misma planta
            </p>
            <h2 className="heading-section mt-3 max-w-2xl">
              Líneas de mobiliario disponibles.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-600">
              Escritorios, sillas, recepciones, almacenamiento y líneas
              especiales. Mismo acabado, un solo proveedor.
            </p>
          </Reveal>

          <RevealGroup
            className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            step={0.07}
          >
            {categories.map(({ category, cover }) => (
              <RevealItem key={category.slug}>
                <Link
                  href={`/catalogo/${category.slug}`}
                  className="group relative block overflow-hidden bg-ink-50"
                >
                  <div className="aspect-4/3">
                    {cover ? (
                      <Image
                        src={cover.src}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        placeholder="blur"
                        blurDataURL={cover.blurDataURL}
                        className="object-contain p-6 transition-transform duration-700 ease-[var(--ease-brand)] group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-ink-100" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-ink-900">
                      {category.name}
                    </h3>
                    <p className="mt-0.5 text-sm text-ink-500">
                      {category.productCount} modelos
                    </p>
                  </div>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal delay={0.1}>
            <Link
              href="/catalogo"
              className="mt-10 inline-flex items-center gap-2 border-b border-ink-900 pb-1 text-sm font-medium text-ink-900 transition-colors hover:border-brand-600 hover:text-brand-600"
            >
              Ver catálogo completo
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
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="border-y border-ink-200 bg-ink-50">
        <div className="container-page py-20 md:py-28">
          <Reveal>
            <p className="eyebrow text-accent-600">Cómo funciona</p>
            <h2 className="heading-section mt-3 max-w-2xl">
              De tu plano a la oficina instalada.
            </h2>
          </Reveal>

          <RevealGroup
            className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4"
            step={0.09}
          >
            {STEPS.map((item) => (
              <RevealItem key={item.step}>
                <div className="border-t-2 border-accent-600 pt-6">
                  <span className="font-[family-name:var(--font-display)] text-sm tabular-nums text-accent-600">
                    {item.step}
                  </span>
                  <h3 className="mt-3 font-medium text-ink-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">
                    {item.body}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Por que Ofifitted */}
      <section className="container-page py-20 md:py-28">
        <Reveal>
          <p className="eyebrow text-accent-600">Por qué Ofifitted</p>
          <h2 className="heading-section mt-3 max-w-2xl">
            Lo que un intermediario no puede ofrecer.
          </h2>
        </Reveal>

        <RevealGroup className="mt-12 grid gap-8 md:grid-cols-2" step={0.09}>
          {ADVANTAGES.map((item) => (
            <RevealItem key={item.title}>
              <div className="flex gap-4">
                <span
                  aria-hidden
                  className="mt-2 h-px w-8 shrink-0 bg-accent-600"
                />
                <div>
                  <h3 className="font-medium text-ink-900">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-600">
                    {item.body}
                  </p>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* CTA final */}
      <section className="bg-ink-900">
        <div className="container-page py-16 text-center md:py-20">
          <Reveal>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-white md:text-3xl">
              Cuéntanos qué espacio necesitas amueblar.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-white/70">
              Sin costo, sin compromiso. Te devolvemos una propuesta con
              distribución, mobiliario y precio desglosado.
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={whatsappUrl(waMessages.project)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-accent-600 px-8 py-4 text-sm font-medium text-white transition-colors hover:bg-accent-700"
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M12.05 21.79h-.01a9.87 9.87 0 01-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 01-1.51-5.26c0-5.45 4.44-9.89 9.89-9.89a9.82 9.82 0 016.99 2.9 9.83 9.83 0 012.89 6.99c0 5.45-4.44 9.89-9.88 9.89m8.41-18.3A11.82 11.82 0 0012.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 005.69 1.45c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 00-3.48-8.4" />
                </svg>
                Enviar por WhatsApp
              </a>
              <Link
                href="/catalogo"
                className="inline-flex items-center border border-white/25 px-8 py-4 text-sm font-medium text-white transition-colors hover:border-white/60 hover:bg-white/5"
              >
                Ver el catálogo
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
