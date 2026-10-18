import { AppShell } from "@/components/AppShell";
import { SwipeDeck } from "@/components/SwipeDeck";

export default function SwipePage() {
  return (
    <AppShell eyebrow="Confirm">
      <SwipeDeck />
    </AppShell>
  );
}
