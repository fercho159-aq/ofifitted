# Ofifitted — sitio nuevo

Rediseño de ofifitted.com. Reemplaza el WordPress + Divi/Hub actual por un
sitio estático en Next.js, con catálogo navegable, visor 3D de producto y
conversión por WhatsApp.

---

## Estado

| Pieza | Estado |
|---|---|
| Sistema de diseño (tokens, tipografía, movimiento) | Hecho |
| Extracción del catálogo desde el backup de WordPress | Hecho — 650 productos, 34 categorías |
| Pipeline de imágenes (WebP + placeholders) | Hecho — 392 MB → 64 MB |
| Header con mega menú (escritorio) y menú vertical (móvil) | Hecho |
| Botón flotante de WhatsApp con disparador | Hecho |
| Animaciones de entrada y ligadas al scroll | Hecho |
| Home completa (PASTOR) | Hecho |
| Listado de catálogo y de categoría | Hecho |
| Ficha de producto | Hecho |
| Visor 3D + realidad aumentada | Hecho, validado con modelo de prueba |
| Catálogos PDF descargables | Hecho — 11 catálogos |
| Nosotros | Hecho |
| Contacto con formulario a WhatsApp | Hecho |
| Aviso de privacidad | Borrador, falta revisión legal |
| 404 | Hecho |
| Prueba social y testimonios | Estructura hecha; **falta contenido real** |

Build actual: **685 páginas estáticas**.

---

## Comandos

```bash
npm run dev      # desarrollo
npm run build    # build de producción
npm run lint
```

Scripts de datos:

```bash
node scripts/import-media.mjs             # importa imágenes del backup a WebP
node scripts/import-media.mjs --force     # reconvierte todo
node scripts/import-catalogs.mjs           # importa los catálogos PDF
node scripts/make-placeholder-model.mjs   # regenera el GLB de prueba
```

`import-media.mjs` lee `src/data/catalog.raw.json` (extraído del dump de
WordPress) y necesita la carpeta del backup como hermana del proyecto:

```
ofifited/
├── u238895611.ofifitted-com.20260908234358/   ← backup
└── ofifitted-web/                             ← este proyecto
```

---

## Decisiones tomadas

**Catálogo, no tienda.** Los 654 productos del WordPress tienen precio 0 y
sin SKU, y la base no registra un solo pedido en tres años. Ofifitted fabrica
sobre medida y cotiza caso por caso. El sitio nuevo asume eso: no hay
carrito ni checkout, y el lugar donde iría el precio lo ocupa el CTA de
cotización con el mensaje de WhatsApp ya escrito.

**Datos estáticos.** El catálogo vive en `src/data/catalog.json` y se
consulta en build time desde `src/lib/catalog.ts`. Sin base de datos.
Cuando el contenido se mueva a un CMS, solo cambia ese archivo.

**Taxonomía corregida en capa aparte.** El origen trae nombres
inconsistentes, un typo (`Linea de Restaruante`), dos categorías
`LINEA PRESTIGE` y varias repetidas bajo padres distintos. Las correcciones
están en `src/lib/taxonomy.ts`, no en los datos: mientras dure la migración
WordPress sigue siendo la fuente.

**El mega menú reagrupa por intención de compra.** La jerarquía real no
sirve para navegar —"Otros muebles" no le dice nada a nadie y el archivado
está repartido en tres ramas—, así que el menú la reordena sin perder
ninguna categoría.

**Movimiento con una sola curva.** Todo el sitio usa
`cubic-bezier(0.22, 1, 0.36, 1)` y tres duraciones, definidas en
`src/lib/motion.ts`. Dos capas:

- `<Reveal>` / `<RevealGroup>` — entradas al hacer scroll.
- `ScrollFx.tsx` — efectos *ligados* al progreso del scroll: parallax, zoom,
  texto que se revela palabra por palabra, barra de progreso.

Todo respeta `prefers-reduced-motion` vía `<MotionConfig reducedMotion="user">`.

**El visor 3D usa `<model-viewer>`, no react-three-fiber.** La razón es la
realidad aumentada: model-viewer entrega Scene Viewer (Android) y Quick Look
(iOS) sin código extra, y esa es la función que convierte. La librería
(~300 KB) se carga con `import()` dinámico solo cuando alguien abre la
pestaña 3D.

**Degradación elegante en 3D.** `src/lib/catalog.ts` tiene un mapa
`MODELS` de slug → modelo. Si un producto no está en el mapa, la ficha
muestra solo fotos, sin pestaña ni hueco. El catálogo completo funciona hoy
con un solo modelo y funcionará igual con 30 o con 654.

