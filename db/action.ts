// app/actions.ts
"use server";
import { neon } from "@neondatabase/serverless";

import { getDatabaseUrl } from "./env";

export async function getData() {
  const sql = neon(getDatabaseUrl());
  const data = await sql`...`;
  return data;
}
