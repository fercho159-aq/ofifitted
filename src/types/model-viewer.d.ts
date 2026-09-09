import type { DetailedHTMLProps, HTMLAttributes } from "react";

/**
 * `<model-viewer>` es un custom element, no un componente de React, así que
 * TypeScript necesita que le declaremos los atributos que usamos.
 * La lista completa vive en https://modelviewer.dev/docs/
 */
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          src?: string;
          "ios-src"?: string;
          alt?: string;
          poster?: string;
          loading?: "auto" | "lazy" | "eager";
          reveal?: "auto" | "manual";
          "camera-controls"?: boolean;
          "touch-action"?: string;
          "auto-rotate"?: boolean;
          "auto-rotate-delay"?: number;
          "rotation-per-second"?: string;
          "interaction-prompt"?: "auto" | "none";
          "shadow-intensity"?: string | number;
          "shadow-softness"?: string | number;
          exposure?: string | number;
          "environment-image"?: string;
          "camera-orbit"?: string;
          "min-camera-orbit"?: string;
          "max-camera-orbit"?: string;
          "field-of-view"?: string;
          "disable-zoom"?: boolean;
          ar?: boolean;
          "ar-modes"?: string;
          "ar-scale"?: "auto" | "fixed";
          "ar-placement"?: "floor" | "wall";
          "xr-environment"?: boolean;
        },
        HTMLElement
      >;
    }
  }
}

export {};
