import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { getDatabaseUrl } from "./env";

const sql = neon(getDatabaseUrl());
export const db = drizzle(sql);
