import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { ScrollZoom } from "@/components/ui/ScrollFx";
import {
  catalogStats,
  getCategoryBySlug,
  getCategoryCover,
} from "@/lib/catalog";
import { getFigures, SHOW_PLACEHOLDER_CONTENT } from "@/data/testimonials";
import { contact, waMessages, whatsappUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Ofifitted fabrica mobiliario de oficina en la Ciudad de México. Planta propia, fabricación sobre medida y entrega a toda la República.",
};

const CAPABILITIES = [
  {
    title: "Diseño y adaptación",
    body: "Tomamos tu plano y devolvemos la distribución con el mobiliario que cabe, no el que había en catálogo.",
  },
  {
    title: "Estructura metálica",
    body: "Corte, doblez, soldadura y pintura electrostática en planta. Es lo que permite sostener un modelo años.",
  },
  {
    title: "Carpintería y laminado",
    body: "Cubiertas, credenzas y libreros en melamina y chapa, con cantos y herrajes de línea comercial.",
  },
  {
    title: "Tapicería",
    body: "Tapiz en tela, vinipiel o piel, en el color que pida tu manual de marca.",
  },
  {
    title: "Instalación",
    body: "Armado y colocación en sitio, coordinado con el horario de tu edificio.",
  },
  {
    title: "Servicio posterior",
    body: "Refacciones y piezas adicionales del mismo modelo, porque conservamos el molde.",
  },
];

export default function NosotrosPage() {
  const heroCategory = getCategoryBySlug("centros-de-trabajo");
  const heroImage = heroCategory ? getCategoryCover(heroCategory) : null;

  const figures = getFigures();

  return (
    <>
      <section className="border-b border-ink-200 bg-white">
        <div className="container-page py-14 md:py-20">
          <Reveal>
            <p className="eyebrow text-accent-600">Nosotros</p>
            <h1 className="heading-section mt-3 max-w-3xl">
              Somos la planta, no el intermediario.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-600">
              Ofifitted fabrica mobiliario para oficina en la Ciudad de México.
              Diseñamos, cortamos, soldamos, tapizamos y entregamos nosotros
              mismos. Cuando pides una medida distinta, no hay que preguntarle
              a nadie más.
            </p>
          </Reveal>
        </div>
      </section>

      {heroImage && (
        <ScrollZoom className="relative aspect-16/9 max-h-[60vh] w-full bg-ink-100">
          <Image
            src={heroImage.src}
            alt=""
            fill
            sizes="100vw"
            placeholder="blur"
            blurDataURL={heroImage.blurDataURL}
            className="object-cover"
          />
        </ScrollZoom>
      )}

      {/* Cifras. Las verificables salen del catálogo; el resto está
          pendiente de que el cliente las confirme. */}
      <section className="container-page py-16 md:py-24">
        <RevealGroup
          className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4"
          step={0.07}
        >
          <RevealItem>
            <Figure value={String(catalogStats.products)} label="Modelos en catálogo" />
          </RevealItem>
          <RevealItem>
            <Figure value={String(catalogStats.categories)} label="Líneas de producto" />
          </RevealItem>
          <RevealItem>
            <Figure value="32" label="Estados con entrega" />
          </RevealItem>
          <RevealItem>
            <Figure value="A medida" label="Fabricación" />
          </RevealItem>
        </RevealGroup>

        {SHOW_PLACEHOLDER_CONTENT && figures.length > 0 && (
          <div className="mt-10 border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-medium">Cifras pendientes de confirmar</p>
            <p className="mt-1 text-amber-800">
              Faltan por pedirle a Ofifitted: {figures.map((f) => f.label.toLowerCase()).join(", ")}.
              No se publican hasta tenerlas por escrito.
            </p>
          </div>
        )}
      </section>

      {/* Qué hacemos en planta */}
      <section className="border-y border-ink-200 bg-white">
        <div className="container-page py-16 md:py-24">
          <Reveal>
            <p className="eyebrow text-accent-600">Lo que hacemos en planta</p>
            <h2 className="heading-section mt-3 max-w-2xl">
              Todo el proceso ocurre bajo el mismo techo.
            </h2>
          </Reveal>

          <RevealGroup
            className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
            step={0.07}
          >
            {CAPABILITIES.map((item, i) => (
              <RevealItem key={item.title}>
                <article>
                  <span className="text-xs tabular-nums text-ink-400">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-1.5 text-lg font-medium text-ink-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">
                    {item.body}
                  </p>
                </article>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Dónde estamos */}
      <section className="container-page py-16 md:py-24">
        <Reveal>
          <p className="eyebrow text-accent-600">Dónde estamos</p>
          <h2 className="heading-section mt-3">Ven a verlo en persona.</h2>
          <p className="mt-4 max-w-xl text-ink-600">
            El mueble de oficina se juzga sentándose en él. Si estás en la zona
            metropolitana, agenda una visita y pruébalo antes de decidir.
          </p>
        </Reveal>

        <RevealGroup className="mt-10 grid gap-8 md:grid-cols-2" step={0.1}>
          {contact.locations.map((location) => (
            <RevealItem key={location.kind}>
              <div className="border-t-2 border-ink-900 pt-5">
                <p className="eyebrow text-accent-600">{location.kind}</p>
                <p className="mt-2 leading-relaxed text-ink-800">
                  {location.address}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal delay={0.15}>
          <div className="mt-12 flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappUrl(waMessages.project)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-accent-600 px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-accent-700"
            >
              Agendar una visita
            </a>
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center border border-ink-300 px-7 py-4 text-sm font-medium text-ink-900 transition-colors hover:border-brand-600 hover:text-brand-600"
            >
              Ver el catálogo
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function Figure({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-t-2 border-ink-900 pt-4">
      <p className="font-[family-name:var(--font-display)] text-3xl font-semibold text-ink-900 md:text-4xl">
        {value}
      </p>
      <p className="mt-1 text-sm text-ink-500">{label}</p>
    </div>
  );
}
