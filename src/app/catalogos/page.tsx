import type { Metadata } from "next";
import Image from "next/image";

import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { formatSize, getCatalogs } from "@/lib/catalogs";
import { waMessages, whatsappUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Catálogos",
  description:
    "Descarga los catálogos de Ofifitted en PDF: línea general, sillería, muebles metálicos, interiorismo y colecciones especiales.",
};

export default function CatalogosPage() {
  const catalogs = getCatalogs();

  return (
    <>
      <section className="border-b border-ink-200 bg-white">
        <div className="container-page py-14 md:py-20">
          <Reveal>
            <p className="eyebrow text-accent-600">Descargables</p>
            <h1 className="heading-section mt-3 max-w-3xl">
              Catálogos en PDF
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-600">
              Los mismos catálogos que usan nuestros vendedores. Descárgalos,
              márcalos y mándanos las páginas que te interesan por WhatsApp:
              es la forma más rápida de cotizar varias piezas de golpe.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container-page py-14 md:py-20">
        <RevealGroup
          className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
          step={0.06}
        >
          {catalogs.map((catalog) => (
            <RevealItem key={catalog.slug}>
              <article className="group flex h-full flex-col">
                <a
                  href={catalog.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block aspect-3/4 overflow-hidden bg-ink-100"
                >
                  {catalog.cover ? (
                    <Image
                      src={catalog.cover.src}
                      alt={`Portada de ${catalog.title}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      placeholder="blur"
                      blurDataURL={catalog.cover.blurDataURL}
                      className="object-cover transition-transform duration-700 ease-[var(--ease-brand)] group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-ink-400">
                      PDF
                    </div>
                  )}

                  {catalog.featured && (
                    <span className="absolute top-3 left-3 bg-accent-600 px-2.5 py-1 text-[10px] font-medium tracking-wide text-white uppercase">
                      Empieza aquí
                    </span>
                  )}
                </a>

                <h2 className="mt-4 text-lg font-medium text-ink-900">
                  {catalog.title}
                </h2>
                <p className="mt-1 flex-1 text-sm leading-relaxed text-ink-600">
                  {catalog.summary}
                </p>

                <a
                  href={catalog.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden>
                    <path
                      d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Descargar PDF
                  <span className="text-xs font-normal text-ink-400">
                    {formatSize(catalog.sizeBytes)}
                  </span>
                </a>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <section className="border-t border-ink-200 bg-white">
        <div className="container-page flex flex-col items-start gap-6 py-14 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="heading-section text-2xl! md:text-3xl!">
              ¿Ya marcaste las páginas?
            </h2>
            <p className="mt-2 max-w-lg text-ink-600">
              Mándanos los números de modelo o una captura del catálogo y te
              regresamos la cotización con precio y tiempo de entrega.
            </p>
          </div>
          <a
            href={whatsappUrl(waMessages.general)}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 bg-accent-600 px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-accent-700"
          >
            Cotizar por WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}
