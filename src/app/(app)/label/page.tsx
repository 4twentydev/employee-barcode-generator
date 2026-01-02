"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/components/toast";
import { formatEmployeeBarcode, formatEmployeeName } from "@/lib/format";

type Employee = {
  id: string;
  name: string;
  employeeNumber: string;
};

type LabelInputProps = {
  index: number;
  selection: Employee | null;
  onSelect: (employee: Employee | null) => void;
};

function LabelInput({ index, selection, onSelect }: LabelInputProps) {
  const { pushToast } = useToast();
  const [query, setQuery] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (selection) {
      setQuery(formatEmployeeName(selection.name));
    }
  }, [selection]);

  useEffect(() => {
    const controller = new AbortController();
    if (!query.trim()) {
      setEmployees([]);
      return () => controller.abort();
    }
    if (selection) {
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
  }, [query, pushToast, selection]);

  const handleSelect = (employee: Employee) => {
    onSelect(employee);
    setQuery(formatEmployeeName(employee.name));
    setEmployees([]);
  };

  return (
    <label className="text-sm font-medium text-subtle">
      Label {index + 1}
      <div className="relative mt-2">
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            onSelect(null);
          }}
          placeholder="Start typing a name..."
          className="w-full rounded-2xl border border-subtle bg-transparent px-4 py-3 text-sm focus:border-[color:var(--accent-secondary)] focus:outline-none"
        />
        {isLoading ? (
          <span className="absolute right-4 top-3 text-xs text-muted">
            Searching...
          </span>
        ) : null}
        {employees.length > 0 ? (
          <div className="absolute z-10 mt-2 w-full rounded-2xl border border-subtle surface p-2 shadow-lg">
            {employees.map((employee) => (
              <button
                type="button"
                key={employee.id}
                onClick={() => handleSelect(employee)}
                className="flex w-full flex-col rounded-xl px-3 py-2 text-left transition hover:bg-[color:var(--surface-muted)]"
              >
                <span className="text-sm font-semibold text-strong">
                  {formatEmployeeName(employee.name)}
                </span>
                <span className="text-xs text-muted">
                  #{employee.employeeNumber}
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </label>
  );
}

export default function LabelPage() {
  const { pushToast } = useToast();
  const [labelCount, setLabelCount] = useState(1);
  const [selections, setSelections] = useState<Array<Employee | null>>([null]);

  useEffect(() => {
    setSelections((prev) => {
      const next = prev.slice(0, labelCount);
      while (next.length < labelCount) {
        next.push(null);
      }
      return next;
    });
  }, [labelCount]);

  const handlePrint = () => {
    const selectedEmployees = selections.filter(
      (employee): employee is Employee => Boolean(employee)
    );
    if (selectedEmployees.length !== labelCount) return;
    const params = new URLSearchParams();
    params.set(
      "ids",
      selectedEmployees.map((employee) => employee.id).join(",")
    );
    const url = `/print?${params.toString()}`;
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (!opened) {
      pushToast({
        title: "Allow pop-ups to print labels",
        description:
          "Your browser blocked the print window. Allow pop-ups for this site and try again.",
        variant: "error",
      });
      return;
    }

    const tryPrint = () => {
      if (opened.closed) return;
      opened.focus();
      opened.print();
    };

    opened.addEventListener("load", tryPrint, { once: true });

    const poll = window.setInterval(() => {
      if (opened.closed) {
        window.clearInterval(poll);
        return;
      }
      if (opened.document.readyState === "complete") {
        window.clearInterval(poll);
        tryPrint();
      }
    }, 250);
  };
  const labelEmployee = useMemo(
    () => selections.find(Boolean) ?? null,
    [selections]
  );
  const barcodeValue = labelEmployee
    ? formatEmployeeBarcode(labelEmployee.employeeNumber)
    : null;
  const canPrint =
    selections.length > 0 &&
    selections.every((employee) => Boolean(employee));

  const handleShare = async () => {
    if (!labelEmployee) return;
    try {
      const params = new URLSearchParams({ id: labelEmployee.id });
      const url = new URL(
        `/api/label?${params.toString()}`,
        window.location.origin
      ).toString();
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Unable to generate the label image.");
      }
      const blob = await response.blob();
      const fileNameBase =
        formatEmployeeName(labelEmployee.name)
          .trim()
          .replace(/[^a-z0-9]+/gi, "-")
          .replace(/(^-|-$)/g, "") || "employee-label";
      const file = new File([blob], `${fileNameBase}.png`, {
        type: "image/png",
      });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "Employee barcode label",
          text: `${formatEmployeeName(labelEmployee.name)} barcode label`,
          files: [file],
        });
        return;
      }
      if (navigator.share) {
        await navigator.share({
          title: "Employee barcode label",
          text: `${formatEmployeeName(labelEmployee.name)} barcode label`,
          url,
        });
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        pushToast({
          title: "PNG link copied",
          description: "Label PNG link copied to your clipboard.",
          variant: "success",
        });
        return;
      }
      pushToast({
        title: "Share unavailable",
        description: "Open the label image in a new tab.",
        variant: "error",
      });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Share failed.";
      pushToast({
        title: "Unable to share",
        description: message,
        variant: "error",
      });
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] xl:gap-8">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-3xl border border-subtle surface p-6 shadow-sm sm:p-8"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-accent-secondary">
          Label builder
        </p>
        <h2 className="text-2xl font-semibold text-strong">
          Generate an employee barcode label
        </h2>
        <div className="mt-6 grid gap-5">
          <label className="grid gap-2 text-sm font-medium text-subtle">
            Labels to print
            <select
              value={labelCount}
              onChange={(event) =>
                setLabelCount(Number(event.target.value))
              }
              className="w-full rounded-2xl border border-subtle bg-transparent px-4 py-3 text-sm focus:border-[color:var(--accent-secondary)] focus:outline-none"
            >
              {Array.from({ length: 8 }).map((_, index) => {
                const count = index + 1;
                return (
                  <option key={count} value={count}>
                    {count} label{count > 1 ? "s" : ""}
                  </option>
                );
              })}
            </select>
            <span className="text-xs font-normal text-muted">
              Prints up to 8 labels (2 columns × 4 rows) on one sheet.
            </span>
          </label>
          <div className="grid gap-4">
            {selections.map((selection, index) => (
              <LabelInput
                key={`label-input-${index}`}
                index={index}
                selection={selection}
                onSelect={(employee) =>
                  setSelections((prev) => {
                    const next = [...prev];
                    next[index] = employee;
                    return next;
                  })
                }
              />
            ))}
          </div>
          <p className="text-xs text-muted">
            Results show active employees only. Manage inactive records in
            Employees.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handlePrint}
            disabled={!canPrint}
            className="btn-primary rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-60"
          >
            Print labels
          </button>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="rounded-3xl border border-subtle surface p-6 shadow-sm sm:p-8"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-accent-secondary">
          Live preview
        </p>
        <h3 className="text-xl font-semibold text-strong">
          3&quot; x 2&quot; label
        </h3>
        <p className="mt-2 text-sm text-muted">
          Sheet layout: 2 columns × 4 rows (up to 8 labels per print).
        </p>
        <div className="mt-6 flex items-center justify-center">
          <div className="w-full max-w-[360px] rounded-2xl border border-dashed border-subtle surface-muted p-4 sm:max-w-[420px]">
            <div className="flex aspect-[3/2] flex-col items-center justify-center gap-2 rounded-xl border border-subtle surface p-4 text-center">
              {labelEmployee ? (
                <>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">
                      Employee
                    </p>
                    <p className="text-lg font-semibold text-strong">
                      {formatEmployeeName(labelEmployee.name)}
                    </p>
                    <p className="text-sm text-subtle">
                      {barcodeValue}
                    </p>
                  </div>
                  <div className="w-full max-w-[220px]">
                    <img
                      src={`/api/barcode?text=${encodeURIComponent(
                        barcodeValue ?? ""
                      )}`}
                      alt={`Barcode for ${barcodeValue ?? ""}`}
                      className="w-full"
                    />
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted">
                  Select an employee to preview the label.
                </p>
              )}
            </div>
          </div>
        </div>
        {labelEmployee ? (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={handleShare}
              className="rounded-full border border-subtle px-4 py-2 text-xs font-semibold text-subtle transition hover:border-strong hover:text-strong"
            >
              Share label
            </button>
          </div>
        ) : null}
        <div className="mt-6 rounded-2xl border border-subtle surface-muted px-4 py-3 text-xs text-subtle">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Print settings
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>Paper size: Letter (8.5&quot; × 11&quot;)</li>
            <li>Scale: 100% (disable fit-to-page)</li>
            <li>Print in color off (monochrome)</li>
          </ul>
        </div>
      </motion.section>
    </div>
  );
}
