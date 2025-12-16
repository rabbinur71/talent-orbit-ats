import { z } from "zod";

/**
 * Auth
 */
export const AuthLoginResponseSchema = z.object({
  access_token: z.string().min(1),
});

export type AuthLoginResponse = z.infer<typeof AuthLoginResponseSchema>;

export const RecruiterMeSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  createdAt: z.string(),
});

export type RecruiterMe = z.infer<typeof RecruiterMeSchema>;

/**
 * Jobs
 */
export const JobStatusSchema = z.union([
  z.literal("open"),
  z.literal("closed"),
]);

export type JobStatus = z.infer<typeof JobStatusSchema>;

/**
 * Strict job schema (list/details).
 */
export const JobSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  location: z.string().nullable().optional().default(null),
  department: z.string().nullable().optional().default(null),
  status: JobStatusSchema.optional().default("open"),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Job = z.infer<typeof JobSchema>;

export const JobsListSchema = z.array(JobSchema);

/**
 * Create job input.
 */
export const CreateJobInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  location: z.string().optional(),
  department: z.string().optional(),
});

export type CreateJobInput = z.infer<typeof CreateJobInputSchema>;

/**
 * Create response schema (MVP-safe):
 * some endpoints may omit createdAt/updatedAt even though DB has them.
 */
export const JobCreateResponseSchema = JobSchema.extend({
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
