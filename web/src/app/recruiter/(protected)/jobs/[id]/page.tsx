import Link from "next/link";
import { redirect } from "next/navigation";
import { getRecruiterToken } from "@/lib/auth";
import {
  getJob,
  recruiterListApplicationsForJob,
  recruiterUpdateApplicationStatus,
} from "@/lib/api";
import type { ApplicationStatus, RecruiterApplication } from "@/lib/types";

export const dynamic = "force-dynamic";

type Params = { id: string };

const PIPELINE: ReadonlyArray<{ key: ApplicationStatus; label: string }> = [
  { key: "APPLIED", label: "Applied" },
  { key: "SCREENED", label: "Screened" },
  { key: "INTERVIEWED", label: "Interviewed" },
  { key: "OFFERED", label: "Offered" },
  { key: "HIRED", label: "Hired" },
  { key: "REJECTED", label: "Rejected" },
];

function groupByStatus(
  apps: RecruiterApplication[]
): Record<ApplicationStatus, RecruiterApplication[]> {
  const grouped: Record<ApplicationStatus, RecruiterApplication[]> = {
    APPLIED: [],
    SCREENED: [],
    INTERVIEWED: [],
    OFFERED: [],
    HIRED: [],
    REJECTED: [],
  };

  for (const a of apps) grouped[a.status].push(a);

  // stable sort (best-effort) newest first if createdAt exists
  for (const key of Object.keys(grouped) as ApplicationStatus[]) {
    grouped[key] = grouped[key].slice().sort((x, y) => {
      const ax = x.createdAt ? Date.parse(x.createdAt) : 0;
      const ay = y.createdAt ? Date.parse(y.createdAt) : 0;
      return ay - ax;
    });
  }
  return grouped;
}

export default async function RecruiterJobPipelinePage(props: {
  params: Promise<Params>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id: jobId } = await props.params;
  const searchParams = await props.searchParams;

  const token = await getRecruiterToken();
  if (!token) redirect("/recruiter/login");

  const job = await getJob(jobId);
  const applications = await recruiterListApplicationsForJob({ token, jobId });
  const grouped = groupByStatus(applications);

  async function updateStatusAction(formData: FormData) {
    "use server";
    const tok = await getRecruiterToken();
    if (!tok) redirect("/recruiter/login");

    const applicationId = String(formData.get("applicationId") ?? "");
    const status = String(formData.get("status") ?? "") as ApplicationStatus;

    if (!applicationId)
      redirect(
        `/recruiter/jobs/${encodeURIComponent(jobId)}?error=missing_application`
      );
    const allowed = new Set<ApplicationStatus>(PIPELINE.map((p) => p.key));
    if (!allowed.has(status))
      redirect(
        `/recruiter/jobs/${encodeURIComponent(jobId)}?error=invalid_status`
      );

    await recruiterUpdateApplicationStatus({
      token: tok,
      applicationId,
      status,
    });

    redirect(`/recruiter/jobs/${encodeURIComponent(jobId)}?updated=1`);
  }

  const updated = searchParams.updated === "1";
  const error =
    typeof searchParams.error === "string" ? searchParams.error : null;

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {job.title}
            </h1>
            <p className="mt-1 text-sm text-neutral-600">
              Pipeline view • {job.department ?? "—"} • {job.location ?? "—"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/recruiter/jobs"
              className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm hover:bg-neutral-50"
            >
              Back to jobs
            </Link>
            <Link
              href={`/jobs/${encodeURIComponent(job.id)}`}
              className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm hover:bg-neutral-50"
            >
              Public view
            </Link>
          </div>
        </div>

        {updated ? (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-900">
            ✅ Status updated
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900">
            Error: {error}
          </div>
        ) : null}
      </header>

      {applications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-8 text-sm text-neutral-700">
          No applications yet for this job.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {PIPELINE.map((col) => (
            <div
              key={col.key}
              className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-tight">
                  {col.label}
                </h2>
                <span className="rounded-full border border-neutral-200 px-2 py-0.5 text-xs text-neutral-700">
                  {grouped[col.key].length}
                </span>
              </div>

              <div className="space-y-3">
                {grouped[col.key].map((a) => (
                  <article
                    key={a.id}
                    className="rounded-xl border border-neutral-200 p-3"
                  >
                    <div className="text-sm font-medium text-neutral-900">
                      {a.name}
                    </div>
                    <div className="mt-0.5 text-xs text-neutral-600">
                      {a.email}
                    </div>

                    {a.phone ? (
                      <div className="mt-1 text-xs text-neutral-600">
                        📞 {a.phone}
                      </div>
                    ) : null}
                    {a.note ? (
                      <div className="mt-2 text-xs text-neutral-700">
                        📝 {a.note}
                      </div>
                    ) : null}

                    <div className="mt-3 flex flex-col gap-2">
                      <form
                        action={updateStatusAction}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="hidden"
                          name="applicationId"
                          value={a.id}
                        />
                        <select
                          name="status"
                          defaultValue={a.status}
                          className="w-full rounded-lg border border-neutral-300 px-2 py-1 text-xs outline-none focus:border-neutral-500"
                        >
                          {PIPELINE.map((p) => (
                            <option key={p.key} value={p.key}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="rounded-lg bg-neutral-900 px-3 py-1 text-xs font-medium text-white hover:bg-neutral-800"
                        >
                          Move
                        </button>
                      </form>

                      <Link
                        href={`/recruiter/applications/${encodeURIComponent(
                          a.id
                        )}/resume`}
                        className="rounded-lg border border-neutral-200 px-3 py-1 text-center text-xs text-neutral-800 hover:bg-neutral-50"
                      >
                        Download resume
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
