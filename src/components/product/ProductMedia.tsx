"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useState } from "react";

import type { Product } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const ProductViewer3D = dynamic(
  () => import("./ProductViewer3D").then((m) => m.ProductViewer3D),
  { ssr: false }
);

/**
 * Bloque de medios de la ficha.
 *
 * Si el producto tiene modelo 3D aparecen dos pestañas; si no, solo la
 * galería, sin ningún hueco ni pestaña deshabilitada. Todo el catálogo
 * funciona hoy con cero modelos y seguirá funcionando cuando haya 30.
 */
export function ProductMedia({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const [tab, setTab] = useState<"fotos" | "3d">("fotos");

  const has3D = product.model !== null;
  const cover = product.images[active] ?? product.images[0];

  return (
    <div>
      {has3D && (
        <div
          role="tablist"
          aria-label="Cómo ver el producto"
          className="mb-4 flex gap-1 border-b border-ink-200"
        >
          <Tab
            active={tab === "fotos"}
            onClick={() => setTab("fotos")}
            label="Fotos"
          />
          <Tab
            active={tab === "3d"}
            onClick={() => setTab("3d")}
            label="Ver en 3D"
            highlight
          />
        </div>
      )}

      {/* El panel activo se monta sin animación de entrada, a propósito.
          Es el contenido principal de la ficha: si depende de una animación
          para volverse visible, basta con que rAF esté frenado —pestaña en
          segundo plano, batería baja— para que el usuario vea un hueco. Las
          transiciones viven dentro de cada panel, donde no bloquean nada. */}
      <div>
        {tab === "3d" && product.model ? (
          <div key="3d">
            <ProductViewer3D
              model={product.model}
              productTitle={product.title}
              poster={cover.src}
            />
          </div>
        ) : (
          <div key="fotos">
            <div className="relative aspect-square w-full overflow-hidden bg-white sm:aspect-4/3">
              <AnimatePresence initial={false}>
                <motion.div
                  key={cover.src}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  <Image
                    src={cover.src}
                    alt={product.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    placeholder="blur"
                    blurDataURL={cover.blurDataURL}
                    className="object-contain p-6"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {product.images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {product.images.map((image, i) => (
                  <button
                    key={image.src}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`Ver imagen ${i + 1} de ${product.images.length}`}
                    aria-current={i === active}
                    className={cn(
                      "relative aspect-square w-16 shrink-0 overflow-hidden bg-white transition-all sm:w-20",
                      i === active
                        ? "ring-2 ring-brand-600"
                        : "opacity-60 ring-1 ring-ink-200 hover:opacity-100"
                    )}
                  >
                    <Image
                      src={image.src}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-contain p-1.5"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Tab({
  active,
  onClick,
  label,
  highlight = false,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  highlight?: boolean;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors",
        active ? "text-brand-600" : "text-ink-500 hover:text-ink-800"
      )}
    >
      {highlight && (
        <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden>
          <path
            d="M12 2l9 5v10l-9 5-9-5V7l9-5zM3 7l9 5 9-5M12 12v10"
            stroke="currentColor"
            strokeWidth="1.8"
            fill="none"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {label}
      {active && (
        <motion.span
          layoutId="product-tab"
          className="absolute inset-x-0 -bottom-px h-0.5 bg-brand-600"
        />
      )}
    </button>
  );
}
