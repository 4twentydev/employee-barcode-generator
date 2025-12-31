import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@db/drizzle";
import { employees } from "@db/schema";
import { employeeSchema } from "@/lib/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const [employee] = await db
    .select()
    .from(employees)
    .where(eq(employees.id, id));

  if (!employee) {
    return NextResponse.json({ error: "Employee not found." }, { status: 404 });
  }

  return NextResponse.json({ employee });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const payload = await request.json();
  const parsed = employeeSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const [updated] = await db
      .update(employees)
      .set({
        name: parsed.data.name,
        employeeNumber: parsed.data.employeeNumber,
        updatedAt: new Date(),
      })
      .where(eq(employees.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Employee not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ employee: updated });
  } catch (error: any) {
    if (error?.code === "23505") {
      return NextResponse.json(
        { error: "Employee number must be unique." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Unable to update employee." },
      { status: 500 }
    );
  }
}

export async function DELETE(_: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const [updated] = await db
    .update(employees)
    .set({ active: false, updatedAt: new Date() })
    .where(eq(employees.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Employee not found." }, { status: 404 });
  }

  return NextResponse.json({ employee: updated });
}
