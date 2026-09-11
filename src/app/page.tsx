import { CategoriesSection } from "@/components/home/CategoriesSection";
import { Hero } from "@/components/home/Hero";
import { OfferSection } from "@/components/home/OfferSection";
import { ProjectsBanner } from "@/components/home/ProjectsBanner";
import { Testimonials } from "@/components/home/Testimonials";
import { ValueStrip } from "@/components/home/ValueStrip";
import { ViewerTeaser } from "@/components/home/ViewerTeaser";
import {
  catalogStats,
  getCategoryBySlug,
  getCategoryCover,
  getProductBySlug,
  getRootCategories,
  getVisualizableProducts,
} from "@/lib/catalog";

export default function HomePage() {
  const heroCategory =
    getCategoryBySlug("directivo-escritorios") ?? getCategoryBySlug("escritorios");
  const heroImage = heroCategory ? getCategoryCover(heroCategory) : null;

  const cards = getRootCategories()
    .slice(0, 7)
    .map((category) => ({ category, cover: getCategoryCover(category) }));

  const visualizable = getVisualizableProducts();
  const teaserProduct =
    getProductBySlug("altus-2") ?? visualizable.find((p) => p.cutout) ?? null;

  return (
    <>
      {heroImage && (
        <Hero
          image={heroImage}
          productCount={catalogStats.products}
          categoryCount={catalogStats.categories}
        />
      )}
      <CategoriesSection cards={cards} />
      <ProjectsBanner />
      <ValueStrip />
      <ViewerTeaser product={teaserProduct} total={visualizable.length} />
      <Testimonials />
      <OfferSection />
    </>
  );
}
