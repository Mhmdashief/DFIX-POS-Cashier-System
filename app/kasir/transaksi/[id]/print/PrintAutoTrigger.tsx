"use client";

import { useEffect } from "react";

/**
 * Fires window.print() once after the page has fully rendered.
 * Using a 300ms delay gives the browser time to apply all styles before
 * the print dialog opens, preventing layout flash.
 */
export default function PrintAutoTrigger() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
