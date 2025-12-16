import Link from "next/link";
import { getJobs } from "@/lib/api";
import { JobCard } from "@/components/job-card";

export const dynamic = "force-dynamic";

export default async function RecruiterJobsPage() {
  const jobs = await getJobs();

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Job Postings</h2>
          <p className="text-sm text-neutral-600">
            Create jobs and manage applications (next phase).
          </p>
        </div>

        <Link
          href="/recruiter/jobs/new"
          className="inline-flex items-center justify-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          New Job
        </Link>
      </header>

      {jobs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-8 text-sm text-neutral-700">
          No jobs yet. Create your first posting.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </section>
  );
}
