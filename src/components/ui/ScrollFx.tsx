"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────────
   Efectos ligados al progreso del scroll.

   A diferencia de <Reveal>, que dispara una animación al entrar, esto
   *sigue* al scroll: la posición del elemento es una función de cuánto
   ha avanzado la página. Es lo que da la sensación de profundidad.

   Todos respetan "reducir movimiento": si el usuario lo pidió, el efecto
   simplemente no se aplica y el contenido queda estático.
   ──────────────────────────────────────────────────────────────────── */

/** Suaviza un MotionValue para que el parallax no se sienta pegado al pixel. */
function useSmooth(value: MotionValue<number>) {
  return useSpring(value, { stiffness: 120, damping: 30, restDelta: 0.001 });
}

type ParallaxProps = {
  children: ReactNode;
  /**
   * Cuánto se desplaza, en píxeles, a lo largo de todo el recorrido.
   * Positivo = se queda atrás (fondo). Negativo = se adelanta (frente).
   */
  distance?: number;
  className?: string;
};

/**
 * Desplaza un elemento en el eje Y conforme atraviesa la pantalla.
 * Úsalo en imágenes de fondo y en elementos decorativos, nunca en texto
 * que el usuario tenga que leer mientras se mueve.
 */
export function Parallax({ children, distance = 80, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useSmooth(useTransform(scrollYProgress, [0, 1], [distance, -distance]));

  return (
    <div ref={ref} className={className}>
      <motion.div style={reduced ? undefined : { y }} className="will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}

/**
 * Imagen que se agranda ligeramente mientras sube por la pantalla.
 * Se usa en las fotos grandes de sección: da peso sin distraer.
 */
export function ScrollZoom({
  children,
  from = 1.12,
  to = 1,
  className,
}: {
  children: ReactNode;
  from?: number;
  to?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const scale = useSmooth(useTransform(scrollYProgress, [0, 1], [from, to]));

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <motion.div
        style={reduced ? undefined : { scale }}
        className="h-full w-full will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * Texto que se revela palabra por palabra conforme avanza el scroll.
 * Reservado para una sola frase por página —la promesa principal—; usado
 * más de una vez pierde todo el efecto.
 */
export function ScrollRevealText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotion();
  const words = text.split(" ");

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.4"],
  });

  return (
    <p ref={ref} className={cn("flex flex-wrap", className)}>
      {words.map((word, i) => (
        <Word
          key={`${word}-${i}`}
          progress={scrollYProgress}
          range={[i / words.length, (i + 1) / words.length]}
          reduced={Boolean(reduced)}
        >
          {word}
        </Word>
      ))}
    </p>
  );
}

function Word({
  children,
  progress,
  range,
  reduced,
}: {
  children: ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
  reduced: boolean;
}) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  return (
    <span className="mr-[0.25em] inline-block">
      <motion.span style={reduced ? undefined : { opacity }}>{children}</motion.span>
    </span>
  );
}

/** Barra de progreso de lectura, fija arriba. */
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-accent-600"
    />
  );
}
