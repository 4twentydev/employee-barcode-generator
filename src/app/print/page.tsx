import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@db/drizzle";
import { employees } from "@db/schema";
import PrintSheet from "./print-sheet";
import "./print.css";

type PrintPageProps = {
  searchParams?: { id?: string; count?: string };
};

export default async function PrintPage({ searchParams }: PrintPageProps) {
  const employeeId = searchParams?.id;

  if (!employeeId) {
    notFound();
  }

  const [employee] = await db
    .select()
    .from(employees)
    .where(eq(employees.id, employeeId));

  if (!employee) {
    notFound();
  }

  const requestedCount = Number(searchParams?.count ?? "1");
  const labelCount = Number.isFinite(requestedCount)
    ? Math.min(8, Math.max(1, requestedCount))
    : 1;

  return <PrintSheet employee={employee} labelCount={labelCount} />;
}
