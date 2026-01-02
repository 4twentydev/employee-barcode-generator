"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ToastProvider } from "@/components/toast";

const links = [
  { href: "/label", label: "Label" },
  { href: "/employees", label: "Employees" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const initial =
      stored === "light" || stored === "dark" ? stored : "dark";
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-sand">
        <header className="border-b border-subtle surface">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-accent-secondary">
                Elward Systems
              </p>
              <h1 className="text-lg font-semibold text-strong">
                Employee Barcode Labels
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <nav className="flex gap-2 rounded-full surface-muted p-1 text-sm">
                {links.map((link) => {
                  const active = pathname?.startsWith(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`rounded-full px-4 py-2 font-medium transition ${
                        active
                          ? "surface text-strong shadow-sm"
                          : "text-muted hover:text-strong"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
              <button
                type="button"
                onClick={() =>
                  setTheme((prev) => (prev === "dark" ? "light" : "dark"))
                }
                className="rounded-full border border-subtle px-3 py-2 text-xs font-semibold text-muted transition hover:border-strong hover:text-strong"
                aria-label="Toggle light or dark mode"
              >
                {theme === "dark" ? (
                  <span className="flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-[0.2em]">
                      Light
                    </span>
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1l2.1-2.1M17 7l2.1-2.1" />
                    </svg>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-[0.2em]">
                      Dark
                    </span>
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M21 14.5A9 9 0 1 1 9.5 3 7 7 0 0 0 21 14.5Z" />
                    </svg>
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
      </div>
    </ToastProvider>
  );
}
