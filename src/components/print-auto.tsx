"use client";

import { useEffect } from "react";

export default function PrintAuto() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
