/**
 * Carga diferida de `<model-viewer>`.
 *
 * La librería pesa ~300 KB y registra un custom element global, así que se
 * pide una sola vez aunque la usen varios componentes (el visor 3D de la ficha
 * y el visualizador sobre foto). La promesa se memoriza: la segunda llamada
 * reutiliza la primera.
 */
let loading: Promise<void> | null = null;

export function loadModelViewer(): Promise<void> {
  if (!loading) {
    loading = import("@google/model-viewer").then(() => undefined);
    // Si falla —red caída, bloqueador—, permite reintentar en la siguiente
    // apertura en vez de quedar envenenado para toda la sesión.
    loading.catch(() => {
      loading = null;
    });
  }
  return loading;
}

/** La parte de la API de `<model-viewer>` que usa el sitio. */
export type ModelViewerElement = HTMLElement & {
  loaded: boolean;
  canActivateAR: boolean;
  activateAR: () => void;
  toBlob: (options?: {
    mimeType?: string;
    qualityArgument?: number;
    idealAspect?: boolean;
  }) => Promise<Blob>;
  getDimensions: () => { x: number; y: number; z: number };
};
