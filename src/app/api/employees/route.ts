import { NextResponse } from "next/server";
import { and, eq, ilike } from "drizzle-orm";
import { db } from "@db/drizzle";
import { employees } from "@db/schema";
import { employeeSchema } from "@/lib/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const status = searchParams.get("status") ?? "active";

  const filters = [];
  if (query) {
    filters.push(ilike(employees.name, `%${query}%`));
  }
  if (status === "active") {
    filters.push(eq(employees.active, true));
  }
  if (status === "inactive") {
    filters.push(eq(employees.active, false));
  }

  const results = await db
    .select()
    .from(employees)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(employees.name);

  return NextResponse.json({ employees: results });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = employeeSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const [created] = await db
      .insert(employees)
      .values({
        name: parsed.data.name,
        employeeNumber: parsed.data.employeeNumber,
      })
      .returning();

    return NextResponse.json({ employee: created });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return NextResponse.json(
        { error: "Employee number must be unique." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Unable to create employee." },
      { status: 500 }
    );
  }
}
