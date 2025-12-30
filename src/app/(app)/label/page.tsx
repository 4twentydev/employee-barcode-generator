"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/components/toast";

type Employee = {
  id: string;
  name: string;
  employeeNumber: string;
};

export default function LabelPage() {
  const { pushToast } = useToast();
  const [query, setQuery] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    if (!query.trim()) {
      setEmployees([]);
      return () => controller.abort();
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          q: query.trim(),
          status: "active",
        });
        const response = await fetch(`/api/employees?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        setEmployees(data.employees ?? []);
      } catch {
        pushToast({
          title: "Unable to search employees",
          description: "Check your connection and try again.",
          variant: "error",
        });
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, pushToast]);

  const labelEmployee = useMemo(() => {
    if (selected) return selected;
    if (query.trim().length === 0) return null;
    return null;
  }, [selected, query]);

  const handleSelect = (employee: Employee) => {
    setSelected(employee);
    setQuery(employee.name);
    setEmployees([]);
  };

  const handlePrint = () => {
    if (!selected) return;
    window.open(`/print/${selected.id}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
          Label builder
        </p>
        <h2 className="text-2xl font-semibold text-zinc-900">
          Generate an employee barcode label
        </h2>
        <div className="mt-6">
          <label className="text-sm font-medium text-zinc-700">
            Employee name
          </label>
          <div className="relative mt-2">
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSelected(null);
              }}
              placeholder="Start typing a name..."
              className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm focus:border-black/30 focus:outline-none"
            />
            {isLoading ? (
              <span className="absolute right-4 top-3 text-xs text-zinc-400">
                Searching...
              </span>
            ) : null}
            {employees.length > 0 ? (
              <div className="absolute z-10 mt-2 w-full rounded-2xl border border-black/10 bg-white p-2 shadow-lg">
                {employees.map((employee) => (
                  <button
                    type="button"
                    key={employee.id}
                    onClick={() => handleSelect(employee)}
                    className="flex w-full flex-col rounded-xl px-3 py-2 text-left hover:bg-zinc-50"
                  >
                    <span className="text-sm font-semibold text-zinc-900">
                      {employee.name}
                    </span>
                    <span className="text-xs text-zinc-500">
                      #{employee.employeeNumber}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            Results show active employees only. Manage inactive records in
            Employees.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handlePrint}
            disabled={!selected}
            className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
          >
            Print label
          </button>
          {selected ? (
            <a
              href={`/print/${selected.id}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              Open print view
            </a>
          ) : null}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
          Live preview
        </p>
        <h3 className="text-xl font-semibold text-zinc-900">
          3&quot; x 2&quot; label
        </h3>
        <div className="mt-6 flex items-center justify-center">
          <div className="w-full max-w-[360px] rounded-2xl border border-dashed border-black/20 bg-zinc-50 p-4">
            <div className="flex aspect-[3/2] flex-col items-center justify-center gap-2 rounded-xl border border-black/10 bg-white p-4 text-center">
              {labelEmployee ? (
                <>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                      Employee
                    </p>
                    <p className="text-lg font-semibold text-zinc-900">
                      {labelEmployee.name}
                    </p>
                    <p className="text-sm text-zinc-600">
                      {labelEmployee.employeeNumber}
                    </p>
                  </div>
                  <div className="w-full max-w-[220px]">
                    <img
                      src={`/api/barcode?text=${encodeURIComponent(
                        labelEmployee.employeeNumber
                      )}`}
                      alt={`Barcode for ${labelEmployee.employeeNumber}`}
                      className="w-full"
                    />
                    <p className="mt-1 text-[10px] tracking-[0.2em] text-zinc-600">
                      {labelEmployee.employeeNumber}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-zinc-500">
                  Select an employee to preview the label.
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
