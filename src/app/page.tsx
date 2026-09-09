import { CategoriesSection } from "@/components/home/CategoriesSection";
import { FactorySection } from "@/components/home/FactorySection";
import { Hero } from "@/components/home/Hero";
import { OfferSection } from "@/components/home/OfferSection";
import { ProblemSection } from "@/components/home/ProblemSection";
import { Testimonials } from "@/components/home/Testimonials";
import { ViewerTeaser } from "@/components/home/ViewerTeaser";
import {
  catalogStats,
  getCategoryBySlug,
  getCategoryCover,
  getProductsWithModel,
  getRootCategories,
} from "@/lib/catalog";

/**
 * Home.
 *
 * El orden sigue PASTOR: problema, amplificación, solución (la fábrica),
 * transformación (qué fabricamos), prueba social, y oferta con la respuesta.
 * El visor 3D se cuela entre la transformación y la prueba social, que es
 * donde alguien ya está considerando un modelo concreto.
 */
export default function HomePage() {
  const heroCategory =
    getCategoryBySlug("directivo-escritorios") ?? getCategoryBySlug("escritorios");
  const heroImage = heroCategory ? getCategoryCover(heroCategory) : null;

  const factoryCategory =
    getCategoryBySlug("recepciones") ?? getCategoryBySlug("centros-de-trabajo");
  const factoryImage = factoryCategory ? getCategoryCover(factoryCategory) : null;

  const cards = getRootCategories()
    .slice(0, 7)
    .map((category) => ({ category, cover: getCategoryCover(category) }));

  const [productWithModel = null] = getProductsWithModel();

  return (
    <>
      {heroImage && (
        <Hero
          image={heroImage}
          productCount={catalogStats.products}
          categoryCount={catalogStats.categories}
        />
      )}
      <ProblemSection />
      <FactorySection image={factoryImage} />
      <CategoriesSection cards={cards} />
      <ViewerTeaser product={productWithModel} />
      <Testimonials />
      <OfferSection />
    </>
  );
}
