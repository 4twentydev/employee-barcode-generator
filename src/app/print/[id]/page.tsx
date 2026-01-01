import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@db/drizzle";
import { employees } from "@db/schema";
import PrintSheet from "../print-sheet";
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

  const requestedCount = Number(searchParams?.count ?? "1");
  const labelCount = Number.isFinite(requestedCount)
    ? Math.min(8, Math.max(1, requestedCount))
    : 1;

  const employeesToPrint = Array.from({ length: labelCount }, () => ({
    name: employee.name,
    employeeNumber: employee.employeeNumber,
  }));

  return <PrintSheet employees={employeesToPrint} />;
}
