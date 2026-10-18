import Link from "next/link";
import type { ReactNode } from "react";

export function AppShell({
  children,
  eyebrow,
}: {
  children: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-lg flex-col px-5 pb-10 pt-6 sm:max-w-xl">
      <header className="mb-8 flex items-baseline justify-between gap-4">
        <Link href="/" className="font-serif text-2xl tracking-tight text-foreground">
          Matrax
        </Link>
        <p className="text-xs uppercase tracking-[0.18em] text-muted">
          {eyebrow ?? "HK dining"}
        </p>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
