import type { ReactNode } from "react";

export function Container(props: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
      {props.children}
    </div>
  );
}
