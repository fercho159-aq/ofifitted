"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import type { ProductImage } from "@/lib/catalog";
import { DURATION, EASE } from "@/lib/motion";

type Props = {
  image: ProductImage;
  productCount: number;
  categoryCount: number;
};

/**
 * Hero de la home.
 *
 * Gancho (PASTOR · Problema): quien busca mobiliario de oficina en México
 * casi siempre acaba con un revendedor. El primer mensaje del sitio ataca
 * justo eso, porque es la única ventaja que un intermediario no puede copiar.
 *
 * La foto se desplaza más lento que el texto al hacer scroll: da profundidad
 * sin que nada se lea en movimiento.
 */
export function Hero({ image, productCount, categoryCount }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[min(92svh,54rem)] items-end overflow-hidden bg-ink-900"
    >
      {/* Fondo */}
      <motion.div
        style={reduced ? undefined : { y: imageY }}
        className="absolute inset-0 -bottom-[18%] will-change-transform"
      >
        <Image
          src={image.src}
          alt=""
          fill
          priority
          sizes="100vw"
          placeholder="blur"
          blurDataURL={image.blurDataURL}
          className="object-cover"
        />
        {/* Dos capas: una vertical que asienta el bloque de texto y otra
            horizontal que protege la columna izquierda. Con una sola, el
            titular queda ilegible sobre las fotos claras del catálogo. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-ink-900 via-ink-900/85 to-ink-900/40"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-r from-ink-900/85 via-ink-900/40 to-transparent"
        />
      </motion.div>

      {/* Contenido */}
      <motion.div
        style={reduced ? undefined : { y: contentY, opacity: contentOpacity }}
        className="container-page relative z-10 pt-32 pb-16 md:pb-24"
      >
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.base, ease: EASE }}
          className="eyebrow text-accent-400"
        >
          Fabricantes directos · Ciudad de México
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.slow, ease: EASE, delay: 0.08 }}
          className="heading-hero mt-4 max-w-4xl text-white"
        >
          Mobiliario de oficina
          <br />
          <span className="text-white/60">directo de fábrica.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.base, ease: EASE, delay: 0.18 }}
          className="mt-6 max-w-xl text-base leading-relaxed text-white/75 md:text-lg"
        >
          Escritorios, sillas, recepciones y almacenamiento fabricados a tu
          medida. Sin intermediarios, sin sobreprecio.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.base, ease: EASE, delay: 0.26 }}
          className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <Link
            href="/catalogo"
            className="inline-flex items-center justify-center bg-accent-600 px-8 py-4 text-sm font-medium text-white transition-colors hover:bg-accent-700"
          >
            Ver catálogo
          </Link>
          <Link
            href="/proyectos"
            className="inline-flex items-center justify-center border border-white/25 px-8 py-4 text-sm font-medium text-white transition-colors hover:border-white/60 hover:bg-white/5"
          >
            Proyectos integrales
          </Link>
        </motion.div>

        {/* Cifras verificables del propio catálogo, no promesas. */}
        <motion.dl
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DURATION.base, delay: 0.4 }}
          className="mt-12 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/15 pt-6"
        >
          <Stat value={`${productCount}`} label="modelos en catálogo" />
          <Stat value={`${categoryCount}`} label="líneas de producto" />
          <Stat value="República" label="cobertura de envío" />
          <Stat value="A medida" label="fabricación propia" />
        </motion.dl>
      </motion.div>

      {/* Indicador de scroll */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 md:block"
      >
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="block h-9 w-px bg-linear-to-b from-white/60 to-transparent"
        />
      </motion.div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd>
        <span className="block font-[family-name:var(--font-display)] text-2xl font-semibold text-white">
          {value}
        </span>
        <span className="mt-0.5 block text-xs text-white/50">{label}</span>
      </dd>
    </div>
  );
}
