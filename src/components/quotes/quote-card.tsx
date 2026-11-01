"use client";

import { Copy, Ellipsis, Pencil, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { TagChip } from "@/components/tags/tag-chip";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { data } from "@/lib/data/store";
import type { Quote } from "@/lib/data/types";
import { ui } from "@/lib/ui-store";
import { cn } from "@/lib/utils";

/** Söz kartı: büyük tırnak, metin, söyleyen; favori yıldızı ve menü */
export function QuoteCard({ quote, onTag }: { quote: Quote; onTag?: (t: string) => void }) {
  const mine = !quote.author;
  return (
    <figure className="group relative mb-4 flex break-inside-avoid flex-col gap-3 rounded-xl border border-line bg-surface p-5 transition-shadow hover:shadow-lift">
      <span aria-hidden className="font-serif text-4xl leading-none text-line-strong select-none">“</span>
      <blockquote className="-mt-3 text-[15px] leading-6 whitespace-pre-line text-foreground">{quote.text}</blockquote>
      <figcaption className="flex flex-wrap items-center gap-x-2 gap-y-1 text-13 text-ink-muted">
        <span className={cn("font-medium", mine && "text-accent-text")}>— {quote.author ?? "Ben"}</span>
        {quote.source && <span className="italic">{quote.source}</span>}
      </figcaption>
      {quote.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {quote.tags.map((t) => <TagChip key={t} tag={t} onClick={onTag ? () => onTag(t) : undefined} />)}
        </div>
      )}
      <div className="absolute top-3 right-3 flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={quote.is_favorite ? "Favorilerden çıkar" : "Favorilere ekle"}
          aria-pressed={quote.is_favorite}
          onClick={() => data().update("quotes", quote.id, { is_favorite: !quote.is_favorite })}
          className={cn(quote.is_favorite ? "text-[#E3B524]" : "text-ink-subtle opacity-0 group-hover:opacity-100 focus-visible:opacity-100 max-md:opacity-100")}
        >
          <Star className={cn(quote.is_favorite && "fill-current")} />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Söz menüsü" className="text-ink-subtle opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100 max-md:opacity-100">
              <Ellipsis />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => ui().open({ type: "quote", quoteId: quote.id })}><Pencil /> Düzenle</DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                void navigator.clipboard?.writeText(`“${quote.text}” — ${quote.author ?? "Ben"}`);
                toast("Söz kopyalandı");
              }}
            >
              <Copy /> Kopyala
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => { data().remove("quotes", quote.id); toast("Söz silindi"); }}>
              <Trash2 /> Sil
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </figure>
  );
}
