"use client";

import { useEffect, useRef } from "react";

/**
 * Video decorativo que se reproduce solo: sin audio, en bucle y en línea.
 *
 * - No descarga nada hasta que entra en pantalla (`preload="none"` y
 *   `IntersectionObserver`), y se pausa al salir: siete videos en una tira no
 *   gastan datos ni batería mientras nadie los ve.
 * - Un elemento oculto con CSS (`display: none`) nunca intersecta, así que
 *   un video solo para móvil no se descarga en escritorio.
 * - Con "reducir movimiento" activado se queda en el poster.
 */
export function AutoplayVideo({
  src,
  poster,
  className,
  label,
}: {
  src: string;
  poster: string;
  className?: string;
  /** Descripción accesible. Sin ella el video se trata como decorativo. */
  label?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // El navegador puede rechazar el autoplay (modo ahorro de datos);
          // en ese caso se queda el poster, que es un estado válido.
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={className}
    />
  );
}
