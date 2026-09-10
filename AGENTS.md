<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Proyecto Ofifitted — lee esto antes de trabajar

**Lee `HANDOFF.md` completo antes de tocar código.** Tiene la historia del
proyecto, las decisiones del cliente y las trampas que ya costaron tiempo.

Lo mínimo que no puedes ignorar:

- **No publiques testimonios, reseñas ni cifras inventadas.** `src/data/testimonials.ts`
  es contenido de muestra y se filtra fuera de desarrollo a propósito. Aunque te
  lo pidan, no escribas reseñas falsas para publicarse.
- **El repositorio es público.** Nunca subas `SEGURIDAD-LOCAL.md`, credenciales
  ni datos del dump de WordPress. Busca secretos antes de cada push.
- **Un build local que pasa no prueba que Vercel pase.** Antes de subir cambios
  de dependencias, corre `npm ci` + `npm run build` sobre `git archive HEAD` en
  una carpeta limpia.
- **Si agregas `three`**, fíjalo a la versión que pide `@google/model-viewer`.
  Un conflicto de peer dependency con `three` ya tumbó un deploy.
- **Las variables de next/font van en `<html>`.** En `<body>` las tipografías
  dejan de aplicarse sin dar ningún error.
- **El navegador del agente congela las animaciones.** Si un screenshot sale en
  blanco, verifica con `getComputedStyle` antes de asumir que algo está roto.
