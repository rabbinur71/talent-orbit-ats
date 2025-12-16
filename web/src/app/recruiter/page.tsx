import { redirect } from "next/navigation";
import { getRecruiterToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function RecruiterHome(): Promise<never> {
  const token = await getRecruiterToken();
  redirect(token ? "/recruiter/jobs" : "/recruiter/login");
}
