import "./globals.css";
import type { ReactNode } from "react";
import Link from "next/link";
import { Container } from "@/components/container";

export const metadata = {
  title: "Talent Orbit ATS",
  description: "Career site for Talent Orbit ATS (MVP)",
};

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-neutral-900">
        <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/80 backdrop-blur">
          <Container>
            <div className="flex h-14 items-center justify-between">
              <Link href="/jobs" className="font-semibold tracking-tight">
                Talent Orbit
              </Link>

              <nav className="flex items-center gap-4 text-sm">
                <Link
                  href="/jobs"
                  className="text-neutral-700 hover:text-neutral-900"
                >
                  Jobs
                </Link>
                <Link
                  href="/recruiter"
                  className="rounded-lg border border-neutral-200 px-3 py-1.5 text-neutral-800 hover:bg-neutral-50"
                >
                  Recruiter
                </Link>
              </nav>
            </div>
          </Container>
        </header>

        <main>
          <Container>
            <div className="py-8">{props.children}</div>
          </Container>
        </main>

        <footer className="border-t border-neutral-200 bg-white">
          <Container>
            <div className="py-6 text-xs text-neutral-600">
              © {new Date().getFullYear()} Talent Orbit ATS — MVP Developed by
              Rabbi_Nur
            </div>
          </Container>
        </footer>
      </body>
    </html>
  );
}
