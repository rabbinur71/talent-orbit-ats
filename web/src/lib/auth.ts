import { cookies } from "next/headers";

const TOKEN_COOKIE = "to_recruiter_token";

export async function getRecruiterToken(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(TOKEN_COOKIE)?.value;
  return token && token.length > 0 ? token : null;
}

export async function setRecruiterToken(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // dev
    path: "/",
  });
}

export async function clearRecruiterToken(): Promise<void> {
  const jar = await cookies();
  jar.set(TOKEN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 0,
  });
}
