import Image from "next/image";
import Link from "next/link";

import type { Product } from "@/lib/catalog";
import { cn } from "@/lib/utils";

/**
 * Tarjeta de producto del listado.
 *
 * El catálogo no tiene precios (Ofifitted cotiza a medida), así que el lugar
 * donde normalmente iría el precio lo ocupa la acción: "Cotizar". Dejarlo
 * vacío hace que la tarjeta se vea incompleta y baja el clic.
 */
export function ProductCard({
  product,
  priority = false,
  className,
}: {
  product: Product;
  priority?: boolean;
  className?: string;
}) {
  const [cover] = product.images;
  if (!cover) return null;

  return (
    <Link
      href={`/producto/${product.slug}`}
      className={cn("group block", className)}
    >
      <div className="relative aspect-square overflow-hidden bg-white">
        <Image
          src={cover.src}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          placeholder="blur"
          blurDataURL={cover.blurDataURL}
          priority={priority}
          className="object-contain p-4 transition-transform duration-700 ease-[var(--ease-brand)] group-hover:scale-[1.04]"
        />

        {product.model && (
          <span className="absolute top-3 left-3 flex items-center gap-1.5 bg-brand-600 px-2.5 py-1 text-[10px] font-medium tracking-wide text-white uppercase">
            <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden>
              <path
                d="M12 2l9 5v10l-9 5-9-5V7l9-5zM3 7l9 5 9-5M12 12v10"
                stroke="currentColor"
                strokeWidth="1.8"
                fill="none"
                strokeLinejoin="round"
              />
            </svg>
            Ver en 3D
          </span>
        )}

        {/* Acción que aparece al pasar el mouse. En táctil no estorba porque
            la tarjeta completa ya es un enlace. */}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-ink-900/90 py-2.5 text-center text-xs font-medium text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          Ver ficha y cotizar
        </span>
      </div>

      <h3 className="mt-3 text-sm leading-snug font-medium text-ink-900 transition-colors group-hover:text-brand-600">
        {product.title}
      </h3>
      <p className="mt-0.5 text-xs text-ink-500">Cotización a medida</p>
    </Link>
  );
}
