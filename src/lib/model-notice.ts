import type { ProductModel } from "./catalog";

/**
 * Etiqueta que acompaña a un modelo 3D que no viene de fábrica.
 *
 * Vive fuera de catalog.ts a propósito: la usan componentes de cliente, y
 * catalog.ts importa el catálogo completo, que no debe llegar al navegador.
 */
export type ModelNotice = {
  /** Texto corto sobre el visor. */
  badge: string;
  /** Explicación más larga, para la pantalla de elegir foto. */
  detail: string;
  tone: "warning" | "info";
};

export function modelNotice(model: ProductModel | null | undefined): ModelNotice | null {
  switch (model?.fidelity) {
    case "demo":
      return {
        badge: "Modelo de demostración · no es el mueble real",
        detail: "Este producto usa un modelo 3D de demostración, no el mueble real.",
        tone: "warning",
      };
    case "approximate":
      return {
        badge: "Representación 3D aproximada",
        detail:
          "Este modelo 3D es una representación aproximada del mueble: medidas y acabados pueden variar.",
        tone: "info",
      };
    default:
      return null;
  }
}
