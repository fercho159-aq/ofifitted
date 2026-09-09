import {
  getCategoryBySlug,
  getCategoryCover,
  type ProductImage,
} from "@/lib/catalog";
import { megaMenu, navLinks } from "@/lib/taxonomy";

import { HeaderClient } from "./HeaderClient";

export type NavItem = {
  label: string;
  href: string;
  count: number;
};

export type NavColumn = {
  title: string;
  href: string | null;
  items: NavItem[];
};

export type NavGroup = {
  label: string;
  href: string;
  blurb: string;
  columns: NavColumn[];
  featured: {
    label: string;
    href: string;
    image: ProductImage;
  } | null;
};

/**
 * Resuelve el mega menú contra el catálogo real.
 *
 * Corre en el servidor durante el build: el cliente recibe la estructura ya
 * armada, con conteos e imagen de portada, y no vuelve a tocar el catálogo.
 */
function buildNav(): NavGroup[] {
  return megaMenu.map((group) => {
    const columns: NavColumn[] = group.columns.map((col) => ({
      title: col.title,
      href: col.href ? `/catalogo/${col.href}` : null,
      items: col.items.flatMap((item) => {
        const category = getCategoryBySlug(item.slug);
        if (!category) return [];
        return [
          {
            label: item.label,
            href: `/catalogo/${category.slug}`,
            count: category.productCount,
          },
        ];
      }),
    }));

    const featuredCategory = getCategoryBySlug(group.featuredCategorySlug);
    const cover = featuredCategory ? getCategoryCover(featuredCategory) : null;

    return {
      label: group.label,
      href: group.href,
      blurb: group.blurb,
      columns,
      featured:
        featuredCategory && cover
          ? {
              label: featuredCategory.name,
              href: `/catalogo/${featuredCategory.slug}`,
              image: cover,
            }
          : null,
    };
  });
}

export function Header() {
  return <HeaderClient groups={buildNav()} links={[...navLinks]} />;
}
