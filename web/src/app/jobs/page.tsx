import { getJobs } from "@/lib/api";
import { JobCard } from "@/components/job-card";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const jobs = await getJobs();

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Open Positions
        </h1>
        <p className="text-sm text-neutral-600">
          Browse current openings and apply in minutes.
        </p>
      </header>

      {jobs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-8 text-sm text-neutral-700">
          No open positions yet.
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
