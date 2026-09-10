"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import type { ProductModel } from "@/lib/catalog";
import { pop } from "@/lib/motion";
import { loadModelViewer } from "@/lib/model-viewer";
import { waMessages, whatsappUrl } from "@/lib/site";

/* ────────────────────────────────────────────────────────────────────
   Visor 3D del producto.

   Se apoya en <model-viewer> de Google en vez de montar la escena a mano
   con react-three-fiber, por una razón concreta: model-viewer entrega la
   realidad aumentada nativa —Scene Viewer en Android y Quick Look en iOS—
   sin escribir una línea extra. Esa es la función que convierte: ver el
   mueble a escala real en tu propia oficina.

   La librería son ~300 KB, así que se importa solo cuando el visor
   realmente entra en pantalla.
   ──────────────────────────────────────────────────────────────────── */

type Props = {
  model: ProductModel;
  productTitle: string;
  /** Foto de respaldo mientras carga el modelo. */
  poster: string;
};

export function ProductViewer3D({ model, productTitle, poster }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [libraryReady, setLibraryReady] = useState(false);
  const [arAvailable, setArAvailable] = useState(false);
  const [error, setError] = useState(false);

  /* La librería se pide al montar, no al entrar en pantalla.
     Este componente solo se monta cuando alguien abre la pestaña "Ver en
     3D", así que el montaje ya *es* la señal de intención; un
     IntersectionObserver encima solo agregaría espera —y no dispara si la
     pestaña del navegador está en segundo plano, dejando el visor colgado
     en el spinner. El code splitting lo da el import dinámico, que es lo
     que mantiene los ~300 KB de model-viewer fuera del bundle principal. */
  useEffect(() => {
    let cancelled = false;

    loadModelViewer()
      .then(() => {
        if (!cancelled) setLibraryReady(true);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative aspect-square w-full overflow-hidden bg-ink-50 sm:aspect-4/3"
    >
      {libraryReady && !error ? (
        <>
          {/* Custom element; sus atributos están tipados en
              src/types/model-viewer.d.ts */}
          <model-viewer
            src={model.glb}
            ios-src={model.usdz}
            poster={poster}
            alt={`Modelo tridimensional de ${productTitle}`}
            loading="eager"
            camera-controls
            touch-action="pan-y"
            auto-rotate
            auto-rotate-delay={2500}
            rotation-per-second="18deg"
            interaction-prompt="auto"
            shadow-intensity="1"
            shadow-softness="0.8"
            exposure="1.05"
            ar
            ar-modes="webxr scene-viewer quick-look"
            ar-scale="fixed"
            ar-placement="floor"
            style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
            onLoad={() => {
              const el = containerRef.current?.querySelector("model-viewer");
              // `canActivateAR` solo es fiable después de que el modelo carga.
              setArAvailable(Boolean((el as unknown as { canActivateAR?: boolean })?.canActivateAR));
            }}
            onError={() => setError(true)}
          />

          {model.demo && (
            <p className="absolute top-3 left-3 bg-amber-400 px-2.5 py-1 text-[11px] font-medium text-ink-900">
              Modelo de demostración · no es el mueble real
            </p>
          )}

          {/* Pista de interacción */}
          <p className="pointer-events-none absolute bottom-3 left-3 text-[11px] tracking-wide text-ink-400 uppercase">
            Arrastra para girar · Pellizca para acercar
          </p>

          {/* Botón de AR: solo si el dispositivo puede abrirlo. En escritorio
              no aparece, porque llevaría a un callejón sin salida. */}
          <AnimatePresence>
            {arAvailable && (
              <motion.button
                variants={pop}
                initial="hidden"
                animate="show"
                exit="exit"
                type="button"
                onClick={() => {
                  const el = containerRef.current?.querySelector("model-viewer");
                  (el as unknown as { activateAR?: () => void })?.activateAR?.();
                }}
                className="absolute right-3 bottom-3 flex items-center gap-2 bg-brand-600 px-4 py-2.5 text-xs font-medium text-white shadow-[var(--shadow-lift)]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
                  <path
                    d="M12 2l9 5v10l-9 5-9-5V7l9-5zM3 7l9 5 9-5M12 12v10"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    fill="none"
                    strokeLinejoin="round"
                  />
                </svg>
                Verlo con la cámara
              </motion.button>
            )}
          </AnimatePresence>
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          {error ? (
            <div className="px-6 text-center">
              <p className="text-sm text-ink-600">
                No pudimos cargar el modelo 3D en este dispositivo.
              </p>
              <a
                href={whatsappUrl(waMessages.quote(productTitle))}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex text-sm font-medium text-brand-600 underline underline-offset-4"
              >
                Pídenos fotos y medidas por WhatsApp
              </a>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <span className="h-7 w-7 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" />
              <p className="text-xs tracking-wide text-ink-400 uppercase">
                Cargando modelo 3D
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
