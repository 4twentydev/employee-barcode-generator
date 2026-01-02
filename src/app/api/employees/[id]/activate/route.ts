import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@db/drizzle";
import { employees } from "@db/schema";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(_: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const [updated] = await db
    .update(employees)
    .set({ active: true, updatedAt: new Date() })
    .where(eq(employees.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Employee not found." }, { status: 404 });
  }

  return NextResponse.json({ employee: updated });
}
