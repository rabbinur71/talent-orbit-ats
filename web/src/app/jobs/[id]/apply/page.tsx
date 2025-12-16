import Link from "next/link";
import { redirect } from "next/navigation";
import { getJob, createApplication } from "@/lib/api";

export const dynamic = "force-dynamic";

type Params = { id: string };

function humanErrorFromUnknown(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}

export default async function ApplyPage(props: {
  params: Promise<Params>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;

  const errorParam =
    typeof searchParams.error === "string" ? searchParams.error : undefined;

  let jobTitle = "Job";
  try {
    const job = await getJob(id);
    jobTitle = job.title;
  } catch {
    // job not found — keep generic title, and still show back link
  }

  async function applyAction(formData: FormData) {
    "use server";

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const noteRaw = String(formData.get("note") ?? "").trim();
    const note = noteRaw.length > 0 ? noteRaw : undefined;

    const resumeValue = formData.get("resume");
    if (!(resumeValue instanceof File)) {
      redirect(
        `/jobs/${encodeURIComponent(
          id
        )}/apply?error=Resume%20file%20is%20required`
      );
    }

    try {
      const created = await createApplication({
        input: { jobId: id, name, email, phone, note },
        resume: resumeValue,
      });

      // success → status page
      redirect(
        `/applications/${encodeURIComponent(created.publicToken)}?submitted=1`
      );
    } catch (err: unknown) {
      // Important: redirect() throws NEXT_REDIRECT,  do not treat it as an error
      if (err instanceof Error && err.message === "NEXT_REDIRECT") {
        throw err;
      }

      const msg = encodeURIComponent(humanErrorFromUnknown(err));
      redirect(`/jobs/${encodeURIComponent(id)}/apply?error=${msg}`);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">
          Apply — {jobTitle}
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Submit your details and upload your resume (PDF/DOC/DOCX, max 10MB).
        </p>

        {errorParam ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {errorParam}
          </div>
        ) : null}

        <form action={applyAction} className="mt-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              name="name"
              required
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black"
              autoComplete="name"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              required
              type="email"
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black"
              autoComplete="email"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="phone">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              required
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black"
              autoComplete="tel"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="note">
              Note (optional)
            </label>
            <textarea
              id="note"
              name="note"
              rows={3}
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="resume">
              Resume
            </label>
            <input
              id="resume"
              name="resume"
              required
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Submit application
          </button>
        </form>
      </div>

      <div className="text-sm text-neutral-600">
        <Link className="underline" href={`/jobs/${encodeURIComponent(id)}`}>
          Back to job
        </Link>
      </div>
    </div>
  );
}
