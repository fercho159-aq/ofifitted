"use server";

import { getProducts, type ProductImage } from "./catalog";

export type SearchResult = {
  slug: string;
  title: string;
  image: ProductImage | null;
};

export async function searchProducts(query: string): Promise<SearchResult[]> {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const words = q.split(/\s+/);
  const products = getProducts();

  const matches: { product: (typeof products)[number]; score: number }[] = [];

  for (const p of products) {
    const title = p.title.toLowerCase();
    let score = 0;

    if (title === q) {
      score = 100;
    } else if (title.startsWith(q)) {
      score = 80;
    } else if (title.includes(q)) {
      score = 60;
    } else {
      const matched = words.filter((w) => title.includes(w));
      if (matched.length === words.length) score = 40;
      else if (matched.length > 0) score = 20 * (matched.length / words.length);
    }

    if (score > 0) matches.push({ product: p, score });
  }

  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((m) => ({
      slug: m.product.slug,
      title: m.product.title,
      image: m.product.images[0] ?? null,
    }));
}
