import { loginRecruiter } from "@/lib/api";
import { setRecruiterToken } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function RecruiterLoginPage() {
  async function loginAction(formData: FormData) {
    "use server";

    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      redirect("/recruiter/login?error=missing");
    }

    let res: { access_token: string };
    try {
      res = await loginRecruiter(email, password);
    } catch (err: unknown) {
      console.error("Recruiter login API failed:", err);
      redirect("/recruiter/login?error=invalid");
    }

    await setRecruiterToken(res.access_token);

    // IMPORTANT: do not wrap redirect in try/catch
    redirect("/recruiter/jobs");
  }

  return (
    <section className="mx-auto max-w-md space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">
          Recruiter Login
        </h1>
        <p className="text-sm text-neutral-600">
          Sign in to manage job postings.
        </p>
      </header>

      <form action={loginAction} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-400"
            placeholder="Enter your email"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-400"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Sign in
        </button>
      </form>
    </section>
  );
}
