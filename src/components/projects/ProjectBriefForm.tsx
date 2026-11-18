"use client";

import { useState } from "react";

import { Field, inputClass } from "@/components/contact/QuoteForm";
import { whatsappUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────────
   Brief de proyecto (B2B).

   Igual que QuoteForm, no manda correo: compone el mensaje y abre WhatsApp
   con todo escrito, con vista previa. Lo que cambia son las preguntas:
   son las que un vendedor de proyectos necesita para calificar el lead en
   el primer mensaje —perfil, espacios, tamaño, fecha y si hay planos— sin
   tener que hacer un interrogatorio por chat.
   ──────────────────────────────────────────────────────────────────── */

const PROFILES = [
  "Empresa (usuario final)",
  "Arquitecto o interiorista",
  "Constructora o contratista",
  "Desarrollador inmobiliario",
  "Otro",
] as const;

const SPACES = [
  "Oficinas gerenciales",
  "Open space / áreas operativas",
  "Salas de juntas",
  "Lobby y recepción",
  "Zonas colaborativas / cafetería",
] as const;

const TIMELINES = [
  "Por definir",
  "Menos de 1 mes",
  "1 a 3 meses",
  "3 a 6 meses",
  "Más de 6 meses",
] as const;

const PLANS = [
  "Sí, DWG o PDF",
  "Croquis o fotos",
  "No, requiero levantamiento",
] as const;

export function ProjectBriefForm() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [profile, setProfile] = useState<string>(PROFILES[0]);
  const [city, setCity] = useState("");
  const [spaces, setSpaces] = useState<string[]>([]);
  const [size, setSize] = useState("");
  const [timeline, setTimeline] = useState<string>(TIMELINES[0]);
  const [plans, setPlans] = useState<string>(PLANS[0]);
  const [details, setDetails] = useState("");
  const [touched, setTouched] = useState(false);

  const nameOk = name.trim().length >= 2;
  const companyOk = company.trim().length >= 2;
  const ready = nameOk && companyOk;

  const toggleSpace = (space: string) =>
    setSpaces((current) =>
      current.includes(space)
        ? current.filter((s) => s !== space)
        : [...current, space]
    );

  const lines: string[] = [
    "Hola Ofifitted, quiero cotizar un proyecto de mobiliario.",
    "",
  ];
  lines.push(`Nombre: ${name.trim() || "—"}`);
  lines.push(`Empresa: ${company.trim() || "—"}`);
  lines.push(`Perfil: ${profile}`);
  if (city.trim()) lines.push(`Ubicación del proyecto: ${city.trim()}`);
  if (spaces.length) lines.push(`Espacios a equipar: ${spaces.join(", ")}`);
  if (size.trim()) lines.push(`Tamaño: ${size.trim()}`);
  lines.push(`Fecha estimada: ${timeline}`);
  lines.push(`Planos: ${plans}`);
  if (details.trim()) lines.push("", `Detalles: ${details.trim()}`);
  const message = lines.join("\n");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!ready) return;
    window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nombre" required>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched(true)}
            autoComplete="name"
            aria-invalid={touched && !nameOk}
            className={inputClass(touched && !nameOk)}
          />
        </Field>
        <Field label="Empresa o despacho" required>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            autoComplete="organization"
            aria-invalid={touched && !companyOk}
            className={inputClass(touched && !companyOk)}
          />
        </Field>
      </div>

      {touched && !ready && (
        <p className="text-xs text-accent-600" role="alert">
          Necesitamos tu nombre y tu empresa para preparar la propuesta.
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Perfil">
          <Select value={profile} onChange={setProfile} options={PROFILES} />
        </Field>
        <Field label="Ubicación del proyecto">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            autoComplete="address-level2"
            placeholder="Ciudad de México, Monterrey…"
            className={inputClass(false)}
          />
        </Field>
      </div>

      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-ink-800">
          Espacios a equipar
        </legend>
        <div className="flex flex-wrap gap-2">
          {SPACES.map((space) => {
            const active = spaces.includes(space);
            return (
              <button
                key={space}
                type="button"
                aria-pressed={active}
                onClick={() => toggleSpace(space)}
                className={cn(
                  "border px-3.5 py-2 text-sm transition-colors",
                  active
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-ink-200 bg-white text-ink-700 hover:border-ink-400"
                )}
              >
                {space}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Tamaño aproximado">
          <input
            type="text"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="800 m² o 60 puestos"
            className={inputClass(false)}
          />
        </Field>
        <Field label="¿Para cuándo?">
          <Select value={timeline} onChange={setTimeline} options={TIMELINES} />
        </Field>
        <Field label="¿Tienes planos?">
          <Select value={plans} onChange={setPlans} options={PLANS} />
        </Field>
      </div>

      <Field label="Detalles del proyecto">
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={3}
          placeholder="Tipo de inmueble, acabados de referencia, presupuesto estimado…"
          className={cn(inputClass(false), "resize-y")}
        />
      </Field>

      <details className="group border border-ink-200 bg-ink-50">
        <summary className="cursor-pointer list-none px-4 py-3 text-xs font-medium tracking-wide text-ink-500 uppercase">
          Ver el mensaje que se enviará
        </summary>
        <pre className="font-body border-t border-ink-200 px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap text-ink-700">
          {message}
        </pre>
      </details>

      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 bg-accent-600 py-4 text-sm font-medium text-white transition-colors hover:bg-accent-700"
      >
        Solicitar propuesta del proyecto
      </button>

      <p className="text-xs leading-relaxed text-ink-500">
        Se abre WhatsApp con el brief escrito para que lo revises antes de
        enviarlo. Sin costo y sin compromiso. No guardamos lo que escribes aquí.
      </p>
    </form>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(inputClass(false), "appearance-none bg-white pr-10")}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
