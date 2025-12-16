import { z } from "zod";
import {
  AuthLoginResponseSchema,
  CreateJobInputSchema,
  JobsListSchema,
  RecruiterMeSchema,
  JobCreateResponseSchema,
  type AuthLoginResponse,
  type CreateJobInput,
  type Job,
  type RecruiterMe,
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
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

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

/** Recruiter profile (only use if your backend supports it reliably) */
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

/**
 * Create job (requires Bearer token)
 * NOTE: create endpoint may omit createdAt/updatedAt in response, so return JobCreateResponse
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
