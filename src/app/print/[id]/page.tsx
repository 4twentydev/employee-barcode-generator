import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@db/drizzle";
import { employees } from "@db/schema";
import PrintAuto from "@/components/print-auto";
import { formatEmployeeBarcode, formatEmployeeName } from "@/lib/format";
import "../print.css";

type PrintPageProps = {
  params: { id: string };
  searchParams?: { count?: string };
};

export default async function PrintPage({
  params,
  searchParams,
}: PrintPageProps) {
  const { id } = params;
  const [employee] = await db
    .select()
    .from(employees)
    .where(eq(employees.id, id));

  if (!employee) {
    notFound();
  }

  const barcodeValue = formatEmployeeBarcode(employee.employeeNumber);
  const requestedCount = Number(searchParams?.count ?? "1");
  const labelCount = Number.isFinite(requestedCount)
    ? Math.min(8, Math.max(1, requestedCount))
    : 1;
  const labelSlots = Array.from({ length: 8 });

  return (
    <div className="print-sheet font-sans text-zinc-900">
      <PrintAuto />
      <div className="print-grid">
        {labelSlots.map((_, index) => {
          const isActive = index < labelCount;
          return (
            <div
              key={`label-${index}`}
              className={`print-label ${
                isActive ? "print-label--active" : "print-label--empty"
              }`}
            >
              {isActive ? (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-center">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                      Employee
                    </p>
                    <h2 className="text-lg font-semibold leading-tight">
                      {formatEmployeeName(employee.name)}
                    </h2>
                    <p className="text-xs text-zinc-700">{barcodeValue}</p>
                  </div>
                  <div className="w-full max-w-[2.3in]">
                    <img
                      src={`/api/barcode?text=${encodeURIComponent(
                        barcodeValue
                      )}`}
                      alt={`Barcode for ${barcodeValue}`}
                      className="h-auto w-full"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
