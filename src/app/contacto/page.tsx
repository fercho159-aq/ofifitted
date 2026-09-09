import type { Metadata } from "next";

import { QuoteForm } from "@/components/contact/QuoteForm";
import { Reveal } from "@/components/ui/Reveal";
import { contact, waMessages, whatsappUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Cotiza tu mobiliario de oficina con Ofifitted. WhatsApp, teléfono y visita a planta en la Ciudad de México.",
};

export default function ContactoPage() {
  return (
    <>
      <section className="border-b border-ink-200 bg-white">
        <div className="container-page py-14 md:py-20">
          <Reveal>
            <p className="eyebrow text-accent-600">Contacto</p>
            <h1 className="heading-section mt-3 max-w-3xl">
              Cotizar no tiene costo ni compromiso.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-600">
              Contestamos en horario de planta. Si escribes fuera de horario,
              tu mensaje es lo primero que vemos al abrir.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container-page py-14 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <Reveal preset="left">
            <h2 className="text-xl font-medium text-ink-900">
              Cuéntanos qué necesitas
            </h2>
            <p className="mt-2 mb-8 text-sm text-ink-600">
              Entre más específico, más rápido te llega el precio.
            </p>
            <QuoteForm />
          </Reveal>

          <Reveal preset="right">
            <div className="space-y-10">
              <div>
                <p className="eyebrow mb-4 text-ink-400">Directo</p>
                <a
                  href={whatsappUrl(waMessages.general)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-[#25D366] px-5 py-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M12.05 21.79h-.01a9.87 9.87 0 01-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 01-1.51-5.26c0-5.45 4.44-9.89 9.89-9.89a9.82 9.82 0 016.99 2.9 9.83 9.83 0 012.89 6.99c0 5.45-4.44 9.89-9.88 9.89m8.41-18.3A11.82 11.82 0 0012.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 005.69 1.45c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 00-3.48-8.4" />
                  </svg>
                  Escribir por WhatsApp
                </a>
              </div>

              <div>
                <p className="eyebrow mb-3 text-ink-400">Teléfono</p>
                <ul className="space-y-2">
                  {[...contact.phones, ...contact.office].map((phone) => (
                    <li key={phone.tel}>
                      <a
                        href={`tel:${phone.tel}`}
                        className="text-ink-800 tabular-nums transition-colors hover:text-brand-600"
                      >
                        <span className="text-ink-500">{phone.label}</span>{" "}
                        {phone.value}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="eyebrow mb-3 text-ink-400">Horario</p>
                <p className="leading-relaxed text-ink-700">{contact.hours}</p>
              </div>

              <div>
                <p className="eyebrow mb-3 text-ink-400">Visítanos</p>
                <div className="space-y-5">
                  {contact.locations.map((location) => (
                    <div key={location.kind}>
                      <p className="text-sm font-medium text-ink-900">
                        {location.kind}
                      </p>
                      <p className="mt-1 leading-relaxed text-ink-600">
                        {location.address}
                      </p>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1.5 inline-flex text-sm text-brand-600 underline underline-offset-4 hover:text-brand-700"
                      >
                        Ver en el mapa
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
