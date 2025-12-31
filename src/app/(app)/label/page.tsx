"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/components/toast";
import { formatEmployeeBarcode, formatEmployeeName } from "@/lib/format";

type Employee = {
  id: string;
  name: string;
  employeeNumber: string;
};

type SheetSettings = {
  sheetWidth: number;
  sheetHeight: number;
  labelWidth: number;
  labelHeight: number;
  columns: number;
  rows: number;
  marginTop: number;
  marginLeft: number;
  gapX: number;
  gapY: number;
  imageOpacity: number;
  imageScale: number;
  imageOffsetX: number;
  imageOffsetY: number;
};

const defaultSheetSettings: SheetSettings = {
  sheetWidth: 8.5,
  sheetHeight: 11,
  labelWidth: 3,
  labelHeight: 2,
  columns: 2,
  rows: 5,
  marginTop: 0.5,
  marginLeft: 0.5,
  gapX: 0.25,
  gapY: 0.25,
  imageOpacity: 60,
  imageScale: 100,
  imageOffsetX: 0,
  imageOffsetY: 0,
};

export default function LabelPage() {
  const { pushToast } = useToast();
  const [query, setQuery] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [sheetSettings, setSheetSettings] = useState<SheetSettings>(
    defaultSheetSettings
  );

  useEffect(() => {
    const controller = new AbortController();
    if (!query.trim()) {
      setEmployees([]);
      return () => controller.abort();
    }
    if (selected) {
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
  }, [query, pushToast, selected]);

  const labelEmployee = useMemo(() => {
    if (selected) return selected;
    if (query.trim().length === 0) return null;
    return null;
  }, [selected, query]);

  const handleSelect = (employee: Employee) => {
    setSelected(employee);
    setQuery(formatEmployeeName(employee.name));
    setEmployees([]);
  };

  const handlePrint = () => {
    if (!selected) return;
    const url = `/print/${selected.id}`;
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (!opened) {
      window.location.assign(url);
    }
  };

  const handleReferenceUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setReferenceImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const updateSetting = <K extends keyof SheetSettings>(
    key: K,
    value: SheetSettings[K]
  ) => {
    setSheetSettings((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const totalLabels = sheetSettings.columns * sheetSettings.rows;
  const barcodeValue = labelEmployee
    ? formatEmployeeBarcode(labelEmployee.employeeNumber)
    : null;

  return (
    <div className="grid gap-8 xl:grid-cols-[1.1fr_1fr_1.2fr]">
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
                      {formatEmployeeName(employee.name)}
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
        </div>
        <div className="mt-4 rounded-2xl border border-black/10 bg-zinc-50 px-4 py-3 text-xs text-zinc-600">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Kyocera TASKalfa 4003i
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>Paper size: Letter (8.5&quot; × 11&quot;)</li>
            <li>Scale: 100% (disable fit-to-page)</li>
            <li>Print in color off (monochrome)</li>
          </ul>
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
                      {formatEmployeeName(labelEmployee.name)}
                    </p>
                    <p className="text-sm text-zinc-600">
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
                <p className="text-sm text-zinc-500">
                  Select an employee to preview the label.
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
          Reference sheet
        </p>
        <h3 className="text-xl font-semibold text-zinc-900">
          Match your existing barcode sheet
        </h3>
        <p className="mt-2 text-sm text-zinc-500">
          Drop in a photo of the sheet and tune the grid until the label boxes
          align. You can use the settings below to recreate the exact spacing.
        </p>

        <div className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-zinc-700">
            Upload sheet image
            <input
              type="file"
              accept="image/*"
              onChange={handleReferenceUpload}
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm focus:border-black/30 focus:outline-none"
            />
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-zinc-700">
              Sheet width (in)
              <input
                type="number"
                step="0.01"
                min="1"
                value={sheetSettings.sheetWidth}
                onChange={(event) =>
                  updateSetting("sheetWidth", Number(event.target.value))
                }
                className="rounded-2xl border border-black/10 px-4 py-2 text-sm focus:border-black/30 focus:outline-none"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-zinc-700">
              Sheet height (in)
              <input
                type="number"
                step="0.01"
                min="1"
                value={sheetSettings.sheetHeight}
                onChange={(event) =>
                  updateSetting("sheetHeight", Number(event.target.value))
                }
                className="rounded-2xl border border-black/10 px-4 py-2 text-sm focus:border-black/30 focus:outline-none"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-zinc-700">
              Label width (in)
              <input
                type="number"
                step="0.01"
                min="0.5"
                value={sheetSettings.labelWidth}
                onChange={(event) =>
                  updateSetting("labelWidth", Number(event.target.value))
                }
                className="rounded-2xl border border-black/10 px-4 py-2 text-sm focus:border-black/30 focus:outline-none"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-zinc-700">
              Label height (in)
              <input
                type="number"
                step="0.01"
                min="0.5"
                value={sheetSettings.labelHeight}
                onChange={(event) =>
                  updateSetting("labelHeight", Number(event.target.value))
                }
                className="rounded-2xl border border-black/10 px-4 py-2 text-sm focus:border-black/30 focus:outline-none"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-zinc-700">
              Columns
              <input
                type="number"
                min="1"
                max="10"
                value={sheetSettings.columns}
                onChange={(event) =>
                  updateSetting("columns", Number(event.target.value))
                }
                className="rounded-2xl border border-black/10 px-4 py-2 text-sm focus:border-black/30 focus:outline-none"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-zinc-700">
              Rows
              <input
                type="number"
                min="1"
                max="20"
                value={sheetSettings.rows}
                onChange={(event) =>
                  updateSetting("rows", Number(event.target.value))
                }
                className="rounded-2xl border border-black/10 px-4 py-2 text-sm focus:border-black/30 focus:outline-none"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-zinc-700">
              Top margin (in)
              <input
                type="number"
                step="0.01"
                min="0"
                value={sheetSettings.marginTop}
                onChange={(event) =>
                  updateSetting("marginTop", Number(event.target.value))
                }
                className="rounded-2xl border border-black/10 px-4 py-2 text-sm focus:border-black/30 focus:outline-none"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-zinc-700">
              Left margin (in)
              <input
                type="number"
                step="0.01"
                min="0"
                value={sheetSettings.marginLeft}
                onChange={(event) =>
                  updateSetting("marginLeft", Number(event.target.value))
                }
                className="rounded-2xl border border-black/10 px-4 py-2 text-sm focus:border-black/30 focus:outline-none"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-zinc-700">
              Horizontal gap (in)
              <input
                type="number"
                step="0.01"
                min="0"
                value={sheetSettings.gapX}
                onChange={(event) =>
                  updateSetting("gapX", Number(event.target.value))
                }
                className="rounded-2xl border border-black/10 px-4 py-2 text-sm focus:border-black/30 focus:outline-none"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-zinc-700">
              Vertical gap (in)
              <input
                type="number"
                step="0.01"
                min="0"
                value={sheetSettings.gapY}
                onChange={(event) =>
                  updateSetting("gapY", Number(event.target.value))
                }
                className="rounded-2xl border border-black/10 px-4 py-2 text-sm focus:border-black/30 focus:outline-none"
              />
            </label>
          </div>

          <div className="mt-2 grid gap-3 rounded-2xl border border-black/10 bg-zinc-50 p-4 md:grid-cols-2">
            <label className="grid gap-2 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
              Image opacity
              <input
                type="range"
                min="0"
                max="100"
                value={sheetSettings.imageOpacity}
                onChange={(event) =>
                  updateSetting("imageOpacity", Number(event.target.value))
                }
              />
            </label>
            <label className="grid gap-2 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
              Image scale
              <input
                type="range"
                min="50"
                max="150"
                value={sheetSettings.imageScale}
                onChange={(event) =>
                  updateSetting("imageScale", Number(event.target.value))
                }
              />
            </label>
            <label className="grid gap-2 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
              Image offset X
              <input
                type="range"
                min="-50"
                max="50"
                value={sheetSettings.imageOffsetX}
                onChange={(event) =>
                  updateSetting("imageOffsetX", Number(event.target.value))
                }
              />
            </label>
            <label className="grid gap-2 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
              Image offset Y
              <input
                type="range"
                min="-50"
                max="50"
                value={sheetSettings.imageOffsetY}
                onChange={(event) =>
                  updateSetting("imageOffsetY", Number(event.target.value))
                }
              />
            </label>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-dashed border-black/20 bg-zinc-50 p-4">
          <div
            className="relative mx-auto rounded-xl border border-black/10 bg-white"
            style={{
              width: `${sheetSettings.sheetWidth}in`,
              height: `${sheetSettings.sheetHeight}in`,
              backgroundImage: referenceImage ? `url(${referenceImage})` : "none",
              backgroundSize: `${sheetSettings.imageScale}%`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: `${50 + sheetSettings.imageOffsetX}% ${
                50 + sheetSettings.imageOffsetY
              }%`,
              opacity: referenceImage ? sheetSettings.imageOpacity / 100 : 1,
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                paddingTop: `${sheetSettings.marginTop}in`,
                paddingLeft: `${sheetSettings.marginLeft}in`,
              }}
            >
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `repeat(${sheetSettings.columns}, ${sheetSettings.labelWidth}in)`,
                  gridAutoRows: `${sheetSettings.labelHeight}in`,
                  columnGap: `${sheetSettings.gapX}in`,
                  rowGap: `${sheetSettings.gapY}in`,
                }}
              >
                {Array.from({ length: totalLabels }).map((_, index) => (
                  <div
                    key={`label-${index}`}
                    className="flex items-center justify-center rounded-lg border border-dashed border-zinc-400/80 bg-white/80 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600"
                  >
                    Label
                  </div>
                ))}
              </div>
            </div>
          </div>
          {!referenceImage ? (
            <p className="mt-3 text-xs text-zinc-500">
              Add a sheet photo to compare the grid layout against your current
              labels.
            </p>
          ) : null}
        </div>
      </motion.section>
    </div>
  );
}
