# Ofifitted

Sitio de [Ofifitted](https://ofifitted.com), fabricante de mobiliario para
oficina en la Ciudad de México. Reemplaza el WordPress anterior por un sitio
estático con catálogo navegable, visor 3D con realidad aumentada y
conversión por WhatsApp.

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind CSS 4 ·
Framer Motion · `<model-viewer>` · TypeScript

---

## Desarrollo

```bash
npm install
npm run dev
```

En [localhost:3000](http://localhost:3000).

```bash
npm run build    # 685 páginas estáticas
npm run lint
```

---

## Cómo está armado

```
src/
├── app/                    rutas (App Router)
│   ├── catalogo/[slug]/    listado por categoría
│   ├── producto/[slug]/    ficha con visor 3D
│   ├── catalogos/          PDF descargables
│   ├── nosotros/  contacto/  aviso-de-privacidad/
├── components/
│   ├── layout/             header con mega menú, footer
│   ├── home/               secciones de la portada
│   ├── product/            galería y visor 3D
│   ├── contact/            formulario que abre WhatsApp
│   └── ui/                 Reveal, ScrollFx, ProductCard…
├── data/                   catálogo y catálogos en JSON
└── lib/                    acceso a datos, taxonomía, movimiento
```

El catálogo es estático: 650 productos y 34 categorías en
`src/data/catalog.json`, resueltos en build time desde `src/lib/catalog.ts`.
No hay base de datos ni CMS.

### Movimiento

Una sola curva (`cubic-bezier(0.22, 1, 0.36, 1)`) y tres duraciones, en
`src/lib/motion.ts`. Dos capas:

- `<Reveal>` / `<RevealGroup>` — entradas al hacer scroll.
- `ScrollFx.tsx` — efectos ligados al progreso del scroll: parallax, zoom,
  texto que se revela palabra por palabra, barra de progreso.

Todo respeta `prefers-reduced-motion`.

### Visor 3D

`<model-viewer>` cargado con `import()` dinámico solo al abrir la pestaña 3D.
Entrega realidad aumentada nativa: Scene Viewer en Android, Quick Look en iOS.

Los modelos se registran en el mapa `MODELS` de `src/lib/catalog.ts`. Un
producto sin modelo muestra solo fotos, sin pestaña ni hueco: el sitio
funciona igual con cero modelos que con todos.

---

## Scripts de datos

Regeneran los datos a partir del backup del WordPress anterior, que debe
estar como carpeta hermana de este proyecto. **No hacen falta para
desarrollar ni para desplegar**: su salida ya está versionada.

```bash
node scripts/import-media.mjs             # imágenes del catálogo a WebP
node scripts/import-catalogs.mjs          # catálogos PDF y sus portadas
node scripts/make-placeholder-model.mjs   # GLB de prueba a escala real
node scripts/make-cutouts.mjs             # recortes para "Pruébalo en tu oficina"
```

---

## Antes de publicar

- **Testimonios.** `src/data/testimonials.ts` trae contenido de muestra que
  no se publica: se filtra fuera de desarrollo. Sustituir por testimonios
  reales de Ofifitted, con autorización de uso.
- **Catálogos PDF.** `public/catalogos/` pesa 140 MB y `gcm-2022.pdf` llega a
  59 MB. Optimizar y, a mediano plazo, mover a almacenamiento de objetos.
- **Aviso de privacidad.** Borrador; falta razón social, domicilio fiscal,
  responsable de datos y revisión legal.
- **Datos de contacto.** Los `TODO(cliente)` de `src/lib/site.ts`.

Ver `HANDOFF.md` para retomar el proyecto (historia, decisiones, trampas
conocidas y cómo verificar) y `PROYECTO.md` para el resumen de estado.
