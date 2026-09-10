import { socials, type SocialNetwork } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Íconos de redes sociales.
 *
 * Una red sin URL todavía se dibuja —para que el espacio exista y el cliente
 * lo vea— pero como elemento inerte con "Próximamente", no como enlace. Ver
 * `socials` en src/lib/site.ts.
 */
export function SocialLinks({
  tone = "dark",
  size = "md",
  className,
}: {
  /** "light" sobre fondos oscuros (barra azul, drawer); "dark" sobre claros. */
  tone?: "light" | "dark";
  size?: "sm" | "md";
  className?: string;
}) {
  const icon = size === "sm" ? 15 : 18;
  const box = size === "sm" ? "h-7 w-7" : "h-9 w-9";

  const live =
    tone === "light"
      ? "text-white/80 hover:text-white hover:bg-white/10"
      : "text-ink-600 hover:text-brand-600 hover:bg-brand-50";
  const pending = tone === "light" ? "text-white/35" : "text-ink-300";

  return (
    <ul className={cn("flex items-center gap-1", className)}>
      {socials.map(({ network, label, url }) => (
        <li key={network}>
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Ofifitted en ${label}`}
              className={cn(
                "flex items-center justify-center rounded-full transition-colors",
                box,
                live
              )}
            >
              <SocialIcon network={network} size={icon} />
            </a>
          ) : (
            <span
              title={`${label}: próximamente`}
              aria-label={`${label}, próximamente`}
              role="img"
              className={cn("flex cursor-default items-center justify-center", box, pending)}
            >
              <SocialIcon network={network} size={icon} />
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

function SocialIcon({ network, size }: { network: SocialNetwork; size: number }) {
  if (network === "instagram") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (network === "tiktok") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.8a5.7 5.7 0 1 0 4.8 5.6V9.1a7.3 7.3 0 0 0 4.3 1.4v-3a4.3 4.3 0 0 1-3.2-1.7z" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3a21 21 0 0 0-2.3-.1c-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1z" />
    </svg>
  );
}
