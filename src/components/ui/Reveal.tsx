"use client";

import { motion, type Variants } from "framer-motion";
import type { ElementType, ReactNode } from "react";

import { fadeIn, fadeSide, fadeUp, stagger, viewport, zoomIn } from "@/lib/motion";

const PRESETS = {
  up: fadeUp,
  in: fadeIn,
  zoom: zoomIn,
  left: fadeSide("left"),
  right: fadeSide("right"),
} satisfies Record<string, Variants>;

export type RevealPreset = keyof typeof PRESETS;

type RevealProps = {
  children: ReactNode;
  /** Tipo de entrada. Por defecto sube y aparece. */
  preset?: RevealPreset;
  /** Retraso en segundos, para escalonar a mano. */
  delay?: number;
  as?: ElementType;
  className?: string;
  /**
   * Repetir la animación cada vez que el bloque vuelve a entrar en pantalla.
   * Por defecto solo ocurre una vez: repetirlo en toda la página marea.
   */
  repeat?: boolean;
};

/**
 * Envuelve un bloque para que entre al hacer scroll.
 *
 * Es el 90% del movimiento del sitio. Para escalonar varios hijos, usa
 * <RevealGroup> alrededor y <RevealItem> en cada uno: así una sola
 * observación del viewport controla al conjunto.
 */
export function Reveal({
  children,
  preset = "up",
  delay = 0,
  as = "div",
  className,
  repeat = false,
}: RevealProps) {
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;

  return (
    <MotionTag
      className={className}
      variants={PRESETS[preset]}
      initial="hidden"
      whileInView="show"
      viewport={repeat ? { ...viewport, once: false } : viewport}
      transition={delay ? { delay } : undefined}
    >
      {children}
    </MotionTag>
  );
}

type GroupProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** Segundos entre la entrada de un hijo y el siguiente. */
  step?: number;
  delay?: number;
};

/** Contenedor que escalona la entrada de sus <RevealItem>. */
export function RevealGroup({
  children,
  className,
  as = "div",
  step = 0.08,
  delay = 0,
}: GroupProps) {
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;

  return (
    <MotionTag
      className={className}
      variants={stagger(delay, step)}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
    >
      {children}
    </MotionTag>
  );
}

/** Hijo de <RevealGroup>. Hereda el momento de entrada del padre. */
export function RevealItem({
  children,
  className,
  preset = "up",
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  preset?: RevealPreset;
  as?: ElementType;
}) {
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;

  return (
    <MotionTag className={className} variants={PRESETS[preset]}>
      {children}
    </MotionTag>
  );
}
