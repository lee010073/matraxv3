import { AppShell } from "@/components/AppShell";
import { SeedForm } from "@/components/SeedForm";

export default function CreatePage() {
  return (
    <AppShell eyebrow="Create">
      <SeedForm />
    </AppShell>
  );
}
