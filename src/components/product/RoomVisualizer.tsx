"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { Product } from "@/lib/catalog";
import { drawer, overlay as overlayVariants } from "@/lib/motion";
import { loadModelViewer, type ModelViewerElement } from "@/lib/model-viewer";
import { waMessages, whatsappUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────────
   "Pruébalo en tu oficina"

   El cliente toma o sube una foto de su espacio y coloca el mueble encima:
   lo arrastra, lo escala con el control o pellizcando, y descarga o comparte
   la imagen. Es la idea del visualizador de ebehar, adaptada a muebles.

   Dos formas de pintar el mueble, según lo que tenga el producto:

   · Modelo 3D  → <model-viewer> con fondo transparente sobre la foto. Se
     puede girar para empatar la perspectiva de la foto, que es justo lo que
     un recorte plano no permite.
   · Recorte    → la foto de estudio sin fondo (scripts/make-cutouts.mjs),
     con opción de reflejarla para voltear el mueble hacia el otro lado.

   La foto del cliente nunca sale de su dispositivo: se lee como blob local,
   se compone en un <canvas> y no se sube a ningún servidor.
   ──────────────────────────────────────────────────────────────────── */

type Props = {
  product: Product;
  open: boolean;
  onClose: () => void;
};

type Point = { x: number; y: number };
type Size = { w: number; h: number };

/** Ancho inicial del mueble como fracción del ancho visible de la foto. */
const BASE_WIDTH = 0.42;
const MIN_SCALE = 0.2;
const MAX_SCALE = 2.6;
/** Tope de resolución de la imagen exportada, para que WhatsApp la acepte bien. */
const EXPORT_MAX = 2400;
const MAX_UPLOAD_MB = 25;

const VIEWS = [
  { label: "Frente", orbit: "0deg 75deg auto" },
  { label: "Lateral", orbit: "90deg 75deg auto" },
  { label: "Atrás", orbit: "180deg 75deg auto" },
  { label: "Arriba", orbit: "0deg 10deg auto" },
] as const;

/** Rectángulo donde queda la foto dentro del escenario (object-contain). */
function containRect(stage: Size, photo: Size) {
  if (!stage.w || !photo.w) return { x: 0, y: 0, w: 0, h: 0, k: 1 };
  const k = Math.min(stage.w / photo.w, stage.h / photo.h);
  const w = photo.w * k;
  const h = photo.h * k;
  return { x: (stage.w - w) / 2, y: (stage.h - h) / 2, w, h, k };
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

class ModelNotReady extends Error {}

/** ¿La imagen es completamente transparente? Muestrea una rejilla, no cada píxel. */
function isBlank(img: HTMLImageElement): boolean {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;
  ctx.drawImage(img, 0, 0, size, size);
  const alpha = ctx.getImageData(0, 0, size, size).data;
  for (let i = 3; i < alpha.length; i += 4) {
    if (alpha[i] > 8) return false;
  }
  return true;
}

/** ¿Puede el navegador mandar una imagen al menú de compartir? (móvil, casi siempre) */
function canShareImageFiles(): boolean {
  try {
    const probe = new File([new Blob()], "x.jpg", { type: "image/jpeg" });
    return Boolean(navigator.canShare?.({ files: [probe] }));
  } catch {
    return false;
  }
}

function slugify(s: string) {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function RoomVisualizer({ product, open, onClose }: Props) {
  const kind: "model" | "cutout" | null = product.model
    ? "model"
    : product.cutout
      ? "cutout"
      : null;

  const [photo, setPhoto] = useState<string | null>(null);
  const [photoSize, setPhotoSize] = useState<Size>({ w: 0, h: 0 });
  const [stage, setStage] = useState<Size>({ w: 0, h: 0 });
  const [anchor, setAnchor] = useState<Point | null>(null); // base del mueble
  const [scale, setScale] = useState(1);
  const [flip, setFlip] = useState(false);
  const [mode, setMode] = useState<"mover" | "girar">("mover");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"descargar" | "compartir" | "cotizar" | null>(null);
  const [modelReady, setModelReady] = useState(false);
  // Capacidad fija del navegador. Este componente se carga con ssr:false,
  // así que se puede leer `navigator` al montar sin descuadrar la hidratación.
  const [canShareFiles] = useState(canShareImageFiles);

  const viewerRef = useRef<ModelViewerElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── Ciclo de vida del diálogo ─────────────────────────────────────── */

  useEffect(() => {
    if (!open) return;
    document.body.dataset.scrollLocked = "true";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.dataset.scrollLocked = "false";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // La librería 3D solo se pide si el producto tiene modelo y el diálogo abre.
  useEffect(() => {
    if (!open || kind !== "model") return;
    let cancelled = false;
    loadModelViewer()
      .then(() => !cancelled && setModelReady(true))
      .catch(() => !cancelled && setError("No se pudo cargar el visor 3D."));
    return () => {
      cancelled = true;
    };
  }, [open, kind]);


  // Libera el blob de la foto al cambiarla o al desmontar.
  useEffect(() => {
    return () => {
      if (photo) URL.revokeObjectURL(photo);
    };
  }, [photo]);

  /* Tamaño del escenario, con un ref de callback en vez de un efecto.
     Se mide de inmediato al montar y el ResizeObserver solo atiende cambios
     posteriores (rotar el teléfono, aparecer el panel de controles). Depender
     solo del observer dejaba el mueble sin dibujar hasta su primer aviso, que
     llega en el siguiente ciclo de pintado y en una pestaña en segundo plano
     puede no llegar. React 19 acepta que el ref devuelva su limpieza. */
  const stageRef = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setStage((prev) =>
        prev.w === r.width && prev.h === r.height ? prev : { w: r.width, h: r.height }
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ── Geometría ─────────────────────────────────────────────────────── */

  const rect = useMemo(() => containRect(stage, photoSize), [stage, photoSize]);

  const furniture = useMemo<Size>(() => {
    const w = rect.w * BASE_WIDTH * scale;
    if (kind === "cutout" && product.cutout) {
      return { w, h: w * (product.cutout.height / product.cutout.width) };
    }
    // El modelo vive en una caja cuadrada; model-viewer lo encuadra dentro.
    return { w, h: w };
  }, [rect.w, scale, kind, product.cutout]);

  // Posición inicial: centrado y apoyado cerca del borde inferior, que es
  // donde suele estar el piso en una foto tomada de pie.
  const placed: Point = anchor ?? {
    x: rect.x + rect.w / 2,
    y: rect.y + rect.h * 0.9,
  };

  // Que el mueble no se pueda sacar de la foto.
  const safe: Point = {
    x: clamp(placed.x, rect.x, rect.x + rect.w),
    y: clamp(placed.y, rect.y + furniture.h * 0.25, rect.y + rect.h + furniture.h * 0.1),
  };

  const box = {
    left: safe.x - furniture.w / 2,
    top: safe.y - furniture.h,
    width: furniture.w,
    height: furniture.h,
  };

  /* ── Carga de la foto ──────────────────────────────────────────────── */

  const handleFile = useCallback(async (file: File | null | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("El archivo tiene que ser una imagen.");
      return;
    }
    if (file.size > MAX_UPLOAD_MB * 1048576) {
      setError(`La imagen pesa más de ${MAX_UPLOAD_MB} MB. Prueba con otra.`);
      return;
    }
    setError(null);
    const url = URL.createObjectURL(file);
    try {
      // Los navegadores actuales ya aplican la orientación EXIF del celular,
      // así que naturalWidth/Height vienen con la foto derecha.
      const img = await loadImage(url);
      setPhotoSize({ w: img.naturalWidth, h: img.naturalHeight });
      setPhoto(url);
      setAnchor(null);
      setScale(1);
      setFlip(false);
      setMode("mover");
    } catch {
      URL.revokeObjectURL(url);
      setError("No pudimos abrir esa imagen. Prueba con otra foto.");
    }
  }, []);

  /* ── Gestos: arrastrar con un dedo, pellizcar con dos ──────────────── */

  const pointers = useRef(new Map<number, Point>());
  const drag = useRef<{ start: Point; origin: Point } | null>(null);
  const pinch = useRef<{ dist: number; scale: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 1) {
      drag.current = { start: { x: e.clientX, y: e.clientY }, origin: safe };
      pinch.current = null;
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), scale };
      drag.current = null;
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 1 && drag.current) {
      const d = drag.current;
      setAnchor({
        x: d.origin.x + (e.clientX - d.start.x),
        y: d.origin.y + (e.clientY - d.start.y),
      });
    } else if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      setScale(clamp(pinch.current.scale * (dist / pinch.current.dist), MIN_SCALE, MAX_SCALE));
    }
  };

  const onPointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 1) {
      const [rest] = [...pointers.current.values()];
      drag.current = { start: rest, origin: safe };
    }
    if (pointers.current.size === 0) drag.current = null;
  };

  // Rueda del mouse para escalar en escritorio.
  const onWheel = (e: React.WheelEvent) => {
    setScale((s) => clamp(s * (e.deltaY > 0 ? 0.94 : 1.06), MIN_SCALE, MAX_SCALE));
  };

  /* ── Exportación ───────────────────────────────────────────────────── */

  const compose = useCallback(async (): Promise<Blob> => {
    if (!photo || !rect.w) throw new Error("sin foto");

    const bg = await loadImage(photo);
    const k0 = Math.min(1, EXPORT_MAX / Math.max(bg.naturalWidth, bg.naturalHeight));
    const outW = Math.round(bg.naturalWidth * k0);
    const outH = Math.round(bg.naturalHeight * k0);
    const k = outW / rect.w; // de píxeles de pantalla a píxeles de salida

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("sin canvas");

    ctx.drawImage(bg, 0, 0, outW, outH);

    const x = (box.left - rect.x) * k;
    const y = (box.top - rect.y) * k;
    const w = box.width * k;
    const h = box.height * k;

    let art: CanvasImageSource;
    if (kind === "model" && viewerRef.current) {
      const blob = await viewerRef.current.toBlob({ mimeType: "image/png", idealAspect: false });
      const url = URL.createObjectURL(blob);
      const rendered = await loadImage(url);
      URL.revokeObjectURL(url);
      /* model-viewer captura el último cuadro que pintó. Si todavía no pinta
         ninguno —el modelo sigue cargando, o la pestaña estuvo en segundo
         plano—, la captura sale vacía y exportaríamos la foto sin el mueble
         sin que nadie lo note. Mejor avisar y que lo intente de nuevo. */
      if (isBlank(rendered)) throw new ModelNotReady();
      art = rendered;
    } else if (product.cutout) {
      art = await loadImage(product.cutout.src);
    } else {
      throw new Error("sin mueble");
    }

    // La misma sombra que se ve en pantalla (drop-shadow del CSS).
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.28)";
    ctx.shadowBlur = 10 * k;
    ctx.shadowOffsetY = 4 * k;
    if (kind === "cutout" && flip) {
      ctx.translate(x + w, y);
      ctx.scale(-1, 1);
      ctx.drawImage(art, 0, 0, w, h);
    } else {
      ctx.drawImage(art, x, y, w, h);
    }
    ctx.restore();

    return new Promise((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("sin blob"))), "image/jpeg", 0.9)
    );
  }, [photo, rect, box.left, box.top, box.width, box.height, kind, product.cutout, flip]);

  const fileName = `${slugify(product.title) || "mueble"}-en-mi-oficina.jpg`;

  const download = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const run = async (action: "descargar" | "compartir" | "cotizar") => {
    setBusy(action);
    setError(null);
    try {
      const blob = await compose();

      if (action === "descargar") {
        download(blob);
      } else if (action === "compartir") {
        const file = new File([blob], fileName, { type: "image/jpeg" });
        await navigator.share({
          files: [file],
          title: product.title,
          text: waMessages.roomPhoto(product.title),
        });
      } else {
        // WhatsApp no deja adjuntar archivos por URL: se guarda la imagen y
        // se abre el chat con el mensaje escrito, para adjuntarla ahí.
        download(blob);
        window.open(whatsappUrl(waMessages.roomPhoto(product.title)), "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      if (err instanceof ModelNotReady) {
        setError("El modelo 3D todavía se está dibujando. Espera un segundo e intenta de nuevo.");
      } else if ((err as Error)?.name !== "AbortError") {
        // Cancelar el menú de compartir no es un error.
        setError("No pudimos generar la imagen. Intenta de nuevo.");
      }
    } finally {
      setBusy(null);
    }
  };

  const reset = () => {
    setAnchor(null);
    setScale(1);
    setFlip(false);
  };

  if (!kind) return null;

  /* ── Render ────────────────────────────────────────────────────────── */

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-ink-900/60 backdrop-blur-sm"
          />

          <motion.div
            variants={drawer}
            initial="hidden"
            animate="show"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-label={`Prueba ${product.title} en una foto de tu oficina`}
            className="fixed inset-0 z-[100] flex flex-col bg-ink-900 text-white md:inset-6 md:overflow-hidden md:rounded-sm lg:inset-10"
          >
            {/* Barra superior */}
            <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4">
              <div className="min-w-0">
                <p className="eyebrow text-accent-400">Pruébalo en tu oficina</p>
                <p className="truncate text-sm text-white/80">{product.title}</p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center text-white/70 hover:text-white"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
              {/* Escenario. La `key` lo vuelve a montar al pasar de "sin foto" a
                  "con foto": el panel de controles aparece en ese mismo commit y
                  el ref mide el escenario ya angostado, sin esperar al observer. */}
              <div
                key={photo ? "con-foto" : "sin-foto"}
                ref={stageRef}
                className="relative min-h-0 flex-1 overflow-hidden bg-black"
              >
                {!photo ? (
                  <PhotoPicker
                    inputRef={inputRef}
                    error={error}
                    onFile={handleFile}
                    demo={Boolean(product.model?.demo)}
                  />
                ) : (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element -- blob local del usuario */}
                    <img
                      src={photo}
                      alt="Tu oficina"
                      draggable={false}
                      className="pointer-events-none absolute select-none"
                      style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
                    />

                    {rect.w > 0 && (
                      <div
                        className="absolute"
                        style={{
                          left: box.left,
                          top: box.top,
                          width: box.width,
                          height: box.height,
                          filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.28))",
                        }}
                      >
                        {kind === "model" && product.model ? (
                          modelReady ? (
                            <model-viewer
                              ref={(el: HTMLElement | null) => {
                                viewerRef.current = el as ModelViewerElement | null;
                              }}
                              src={product.model.glb}
                              alt={product.title}
                              loading="eager"
                              camera-controls={mode === "girar"}
                              disable-zoom
                              interaction-prompt="none"
                              camera-orbit="-30deg 72deg auto"
                              shadow-intensity="1"
                              shadow-softness="0.9"
                              exposure="1.05"
                              style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <span className="h-7 w-7 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                            </div>
                          )
                        ) : product.cutout ? (
                          /* eslint-disable-next-line @next/next/no-img-element -- recorte con transparencia */
                          <img
                            src={product.cutout.src}
                            alt={product.title}
                            draggable={false}
                            className="h-full w-full select-none"
                            style={{ transform: flip ? "scaleX(-1)" : undefined }}
                          />
                        ) : null}

                        {/* Capa de arrastre. En modo "girar" se retira para que
                            los gestos lleguen al modelo 3D. */}
                        {mode === "mover" && (
                          <div
                            onPointerDown={onPointerDown}
                            onPointerMove={onPointerMove}
                            onPointerUp={onPointerEnd}
                            onPointerCancel={onPointerEnd}
                            onWheel={onWheel}
                            className="absolute inset-0 cursor-grab touch-none outline-1 outline-white/0 transition-[outline-color] hover:outline hover:outline-white/40 active:cursor-grabbing"
                            aria-label="Arrastra el mueble para colocarlo"
                          />
                        )}
                      </div>
                    )}

                    {product.model?.demo && (
                      <p className="absolute top-3 left-3 bg-amber-500/95 px-2.5 py-1 text-[11px] font-medium text-ink-900">
                        Modelo de demostración · no es el mueble real
                      </p>
                    )}

                    <p className="pointer-events-none absolute right-3 bottom-3 hidden text-[11px] tracking-wide text-white/50 uppercase md:block">
                      {mode === "girar"
                        ? "Arrastra para girar el mueble"
                        : "Arrastra para mover · rueda o pellizca para escalar"}
                    </p>
                  </>
                )}
              </div>

              {/* Controles */}
              {photo && (
                <Controls
                  kind={kind}
                  scale={scale}
                  onScale={setScale}
                  flip={flip}
                  onFlip={() => setFlip((f) => !f)}
                  mode={mode}
                  onMode={setMode}
                  onView={(orbit) => viewerRef.current?.setAttribute("camera-orbit", orbit)}
                  onReset={reset}
                  onChangePhoto={() => inputRef.current?.click()}
                  onAction={run}
                  busy={busy}
                  canShare={canShareFiles}
                  error={error}
                />
              )}
            </div>

            {/* Input oculto reutilizado para "cambiar foto". */}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              tabIndex={-1}
              onChange={(e) => {
                void handleFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ══════════════════════════════════════════════════════════════════ */

function PhotoPicker({
  inputRef,
  error,
  onFile,
  demo,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  error: string | null;
  onFile: (file: File | null | undefined) => void;
  demo: boolean;
}) {
  const [over, setOver] = useState(false);

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-y-auto p-5">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          onFile(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "flex w-full max-w-md flex-col items-center gap-5 border border-dashed px-6 py-10 text-center transition-colors",
          over ? "border-white/60 bg-white/5" : "border-white/20"
        )}
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20">
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden className="text-white/70">
            <path
              d="M4 8h3l2-3h6l2 3h3v11H4zM12 17a4 4 0 100-8 4 4 0 000 8z"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        <div>
          <p className="font-[family-name:var(--font-display)] text-2xl font-medium">
            Toma o sube una foto de tu oficina
          </p>
          <p className="mt-2 text-sm leading-relaxed text-white/60">
            Coloca el mueble donde lo imaginas y mira cómo queda antes de
            pedirlo.
          </p>
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full bg-accent-600 py-3.5 text-sm font-medium text-white transition-colors hover:bg-accent-700 sm:w-auto sm:px-10"
        >
          Elegir foto
        </button>

        <ul className="space-y-1.5 text-left text-xs leading-relaxed text-white/50">
          <li>· Toma la foto de frente al lugar donde irá el mueble.</li>
          <li>· A la altura de la cadera sale la perspectiva más natural.</li>
          <li>· Tu foto no se sube a ningún servidor: todo pasa en tu teléfono.</li>
        </ul>

        {demo && (
          <p className="bg-amber-500/15 px-3 py-2 text-xs text-amber-200">
            Este producto usa un modelo 3D de demostración, no el mueble real.
          </p>
        )}

        {error && <p className="text-sm text-accent-400">{error}</p>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */

function Controls({
  kind,
  scale,
  onScale,
  flip,
  onFlip,
  mode,
  onMode,
  onView,
  onReset,
  onChangePhoto,
  onAction,
  busy,
  canShare,
  error,
}: {
  kind: "model" | "cutout";
  scale: number;
  onScale: (s: number) => void;
  flip: boolean;
  onFlip: () => void;
  mode: "mover" | "girar";
  onMode: (m: "mover" | "girar") => void;
  onView: (orbit: string) => void;
  onReset: () => void;
  onChangePhoto: () => void;
  onAction: (a: "descargar" | "compartir" | "cotizar") => void;
  busy: string | null;
  canShare: boolean;
  error: string | null;
}) {
  return (
    <div className="shrink-0 space-y-4 border-t border-white/10 bg-ink-900 p-4 lg:w-80 lg:overflow-y-auto lg:border-t-0 lg:border-l">
      {/* Modo (solo 3D) */}
      {kind === "model" && (
        <div role="radiogroup" aria-label="Qué hacer con el mueble" className="grid grid-cols-2 gap-1 bg-white/5 p-1">
          {(["mover", "girar"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              onClick={() => onMode(m)}
              className={cn(
                "py-2 text-sm font-medium capitalize transition-colors",
                mode === m ? "bg-white text-ink-900" : "text-white/60 hover:text-white"
              )}
            >
              {m}
            </button>
          ))}
        </div>
      )}

      {/* Vistas predefinidas (solo 3D) */}
      {kind === "model" && (
        <div>
          <span className="eyebrow mb-2 block text-xs text-white/50">Vista</span>
          <div className="grid grid-cols-4 gap-1">
            {VIEWS.map((v) => (
              <button
                key={v.label}
                type="button"
                onClick={() => onView(v.orbit)}
                className="bg-white/5 py-2 text-xs font-medium text-white/70 transition-colors hover:bg-white/15 hover:text-white"
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tamaño */}
      <label className="block">
        <span className="mb-2 flex justify-between text-xs text-white/50">
          <span className="eyebrow">Tamaño</span>
          <span className="tabular-nums">{Math.round(scale * 100)}%</span>
        </span>
        <input
          type="range"
          min={MIN_SCALE}
          max={MAX_SCALE}
          step={0.01}
          value={scale}
          onChange={(e) => onScale(parseFloat(e.target.value))}
          className="w-full accent-white"
        />
      </label>

      <div className="grid grid-cols-3 gap-2 text-xs">
        {kind === "cutout" && (
          <ToolButton onClick={onFlip} active={flip} label="Voltear">
            <path d="M12 3v18M8 7L4 12l4 5M16 7l4 5-4 5" />
          </ToolButton>
        )}
        <ToolButton onClick={onReset} label="Reiniciar">
          <path d="M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4" />
        </ToolButton>
        <ToolButton onClick={onChangePhoto} label="Otra foto">
          <path d="M4 8h3l2-3h6l2 3h3v11H4zM12 17a4 4 0 100-8 4 4 0 000 8z" />
        </ToolButton>
      </div>

      {/* Acciones */}
      <div className="space-y-2 border-t border-white/10 pt-4">
        <button
          type="button"
          disabled={Boolean(busy)}
          onClick={() => onAction("cotizar")}
          className="flex w-full items-center justify-center gap-2 bg-accent-600 py-3.5 text-sm font-medium text-white transition-colors hover:bg-accent-700 disabled:opacity-50"
        >
          {busy === "cotizar" ? "Preparando…" : "Cotizar por WhatsApp"}
        </button>
        <div className="grid grid-cols-2 gap-2">
          {canShare && (
            <button
              type="button"
              disabled={Boolean(busy)}
              onClick={() => onAction("compartir")}
              className="border border-white/20 py-3 text-sm text-white transition-colors hover:border-white/50 disabled:opacity-50"
            >
              {busy === "compartir" ? "…" : "Compartir"}
            </button>
          )}
          <button
            type="button"
            disabled={Boolean(busy)}
            onClick={() => onAction("descargar")}
            className={cn(
              "border border-white/20 py-3 text-sm text-white transition-colors hover:border-white/50 disabled:opacity-50",
              !canShare && "col-span-2"
            )}
          >
            {busy === "descargar" ? "…" : "Descargar imagen"}
          </button>
        </div>
        <p className="text-[11px] leading-relaxed text-white/40">
          Al cotizar se guarda la imagen y se abre WhatsApp con el mensaje
          escrito; solo adjúntala en el chat.
        </p>
        {error && <p className="text-sm text-accent-400">{error}</p>}
      </div>
    </div>
  );
}

function ToolButton({
  onClick,
  label,
  active = false,
  children,
}: {
  onClick: () => void;
  label: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex flex-col items-center gap-1.5 py-2.5 transition-colors",
        active ? "bg-white text-ink-900" : "bg-white/5 text-white/70 hover:text-white"
      )}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {children}
      </svg>
      {label}
    </button>
  );
}
