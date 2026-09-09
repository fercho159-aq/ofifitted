import Link from "next/link";

import { getRootCategories } from "@/lib/catalog";
import { waMessages, whatsappUrl } from "@/lib/site";

export default function NotFound() {
  const categories = getRootCategories().slice(0, 6);

  return (
    <section className="container-page flex min-h-[60vh] flex-col justify-center py-20">
      <p className="eyebrow text-accent-600">Error 404</p>
      <h1 className="heading-section mt-3 max-w-2xl">
        Esta página no existe, pero el mueble probablemente sí.
      </h1>
      <p className="mt-4 max-w-xl text-ink-600">
        Puede que el enlace haya cambiado con el sitio nuevo. Busca por línea
        de producto o pregúntanos directo.
      </p>

      <ul className="mt-8 flex flex-wrap gap-2">
        {categories.map((category) => (
          <li key={category.slug}>
            <Link
              href={`/catalogo/${category.slug}`}
              className="inline-flex border border-ink-200 px-4 py-2 text-sm text-ink-700 transition-colors hover:border-brand-600 hover:text-brand-600"
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/catalogo"
          className="inline-flex items-center justify-center bg-ink-900 px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-ink-800"
        >
          Ver el catálogo
        </Link>
        <a
          href={whatsappUrl(waMessages.general)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center border border-ink-300 px-7 py-4 text-sm font-medium text-ink-900 transition-colors hover:border-brand-600 hover:text-brand-600"
        >
          Preguntar por WhatsApp
        </a>
      </div>
    </section>
  );
}
