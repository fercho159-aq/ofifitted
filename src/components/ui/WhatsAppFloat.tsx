"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import { pop } from "@/lib/motion";
import { waMessages, whatsappUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────────
   Botón flotante de WhatsApp con disparador.

   El disparador abre una burbuja con un mensaje, pero solo con hechos
   verificables: si la fábrica está abierta ahora mismo y en qué sección
   está navegando la persona. Nada de contadores de visitantes ni de
   "quedan 2 piezas": es información inventada y, en un fabricante que
   produce sobre pedido, además es mentira.

   Se dispara por lo que primero ocurra:
     - 22 s en la misma página, o
     - 55% de scroll, o
     - intención de salida (solo escritorio, el mouse sale por arriba).

   Se descarta una sola vez por sesión.
   ──────────────────────────────────────────────────────────────────── */

const DISMISS_KEY = "ofifitted:wa-nudge-dismissed";
const IDLE_MS = 22_000;
const SCROLL_TRIGGER = 0.55;
/** Nada se dispara antes de esto, aunque el usuario baje de golpe. */
const MIN_DWELL_MS = 8_000;

/** Horario de la planta, en hora de Ciudad de México. */
function isOpenNow(now = new Date()): boolean {
  const parts = new Intl.DateTimeFormat("es-MX", {
    timeZone: "America/Mexico_City",
    weekday: "short",
    hour: "numeric",
    hour12: false,
  }).formatToParts(now);

  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");

  const day = weekday.toLowerCase();
  if (day.startsWith("dom")) return false;
  if (day.startsWith("sáb") || day.startsWith("sab")) return hour >= 10 && hour < 14;
  return hour >= 9 && hour < 18;
}

/**
 * Suscribe el componente al reloj: reevalúa el horario cada minuto.
 * Va por `useSyncExternalStore` porque el valor depende de la hora del
 * cliente y el HTML se sirve estático: en el servidor no hay respuesta
 * correcta, así que ahí devolvemos null y no se pinta el indicador.
 */
function subscribeToClock(onChange: () => void) {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
}

function readDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    // Navegación privada o almacenamiento bloqueado: mostramos igual.
    return false;
  }
}

export function WhatsAppFloat() {
  const pathname = usePathname();
  const [nudge, setNudge] = useState(false);
  const [dismissed, setDismissed] = useState(readDismissed);
  const [open, setOpen] = useState(false);

  // Estado de la planta. No se fija en el HTML estático, que se cachea y
  // quedaría mintiendo horas después.
  const openNow = useSyncExternalStore(
    subscribeToClock,
    () => isOpenNow(),
    () => null
  );

  const dismiss = useCallback(() => {
    setNudge(false);
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Si no se puede persistir, al menos no reaparece en esta vista.
    }
  }, []);

  // Disparadores.
  useEffect(() => {
    if (dismissed) return;

    const fire = () => setNudge(true);
    const timer = setTimeout(fire, IDLE_MS);

    /* Piso mínimo antes de que scroll o salida puedan disparar. Sin esto, en
       una página corta el primer scroll ya rebasa el 55% y la burbuja
       aparece encima del hero, antes de que la persona lea nada. */
    const armedAt = Date.now() + MIN_DWELL_MS;
    const armed = () => Date.now() >= armedAt;

    const onScroll = () => {
      if (!armed()) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max > SCROLL_TRIGGER) fire();
    };

    const onLeave = (e: MouseEvent) => {
      if (armed() && e.clientY <= 0) fire();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mouseout", onLeave);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseout", onLeave);
    };
  }, [dismissed, pathname]);

  /* Mensaje genérico: el botón flotante vive en todas las páginas y aquí no
     conoce el producto. La ficha tiene su propio CTA, ese sí prellenado con
     el modelo. */
  const href = whatsappUrl(waMessages.general);

  return (
    <div className="fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {nudge && !dismissed && (
          <motion.div
            variants={pop}
            initial="hidden"
            animate="show"
            exit="exit"
            role="status"
            className="relative max-w-[17rem] rounded-lg bg-white p-4 shadow-[var(--shadow-float)] ring-1 ring-ink-200"
          >
            <button
              type="button"
              onClick={dismiss}
              aria-label="Cerrar aviso"
              className="absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center text-ink-300 hover:text-ink-600"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden>
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {openNow !== null && (
              <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium">
                <span
                  className={cn(
                    "inline-block h-1.5 w-1.5 rounded-full",
                    openNow ? "bg-emerald-500" : "bg-ink-300"
                  )}
                  aria-hidden
                />
                <span className={openNow ? "text-emerald-700" : "text-ink-500"}>
                  {openNow ? "Un asesor está en línea" : "Fuera de horario"}
                </span>
              </p>
            )}

            <p className="pr-4 text-sm leading-snug text-ink-800">
              {openNow
                ? "¿Ya viste algo que te sirva? Mándanos el modelo y te pasamos precio y tiempo de entrega hoy mismo."
                : "Déjanos tu mensaje ahora y lo contestamos al abrir, a primera hora."}
            </p>

            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={dismiss}
              className="mt-3 inline-flex w-full items-center justify-center bg-accent-600 py-2.5 text-xs font-medium text-white transition-colors hover:bg-accent-700"
            >
              Pedir cotización
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escríbenos por WhatsApp"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[var(--shadow-float)] transition-transform duration-300 hover:scale-105"
      >
        {/* Halo que late, solo mientras hay alguien para contestar. */}
        {openNow && (
          <span
            aria-hidden
            className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-20 [animation-duration:2.4s] motion-reduce:hidden"
          />
        )}
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden>
          <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.66-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.7.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.08-.13-.27-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 01-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 01-1.51-5.26c0-5.45 4.44-9.89 9.89-9.89a9.82 9.82 0 016.99 2.9 9.83 9.83 0 012.89 6.99c0 5.45-4.44 9.89-9.88 9.89m8.41-18.3A11.82 11.82 0 0012.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 005.69 1.45c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 00-3.48-8.4" />
        </svg>

        {/* Etiqueta que se despliega al pasar el mouse (solo escritorio). */}
        <span
          className={cn(
            "pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded bg-ink-900 px-3 py-1.5 text-xs text-white transition-all duration-300 lg:block",
            open ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0"
          )}
        >
          Cotiza por WhatsApp
        </span>
      </a>
    </div>
  );
}
