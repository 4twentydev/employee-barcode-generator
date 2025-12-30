"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ToastProvider } from "@/components/toast";

const links = [
  { href: "/label", label: "Label" },
  { href: "/employees", label: "Employees" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <ToastProvider>
      <div className="min-h-screen bg-sand">
        <header className="border-b border-black/10 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                4twenty operations
              </p>
              <h1 className="text-lg font-semibold text-zinc-900">
                Employee Barcode Labels
              </h1>
            </div>
            <nav className="flex gap-2 rounded-full bg-zinc-100 p-1 text-sm">
              {links.map((link) => {
                const active = pathname?.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-full px-4 py-2 font-medium transition ${
                      active
                        ? "bg-white text-zinc-900 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-900"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
      </div>
    </ToastProvider>
  );
}
