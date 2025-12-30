import { db } from "../db/drizzle";
import { employees } from "../db/schema";

const sampleEmployees = [
  { name: "Avery Cole", employeeNumber: "000123" },
  { name: "Jordan Blake", employeeNumber: "000124" },
  { name: "Riley Quinn", employeeNumber: "000125" },
];

async function seed() {
  await db
    .insert(employees)
    .values(sampleEmployees)
    .onConflictDoNothing();

  // eslint-disable-next-line no-console
  console.log("Seed complete.");
}

seed().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Seed failed:", error);
  process.exit(1);
});
