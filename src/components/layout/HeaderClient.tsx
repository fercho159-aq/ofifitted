"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { SocialLinks } from "@/components/ui/SocialLinks";
import { drawer, megaPanel, overlay } from "@/lib/motion";
import { contact, waMessages, whatsappUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

import type { NavGroup } from "./Header";

type Props = {
  groups: NavGroup[];
  links: { label: string; href: string }[];
};

export function HeaderClient({ groups, links }: Props) {
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
            Fabricantes directos · Envíos a toda la República Mexicana
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
          <Link href="/" className="shrink-0" aria-label="Ofifitted, inicio">
            <Image
              src="/brand/logo-ofifitted.png"
              alt="Ofifitted"
              width={192}
              height={43}
              priority
              className="h-7 w-auto md:h-8"
            />
          </Link>

          {/* Navegación de escritorio */}
          <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
            {groups.map((group) => {
              const isOpen = openGroup === group.label;
              return (
                <div key={group.label} onMouseEnter={() => openNow(group.label)}>
                  <Link
                    href={group.href}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    onFocus={() => openNow(group.label)}
                    className={cn(
                      "relative flex h-[var(--header-h)] items-center px-2.5 text-sm font-medium whitespace-nowrap transition-colors xl:px-3",
                      isOpen ? "text-brand-600" : "text-ink-700 hover:text-brand-600"
                    )}
                  >
                    {group.label}
                    <span
                      className={cn(
                        "absolute inset-x-3 bottom-0 h-[2px] origin-left bg-accent-600 transition-transform duration-300",
                        isOpen ? "scale-x-100" : "scale-x-0"
                      )}
                    />
                  </Link>
                </div>
              );
            })}

            {/* Los enlaces secundarios aparecen hasta xl. Entre 1024 y 1280 el
                mega menú ya ocupa el ancho disponible y meterlos aquí parte
                las etiquetas en dos líneas; siguen accesibles desde el pie y
                desde el menú móvil. */}
            <span className="mx-2 hidden h-4 w-px bg-ink-200 xl:block" aria-hidden />

            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hidden px-3 text-sm font-medium whitespace-nowrap text-ink-700 transition-colors hover:text-brand-600 xl:block"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={whatsappUrl(waMessages.general)}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden shrink-0 items-center gap-2 bg-accent-600 px-5 py-2.5 text-sm font-medium whitespace-nowrap text-white transition-colors hover:bg-accent-700 sm:inline-flex"
            >
              Cotizar ahora
            </a>

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
          {openGroup && (
            <MegaPanel
              group={groups.find((g) => g.label === openGroup)!}
              onEnter={() => openNow(openGroup)}
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
        links={links}
      />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════ */

function MegaPanel({
  group,
  onEnter,
  onLeave,
}: {
  group: NavGroup;
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
      <div className="container-page grid grid-cols-12 gap-10 py-10">
        {/* Promesa del grupo */}
        <div className="col-span-3">
          <p className="eyebrow text-accent-600">{group.label}</p>
          <p className="mt-3 text-sm leading-relaxed text-ink-600">{group.blurb}</p>
          <Link
            href={group.href}
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Ver todo
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="1.8"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>

        {/* Columnas de categorías */}
        <div className="col-span-6 grid grid-cols-2 gap-x-8 gap-y-8">
          {group.columns.map((column) => (
            <div key={column.title}>
              <p className="eyebrow mb-3 text-ink-400">{column.title}</p>
              <ul className="space-y-1">
                {column.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex items-baseline justify-between gap-3 py-1.5 text-[15px] text-ink-800 transition-colors hover:text-brand-600"
                    >
                      <span className="relative">
                        {item.label}
                        <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-brand-600 transition-[width] duration-300 group-hover:w-full" />
                      </span>
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

        {/* Destacado */}
        {group.featured && (
          <Link href={group.featured.href} className="group col-span-3">
            <div className="relative aspect-4/3 overflow-hidden bg-ink-100">
              <Image
                src={group.featured.image.src}
                alt={group.featured.label}
                fill
                sizes="320px"
                placeholder="blur"
                blurDataURL={group.featured.image.blurDataURL}
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <p className="mt-3 text-sm font-medium text-ink-900">
              {group.featured.label}
            </p>
            <p className="text-xs text-ink-500">Ver la línea completa</p>
          </Link>
        )}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */

function MobileDrawer({
  open,
  onClose,
  groups,
  links,
}: {
  open: boolean;
  onClose: () => void;
  groups: NavGroup[];
  links: { label: string; href: string }[];
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
              <Image
                src="/brand/logo-ofifitted.png"
                alt="Ofifitted"
                width={192}
                height={43}
                className="h-7 w-auto"
              />
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

            <nav
              aria-label="Principal"
              className="flex-1 overflow-y-auto overscroll-contain px-5 py-4"
            >
              <ul className="divide-y divide-ink-100">
                {groups.map((group) => {
                  const isOpen = expanded === group.label;
                  const panelId = `menu-${group.label.replace(/\s+/g, "-")}`;
                  return (
                    <li key={group.label} className="py-1">
                      <div className="flex items-center">
                        <Link
                          href={group.href}
                          className="flex-1 py-3.5 text-lg font-medium text-ink-900"
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
                      className="block py-3.5 text-lg font-medium text-ink-900"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="shrink-0 border-t border-ink-200 p-5">
              <a
                href={whatsappUrl(waMessages.general)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 bg-accent-600 py-3.5 text-sm font-medium text-white"
              >
                Cotizar por WhatsApp
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
