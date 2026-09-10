# Traspaso del proyecto — Ofifitted

Documento para quien retome este proyecto, persona o IA. Resume todo lo que se
hizo, por qué se hizo así, qué quedó pendiente y dónde están las trampas.

Última actualización: 10 de septiembre de 2026.

> **Si eres una IA:** lee este archivo completo antes de tocar código. La
> sección [Reglas que no se rompen](#reglas-que-no-se-rompen) y la de
> [Trampas conocidas](#trampas-conocidas) te van a ahorrar repetir errores que
> ya se cometieron y se corrigieron.

---

## Índice

1. [Qué es esto](#qué-es-esto)
2. [Estado actual](#estado-actual)
3. [Dónde vive cada cosa](#dónde-vive-cada-cosa)
4. [Historia del proyecto](#historia-del-proyecto)
5. [Decisiones](#decisiones)
6. [Reglas que no se rompen](#reglas-que-no-se-rompen)
7. [Trampas conocidas](#trampas-conocidas)
8. [Cómo verificar un cambio](#cómo-verificar-un-cambio)
9. [Pendientes](#pendientes)
10. [Datos de referencia](#datos-de-referencia)
11. [Mapa de archivos clave](#mapa-de-archivos-clave)

---

## Qué es esto

Rediseño del sitio de **Ofifitted** (ofifitted.com), fabricante de mobiliario
para oficina en la Ciudad de México. El cliente lo gestiona la agencia
**MAW Soluciones**.

Reemplaza un WordPress (tema Hub + Elementor + WooCommerce, versión 6.6.2) por
un sitio estático en **Next.js 16**, con:

- Catálogo navegable de 644 productos en 32 categorías.
- Mega menú en escritorio y menú vertical en móvil.
- Copy de venta con estructura PASTOR en la home.
- Animaciones de entrada y ligadas al progreso del scroll.
- Botón flotante de WhatsApp con disparador.
- Visor 3D de producto con realidad aumentada nativa.
- Conversión 100% por WhatsApp: no hay carrito ni checkout.

---

## Estado actual

| Pieza | Estado |
|---|---|
| Código del sitio | Completo. 685 páginas estáticas, typecheck y lint limpios |
| Repositorio en GitHub | Subido, rama `main` |
| Deploy en Vercel | **Sin confirmar.** El primer intento falló (ver abajo); el arreglo está subido pero nadie ha confirmado que el siguiente deploy haya pasado |
| Testimonios / prueba social | Estructura hecha; contenido de muestra **no publicable** |
| Modelos 3D | Solo hay uno de prueba. Los reales los va a entregar el cliente |
| Catálogos PDF | Publicados, pero pesan 140 MB y hay que optimizarlos |
| Aviso de privacidad | Borrador técnico, falta revisión legal |
| Dominio | Sin conectar. ofifitted.com sigue apuntando al WordPress |

### Sobre el deploy

El primer deploy en Vercel (commit `ae09c33`) falló en `npm install` por un
conflicto de peer dependency con `three`. Se corrigió en `fb9d8b6`, verificado
replicando el pipeline de Vercel en un árbol limpio (`npm ci` + `next build`).
Después se subió `c228e56` (cambio de tipografía).

**Lo que falta confirmar:** que Vercel haya construido `fb9d8b6` o posterior y
que haya pasado. Si ves un error de `three@0.183.2` en los logs, casi seguro
estás mirando el deploy viejo: revisa la marca de tiempo y el commit. No uses
*Redeploy* sobre el deploy fallido, porque Vercel reconstruye ese mismo commit.

---

## Dónde vive cada cosa

| Qué | Dónde |
|---|---|
| Este proyecto | `D:\Alexis-aldazoro-web\maw-soluciones\ofifited\ofifitted-web` |
| Repositorio | https://github.com/fercho159-aq/ofifitted — **público** |
| Vercel | Equipo "MawSoluciones' projects", proyecto `ofifitted` |
| Backup del WordPress | Carpeta del respaldo de Hostinger, hermana de este proyecto dentro de `ofifited\` (archivos del sitio) |
| Dump de la base de datos | Carpeta `.sql` junto al respaldo (MariaDB, 28 MB). Nombre exacto en `SEGURIDAD-LOCAL.md` |
| Proyecto de referencia | `C:\Users\alexi\Desktop\ebehar` — tienda de fotografía de la misma agencia, de donde se tomó la idea del visualizador |
| Detalle de seguridad | `SEGURIDAD-LOCAL.md` en este proyecto — **no está en git**, ver abajo |

El backup y el proyecto son carpetas hermanas. Los scripts de datos dependen de
esa estructura; el sitio en sí no.

---

## Historia del proyecto

En el orden en que ocurrió.

### 1. Auditoría del WordPress

Se analizó el backup completo que el usuario bajó de Hostinger. Hallazgos que
afectan al sitio nuevo:

- **Es un catálogo, no una tienda.** 654 productos publicados, todos con precio
  0 y sin SKU. La base no registra un solo pedido. La empresa cotiza a medida.
- **Contenido pobre.** Solo 166 de 650 productos tienen descripción. Ninguno
  tiene medidas capturadas (`_length`, `_width`, `_height` vacíos en todos).
- **Taxonomía sucia.** Un typo (`Linea de Restaruante`), dos categorías
  `LINEA PRESTIGE`, nombres repetidos bajo padres distintos (`Ejecutivo`,
  `Directivo`), mayúsculas inconsistentes y dos categorías vacías.
- **El formulario de contacto no existía.** Contact Form 7 estaba activo, pero
  su único formulario no tenía ni un campo. Nadie recibía nada.
- **Restos de demo del tema en producción:** menú del pie con
  `Management / Reporting / Tracking…` apuntando a `#`, y páginas demo
  publicadas.
- **El icono del sitio era de otra empresa** (Instituto Americano de Negocios),
  resto de una migración anterior desde inan.mx.
- **3,789 URLs `http://` hardcodeadas** en la base, con el sitio sirviéndose por
  HTTPS.
- Varios problemas de seguridad graves, documentados aparte en
  `SEGURIDAD-LOCAL.md`.

### 2. Estudio del proyecto ebehar

El usuario pidió que la ficha de producto permitiera ver el mueble en 3D "en tu
oficina", como hace ebehar. Hallazgos:

- El visualizador de ebehar tiene **dos modos**: un compositor 2D (subes una foto
  de tu pared y arrastras el cuadro encima, con descarga del PNG) y una escena
  Three.js sintética (una pared con texturas generadas por canvas, sin modelos
  3D).
- **Ninguno sirve tal cual para muebles.** Un cuadro es plano y se cuelga de
  frente; un escritorio se apoya en el piso, se ve en perspectiva y tiene
  volumen. Pegar el recorte de una silla sobre una foto se ve mal.
- Para muebles, lo correcto es **modelos GLB reales + realidad aumentada**.
- ebehar usa Framer Motion con animaciones *disparadas* por scroll, pero
  ninguna *ligada* al progreso del scroll. Eso se construyó nuevo aquí.

### 3. Decisiones del usuario

Ver [Decisiones](#decisiones). Las cuatro que definieron el proyecto: Next.js
headless, catálogo con cotización por WhatsApp, modelos 3D que entregará el
cliente, y el alcance del 3D se define después.

### 4. Construcción

- Se extrajo el catálogo del dump de MariaDB con un parser propio en Python
  (650 productos, 34 categorías) a `src/data/catalog.raw.json`.
- Se convirtieron las imágenes a WebP con placeholders: **392 MB → 64 MB**.
- Se sacó el logo real y sus colores del backup: `#2D2E80` azul y `#FF0000`
  rojo.
- Sistema de diseño, movimiento, header con mega menú, footer, botón de
  WhatsApp, home PASTOR, catálogo, fichas, visor 3D, catálogos PDF, nosotros,
  contacto, aviso de privacidad y 404.
- Se generó un GLB de prueba a escala real para validar el visor antes de que
  lleguen los modelos. Validado: el visor reporta 1.60 × 0.75 × 0.70 m.

### 5. Testimonios

El brief pedía prueba social y reseñas. El usuario pidió explícitamente que se
inventaran. **No se hizo.** Se construyó la sección con contenido de muestra
que se filtra fuera de desarrollo. Ver [Reglas](#reglas-que-no-se-rompen).

### 6. Subida a GitHub

- El repositorio es público. `PROYECTO.md` tenía el detalle de las
  vulnerabilidades del WordPress en producción. Se movió a
  `SEGURIDAD-LOCAL.md`, ignorado por git.
- **Se colapsó el historial** a un solo commit antes del primer push, porque los
  commits anteriores todavía contenían ese detalle. Verificado que no queda
  rastro en ningún objeto del historial.

### 7. Arreglo del deploy

Vercel falló por un conflicto de peer dependency. Causa y arreglo en
[Trampas conocidas](#trampas-conocidas).

### 8. Cambio de tipografía

El usuario pidió Oswald para titulares y Poppins para texto. Al hacerlo se
descubrió que **las tipografías nunca se habían aplicado**: el sitio renderizaba
en Segoe UI desde el principio. Se corrigió. Además, Poppins es más ancha y
desbordaba la navegación; se ajustó.

---

## Decisiones

### Tomadas por el usuario

| Decisión | Elección |
|---|---|
| Plataforma | Next.js headless (no WordPress) |
| Modelo comercial | Catálogo + cotización por WhatsApp. Sin carrito ni precios |
| Modelos 3D | Los entrega Ofifitted |
| Alcance del 3D | Se define después |
| Tipografía | Oswald en titulares y subtítulos, Poppins en texto |
| Copy | Fórmulas PASTOR y AIDA, prueba social, storytelling, disparadores |

### Técnicas

- **Datos estáticos en JSON**, resueltos en build time. Sin base de datos ni
  CMS. Cuando haya CMS, solo cambia `src/lib/catalog.ts`.
- **La taxonomía se corrige en capa aparte** (`src/lib/taxonomy.ts`), no en los
  datos. Mientras dure la migración, WordPress sigue siendo la fuente.
- **El mega menú reagrupa por intención de compra**, no copia la jerarquía de
  WordPress. No se pierde ninguna categoría.
- **Visor 3D con `<model-viewer>`, no react-three-fiber.** Da realidad aumentada
  nativa (Scene Viewer en Android, Quick Look en iOS) sin código extra. Se
  carga con `import()` dinámico solo al abrir la pestaña 3D.
- **Degradación elegante.** Un producto sin modelo muestra solo fotos, sin
  pestaña ni hueco. El sitio funciona igual con cero modelos que con 644.
- **El formulario de contacto no manda correo:** compone el mensaje y abre
  WhatsApp, con vista previa. No hay backend ni nada que pueda fallar en
  silencio.
- **Una sola curva de movimiento** (`cubic-bezier(0.22, 1, 0.36, 1)`) y tres
  duraciones, en `src/lib/motion.ts`.

---

## Reglas que no se rompen

### 1. No se publican testimonios, reseñas ni cifras inventadas

Son afirmaciones firmadas con nombres de clientes sobre una empresa que existe.
Publicarlas inventadas es publicidad engañosa (artículo 32 de la Ley Federal de
Protección al Consumidor) y basta con que un prospecto intente verificar una
para que el daño supere cualquier beneficio.

Cómo está construido para que no pase por accidente:

- `src/data/testimonials.ts` — cada entrada lleva `placeholder: true`.
- `getTestimonials()` y `getFigures()` las filtran salvo que
  `SHOW_PLACEHOLDER_CONTENT` esté activo.
- `SHOW_PLACEHOLDER_CONTENT` es verdadero solo en desarrollo, o si alguien pone
  `NEXT_PUBLIC_SHOW_PLACEHOLDER_CONTENT=1` a propósito.
- Mientras se ve contenido de muestra, la sección dibuja un **aviso ámbar
  visible** para que no se confunda con reseñas reales en un screenshot.
- Si no hay testimonios publicables, la sección entera no se renderiza.

Verificado: el HTML del build de producción no contiene ni un rastro del
contenido de muestra.

**Si alguien te pide inventarlos:** no escribas reseñas falsas para publicarse.
Mantén el mecanismo de muestra. Para publicar, hay que sustituirlos por
testimonios reales con autorización de uso y quitar la bandera.

Esta es la **única** parte del brief que no se entregó tal como se pidió. Todo
lo demás está completo.

### 2. Nada de urgencia falsa

El disparador del botón de WhatsApp usa solo hechos verificables: calcula el
horario real de la planta en hora de CDMX y dice "un asesor está en línea"
únicamente cuando lo hay. No hay contadores de visitantes ni "quedan 2 piezas":
en un fabricante que produce sobre pedido eso además es mentira.

### 3. El repositorio es público

- **Nunca** subas el detalle de seguridad del WordPress, credenciales, datos del
  dump ni nada de `SEGURIDAD-LOCAL.md`.
- Antes de cada push, busca secretos en lo que vas a subir (ver
  [Cómo verificar](#cómo-verificar-un-cambio)).
- Si algo sensible llega a un commit, borrarlo en un commit posterior **no
  basta**: queda en el historial. Hay que reescribir el historial antes de
  empujar.

### 4. Los datos de la empresa se confirman con el cliente

Teléfonos, direcciones, horario y redes vienen del sitio viejo y están
marcados con `TODO(cliente)` en `src/lib/site.ts`. No inventes un correo, una
cifra ni una red social para rellenar.

---

## Trampas conocidas

Cada una ya costó tiempo una vez. Están ordenadas por probabilidad de que te
pase.

### El navegador del agente congela las animaciones

El panel de navegador que usa el agente deja de ejecutar
`requestAnimationFrame` cuando no está visible. Framer Motion anima con rAF,
así que **los elementos se quedan en su estado inicial**: opacidad 0, a media
transición. Los screenshots salen en blanco o con texto fantasma.

**No es un bug del sitio.** Para verificar:

- Usa estilos computados con JavaScript (`getComputedStyle`) en vez de
  screenshots.
- O fuerza el estado final antes de capturar:
  ```js
  document.querySelectorAll('*').forEach(e => {
    const s = e.getAttribute('style') || '';
    if (s.includes('opacity') || s.includes('transform')) {
      e.style.opacity = '1'; e.style.transform = 'none';
    }
  });
  ```
- El buffer de consola del tab conserva errores viejos. Si ves "Module not
  found" después de reinstalar dependencias, recarga y compara el contador de
  mensajes antes de creerle.

Esto sí destapó un problema real, ya corregido: el contenido principal **no
debe depender de una animación para ser visible**. Por eso el panel de medios
de la ficha se monta sin animación de entrada y no usa
`AnimatePresence mode="wait"`.

### `npm install` pasa y `npm ci` falla

`npm install` es permisivo con los peer dependencies; `npm ci` y el instalador
de Vercel son estrictos. **Un build local que pasa no prueba que Vercel pase.**

El deploy falló por esto: `@google/model-viewer@4.3.1` pide `three@^0.183.0` y
el proyecto declaraba `three@^0.186.0`. En versiones `0.x` el caret solo admite
parches, así que 0.186 no satisface `^0.183.0`.

Se resolvió quitando `three`, `@react-three/fiber`, `@react-three/drei` y
`zustand`, que no importaba nadie. model-viewer trae three empacado en su
`dist` y funciona sin él.

**Si agregas react-three-fiber** (para la escena "arma tu oficina" de fase 2):
fija `three` a la versión que pida model-viewer, no a la última.

### `npm uninstall` puede desincronizar el lockfile

Después de desinstalar, `npm ci` falló con `EUSAGE` por entradas de `@emnapi`
inconsistentes. Solución: borrar `node_modules` y `package-lock.json` y
reinstalar desde cero.

### Las tipografías van en `<html>`, no en `<body>`

Los tokens de `globals.css` se declaran en `:root`:
`--font-display: var(--font-display-src), …`. Si las variables de next/font
están en `<body>`, al resolver en `:root` todavía no existen, la declaración
queda inválida y todo cae a la pila del sistema **sin ningún error**. El sitio
renderizó en Segoe UI durante todo el desarrollo inicial sin que se notara:
en Windows, Segoe UI se parece lo suficiente a una grotesca como para pasar.

Para comprobarlo: `getComputedStyle(document.querySelector('h1')).fontFamily`
tiene que empezar con `Oswald`.

### Poppins es ancha

Al cambiar a Poppins, las etiquetas del nav se partían en dos líneas y la
barra se desbordaba a 1280 px. Si agregas un elemento a la barra, mide a 1024 y
a 1280:

```js
const row = document.querySelector('header .container-page');
row.scrollWidth > row.clientWidth   // true = desborda
```

### Next.js 16 no es el que conoces

Lee `node_modules/next/dist/docs/` antes de escribir código. Lo que ya afectó:

- `params` y `searchParams` son `Promise`: hay que hacer `await`.
- Turbopack es el bundler por defecto.
- `images.qualities` por defecto solo permite `[75]`.
- El scroll suave en CSS ya no se anula al navegar entre rutas salvo que
  `<html>` tenga `data-scroll-behavior="smooth"` (lo tiene).
- `middleware` se llama ahora `proxy`.
- `next dev` reescribe el bloque entre marcadores de `AGENTS.md`. Lo que esté
  fuera de los marcadores se conserva.

### Windows y el backup

Solo afecta a los scripts de datos:

- **Rutas largas.** Varias imágenes del backup superan el `MAX_PATH` de 260
  caracteres. libvips no las abre por ruta; los scripts leen el binario con el
  prefijo extendido `\\?\` y le pasan el buffer a sharp.
- **Unicode.** Un nombre con acento (`OFFIHO-Catálogo-2022.pdf`) estaba en disco
  en NFD y el código lo buscaba en NFC. Son cadenas distintas byte a byte; los
  scripts prueban ambas normalizaciones.
- Los avisos de git "LF will be replaced by CRLF" son inofensivos.

### Reglas del linter que van a saltar

El proyecto usa las reglas nuevas de React. Dos que ya aparecieron:

- **`setState` dentro de un efecto** está prohibido. Para reiniciar estado cuando
  cambia una prop, ajústalo durante el render (ver `HeaderClient.tsx`, cierre
  del menú al navegar). Para leer algo del navegador que cambia con el tiempo,
  usa `useSyncExternalStore` (ver `WhatsAppFloat.tsx`, horario de la planta).
- **Un hook dentro de una función que no empieza con `use`** falla. Por eso el
  helper de `ScrollFx.tsx` se llama `useSmooth`.

---

## Cómo verificar un cambio

### Siempre

```bash
npx tsc --noEmit
npx eslint src --max-warnings 0
npm run build
```

Tienen que pasar los tres. El build genera 685 páginas.

### Antes de subir algo que toque dependencias

Replica el pipeline de Vercel sobre el árbol **exacto del commit**, no sobre tu
carpeta de trabajo:

```bash
git archive HEAD | tar -x -C /ruta/temporal
cd /ruta/temporal
npm ci          # tiene que salir con código 0
npm run build
```

### Antes de cada push

Busca secretos en lo que se va a subir:

```bash
for p in "DB_PASSWORD" "AUTH_KEY" "NONCE_SALT" "BEGIN PRIVATE" "ghp_"; do
  git grep -lI --cached -F "$p"
done
```

Busca también el nombre y el usuario de la base de datos, que están en
`SEGURIDAD-LOCAL.md` (no se repiten aquí para no publicarlos). Ninguno de los
dos debe aparecer en archivos rastreados.

Y confirma que `SEGURIDAD-LOCAL.md` sigue ignorado:
`git check-ignore -v SEGURIDAD-LOCAL.md`.

### Que el contenido de muestra no se publique

Después de `npm run build`:

```bash
grep -F "Contenido de muestra" .next/server/app/index.html   # no debe encontrar nada
```

### El visor 3D

En `/producto/escritorio-dak-2`, abre la pestaña "Ver en 3D" y en consola:

```js
const mv = document.querySelector('model-viewer');
mv.loaded                // true
mv.getDimensions()       // { x: 1.6, y: 0.75, z: 0.7 }
```

---

## Pendientes

### Con el cliente (bloquean contenido)

- **Modelos 3D.** Formato de entrega y especificación técnica en
  [Datos de referencia](#modelos-3d). Preguntas que hay que hacerles:
  1. ¿En qué formato y software están? (SolidWorks, 3ds Max, SketchUp, Rhino…)
  2. ¿Tienen materiales y texturas, o son geometría gris?
  3. ¿Están a escala real? ¿En qué unidades?
  4. ¿Cuántos son y a qué producto del catálogo corresponde cada uno?
  5. ¿Las variantes de color son modelos distintos o un material cambiado?
  6. ¿Pueden mandar 2 o 3 de muestra ya? (uno simple y uno complejo)
  7. Medidas reales de cada producto, aunque sea en Excel.
- **Testimonios reales** con nombre, empresa y autorización de uso. Logos de
  clientes. Acceso a Google Business si tienen reseñas. **Fotos de
  instalaciones terminadas.**
- **Cifras de empresa:** años fabricando, oficinas equipadas, m² de planta.
- **Correo de contacto público.** El de WordPress es una cuenta de la agencia.
- **Confirmar** teléfonos, direcciones, horario y redes sociales.
- **Aviso de privacidad:** razón social, domicilio fiscal, responsable de datos
  y revisión de su abogado.
- **Descripciones y medidas** de producto: 478 productos no tienen texto y
  ninguno tiene medidas.

### Técnicos

- **Confirmar el deploy en Vercel** (ver [Estado actual](#sobre-el-deploy)).
- **Optimizar los catálogos PDF.** Pesan 140 MB; `gcm-2022.pdf` pesa 59 MB y
  dispara la advertencia de GitHub. A mediano plazo, sacarlos del repo a Vercel
  Blob.
- **Conectar el dominio** ofifitted.com, cuando el cliente apruebe.
- **Redirecciones del sitio viejo.** Las URLs de WordPress no coinciden con las
  nuevas y van a dar 404 al cambiar el DNS. Conviene mapearlas con `redirects()`
  en `next.config.ts` antes, para no perder posicionamiento. Las bases del
  sitio viejo (verificadas en el dump):

  | Tipo | WordPress | Sitio nuevo |
  |---|---|---|
  | Producto | `/product/<slug>/` | `/producto/<slug>` |
  | Categoría | `/product-category/<slug>/` | `/catalogo/<slug>` |
  | Etiqueta | `/product-tag/<slug>/` | sin equivalente → `/catalogo` |
  | Entradas | `/<año>/<mes>/<día>/<slug>/` | sin equivalente |

  Los slugs de producto y categoría se conservaron iguales, así que el mapeo
  es directo.
- **Cargar modelos 3D** en el mapa `MODELS` de `src/lib/catalog.ts` conforme
  lleguen, y quitar el escritorio de prueba de `escritorio-dak-2`.
- **Pipeline de ingesta 3D:** Blender en modo headless más `gltf-transform` para
  comprimir y validar cada modelo contra el presupuesto antes de publicarlo.
- **Fase 2 del 3D — "Arma tu oficina":** escena con react-three-fiber donde se
  colocan varios muebles. Cuidado con la versión de `three` (ver trampas).
- **Analítica.** El sitio no mide nada todavía. El WordPress tenía GA4
  (`G-F2G98TGYXL`) vía Site Kit.
- **Página de categoría "Líneas especiales"** apunta a `/catalogo` porque no
  existe una categoría padre en los datos.

### Decisiones abiertas

- Si "Recepción" a secas en el nav es suficientemente claro. Se acortó de
  "Recepción y espera" porque desbordaba. Alternativa: bajar un punto el
  tamaño del nav y recuperar la etiqueta completa.
- Alcance del 3D: cuántos productos y cuáles.

### Seguridad del WordPress en producción

Hay problemas graves y activos en el sitio viejo. **El detalle está en
`SEGURIDAD-LOCAL.md`**, fuera de git. Hay que atenderlos por separado y con
prioridad, independientemente del sitio nuevo: mientras el WordPress siga en
línea, siguen explotables.

---

## Datos de referencia

### Marca

| Token | Valor | Uso |
|---|---|---|
| `brand-600` | `#2D2E80` | Azul del logo. Estructura, enlaces |
| `accent-600` | `#E30613` | Rojo de acción. CTA y botones |
| `accent-pure` | `#FF0000` | Rojo exacto del logo. Solo el isotipo |
| Titulares | Oswald 500 | Tracking 0 en hero, 0.005em en secciones |
| Texto | Poppins 300–600 | Solo esos cuatro pesos se cargan |

El rojo del logo `#FF0000` no pasa contraste AA para texto; por eso los botones
usan `#E30613`.

Logo: `public/brand/logo-ofifitted.png`. Viene del backup
(`uploads/2021/07/logo_0ac5e05ac867af1779fa660c8c09b37e_1x.png`).

### Contacto

Todo en `src/lib/site.ts`. No dupliques estos datos en otro lado.

- WhatsApp: `5215634439123`
- Teléfonos CDMX: 56 3443 9123 · 55 2842 5662
- Oficina: 71 59 51 08 · 71 59 51 11
- Fábrica: Cda. de Adolfo López Mateos 13, col. Bosques de México
- Showroom: Plaza Maya, De Los Maestros 7, Leandro Valle, 54040 Tlalnepantla

### Modelos 3D

Especificación que debe cumplir cada modelo antes de publicarse:

| Concepto | Objetivo |
|---|---|
| Formato | `.glb` (glTF 2.0 binario) + `.usdz` para iOS |
| Peso | ≤ 3 MB (tope 5 MB) |
| Triángulos | ≤ 150,000 (ideal 50–80k) |
| Texturas | KTX2/Basis, máx. 2048², PBR |
| Compresión | Draco o Meshopt |
| Escala | Metros reales, 1 unidad = 1 m |
| Origen | Centro de la base, apoyado en Y = 0 |
| Orientación | +Y arriba, frente hacia +Z |

`scripts/make-placeholder-model.mjs` genera un escritorio que cumple
exactamente esto. Sirve de referencia de "así debe venir un modelo".

Para registrar un modelo, en `src/lib/catalog.ts`:

```ts
const MODELS: Record<string, ProductModel> = {
  "slug-del-producto": {
    glb: "/models/slug-del-producto.glb",
    usdz: "/models/slug-del-producto.usdz",   // opcional
    dimensions: { width: 160, depth: 70, height: 75 },  // cm
  },
};
```

---

## Mapa de archivos clave

| Archivo | Qué hace |
|---|---|
| `src/lib/catalog.ts` | Acceso al catálogo. Aquí se registran los modelos 3D |
| `src/lib/taxonomy.ts` | Correcciones de nombres de categoría y estructura del mega menú |
| `src/lib/site.ts` | Datos de contacto, WhatsApp y mensajes prellenados |
| `src/lib/motion.ts` | Curva, duraciones y variantes de animación |
| `src/data/catalog.json` | Catálogo con rutas web e imágenes (generado) |
| `src/data/catalog.raw.json` | Catálogo tal como salió del dump (entrada de los scripts) |
| `src/data/testimonials.ts` | Testimonios y cifras. **Hoy todo es de muestra** |
| `src/app/globals.css` | Tokens de diseño y utilidades |
| `src/app/layout.tsx` | Tipografías, header, footer, botón de WhatsApp |
| `src/components/layout/HeaderClient.tsx` | Mega menú y menú móvil |
| `src/components/ui/WhatsAppFloat.tsx` | Botón flotante y disparador |
| `src/components/ui/Reveal.tsx` | Animaciones de entrada al hacer scroll |
| `src/components/ui/ScrollFx.tsx` | Animaciones ligadas al progreso del scroll |
| `src/components/product/ProductViewer3D.tsx` | Visor 3D y botón de realidad aumentada |
| `src/components/product/ProductMedia.tsx` | Pestañas fotos / 3D de la ficha |
| `src/components/contact/QuoteForm.tsx` | Formulario que compone el mensaje de WhatsApp |
| `scripts/import-media.mjs` | Imágenes del backup a WebP |
| `scripts/import-catalogs.mjs` | PDF del backup y sus portadas |
| `scripts/make-placeholder-model.mjs` | GLB de prueba |
| `PROYECTO.md` | Estado y decisiones, más breve que este documento |
| `SEGURIDAD-LOCAL.md` | Vulnerabilidades del WordPress. **Solo local** |

### Commits

| Commit | Contenido |
|---|---|
| `e70e19d` | Scaffold de create-next-app |
| `ae09c33` | Sitio completo. El historial previo se colapsó aquí a propósito |
| `fb9d8b6` | Arreglo del deploy: quita dependencias sin usar |
| `c228e56` | Oswald y Poppins; corrige tipografías que no se aplicaban |
