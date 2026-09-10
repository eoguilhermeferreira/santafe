import { ChevronDown } from "lucide-react";

import type { FaqItem } from "@/lib/faq";

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-border rounded-xl border border-border">
      {items.map((item) => (
        <details key={item.question} className="group p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-base font-semibold sm:text-lg">
            {item.question}
            <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
