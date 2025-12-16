import Link from "next/link";
import { getJob } from "@/lib/api";

export const dynamic = "force-dynamic";

type Params = { id: string };

export default async function JobDetailPage(props: {
  params: Promise<Params>;
}) {
  const { id } = await props.params;

  let job;
  try {
    job = await getJob(id);
  } catch {
    return (
      <div className="mx-auto max-w-3xl space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Job not found</h1>
        <Link className="text-sm underline" href="/jobs">
          Back to jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {job.title}
            </h1>
            <p className="mt-1 text-sm text-neutral-600">
              {job.department ?? "—"} • {job.location ?? "—"} •{" "}
              {job.status.toUpperCase()}
            </p>
          </div>

          <Link
            href={`/jobs/${encodeURIComponent(job.id)}/apply`}
            className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Apply now
          </Link>
        </div>

        <div className="prose prose-neutral mt-6 max-w-none">
          <p className="whitespace-pre-wrap">{job.description}</p>
        </div>
      </div>

      <div className="text-sm text-neutral-600">
        <Link className="underline" href="/jobs">
          Back to jobs
        </Link>
      </div>
    </div>
  );
}
