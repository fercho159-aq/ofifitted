import { CatalogShortcut } from "@/components/home/CatalogShortcut";
import { Hero } from "@/components/home/Hero";
import { Testimonials } from "@/components/home/Testimonials";
import { PartnersSection } from "@/components/projects/PartnersSection";
import { ProcessSection } from "@/components/projects/ProcessSection";
import { ProjectQuoteSection } from "@/components/projects/ProjectQuoteSection";
import { SpacesSection } from "@/components/projects/SpacesSection";
import { VideoReel } from "@/components/projects/VideoReel";
import {
  catalogStats,
  getCategoryBySlug,
  getCategoryCover,
  getProductBySlug,
  getRootCategories,
} from "@/lib/catalog";

/**
 * Home orientada a proyectos B2B.
 *
 * Orden: promesa (hero) → qué espacios equipamos → cómo trabajamos →
 * socios comerciales → prueba social → brief de proyecto. El catálogo de
 * piezas sueltas cierra la página como complemento, no como protagonista.
 */
export default function HomePage() {
  // Foto de ambiente (oficina de dirección completa), no un recorte de
  // producto: el hero vende el espacio terminado, no el mueble.
  const heroImage =
    getProductBySlug("centuria-directivo-2")?.images[0] ??
    (() => {
      const fallback = getCategoryBySlug("directivo-escritorios");
      return fallback ? getCategoryCover(fallback) : null;
    })();

  const catalogCards = getRootCategories()
    .slice(0, 6)
    .map((category) => ({ category, cover: getCategoryCover(category) }));

  return (
    <>
      {heroImage && <Hero image={heroImage} />}
      <SpacesSection />
      <VideoReel />
      <ProcessSection />
      <PartnersSection />
      <Testimonials />
      <ProjectQuoteSection />
      <CatalogShortcut cards={catalogCards} productCount={catalogStats.products} />
    </>
  );
}
