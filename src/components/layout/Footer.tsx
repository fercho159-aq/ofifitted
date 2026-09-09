import Image from "next/image";
import Link from "next/link";

import { getRootCategories } from "@/lib/catalog";
import { contact, site, waMessages, whatsappUrl } from "@/lib/site";
import { navLinks } from "@/lib/taxonomy";

export function Footer() {
  const categories = getRootCategories().slice(0, 8);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-ink-200 bg-white">
      {/* Cierre de venta: última oportunidad antes del pie legal. */}
      <div className="border-b border-ink-200 bg-brand-600 text-white">
        <div className="container-page flex flex-col items-start gap-6 py-12 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="heading-section max-w-xl text-white">
              Mándanos el plano de tu oficina.
            </h2>
            <p className="mt-3 max-w-lg text-sm text-white/70">
              Te devolvemos una propuesta de distribución con el mobiliario
              cotizado. Sin costo y sin compromiso.
            </p>
          </div>
          <a
            href={whatsappUrl(waMessages.project)}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 bg-white px-7 py-4 text-sm font-medium text-brand-700 transition-colors hover:bg-ink-50"
          >
            Enviar por WhatsApp
          </a>
        </div>
      </div>

      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Image
            src="/brand/logo-ofifitted.png"
            alt={site.name}
            width={192}
            height={43}
            className="h-8 w-auto"
          />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-600">
            {site.description}
          </p>
        </div>

        <div>
          <p className="eyebrow mb-4 text-ink-400">Catálogo</p>
          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/catalogo/${category.slug}`}
                  className="text-sm text-ink-700 transition-colors hover:text-brand-600"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-4 text-ink-400">Empresa</p>
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-ink-700 transition-colors hover:text-brand-600"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/aviso-de-privacidad"
                className="text-sm text-ink-700 transition-colors hover:text-brand-600"
              >
                Aviso de privacidad
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-4 text-ink-400">Contacto</p>
          <ul className="space-y-2 text-sm text-ink-700">
            {[...contact.phones, ...contact.office].map((phone) => (
              <li key={phone.tel}>
                <a
                  href={`tel:${phone.tel}`}
                  className="tabular-nums transition-colors hover:text-brand-600"
                >
                  {phone.label} · {phone.value}
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-5 space-y-3">
            {contact.locations.map((location) => (
              <div key={location.kind}>
                <p className="text-xs font-medium text-ink-900">{location.kind}</p>
                <p className="text-sm leading-relaxed text-ink-600">
                  {location.address}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-5 text-xs text-ink-500">{contact.hours}</p>
        </div>
      </div>

      <div className="border-t border-ink-100">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.legalName}. Fabricantes de mobiliario para oficina.
          </p>
          <p>Hecho en México</p>
        </div>
      </div>
    </footer>
  );
}
