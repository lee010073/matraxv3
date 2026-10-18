import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export default function Home() {
  return (
    <AppShell>
      <div className="flex flex-1 flex-col justify-center">
        <p className="text-xs uppercase tracking-[0.2em] text-accent">
          Food first · Hong Kong
        </p>
        <h1 className="mt-4 max-w-md font-serif text-5xl leading-[1.05] tracking-tight">
          Your dining taste, without a spreadsheet.
        </h1>
        <p className="mt-5 max-w-md text-base leading-7 text-muted">
          AI does the homework. You swipe 10 keep/kill. Then publish one
          category — Date night or Casual — so the slice is real.
        </p>
        <Link
          href="/create"
          className="mt-10 inline-flex h-12 w-fit items-center justify-center rounded-full bg-accent px-6 text-sm font-medium text-accent-ink hover:brightness-110"
        >
          Create my food taste
        </Link>
        <ol className="mt-12 space-y-2 text-sm text-muted">
          <li>1. Seed with links or HK famous lists</li>
          <li>2. Confirm in 10 swipes</li>
          <li>3. Publish one dining category</li>
        </ol>
      </div>
    </AppShell>
  );
}
