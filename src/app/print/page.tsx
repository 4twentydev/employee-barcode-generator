import { notFound, redirect } from "next/navigation";
import { inArray } from "drizzle-orm";
import { db } from "@db/drizzle";
import { employees } from "@db/schema";
import PrintSheet from "./print-sheet";
import "./print.css";

type PrintPageProps = {
  searchParams?: { id?: string; count?: string; ids?: string };
};

export default async function PrintPage({ searchParams }: PrintPageProps) {
  const idsParam = searchParams?.ids;
  if (idsParam) {
    const ids = idsParam
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (ids.length === 0) {
      redirect("/label");
    }

    const results = await db
      .select()
      .from(employees)
      .where(inArray(employees.id, ids));

    if (results.length === 0) {
      notFound();
    }

    const employeesInOrder = ids
      .map((id) => results.find((employee) => employee.id === id))
      .filter((employee): employee is typeof results[number] => Boolean(employee))
      .slice(0, 8)
      .map((employee) => ({
        name: employee.name,
        employeeNumber: employee.employeeNumber,
      }));

    if (employeesInOrder.length === 0) {
      notFound();
    }

    return <PrintSheet employees={employeesInOrder} />;
  }

  const employeeId = searchParams?.id;

  if (!employeeId) {
    redirect("/label");
  }

  const params = new URLSearchParams();
  if (searchParams?.count) {
    params.set("count", searchParams.count);
  }
  const suffix = params.toString();
  redirect(`/print/${employeeId}${suffix ? `?${suffix}` : ""}`);
}
