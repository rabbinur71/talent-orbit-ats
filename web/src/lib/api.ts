import { z } from "zod";
import {
  AuthLoginResponseSchema,
  CreateJobInputSchema,
  JobsListSchema,
  RecruiterMeSchema,
  JobSchema,
  JobCreateResponseSchema,
  CreateApplicationInputSchema,
  ApplicationPublicSchema,
  StatusLookupSchema,
  type AuthLoginResponse,
  type CreateJobInput,
  type Job,
  type RecruiterMe,
  type CreateApplicationInput,
  type ApplicationPublic,
  type StatusLookup,
} from "./types";

type JobCreateResponse = z.infer<typeof JobCreateResponseSchema>;

function getApiBase(): string {
  const serverBase = process.env.API_BASE;
  const publicBase = process.env.NEXT_PUBLIC_API_BASE;
  return (serverBase ?? publicBase ?? "http://localhost:3000/api/v1").replace(
    /\/$/,
    ""
  );
}

async function fetchJson<TSchema extends z.ZodTypeAny>(args: {
  url: string;
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  token?: string;
  body?: unknown;
  schema: TSchema;
}): Promise<z.infer<TSchema>> {
  const headers: Record<string, string> = { Accept: "application/json" };

  if (args.body !== undefined) headers["Content-Type"] = "application/json";
  if (args.token) headers["Authorization"] = `Bearer ${args.token}`;

  const res = await fetch(args.url, {
    method: args.method ?? "GET",
    headers,
    body: args.body === undefined ? undefined : JSON.stringify(args.body),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed (${res.status}): ${text}`);
  }

  const data: unknown = await res.json();
  return args.schema.parse(data);
}

async function fetchJsonMultipart<TSchema extends z.ZodTypeAny>(args: {
  url: string;
  method: "POST";
  form: FormData;
  schema: TSchema;
}): Promise<z.infer<TSchema>> {
  const res = await fetch(args.url, {
    method: args.method,
    body: args.form,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed (${res.status}): ${text}`);
  }

  const data: unknown = await res.json();
  return args.schema.parse(data);
}

/** Recruiter login */
export async function loginRecruiter(
  email: string,
  password: string
): Promise<AuthLoginResponse> {
  const base = getApiBase();
  return fetchJson({
    url: `${base}/auth/login`,
    method: "POST",
    body: { email, password },
    schema: AuthLoginResponseSchema,
  });
}

/** Recruiter profile (optional usage) */
export async function getRecruiterMe(token: string): Promise<RecruiterMe> {
  const base = getApiBase();
  return fetchJson({
    url: `${base}/auth/me`,
    method: "GET",
    token,
    schema: RecruiterMeSchema,
  });
}

/** Jobs list (public) */
export async function getJobs(): Promise<Job[]> {
  const base = getApiBase();
  return fetchJson({
    url: `${base}/jobs`,
    method: "GET",
    schema: JobsListSchema,
  });
}

/** Job detail (public) */
export async function getJob(id: string): Promise<Job> {
  const base = getApiBase();
  return fetchJson({
    url: `${base}/jobs/${encodeURIComponent(id)}`,
    method: "GET",
    schema: JobSchema,
  });
}

/**
 * Create job (requires Bearer token)
 * create endpoint may omit createdAt/updatedAt; return JobCreateResponse
 */
export async function createJob(
  token: string,
  input: CreateJobInput
): Promise<JobCreateResponse> {
  const base = getApiBase();
  const validated = CreateJobInputSchema.parse(input);

  const body: Record<string, string> = {
    title: validated.title,
    description: validated.description,
  };
  if (validated.location) body.location = validated.location;
  if (validated.department) body.department = validated.department;

  return fetchJson({
    url: `${base}/jobs`,
    method: "POST",
    token,
    body,
    schema: JobCreateResponseSchema,
  });
}

/**
 * Candidate: create application (multipart)
 * Gateway expects: jobId, name, email, phone, note?, resume(file)
 */
export async function createApplication(args: {
  input: CreateApplicationInput;
  resume: File;
}): Promise<ApplicationPublic> {
  const base = getApiBase();
  const validated = CreateApplicationInputSchema.parse(args.input);

  if (!(args.resume instanceof File)) {
    throw new Error("Resume file is required");
  }
  if (args.resume.size <= 0) {
    throw new Error("Resume file is empty");
  }
  if (args.resume.size > 10 * 1024 * 1024) {
    throw new Error("Resume file is too large (max 10MB)");
  }

  const form = new FormData();
  form.append("jobId", validated.jobId);
  form.append("name", validated.name);
  form.append("email", validated.email);
  form.append("phone", validated.phone);
  if (validated.note) form.append("note", validated.note);
  form.append("resume", args.resume, args.resume.name);

  return fetchJsonMultipart({
    url: `${base}/applications`,
    method: "POST",
    form,
    schema: ApplicationPublicSchema,
  });
}

/** Candidate: status lookup by public token */
export async function getApplicationStatus(
  token: string
): Promise<StatusLookup> {
  const base = getApiBase();
  return fetchJson({
    url: `${base}/applications/status/${encodeURIComponent(token)}`,
    method: "GET",
    schema: StatusLookupSchema,
  });
}