---

## Sobre la prueba social

La sección de testimonios está construida y se puede revisar completa en
desarrollo, pero **con contenido de muestra que no se publica**.

El mecanismo está en `src/data/testimonials.ts`. Cada entrada lleva
`placeholder: true` y `getTestimonials()` las filtra salvo que
`SHOW_PLACEHOLDER_CONTENT` esté activo, lo cual ocurre solo en desarrollo o
si alguien pone `NEXT_PUBLIC_SHOW_PLACEHOLDER_CONTENT=1` a propósito para
enseñarle un preview al cliente. Mientras haya contenido de muestra a la
vista, la sección dibuja además un aviso ámbar visible, para que sea
imposible confundirlo con reseñas reales en un screenshot.

Verificado en el build de producción: ni "Contenido de muestra", ni los
nombres inventados, ni los textos de los testimonios aparecen en el HTML
generado. Cuando lleguen los reales, se sustituye el archivo, se quita la
bandera y la sección aparece sola.

La razón de fondo: son afirmaciones sobre una empresa que existe, firmadas
con nombres de clientes. Publicarlas inventadas es publicidad engañosa
—artículo 32 de la Ley Federal de Protección al Consumidor— y basta con que
alguien intente verificar un testimonio para que el daño reputacional supere
cualquier beneficio.

Lo que sí se está usando hoy, porque es verificable: el número de modelos
del catálogo, las líneas de producto, la cobertura de envío y el horario
real de la planta (el indicador "un asesor está en línea" del botón de
WhatsApp calcula el horario de CDMX de verdad, no lo simula).

Para llenar la sección hace falta que Ofifitted aporte:

- Testimonios con nombre, empresa y puesto de quien los da.
- Logos de clientes con autorización de uso.
- Acceso a su perfil de Google Business, si tiene reseñas ahí, para leerlas
  por API en vez de transcribirlas.
- Fotos de instalaciones terminadas (los "antes y después" venden más que
  cualquier testimonio escrito).

---

## Pendientes con el cliente

**Modelos 3D.** Ofifitted los va a entregar. Presupuesto técnico por modelo:

| Concepto | Objetivo |
|---|---|
| Formato | `.glb` (glTF 2.0 binario) + `.usdz` para iOS |
| Peso | ≤ 3 MB (tope 5 MB) |
| Triángulos | ≤ 150,000 (ideal 50–80k) |
| Texturas | KTX2/Basis, máx. 2048², PBR |
| Compresión | Draco o Meshopt |
| Escala | metros reales, 1 unidad = 1 m |
| Origen | centro de la base, apoyado en Y = 0 |
| Orientación | +Y arriba, frente hacia +Z |

`scripts/make-placeholder-model.mjs` genera un escritorio de prueba que
cumple exactamente ese presupuesto. Sirvió para validar el visor, la escala
y la AR antes de la primera entrega, y se puede seguir usando como
referencia de "así debe venir un modelo".

**Catálogos PDF pesados.** `public/catalogos/` son 140 MB. Cinco pasan de
10 MB y uno —`gcm-2022.pdf`— pesa **59 MB**: nadie lo descarga desde datos
móviles. Hay que mandarlos a optimizar antes de publicar, y a mediano plazo
sacarlos del repositorio a almacenamiento de objetos (Vercel Blob o
equivalente). El script avisa cuáles exceden el umbral cada vez que corre.

**Datos que faltan** (marcados con `TODO(cliente)` en `src/lib/site.ts`):

- Correo de contacto público. El de WordPress es una cuenta de la agencia.
- Confirmar teléfonos, direcciones y horario.
- Redes sociales reales (las URLs actuales son suposiciones).
- Razón social, domicilio fiscal y responsable de datos para el aviso de
  privacidad, más revisión de su abogado.
- Cifras de empresa: años fabricando, oficinas equipadas, m² de planta.
- Medidas de cada producto: los 654 tienen los campos vacíos.
- Descripciones: solo 166 de 650 productos tienen texto.

---

## Notas de la migración

El WordPress actual tiene pendientes de seguridad que **no** se arrastraron a
este proyecto, pero que siguen vivos en producción y hay que atender por
separado y con prioridad.

El detalle está en `SEGURIDAD-LOCAL.md`, fuera del control de versiones: este
repositorio es público y esa información es explotable mientras el sitio viejo
siga en línea. Pedírselo al equipo por canal privado.
