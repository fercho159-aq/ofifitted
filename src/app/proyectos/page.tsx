import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { PartnersSection } from "@/components/projects/PartnersSection";
import { ProcessSection } from "@/components/projects/ProcessSection";
import { ProjectQuoteSection } from "@/components/projects/ProjectQuoteSection";
import { SpacesSection } from "@/components/projects/SpacesSection";
import { VideoReel } from "@/components/projects/VideoReel";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { getCategoryBySlug, getCategoryCover, getProductBySlug } from "@/lib/catalog";
import { waMessages, whatsappUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Proyectos corporativos llave en mano",
  description:
    "Equipamiento integral de oficinas, salas de juntas, lobbies y áreas comunes para empresas, arquitectos, constructoras y desarrolladores. Fabricación propia, entrega e instalación.",
};

const AUDIENCES = [
  {
    title: "Empresas medianas y grandes",
    body: "Corporativos, mudanzas y expansiones. Unificamos acabados en todas las áreas, coordinamos entregas y facturamos en una sola orden.",
    icon: (
      <path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16" />
    ),
  },
  {
    title: "Arquitectos e interioristas",
    body: "Fabricamos sobre tu especificación. Ajustamos medidas, acabados y materiales al proyecto sin mover tus tiempos.",
    icon: <path d="M2 20h20M5 20V8.5L12 3l7 5.5V20M9 20v-4a3 3 0 016 0v4" />,
  },
  {
    title: "Constructoras y contratistas",
    body: "Mobiliario como una partida más de la obra: volumen, calendario y un solo proveedor responsable.",
    icon: <path d="M2 18h20M4 18v-3a8 8 0 0116 0v3M12 7V4M9 7h6" />,
  },
  {
    title: "Desarrolladores inmobiliarios",
    body: "Amenidades, lobbies, oficinas muestra y áreas comunes listas para entregar o comercializar.",
    icon: <path d="M4 21V10l8-6 8 6v11M9 21v-6h6v6" />,
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
  const heroImage =
    getProductBySlug("mesa-de-juntas-armonia-2")?.images[0] ??
    (() => {
      const fallback = getCategoryBySlug("recepciones");
      return fallback ? getCategoryCover(fallback) : null;
    })();

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
              className="object-cover opacity-40"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-linear-to-r from-ink-900/95 via-ink-900/70 to-ink-900/30"
            />
          </div>
        )}
        <div className="container-page relative z-10">
          <Reveal>
            <p className="eyebrow text-accent-400">
              Proyectos corporativos llave en mano
            </p>
            <h1 className="heading-hero mt-4 max-w-4xl text-[clamp(2.1rem,5.2vw,4.4rem)]! leading-[1.04]! text-white">
              Un solo proveedor para equipar todo tu proyecto.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75">
              Oficinas, open spaces, salas de juntas, lobbies y áreas comunes.
              Proyectamos sobre tu plano, fabricamos en planta propia,
              entregamos e instalamos con fecha comprometida.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#cotizar"
                className="inline-flex items-center justify-center bg-accent-600 px-8 py-4 text-sm font-medium text-white transition-colors hover:bg-accent-700"
              >
                Cotiza tu proyecto
              </Link>
              <a
                href={whatsappUrl(waMessages.consult)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center border border-white/25 px-8 py-4 text-sm font-medium text-white transition-colors hover:border-white/60 hover:bg-white/5"
              >
                Agendar asesoría con un especialista
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Para quién */}
      <section className="container-page py-20 md:py-28">
        <Reveal>
          <p className="eyebrow text-accent-600">¿Con quién trabajamos?</p>
          <h2 className="heading-section mt-3 max-w-2xl">
            Para quien decide y ejecuta proyectos completos.
          </h2>
        </Reveal>

        <RevealGroup
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          step={0.1}
        >
          {AUDIENCES.map((item) => (
            <RevealItem key={item.title}>
              <article className="h-full border border-ink-200 bg-white p-7">
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

      <SpacesSection />
      <VideoReel />
      <ProcessSection />
      <PartnersSection />

      {/* Por qué Ofifitted */}
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

        <Reveal delay={0.1}>
          <p className="mt-12 text-sm text-ink-500">
            ¿Quieres revisar líneas y acabados antes?{" "}
            <Link
              href="/catalogo"
              className="font-medium text-ink-900 underline underline-offset-4 hover:text-brand-600"
            >
              Ver catálogo general
            </Link>{" "}
            ·{" "}
            <Link
              href="/catalogos"
              className="font-medium text-ink-900 underline underline-offset-4 hover:text-brand-600"
            >
              Catálogos PDF
            </Link>
          </p>
        </Reveal>
      </section>

      <ProjectQuoteSection />
    </>
  );
}
