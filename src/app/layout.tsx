import type { Metadata, Viewport } from "next";
import { Oswald, Poppins } from "next/font/google";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { ScrollProgressBar } from "@/components/ui/ScrollFx";
import { WhatsAppFloat } from "@/components/ui/WhatsAppFloat";
import { site } from "@/lib/site";

import "./globals.css";

/* Oswald para titulares: condensada, con carácter industrial que le queda a
   un fabricante. Es variable, así que un solo archivo cubre todos los pesos. */
const display = Oswald({
  subsets: ["latin"],
  variable: "--font-display-src",
  display: "swap",
});

/* Poppins para el texto corrido. No tiene versión variable en Google Fonts,
   así que se piden solo los pesos que el sitio usa de verdad: cargar los
   nueve serían nueve archivos por cada juego de caracteres. */
const body = Poppins({
  subsets: ["latin"],
  variable: "--font-body-src",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} · ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: site.name,
    title: `${site.name} · ${site.tagline}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#2d2e80",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    /* `data-scroll-behavior="smooth"` le pide a Next 16 que siga anulando el
       scroll suave durante las transiciones de ruta: el scroll suave lo
       queremos para anclas internas, no para cambiar de página. */
    /* Las variables de next/font van en <html>, no en <body>: los tokens de
       globals.css (`--font-display: var(--font-display-src), …`) se declaran
       en :root, y ahí una variable definida más abajo todavía no existe. La
       declaración quedaba inválida y todo caía a la pila del sistema. */
    <html
      lang="es-MX"
      data-scroll-behavior="smooth"
      className={`${display.variable} ${body.variable}`}
    >
      <body className="antialiased">
        <MotionProvider>
          <a
            href="#contenido"
            className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
          >
            Saltar al contenido
          </a>

          <ScrollProgressBar />
          <Header />
          <main id="contenido">{children}</main>
          <Footer />
          <WhatsAppFloat />
        </MotionProvider>
      </body>
    </html>
  );
}
