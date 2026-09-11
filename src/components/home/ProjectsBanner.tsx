import Link from "next/link";

import { Reveal } from "@/components/ui/Reveal";

export function ProjectsBanner() {
  return (
    <section className="bg-brand-600">
      <Reveal>
        <div className="container-page flex flex-col items-start gap-6 py-12 md:flex-row md:items-center md:justify-between md:py-14">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-white md:text-3xl">
              ¿Amueblas una oficina completa?
            </h2>
            <p className="mt-2 max-w-lg text-white/80">
              Empresas, contratistas y arquitectos nos contratan para amueblar
              pisos y edificios enteros. Una propuesta, un proveedor.
            </p>
          </div>
          <Link
            href="/proyectos"
            className="inline-flex shrink-0 items-center gap-2 bg-white px-7 py-4 text-sm font-medium text-brand-700 transition-colors hover:bg-white/90"
          >
            Conoce el servicio
            <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden>
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="1.8"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
