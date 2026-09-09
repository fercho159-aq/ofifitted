"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * `reducedMotion="user"` hace que Framer Motion desactive por su cuenta las
 * animaciones de transformación cuando el sistema operativo pide reducir
 * movimiento. Sin esto, el CSS de globals.css solo alcanza a las
 * transiciones nativas y las de JS se siguen ejecutando.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
