import type { Transition, Variants } from "framer-motion";

/**
 * Sistema de movimiento de Ofifitted.
 *
 * Una sola curva y tres duraciones para todo el sitio. Si algo se mueve y no
 * usa estas constantes, se nota: el sitio deja de sentirse como una pieza.
 *
 * Framer Motion respeta `prefers-reduced-motion` por su cuenta cuando el
 * componente se envuelve en <MotionConfig reducedMotion="user">, que es lo
 * que hace el layout raíz.
 */

/** Curva de salida suave. La misma que usa `--ease-brand` en CSS. */
export const EASE = [0.22, 1, 0.36, 1] as const;

export const DURATION = {
  fast: 0.35,
  base: 0.6,
  slow: 0.9,
} as const;

export const transition: Transition = {
  duration: DURATION.base,
  ease: EASE,
};

/* ── Entradas al hacer scroll ─────────────────────────────────────────
   `viewport.margin` negativo dispara la animación un poco antes de que el
   elemento toque el borde, para que nunca se vea "aparecer tarde".      */

export const viewport = { once: true, margin: "-80px" } as const;

/** El caballito de batalla: sube y aparece. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition },
};

/** Para bloques anchos donde el desplazamiento vertical se ve exagerado. */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition },
};

/** Entrada lateral, para columnas de texto junto a una imagen. */
export const fadeSide = (from: "left" | "right"): Variants => ({
  hidden: { opacity: 0, x: from === "left" ? -32 : 32 },
  show: { opacity: 1, x: 0, transition },
});

/** Imagen que entra escalando apenas: da sensación de peso. */
export const zoomIn: Variants = {
  hidden: { opacity: 0, scale: 1.06 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.slow, ease: EASE },
  },
};

/**
 * Contenedor que escalona a sus hijos.
 * Los hijos deben declarar `variants={fadeUp}` sin `initial`/`animate`:
 * heredan el estado del padre.
 */
export const stagger = (delayChildren = 0, staggerChildren = 0.08): Variants => ({
  hidden: {},
  show: {
    transition: { delayChildren, staggerChildren },
  },
});

/* ── Entradas y salidas de overlays ──────────────────────────────────── */

/** Menú móvil: entra desde la derecha. */
export const drawer: Variants = {
  hidden: { x: "100%" },
  show: { x: 0, transition: { duration: DURATION.fast, ease: EASE } },
  exit: { x: "100%", transition: { duration: 0.28, ease: EASE } },
};

/** Panel del mega menú: baja y aparece. */
export const megaPanel: Variants = {
  hidden: { opacity: 0, y: -8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: EASE } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: EASE } },
};

export const overlay: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

/** Aparición de una píldora o aviso flotante, con rebote contenido. */
export const pop: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 8 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 320, damping: 26 },
  },
  exit: { opacity: 0, scale: 0.95, y: 4, transition: { duration: 0.18 } },
};
