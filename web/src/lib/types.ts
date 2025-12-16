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

export const CreateJobInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  location: z.string().optional(),
  department: z.string().optional(),
});

export type CreateJobInput = z.infer<typeof CreateJobInputSchema>;

export const JobCreateResponseSchema = JobSchema.extend({
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

/**
 * Applications
 */
export const ApplicationStatusSchema = z.union([
  z.literal("APPLIED"),
  z.literal("SCREENED"),
  z.literal("INTERVIEWED"),
  z.literal("OFFERED"),
  z.literal("HIRED"),
  z.literal("REJECTED"),
]);

export type ApplicationStatus = z.infer<typeof ApplicationStatusSchema>;

export const ApplicationPublicSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  note: z.string().nullable().optional().default(null),
  status: ApplicationStatusSchema,
  publicToken: z.string().min(1),
  createdAt: z.string(),
});

export type ApplicationPublic = z.infer<typeof ApplicationPublicSchema>;

/**
 * This matches what your applications service actually returns for token lookup:
 * { publicToken, status, jobId, createdAt }
 */
export const StatusLookupSchema = z.object({
  publicToken: z.string().min(1),
  status: ApplicationStatusSchema,
  jobId: z.string(),
  createdAt: z.string(),
});

export type StatusLookup = z.infer<typeof StatusLookupSchema>;

export const CreateApplicationInputSchema = z.object({
  jobId: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  note: z.string().optional(),
});

export type CreateApplicationInput = z.infer<
  typeof CreateApplicationInputSchema
>;
