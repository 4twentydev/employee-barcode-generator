import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@db/drizzle";
import { employees } from "@db/schema";
import PrintAuto from "@/components/print-auto";
import "../print.css";

type PrintPageProps = {
  params: { id: string };
};

export default async function PrintPage({ params }: PrintPageProps) {
  const [employee] = await db
    .select()
    .from(employees)
    .where(eq(employees.id, params.id));

  if (!employee) {
    notFound();
  }

  return (
    <div className="print-surface font-sans text-zinc-900">
      <PrintAuto />
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center">
        <div>
          <p className="text-sm uppercase tracking-[0.14em] text-zinc-500">
            Employee
          </p>
          <h2 className="text-xl font-semibold">{employee.name}</h2>
          <p className="text-sm text-zinc-700">{employee.employeeNumber}</p>
        </div>
        <div className="w-full max-w-[2.3in]">
          <img
            src={`/api/barcode?text=${encodeURIComponent(
              employee.employeeNumber
            )}`}
            alt={`Barcode for ${employee.employeeNumber}`}
            className="h-auto w-full"
          />
          <p className="mt-1 text-[10px] tracking-[0.2em] text-zinc-700">
            {employee.employeeNumber}
          </p>
        </div>
      </div>
    </div>
  );
}
