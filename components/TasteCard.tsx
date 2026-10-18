import { CATEGORY_META } from "@/lib/categories";
import type { CategorySlug, TasteItem } from "@/lib/types";
import { hostnameLabel } from "@/lib/urls";

export function TasteCard({
  item,
  offset = 0,
}: {
  item: TasteItem;
  offset?: number;
}) {
  const category = CATEGORY_META[item.categoryId as CategorySlug];
  const source = item.provenance[0];

  return (
    <article
      className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
      style={{
        transform: `translateY(${offset * 10}px) scale(${1 - offset * 0.04})`,
        opacity: offset > 1 ? 0 : 1,
      }}
    >
      <div>
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full border border-border px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-accent">
            {category?.name ?? item.categoryId}
          </span>
          <span className="text-[11px] uppercase tracking-[0.16em] text-muted">
            {item.kind === "dish" ? "Dish" : "Restaurant"}
          </span>
        </div>
        <h2 className="mt-8 font-serif text-4xl leading-[1.05] tracking-tight">
          {item.name}
        </h2>
        <p className="mt-3 text-sm text-muted">
          {item.venueName ? `${item.venueName} · ` : null}
          {item.neighborhood}
          {item.cuisine ? ` · ${item.cuisine}` : null}
        </p>
        {item.kind === "restaurant" && item.dish ? (
          <p className="mt-4 text-sm text-foreground/90">Try: {item.dish}</p>
        ) : null}
        {item.note ? (
          <p className="mt-5 max-w-sm text-base leading-7 text-foreground/85">
            {item.note}
          </p>
        ) : null}
      </div>

      {source ? (
        <p className="text-xs leading-5 text-muted">
          Provenance: {source.sourceLabel}
          {source.sourceUrl ? ` · ${hostnameLabel(source.sourceUrl)}` : null}
        </p>
      ) : null}
    </article>
  );
}
