import { RevealGroup, RevealItem } from "@/components/ui/Reveal";

const PROPS = [
  {
    title: "Fabricación propia",
    body: "Producimos en nuestra planta en la Ciudad de México.",
    icon: <path d="M3 21h18M9 21V12h6v9M5 21V8l7-5 7 5v13" />,
  },
  {
    title: "A tu medida",
    body: "Ajustamos dimensiones al espacio sin cambiar el precio.",
    icon: <path d="M16 3h5v5M8 21H3v-5M21 3l-7 7M3 21l7-7" />,
  },
  {
    title: "Envío nacional",
    body: "Entrega a toda la República Mexicana.",
    icon: (
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM15 10a3 3 0 11-6 0 3 3 0 016 0z" />
    ),
  },
  {
    title: "Garantía directa",
    body: "Refacciones y soporte sin intermediarios.",
    icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  },
];

export function ValueStrip() {
  return (
    <section className="border-y border-ink-200 bg-white">
      <div className="container-page py-14 md:py-16">
        <RevealGroup
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
          step={0.08}
        >
          {PROPS.map((prop) => (
            <RevealItem key={prop.title}>
              <div className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    aria-hidden
                  >
                    {prop.icon}
                  </svg>
                </span>
                <div>
                  <h3 className="text-sm font-medium text-ink-900">
                    {prop.title}
                  </h3>
                  <p className="mt-0.5 text-sm text-ink-500">{prop.body}</p>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
