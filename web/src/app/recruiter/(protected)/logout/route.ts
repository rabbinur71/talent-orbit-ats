import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

const TOKEN_COOKIE = "to_recruiter_token";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const jar = await cookies();

  jar.set(TOKEN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // dev
    path: "/",
    maxAge: 0,
  });

  const baseUrl = process.env.NEXT_PUBLIC_WEB_BASE ?? request.nextUrl.origin;

  return NextResponse.redirect(new URL("/recruiter/login", baseUrl));
}
