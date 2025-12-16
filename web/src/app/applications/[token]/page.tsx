import Link from "next/link";
import { getApplicationStatus, getJob } from "@/lib/api";
import type { Job, StatusLookup } from "@/lib/types";

export const dynamic = "force-dynamic";

type Params = { token: string };

function statusLabel(status: string): string {
  switch (status) {
    case "APPLIED":
      return "Applied";
    case "SCREENED":
      return "Under review";
    case "INTERVIEWED":
      return "Interview stage";
    case "OFFERED":
      return "Offer stage";
    case "HIRED":
      return "Hired";
    case "REJECTED":
      return "Rejected";
    default:
      return status;
  }
}

export default async function ApplicationStatusPage(props: {
  params: Promise<Params>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { token } = await props.params;
  const searchParams = await props.searchParams;
  const submitted = searchParams.submitted === "1";

  let status: StatusLookup | null = null;
  let job: Job | null = null;

  try {
    status = await getApplicationStatus(token);
    job = await getJob(status.jobId);
  } catch {
    status = null;
    job = null;
  }

  if (!status || !job) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">
          Invalid or expired status token
        </h1>
        <p className="text-sm text-neutral-600">
          Please check the link and try again.
        </p>
        <Link className="text-sm underline" href="/jobs">
          Browse jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {submitted ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
          ✅ Application submitted successfully. Save this page link to track
          status.
        </div>
      ) : null}

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">
          Application status
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Job: <span className="font-medium text-neutral-900">{job.title}</span>
        </p>

        <div className="mt-6 rounded-xl border border-neutral-200 p-4">
          <div className="text-xs uppercase tracking-wide text-neutral-500">
            Current stage
          </div>
          <div className="mt-1 text-xl font-semibold">
            {statusLabel(status.status)}
          </div>
          <div className="mt-2 text-sm text-neutral-600">
            Submitted: {new Date(status.createdAt).toLocaleString()}
          </div>
        </div>

        <div className="mt-6 text-sm text-neutral-600">
          Token:{" "}
          <span className="font-mono text-neutral-900">
            {status.publicToken}
          </span>
        </div>
      </div>

      <div className="text-sm text-neutral-600">
        <Link
          className="underline"
          href={`/jobs/${encodeURIComponent(job.id)}`}
        >
          Back to job
        </Link>
        <span className="mx-2">•</span>
        <Link className="underline" href="/jobs">
          Browse jobs
        </Link>
      </div>
    </div>
  );
}
