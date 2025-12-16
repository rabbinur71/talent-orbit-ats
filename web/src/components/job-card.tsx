import Link from "next/link";
import type { Job } from "@/lib/types";

function formatLocation(job: Job): string {
  const parts: string[] = [];
  if (job.location) parts.push(job.location);
  if (job.department) parts.push(job.department);
  return parts.length > 0 ? parts.join(" • ") : "—";
}

export function JobCard(props: { job: Job }) {
  const { job } = props;

  return (
    <article className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">
            <Link
              href={`/jobs/${encodeURIComponent(job.id)}`}
              className="hover:underline"
            >
              {job.title}
            </Link>
          </h2>
          <p className="mt-1 text-sm text-neutral-600">{formatLocation(job)}</p>
        </div>

        <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-700">
          {job.status === "open" ? "Open" : "Closed"}
        </span>
      </div>

      <p className="mt-4 line-clamp-3 text-sm text-neutral-700">
        {job.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={`/jobs/${encodeURIComponent(job.id)}`}
          className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-800 hover:bg-neutral-50"
        >
          View details
        </Link>
        <Link
          href={`/jobs/${encodeURIComponent(job.id)}/apply`}
          className="rounded-lg bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Apply
        </Link>
      </div>
    </article>
  );
}
