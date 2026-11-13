"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import type { ProductImage } from "@/lib/catalog";
import { DURATION, EASE } from "@/lib/motion";
import { waMessages, whatsappUrl } from "@/lib/site";

type Props = {
  image: ProductImage;
};

/**
 * Hero de la home, enfocado a proyectos corporativos (B2B).
 *
 * Le habla a quien decide un proyecto completo —director de operaciones,
 * arquitecto, constructora—, no a quien busca una silla. La CTA principal
 * lleva al brief de proyecto; la secundaria abre una asesoría por
 * WhatsApp. El catálogo queda como enlace discreto para quien sí busca
 * piezas sueltas, sin competir con el botón principal.
 *
 * La foto se desplaza más lento que el texto al hacer scroll: da profundidad
 * sin que nada se lea en movimiento.
 */
export function Hero({ image }: Props) {
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
        className="container-page relative z-10 pt-28 pb-16 md:pt-32 md:pb-24"
      >
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.base, ease: EASE }}
          className="eyebrow text-accent-400"
        >
          Proyectos corporativos llave en mano · Fabricantes directos
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.slow, ease: EASE, delay: 0.08 }}
          className="heading-hero mt-4 max-w-5xl text-[clamp(2.1rem,5.2vw,4.4rem)]! leading-[1.04]! text-white"
        >
          Mobiliario integral para proyectos{" "}
          <span className="text-white/60">
            corporativos, arquitectónicos y de construcción.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.base, ease: EASE, delay: 0.18 }}
          className="mt-6 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg"
        >
          Delega en un solo proveedor el equipamiento completo de tus
          oficinas, salas de juntas, lobbies y áreas comunes. Proyectamos,
          fabricamos e instalamos, con fechas comprometidas y precio de planta.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.base, ease: EASE, delay: 0.26 }}
          className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <Link
            href="#cotizar"
            className="inline-flex items-center justify-center gap-2 bg-accent-600 px-8 py-4 text-sm font-medium text-white transition-colors hover:bg-accent-700"
          >
            Cotiza tu proyecto
            <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden>
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
          <a
            href={whatsappUrl(waMessages.consult)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center border border-white/25 px-8 py-4 text-sm font-medium text-white transition-colors hover:border-white/60 hover:bg-white/5"
          >
            Agendar asesoría con un especialista
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DURATION.base, delay: 0.34 }}
          className="mt-5 text-sm text-white/50"
        >
          ¿Buscas piezas individuales?{" "}
          <Link
            href="/catalogo"
            className="text-white/80 underline underline-offset-4 hover:text-white"
          >
            Ver catálogo general
          </Link>
        </motion.p>

        {/* Lo que se ofrece, sin cifras que no se puedan comprobar. */}
        <motion.dl
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DURATION.base, delay: 0.4 }}
          className="mt-12 grid grid-cols-2 gap-x-10 gap-y-5 border-t border-white/15 pt-6 md:flex md:flex-wrap"
        >
          <Stat value="Llave en mano" label="proyecto, fabricación e instalación" />
          <Stat value="Sobre plano" label="asesoría técnica y layout" />
          <Stat value="Planta propia" label="precio de fábrica por proyecto" />
          <Stat value="Nacional" label="entregas en toda la República" />
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
