/**
 * Acceso al catálogo.
 *
 * Los datos salen del backup de WordPress y viven en un JSON estático, así
 * que todo esto corre en build time y no toca base de datos. Cuando el
 * catálogo se mueva a un CMS, solo cambia este archivo.
 */
import rawCatalog from "@/data/catalog.json";
import { displayName, HIDDEN_CATEGORY_SLUGS } from "./taxonomy";

export type ProductImage = {
  src: string;
  width: number;
  height: number;
  blurDataURL: string;
};

export type Product = {
  wpId: number;
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  categoryIds: number[];
  images: ProductImage[];
  createdAt: string;
  /**
   * Ruta del modelo 3D, cuando el producto tiene uno.
   * Se llena desde `src/data/models.json` cuando lleguen los GLB de fábrica;
   * mientras tanto es null y la ficha degrada a galería de fotos.
   */
  model: ProductModel | null;
};

export type ProductModel = {
  /** GLB optimizado, servido desde /models. */
  glb: string;
  /** USDZ para Quick Look en iOS. Opcional: model-viewer puede derivarlo. */
  usdz?: string;
  /** Dimensiones reales en centímetros, para la ficha técnica. */
  dimensions?: { width: number; depth: number; height: number };
};

export type Category = {
  id: number;
  slug: string;
  name: string;
  parent: number;
  description: string;
  productCount: number;
  children: number[];
};

type RawCategory = (typeof rawCatalog)["categories"][number];
type RawProduct = (typeof rawCatalog)["products"][number];

/* ── Modelos 3D ───────────────────────────────────────────────────────
   Mapa slug -> modelo. Se irá llenando conforme Ofifitted entregue los GLB.
   El sitio entero está escrito para funcionar con este mapa vacío: sin
   modelo, la ficha degrada a galería de fotos sin dejar huecos.

   La única entrada de hoy es el escritorio de prueba que genera
   `scripts/make-placeholder-model.mjs`. Está aquí para poder revisar el
   visor y la realidad aumentada antes de la primera entrega de modelos;
   se quita en cuanto llegue el GLB real de este producto.               */
const MODELS: Record<string, ProductModel> = {
  "escritorio-dak-2": {
    glb: "/models/escritorio-demo.glb",
    dimensions: { width: 160, depth: 70, height: 75 },
  },
};

/* ── Normalización ───────────────────────────────────────────────────── */

function toCategory(c: RawCategory): Category {
  return {
    id: c.id,
    slug: c.slug,
    name: displayName(c.slug, c.name),
    parent: c.parent,
    description: c.description,
    productCount: c.productCount,
    children: c.children,
  };
}

function toProduct(p: RawProduct): Product {
  return {
    wpId: p.wpId,
    slug: p.slug,
    title: p.title,
    description: p.description,
    excerpt: p.excerpt,
    categoryIds: p.categoryIds,
    images: p.images as ProductImage[],
    createdAt: p.createdAt,
    model: MODELS[p.slug] ?? null,
  };
}

const allCategories: Category[] = (rawCatalog.categories as RawCategory[]).map(
  toCategory
);

/** Solo productos con al menos una imagen: sin foto no hay ficha que valga. */
const allProducts: Product[] = (rawCatalog.products as RawProduct[])
  .map(toProduct)
  .filter((p) => p.images.length > 0);

const categoriesById = new Map(allCategories.map((c) => [c.id, c]));
const categoriesBySlug = new Map(allCategories.map((c) => [c.slug, c]));
const productsBySlug = new Map(allProducts.map((p) => [p.slug, p]));

/* ── Consultas ───────────────────────────────────────────────────────── */

export function getCategories(): Category[] {
  return allCategories.filter((c) => !HIDDEN_CATEGORY_SLUGS.has(c.slug));
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categoriesBySlug.get(slug);
}

export function getCategoryById(id: number): Category | undefined {
  return categoriesById.get(id);
}

/** Categorías raíz, de mayor a menor inventario. */
export function getRootCategories(): Category[] {
  return getCategories()
    .filter((c) => c.parent === 0 || !categoriesById.has(c.parent))
    .sort((a, b) => b.productCount - a.productCount);
}

export function getChildren(category: Category): Category[] {
  return category.children
    .map((id) => categoriesById.get(id))
    .filter((c): c is Category => Boolean(c) && !HIDDEN_CATEGORY_SLUGS.has(c!.slug))
    .sort((a, b) => b.productCount - a.productCount);
}

export function getProducts(): Product[] {
  return allProducts;
}

export function getProductBySlug(slug: string): Product | undefined {
  return productsBySlug.get(slug);
}

/**
 * Productos de una categoría, incluyendo los de sus subcategorías.
 * En este catálogo un producto puede estar en varias ramas a la vez, así que
 * se deduplica por slug.
 */
export function getProductsByCategory(category: Category): Product[] {
  const ids = new Set<number>([category.id]);
  const walk = (c: Category) => {
    for (const childId of c.children) {
      if (ids.has(childId)) continue;
      ids.add(childId);
      const child = categoriesById.get(childId);
      if (child) walk(child);
    }
  };
  walk(category);

  return allProducts.filter((p) => p.categoryIds.some((id) => ids.has(id)));
}

/** Las categorías a las que pertenece un producto, para migas y enlaces. */
export function getProductCategories(product: Product): Category[] {
  return product.categoryIds
    .map((id) => categoriesById.get(id))
    .filter((c): c is Category => Boolean(c));
}

/**
 * Productos relacionados: mismos padres, excluyendo el actual.
 * Sirve para la fila de "También te puede servir" en la ficha.
 */
export function getRelatedProducts(product: Product, limit = 4): Product[] {
  const ids = new Set(product.categoryIds);
  return allProducts
    .filter((p) => p.slug !== product.slug && p.categoryIds.some((id) => ids.has(id)))
    .slice(0, limit);
}

/** Primera imagen utilizable de una categoría, para tarjetas y mega menú. */
export function getCategoryCover(category: Category): ProductImage | null {
  const [first] = getProductsByCategory(category);
  return first?.images[0] ?? null;
}

export function getProductsWithModel(): Product[] {
  return allProducts.filter((p) => p.model !== null);
}

export const catalogStats = {
  products: allProducts.length,
  categories: getCategories().length,
  withModel: allProducts.filter((p) => p.model).length,
};
