import { AppShell } from "@/components/AppShell";
import { PublishPanel } from "@/components/PublishPanel";

export default function PublishPage() {
  return (
    <AppShell eyebrow="Publish">
      <PublishPanel />
    </AppShell>
  );
}
