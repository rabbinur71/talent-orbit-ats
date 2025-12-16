import { createJob } from "@/lib/api";
import { getRecruiterToken } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function NewJobPage() {
  async function createJobAction(formData: FormData) {
    "use server";

    const token = await getRecruiterToken();
    if (!token) redirect("/recruiter/login");

    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const location = String(formData.get("location") ?? "").trim();
    const department = String(formData.get("department") ?? "").trim();

    if (!title || !description) {
      redirect("/recruiter/jobs/new?error=missing");
    }

    await createJob(token, {
      title,
      description,
      location: location || undefined,
      department: department || undefined,
    });

    redirect("/recruiter/jobs");
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">Create Job</h2>
        <p className="text-sm text-neutral-600">
          Publish a new position to the career page.
        </p>
      </header>

      <form action={createJobAction} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="title" className="text-sm font-medium">
            Title
          </label>
          <input
            id="title"
            name="title"
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-400"
            placeholder="Backend Engineer"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="location" className="text-sm font-medium">
              Location
            </label>
            <input
              id="location"
              name="location"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-400"
              placeholder="Remote"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="department" className="text-sm font-medium">
              Department
            </label>
            <input
              id="department"
              name="department"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-400"
              placeholder="Engineering"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={8}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-400"
            placeholder="Build APIs and services for Talent Orbit ATS..."
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Create Job
        </button>
      </form>
    </section>
  );
}
