import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const TOKEN_COOKIE = "to_recruiter_token";

function apiBaseFromEnv(): string {
  const publicBase = process.env.NEXT_PUBLIC_API_BASE;
  const serverBase = process.env.API_BASE;
  return (serverBase ?? publicBase ?? "http://localhost:3000/api/v1").replace(
    /\/$/,
    ""
  );
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const jar = await cookies();
  const token = jar.get(TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.redirect(
      new URL("/recruiter/login", request.nextUrl.origin)
    );
  }

  const { id } = await context.params;

  const base = apiBaseFromEnv();
  const url = `${base}/applications/${encodeURIComponent(id)}/resume`;

  const upstream = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!upstream.ok) {
    const text = await upstream.text();
    return new NextResponse(text, { status: upstream.status });
  }

  const headers = new Headers();
  const ct = upstream.headers.get("content-type");
  const cd = upstream.headers.get("content-disposition");
  if (ct) headers.set("Content-Type", ct);
  if (cd) headers.set("Content-Disposition", cd);

  return new NextResponse(upstream.body, {
    status: 200,
    headers,
  });
}
