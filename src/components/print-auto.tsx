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
        window.focus();
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

  return (
    <div className="mb-4 flex flex-col items-end gap-2 text-xs text-zinc-500 print:hidden">
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black"
      >
        Print labels
      </button>
      <p>If the print dialog did not open, use the button above.</p>
    </div>
  );
}
