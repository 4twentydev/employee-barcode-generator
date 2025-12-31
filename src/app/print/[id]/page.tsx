import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@db/drizzle";
import { employees } from "@db/schema";
import PrintAuto from "@/components/print-auto";
import { formatEmployeeName } from "@/lib/format";
import "../print.css";

type PrintPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PrintPage({ params }: PrintPageProps) {
  const { id } = await params;
  const [employee] = await db
    .select()
    .from(employees)
    .where(eq(employees.id, id));

  if (!employee) {
    notFound();
  }

  return (
    <div className="print-surface font-sans text-zinc-900">
      <PrintAuto />
      <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-center">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">
            Employee
          </p>
          <h2 className="text-lg font-semibold leading-tight">
            {formatEmployeeName(employee.name)}
          </h2>
          <p className="text-xs text-zinc-700">{employee.employeeNumber}</p>
        </div>
        <div className="w-full max-w-[2.3in]">
          <img
            src={`/api/barcode?text=${encodeURIComponent(
              employee.employeeNumber
            )}`}
            alt={`Barcode for ${employee.employeeNumber}`}
            className="h-auto w-full"
          />
        </div>
      </div>
    </div>
  );
}
