import { z } from "zod";

export const JobStatusSchema = z.union([
  z.literal("open"),
  z.literal("closed"),
]);

export const JobSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  location: z.string().nullable(),
  department: z.string().nullable(),
  status: JobStatusSchema,
  createdAt: z.string(), // API returns ISO strings
  updatedAt: z.string(),
});

export const JobsListSchema = z.array(JobSchema);

export type Job = z.infer<typeof JobSchema>;
export type JobStatus = z.infer<typeof JobStatusSchema>;
