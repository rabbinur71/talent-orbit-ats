import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getRecruiterToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function RecruiterLayout(props: { children: ReactNode }) {
  const token = await getRecruiterToken();
  if (!token) redirect("/recruiter/login");

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Recruiter</h1>
          <p className="text-sm text-neutral-600">Signed in</p>
        </div>

        <nav className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/recruiter/jobs"
            className="rounded-lg border border-neutral-200 px-3 py-1.5 hover:bg-neutral-50"
          >
            Jobs
          </Link>
          <Link
            href="/recruiter/jobs/new"
            className="rounded-lg border border-neutral-200 px-3 py-1.5 hover:bg-neutral-50"
          >
            New Job
          </Link>
          <Link
            href="/recruiter/logout"
            className="rounded-lg border border-neutral-200 px-3 py-1.5 hover:bg-neutral-50"
          >
            Logout
          </Link>
        </nav>
      </header>

      {props.children}
    </div>
  );
}
