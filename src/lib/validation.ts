import { z } from "zod";

export const employeeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Employee name is required.")
    .max(120, "Employee name must be 120 characters or fewer."),
  employeeNumber: z
    .string()
    .trim()
    .min(1, "Employee number is required.")
    .max(32, "Employee number must be 32 digits or fewer.")
    .regex(/^\d+$/, "Employee number must contain digits only."),
});

export const employeeUpdateSchema = employeeSchema.extend({
  id: z.string().uuid("Invalid employee id."),
});
