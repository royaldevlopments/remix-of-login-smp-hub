import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { PixelHeading, PixelPanel } from "@/components/site/pixel";
import { faqCategoriesQuery, faqsQuery } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQs — Login SMP" },
      {
        name: "description",
        content:
          "Answers about joining Login SMP, store delivery times, payments and gameplay rules.",
      },
      { property: "og:title", content: "FAQs — Login SMP" },
      {
        property: "og:description",
        content: "Common questions about joining and buying on Login SMP.",
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const { data: categories } = useQuery(faqCategoriesQuery);
  const { data: faqs } = useQuery(faqsQuery);
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const cats = categories ?? [];
  const selected = active ?? cats[0]?.id ?? null;
  const visible = (faqs ?? []).filter((f) => f.category_id === selected);

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <PixelHeading as="h1">FAQS</PixelHeading>
      <p className="mt-4 text-muted-foreground">Pick a category to find your answer.</p>

      <div className="mt-8 flex flex-wrap gap-3">
        {cats.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className={cn(
              "pixel-border text-pixel px-4 py-3 text-[10px]",
              c.id === selected ? "bg-primary text-primary-foreground" : "bg-secondary",
            )}
          >
            {c.name.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        {visible.map((faq) => (
          <PixelPanel key={faq.id} className="p-0">
            <button
              className="flex w-full items-center justify-between gap-4 p-5 text-left"
              onClick={() => setOpen(open === faq.id ? null : faq.id)}
            >
              <span className="text-pixel text-[11px] text-foreground">{faq.question}</span>
              <ChevronDown
                className={cn("size-5 shrink-0 transition-transform", open === faq.id && "rotate-180")}
              />
            </button>
            {open === faq.id ? (
              <p className="border-t-4 border-border p-5 text-muted-foreground">{faq.answer}</p>
            ) : null}
          </PixelPanel>
        ))}
        {visible.length === 0 ? (
          <p className="text-muted-foreground">No questions in this category yet.</p>
        ) : null}
      </div>
    </div>
  );
}
