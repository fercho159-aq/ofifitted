"use client";

import { useState } from "react";

import { whatsappUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────────
   Formulario de cotización.

   No manda correo: compone el mensaje y abre WhatsApp con todo escrito.

   Es a propósito. El sitio no tiene backend ni servicio de correo, y el
   formulario del WordPress anterior llevaba años roto —el formulario existía
   pero no tenía ni un solo campo, así que nadie recibió nunca nada—. Con
   esto no hay nada que se pueda romper en silencio: el mensaje se ve antes
   de enviarse y queda en la conversación de WhatsApp del vendedor, que es
   donde de verdad se atiende.
   ──────────────────────────────────────────────────────────────────── */

const NEEDS = [
  "Amueblar una oficina completa",
  "Escritorios y estaciones de trabajo",
  "Sillería",
  "Recepción o sala de espera",
  "Archivo y guardado",
  "Otro",
] as const;

export function QuoteForm() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [city, setCity] = useState("");
  const [need, setNeed] = useState<string>(NEEDS[0]);
  const [quantity, setQuantity] = useState("");
  const [details, setDetails] = useState("");
  const [touched, setTouched] = useState(false);

  const nameOk = name.trim().length >= 2;
  const ready = nameOk;

  /* Se arma empujando líneas en vez de filtrar un arreglo: con `filter(Boolean)`
     la línea en blanco que separa el saludo desaparece junto con los campos
     vacíos, porque ambas son la cadena "". */
  const lines: string[] = ["Hola Ofifitted, quiero una cotización.", ""];
  lines.push(`Nombre: ${name.trim() || "—"}`);
  if (company.trim()) lines.push(`Empresa: ${company.trim()}`);
  if (city.trim()) lines.push(`Ciudad: ${city.trim()}`);
  lines.push(`Necesito: ${need}`);
  if (quantity.trim()) lines.push(`Cantidad aproximada: ${quantity.trim()}`);
  if (details.trim()) lines.push("", `Detalles: ${details.trim()}`);

  const message = lines.join("\n");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!ready) return;
    window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Tu nombre" required>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched(true)}
            autoComplete="name"
            aria-invalid={touched && !nameOk}
            aria-describedby={touched && !nameOk ? "name-error" : undefined}
            className={inputClass(touched && !nameOk)}
          />
          {touched && !nameOk && (
            <p id="name-error" className="mt-1.5 text-xs text-accent-600">
              Necesitamos tu nombre para saber con quién hablamos.
            </p>
          )}
        </Field>

        <Field label="Empresa">
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            autoComplete="organization"
            className={inputClass(false)}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Ciudad">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            autoComplete="address-level2"
            placeholder="Ciudad de México"
            className={inputClass(false)}
          />
        </Field>

        <Field label="Cantidad aproximada">
          <input
            type="text"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="12 escritorios, 30 sillas…"
            className={inputClass(false)}
          />
        </Field>
      </div>

      <Field label="¿Qué necesitas?">
        <select
          value={need}
          onChange={(e) => setNeed(e.target.value)}
          className={cn(inputClass(false), "appearance-none bg-white pr-10")}
        >
          {NEEDS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Detalles">
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={4}
          placeholder="Medidas, acabado, color de tapiz, fecha en que lo necesitas…"
          className={cn(inputClass(false), "resize-y")}
        />
      </Field>

      {/* Vista previa: que nadie mande algo sin saber qué manda. */}
      <div className="border border-ink-200 bg-ink-50 p-4">
        <p className="eyebrow mb-2 text-ink-400">Se enviará este mensaje</p>
        <pre className="font-body text-sm leading-relaxed whitespace-pre-wrap text-ink-700">
          {message}
        </pre>
      </div>

      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 bg-accent-600 py-4 text-sm font-medium text-white transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12.05 21.79h-.01a9.87 9.87 0 01-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 01-1.51-5.26c0-5.45 4.44-9.89 9.89-9.89a9.82 9.82 0 016.99 2.9 9.83 9.83 0 012.89 6.99c0 5.45-4.44 9.89-9.88 9.89m8.41-18.3A11.82 11.82 0 0012.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 005.69 1.45c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 00-3.48-8.4" />
        </svg>
        Abrir WhatsApp con este mensaje
      </button>

      <p className="text-xs leading-relaxed text-ink-500">
        Se abre tu WhatsApp con el mensaje escrito. Puedes revisarlo o cambiarlo
        antes de mandarlo. No guardamos nada de lo que escribes aquí.
      </p>
    </form>
  );
}

function inputClass(invalid: boolean) {
  return cn(
    "w-full border bg-white px-4 py-3 text-sm text-ink-900 outline-none transition-colors",
    "placeholder:text-ink-400 focus:border-brand-600",
    invalid ? "border-accent-600" : "border-ink-200"
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-800">
        {label}
        {required && <span className="ml-1 text-accent-600">*</span>}
      </span>
      {children}
    </label>
  );
}
