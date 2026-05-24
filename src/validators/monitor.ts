import { z } from "zod";

export const createMonitorSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  url: z.string().url("Please enter a valid URL"),
  type: z.enum(["website", "api", "ai"], "Please select a monitor type"),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]).default("GET"),
  headers: z.record(z.string(), z.string()).optional().default({}),
  body: z.string().optional(),
  expected_status: z
    .number()
    .int()
    .min(100, "Status must be between 100-599")
    .max(599, "Status must be between 100-599")
    .default(200),
  timeout_ms: z
    .number()
    .int()
    .min(1000, "Timeout must be at least 1 second")
    .max(60000, "Timeout cannot exceed 60 seconds")
    .default(30000),
});

export const updateMonitorSchema = createMonitorSchema.partial();

export type CreateMonitorInput = z.infer<typeof createMonitorSchema>;
export type UpdateMonitorInput = z.infer<typeof updateMonitorSchema>;
