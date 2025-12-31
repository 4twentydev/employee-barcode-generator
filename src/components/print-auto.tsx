"use client";

import { useEffect, useRef } from "react";

export default function PrintAuto() {
  const didPrintRef = useRef(false);

  useEffect(() => {
    if (didPrintRef.current) return;
    didPrintRef.current = true;

    let timeoutId: number | null = null;
    let rafId: number | null = null;
    let cancelled = false;

    const schedulePrint = async () => {
      if (document.fonts?.ready) {
        try {
          await document.fonts.ready;
        } catch {
          // Ignore font readiness failures and proceed to print.
        }
      }
      if (cancelled) return;
      timeoutId = window.setTimeout(() => {
        window.print();
      }, 300);
    };

    const start = () => {
      rafId = window.requestAnimationFrame(() => {
        void schedulePrint();
      });
    };

    if (document.readyState === "complete") {
      start();
    } else {
      window.addEventListener("load", start, { once: true });
    }

    return () => {
      cancelled = true;
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      window.removeEventListener("load", start);
    };
  }, []);

  return null;
}
