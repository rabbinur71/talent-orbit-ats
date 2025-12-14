import { z } from "zod";
import { JobsListSchema, type Job } from "./types";

function getApiBase(): string {
  // Server can use API_BASE, browser uses NEXT_PUBLIC_API_BASE
  const serverBase = process.env.API_BASE;
  const publicBase = process.env.NEXT_PUBLIC_API_BASE;
  return (serverBase ?? publicBase ?? "http://localhost:3000/api/v1").replace(
    /\/$/,
    ""
  );
}

async function fetchJson<TSchema extends z.ZodTypeAny>(
  input: string,
  schema: TSchema
): Promise<z.infer<TSchema>> {
  const res = await fetch(input, { cache: "no-store" });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed (${res.status}): ${text}`);
  }

  const data: unknown = await res.json();
  return schema.parse(data);
}

export async function getJobs(): Promise<Job[]> {
  const base = getApiBase();
  return fetchJson(`${base}/jobs`, JobsListSchema);
}
