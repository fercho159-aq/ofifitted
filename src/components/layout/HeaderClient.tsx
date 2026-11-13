"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { SocialLinks } from "@/components/ui/SocialLinks";
import { SearchBar } from "@/components/layout/SearchBar";
import { searchProducts, type SearchResult } from "@/lib/search-action";
import { drawer, megaPanel, overlay } from "@/lib/motion";
import { contact, waMessages, whatsappUrl } from "@/lib/site";
import { PRODUCTS_MENU_LABEL } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

import type { NavGroup } from "./Header";

type NavLink = { label: string; href: string };

type Props = {
  /** Grupos del catálogo: van todos dentro del desplegable "Productos". */
  groups: NavGroup[];
  /** Servicio de proyectos B2B: siempre visibles en escritorio. */
  primary: NavLink[];
  /** Enlaces secundarios: visibles desde xl. */
  links: NavLink[];
};

export function HeaderClient({ groups, primary, links }: Props) {
  const pathname = usePathname();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /** Cierra el panel con un respiro, para poder cruzar el hueco con el mouse. */
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openNow = useCallback((label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenGroup(label);
  }, []);

  const closeSoon = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenGroup(null), 120);
  }, []);

  // El header cambia de piel al salir del hero.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Cerrar todo al navegar.
     Se ajusta durante el render en vez de en un efecto: así el menú nunca
     alcanza a pintarse abierto sobre la página nueva. Es el patrón que
     React recomienda para "reiniciar estado cuando cambia una prop". */
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpenGroup(null);
    setDrawerOpen(false);
  }

  // Escape cierra lo que esté abierto.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpenGroup(null);
      setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Bloquear el scroll del fondo mientras el drawer está abierto.
  useEffect(() => {
    document.body.dataset.scrollLocked = drawerOpen ? "true" : "false";
    return () => {
      document.body.dataset.scrollLocked = "false";
    };
  }, [drawerOpen]);

  return (
    <>
      {/* ── Barra de confianza ─────────────────────────────────────── */}
      <div className="hidden bg-brand-600 text-white lg:block">
        <div className="container-page flex h-9 items-center justify-between text-xs">
          <p className="tracking-wide">
            Proyectos corporativos llave en mano · Fabricantes directos · Cobertura nacional
          </p>
          <div className="flex items-center gap-5">
            {contact.phones.map((phone) => (
              <a
                key={phone.tel}
                href={`tel:${phone.tel}`}
                className="tabular-nums transition-opacity hover:opacity-80"
              >
                {phone.label} {phone.value}
              </a>
            ))}
            <span className="h-4 w-px bg-white/25" aria-hidden />
            <SocialLinks tone="light" size="sm" className="-mr-1.5" />
          </div>
        </div>
      </div>

      {/* ── Header principal ───────────────────────────────────────── */}
      <header
        className={cn(
          "sticky top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300",
          scrolled || openGroup
            ? "border-ink-200 bg-paper/95 shadow-[0_1px_0_rgb(26_25_23/0.04)] backdrop-blur-md"
            : "border-transparent bg-paper"
        )}
        onMouseLeave={closeSoon}
      >
        <div className="container-page flex h-[var(--header-h)] items-center justify-between gap-6">
          {/* El logo es un emblema cuadrado: a la altura del header su texto
              interior no se alcanza a leer, así que el nombre va al lado en la
              tipografía del sitio. */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5"
            aria-label="Ofifitted, inicio"
          >
            <Image
              src="/brand/logo-ofifitted.png"
              alt=""
              width={512}
              height={512}
              priority
              className="h-9 w-9 rounded-lg md:h-10 md:w-10"
            />
            {/* Entre 1024 y 1535 px el mega menú ocupa todo el ancho y el
                nombre desbordaba la barra: ahí se queda solo el emblema. */}
            <span className="font-[family-name:var(--font-display)] text-xl leading-none font-medium tracking-wide text-ink-900 max-lg:inline hidden md:text-2xl 2xl:inline">
              OFIFITTED
            </span>
          </Link>

          {/* Navegación de escritorio */}
          <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
            {primary.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onMouseEnter={closeSoon}
                className={cn(
                  "flex h-[var(--header-h)] items-center px-2.5 text-sm font-medium whitespace-nowrap transition-colors xl:px-3",
                  pathname === link.href
                    ? "text-brand-600"
                    : "text-ink-800 hover:text-brand-600"
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* Catálogo de piezas sueltas: un solo desplegable que agrupa
                todas las líneas, para que no compita con el servicio de
                proyectos en la barra. */}
            <div onMouseEnter={() => openNow(PRODUCTS_MENU_LABEL)}>
              <Link
                href="/catalogo"
                aria-expanded={openGroup === PRODUCTS_MENU_LABEL}
                aria-haspopup="true"
                onFocus={() => openNow(PRODUCTS_MENU_LABEL)}
                className={cn(
                  "relative flex h-[var(--header-h)] items-center gap-1 px-2.5 text-sm font-medium whitespace-nowrap transition-colors xl:px-3",
                  openGroup === PRODUCTS_MENU_LABEL
                    ? "text-brand-600"
                    : "text-ink-600 hover:text-brand-600"
                )}
              >
                {PRODUCTS_MENU_LABEL}
                <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden>
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span
                  className={cn(
                    "absolute inset-x-3 bottom-0 h-[2px] origin-left bg-accent-600 transition-transform duration-300",
                    openGroup === PRODUCTS_MENU_LABEL ? "scale-x-100" : "scale-x-0"
                  )}
                />
              </Link>
            </div>

            {/* Los enlaces secundarios aparecen hasta xl: entre 1024 y 1280
                no caben sin partir etiquetas. Siguen accesibles desde el pie
                y desde el menú móvil. */}
            <span className="mx-2 hidden h-4 w-px bg-ink-200 xl:block" aria-hidden />

            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onMouseEnter={closeSoon}
                className="hidden px-2.5 text-sm whitespace-nowrap text-ink-600 transition-colors hover:text-brand-600 xl:block"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <SearchBar onOpenChange={(isOpen) => { if (isOpen) setDrawerOpen(false); }} />

            <Link
              href="/proyectos#cotizar"
              className="hidden shrink-0 items-center gap-2 bg-accent-600 px-5 py-2.5 text-sm font-medium whitespace-nowrap text-white transition-colors hover:bg-accent-700 sm:inline-flex"
            >
              Cotiza tu proyecto
            </Link>

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir menú"
              aria-expanded={drawerOpen}
              className="-mr-2 flex h-11 w-11 items-center justify-center text-ink-900 lg:hidden"
            >
              <span className="sr-only">Menú</span>
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
                <path
                  d="M3 6h18M3 12h18M3 18h18"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Panel del mega menú ──────────────────────────────────── */}
        <AnimatePresence>
          {openGroup === PRODUCTS_MENU_LABEL && (
            <ProductsPanel
              groups={groups}
              onEnter={() => openNow(PRODUCTS_MENU_LABEL)}
              onLeave={closeSoon}
            />
          )}
        </AnimatePresence>
      </header>

      {/* ── Menú vertical (móvil y tablet) ─────────────────────────── */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        groups={groups}
        primary={primary}
        links={links}
      />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════ */

function ProductsPanel({
  groups,
  onEnter,
  onLeave,
}: {
  groups: NavGroup[];
  onEnter: () => void;
  onLeave: () => void;
}) {
  return (
    <motion.div
      variants={megaPanel}
      initial="hidden"
      animate="show"
      exit="exit"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="absolute inset-x-0 top-full hidden border-b border-ink-200 bg-paper shadow-[0_24px_48px_-24px_rgb(26_25_23/0.25)] lg:block"
    >
      <div className="container-page grid grid-cols-12 gap-8 py-10">
        {/* Encabezado del catálogo */}
        <div className="col-span-3 border-r border-ink-200 pr-8">
          <p className="eyebrow text-ink-400">Catálogo general</p>
          <p className="mt-3 text-sm leading-relaxed text-ink-600">
            Piezas individuales de fabricación propia para reposición o
            compras puntuales. ¿Equipas un espacio completo?{" "}
            <Link href="/proyectos" className="font-medium text-brand-600 hover:text-brand-700">
              Conoce Proyectos
            </Link>
            .
          </p>
          <div className="mt-5 flex flex-col gap-2 text-sm font-medium">
            <Link href="/catalogo" className="text-ink-900 hover:text-brand-600">
              Ver todos los productos →
            </Link>
            <Link href="/catalogos" className="text-ink-600 hover:text-brand-600">
              Descargar catálogos PDF →
            </Link>
          </div>
        </div>

        {/* Una columna por línea de producto */}
        <div className="col-span-9 grid grid-cols-5 gap-x-6">
          {groups.map((group) => (
            <div key={group.label}>
              <Link
                href={group.href}
                className="eyebrow mb-3 block text-ink-900 hover:text-brand-600"
              >
                {group.label}
              </Link>
              <ul className="space-y-0.5">
                {group.columns
                  .flatMap((column) => column.items)
                  .map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="flex items-baseline justify-between gap-2 py-1 text-sm text-ink-700 transition-colors hover:text-brand-600"
                      >
                        <span>{item.label}</span>
                        <span className="text-[11px] tabular-nums text-ink-300">
                          {item.count}
                        </span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */

function MobileDrawer({
  open,
  onClose,
  groups,
  primary,
  links,
}: {
  open: boolean;
  onClose: () => void;
  groups: NavGroup[];
  primary: NavLink[];
  links: NavLink[];
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            variants={overlay}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-ink-900/40 backdrop-blur-[2px] lg:hidden"
          />

          <motion.div
            variants={drawer}
            initial="hidden"
            animate="show"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
            className="fixed inset-y-0 right-0 z-[80] flex w-[min(88vw,26rem)] flex-col bg-paper lg:hidden"
          >
            <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between border-b border-ink-200 px-5">
              <div className="flex items-center gap-2.5">
                <Image
                  src="/brand/logo-ofifitted.png"
                  alt=""
                  width={512}
                  height={512}
                  className="h-9 w-9 rounded-lg"
                />
                <span className="font-[family-name:var(--font-display)] text-xl leading-none font-medium tracking-wide text-ink-900">
                  OFIFITTED
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar menú"
                className="-mr-2 flex h-11 w-11 items-center justify-center text-ink-700"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <DrawerSearch onNavigate={onClose} />

            <nav
              aria-label="Principal"
              className="flex-1 overflow-y-auto overscroll-contain px-5 py-4"
            >
              <ul className="divide-y divide-ink-100">
                {primary.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className="block py-3.5 text-lg font-medium text-ink-900"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}

                <li className="pt-6 pb-1">
                  <p className="eyebrow text-ink-400">
                    {PRODUCTS_MENU_LABEL} · Catálogo general
                  </p>
                </li>

                {groups.map((group) => {
                  const isOpen = expanded === group.label;
                  const panelId = `menu-${group.label.replace(/\s+/g, "-")}`;
                  return (
                    <li key={group.label} className="py-1">
                      <div className="flex items-center">
                        <Link
                          href={group.href}
                          className="flex-1 py-3 text-base text-ink-800"
                        >
                          {group.label}
                        </Link>
                        <button
                          type="button"
                          onClick={() => setExpanded(isOpen ? null : group.label)}
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                          aria-label={`${isOpen ? "Ocultar" : "Mostrar"} subcategorías de ${group.label}`}
                          className="flex h-11 w-11 items-center justify-center text-ink-400"
                        >
                          <motion.svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.25 }}
                            aria-hidden
                          >
                            <path
                              d="M6 9l6 6 6-6"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </motion.svg>
                        </button>
                      </div>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            id={panelId}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-4 pb-4 pl-1">
                              {group.columns.map((column) => (
                                <div key={column.title}>
                                  <p className="eyebrow mb-1.5 text-ink-400">
                                    {column.title}
                                  </p>
                                  <ul>
                                    {column.items.map((item) => (
                                      <li key={item.href}>
                                        <Link
                                          href={item.href}
                                          className="flex items-baseline justify-between py-2 text-[15px] text-ink-700"
                                        >
                                          {item.label}
                                          <span className="text-xs tabular-nums text-ink-300">
                                            {item.count}
                                          </span>
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}

                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block py-3 text-base text-ink-800"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="shrink-0 border-t border-ink-200 p-5">
              <Link
                href="/proyectos#cotizar"
                onClick={onClose}
                className="flex w-full items-center justify-center gap-2 bg-accent-600 py-3.5 text-sm font-medium text-white"
              >
                Cotiza tu proyecto
              </Link>
              <a
                href={whatsappUrl(waMessages.consult)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex w-full items-center justify-center border border-ink-200 py-3 text-sm font-medium text-ink-800"
              >
                Agendar asesoría por WhatsApp
              </a>
              <div className="mt-4 flex items-end justify-between gap-4">
                <div className="space-y-1">
                  {contact.phones.map((phone) => (
                    <a
                      key={phone.tel}
                      href={`tel:${phone.tel}`}
                      className="block text-sm text-ink-600"
                    >
                      {phone.label} · {phone.value}
                    </a>
                  ))}
                </div>
                <SocialLinks className="-mr-2" />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ══════════════════════════════════════════════════════════════════ */

function DrawerSearch({ onNavigate }: { onNavigate: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const doSearch = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const r = await searchProducts(q);
      setResults(r);
      setLoading(false);
    }, 200);
  }, []);

  return (
    <div className="border-b border-ink-100 px-5 py-3">
      <div className="flex items-center gap-2.5 rounded-lg border border-ink-200 bg-ink-50 px-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 text-ink-400" aria-hidden>
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
          <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          placeholder="Buscar productos..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            doSearch(e.target.value);
          }}
          className="h-10 flex-1 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(""); setResults([]); }}
            className="text-ink-400"
            aria-label="Limpiar búsqueda"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {query.trim().length >= 2 && (
        <div className="mt-2">
          {loading && results.length === 0 && (
            <p className="py-3 text-center text-sm text-ink-400">Buscando...</p>
          )}

          {!loading && results.length === 0 && (
            <p className="py-3 text-center text-sm text-ink-400">Sin resultados</p>
          )}

          {results.length > 0 && (
            <ul className="space-y-1">
              {results.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/producto/${r.slug}`}
                    onClick={onNavigate}
                    className="flex items-center gap-3 rounded-lg px-1 py-2 transition-colors active:bg-ink-50"
                  >
                    {r.image ? (
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                        <Image
                          src={r.image.src}
                          alt=""
                          width={r.image.width}
                          height={r.image.height}
                          placeholder="blur"
                          blurDataURL={r.image.blurDataURL}
                          sizes="48px"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-ink-100">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-ink-300" aria-hidden>
                          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                      </div>
                    )}
                    <span className="min-w-0 flex-1 text-sm font-medium text-ink-800 leading-snug">
                      {r.title}
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 text-ink-300" aria-hidden>
                      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
