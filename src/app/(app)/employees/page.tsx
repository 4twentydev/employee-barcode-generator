"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/components/toast";
import { formatEmployeeName } from "@/lib/format";

type Employee = {
  id: string;
  name: string;
  employeeNumber: string;
  active: boolean;
};

type FormState = {
  id?: string;
  name: string;
  employeeNumber: string;
};

const emptyForm: FormState = {
  name: "",
  employeeNumber: "",
};

export default function EmployeesPage() {
  const { pushToast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | "all">("active");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameWarning, setNameWarning] = useState<string | null>(null);

  const isEditing = Boolean(form.id);

  const filteredLabel = useMemo(
    () => (status === "all" ? "All" : status === "active" ? "Active" : "Inactive"),
    [status]
  );

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      params.set("status", status);
      const response = await fetch(`/api/employees?${params.toString()}`, {
        signal: controller.signal,
      });
      const data = await response.json();
      setEmployees(data.employees ?? []);
    };
    load().catch(() => {
      pushToast({
        title: "Unable to load employees",
        description: "Check your network or API status.",
        variant: "error",
      });
    });
    return () => controller.abort();
  }, [query, status, pushToast]);

  useEffect(() => {
    const controller = new AbortController();
    const name = form.name.trim();
    if (!name) {
      setNameWarning(null);
      return () => controller.abort();
    }

    const timer = setTimeout(async () => {
      try {
        const formattedName = formatEmployeeName(name);
        const params = new URLSearchParams({ q: name, status: "all" });
        const response = await fetch(`/api/employees?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        const matches = (data.employees ?? []).filter(
          (employee: Employee) =>
            formatEmployeeName(employee.name).toLowerCase() ===
              formattedName.toLowerCase() &&
            employee.id !== form.id
        );
        if (matches.length > 0) {
          setNameWarning("Duplicate name detected. Employee numbers must be unique.");
        } else {
          setNameWarning(null);
        }
      } catch {
        setNameWarning(null);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [form.name, form.id]);

  const resetForm = () => setForm(emptyForm);

  const submitForm = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(
        form.id ? `/api/employees/${form.id}` : "/api/employees",
        {
          method: form.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            employeeNumber: form.employeeNumber,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Request failed.");
      }
      pushToast({
        title: form.id ? "Employee updated" : "Employee added",
        description: data.employee.name,
        variant: "success",
      });
      resetForm();
      const params = new URLSearchParams();
      params.set("status", status);
      if (query.trim()) params.set("q", query.trim());
      const reload = await fetch(`/api/employees?${params.toString()}`);
      const reloadData = await reload.json();
      setEmployees(reloadData.employees ?? []);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Request failed.";
      pushToast({
        title: "Unable to save employee",
        description: message,
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (employee: Employee) => {
    try {
      const response = await fetch(`/api/employees/${employee.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Request failed.");
      }
      pushToast({
        title: "Employee deactivated",
        description: employee.name,
        variant: "success",
      });
      setEmployees((prev) =>
        prev.map((item) =>
          item.id === employee.id ? { ...item, active: false } : item
        )
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Request failed.";
      pushToast({
        title: "Unable to deactivate",
        description: message,
        variant: "error",
      });
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Employee Directory
            </p>
            <h2 className="text-2xl font-semibold text-zinc-900">
              {filteredLabel} employees
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name..."
              className="w-48 rounded-full border border-black/10 px-4 py-2 text-sm focus:border-black/30 focus:outline-none"
            />
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as "active" | "inactive" | "all")
              }
              className="rounded-full border border-black/10 px-4 py-2 text-sm focus:border-black/30 focus:outline-none"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          {employees.map((employee) => (
            <div
              key={employee.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/5 bg-zinc-50 px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-zinc-900">
                  {formatEmployeeName(employee.name)}
                </p>
                <p className="text-xs text-zinc-500">
                  #{employee.employeeNumber}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span
                  className={`rounded-full px-3 py-1 font-medium ${
                    employee.active
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-zinc-200 text-zinc-600"
                  }`}
                >
                  {employee.active ? "Active" : "Inactive"}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      id: employee.id,
                      name: employee.name,
                      employeeNumber: employee.employeeNumber,
                    })
                  }
                  className="rounded-full border border-black/10 px-3 py-1 font-medium text-zinc-700 hover:bg-white"
                >
                  Edit
                </button>
                {employee.active ? (
                  <button
                    type="button"
                    onClick={() => handleDeactivate(employee)}
                    className="rounded-full border border-rose-200 px-3 py-1 font-medium text-rose-700 hover:bg-rose-50"
                  >
                    Deactivate
                  </button>
                ) : null}
              </div>
            </div>
          ))}
          {employees.length === 0 ? (
            <p className="text-sm text-zinc-500">No employees found.</p>
          ) : null}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            {isEditing ? "Edit employee" : "Add employee"}
          </p>
          <h3 className="text-xl font-semibold text-zinc-900">
            {isEditing ? "Update record" : "Create a new record"}
          </h3>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-zinc-700">
            Name
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Employee name"
              className="rounded-2xl border border-black/10 px-4 py-3 focus:border-black/30 focus:outline-none"
            />
            {nameWarning ? (
              <span className="text-xs font-medium text-amber-600">
                {nameWarning}
              </span>
            ) : null}
          </label>
          <label className="grid gap-2 text-sm font-medium text-zinc-700">
            Employee number
            <input
              value={form.employeeNumber}
              onChange={(event) =>
                setForm({ ...form, employeeNumber: event.target.value })
              }
              placeholder="Numbers only"
              inputMode="numeric"
              className="rounded-2xl border border-black/10 px-4 py-3 focus:border-black/30 focus:outline-none"
            />
          </label>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={submitForm}
            disabled={isSubmitting}
            className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
          >
            {isEditing ? "Save changes" : "Add employee"}
          </button>
          {isEditing ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
