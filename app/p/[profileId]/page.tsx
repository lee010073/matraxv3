import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { PublishedView } from "@/components/PublishedView";

export default function PublishedPage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  return (
    <AppShell eyebrow="Public slice">
      <Suspense fallback={<p className="text-muted">Loading published slice…</p>}>
        <PublishedLoader params={params} />
      </Suspense>
    </AppShell>
  );
}

async function PublishedLoader({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  return <PublishedView profileId={profileId} />;
}
