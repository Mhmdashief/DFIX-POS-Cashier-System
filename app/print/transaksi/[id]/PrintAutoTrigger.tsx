"use client";

import { useEffect } from "react";

/**
 * Auto-triggers window.print() after the page renders.
 * 400ms delay ensures all fonts and styles are fully applied
 * before the print dialog opens.
 */
export default function PrintAutoTrigger() {
  useEffect(() => {
    const t = setTimeout(() => window.print(), 400);
    return () => clearTimeout(t);
  }, []);
  return null;
}
