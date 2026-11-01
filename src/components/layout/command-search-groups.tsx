"use client";

import { CircleCheck, ListTodo, NotebookPen, Play, Quote } from "lucide-react";

import { TYPE_META } from "@/components/resources/resource-meta";
import { CommandGroup, CommandItem } from "@/components/ui/command";
import { useActiveCourses, useRows } from "@/lib/data/hooks";
import { useNav } from "@/lib/nav/nav-context";
import { startStudy } from "@/lib/timer/start-study";
import { ui } from "@/lib/ui-store";
import { kindOf } from "@/lib/area-kinds";

/** Komut paletinde verilerde arama: alanlar, görevler, notlar, sözler, kaynaklar */
export function CommandSearchGroups({ run }: { run: (fn: () => void) => void }) {
  const nav = useNav();
  const courses = useActiveCourses();
  const tasks = useRows("tasks");
  const notes = useRows("notes");
  const resources = useRows("resources");
  const quotes = useRows("quotes");

  return (
    <>
      <CommandGroup heading="Alanlar">
        {courses.map((c) => {
          const k = kindOf(c);
          const Icon = k.icon;
          return (
            <CommandItem key={c.id} value={`alan ders ${k.label} ${c.name} ${c.code ?? ""}`} onSelect={() => run(() => nav.push(`/alanlar/${c.id}`))}>
              <Icon data-course={c.color} className="text-course-solid" />
              {c.name}
              <span className="ml-auto text-xs text-ink-subtle">{k.label}</span>
            </CommandItem>
          );
        })}
        {courses.map((c) => (
          <CommandItem key={`t-${c.id}`} value={`zamanlayıcı başlat ${kindOf(c).activity} ${c.name}`} onSelect={() => run(() => startStudy(c.id))}>
            <Play /> {c.name}: {kindOf(c).activity.toLocaleLowerCase("tr")} başlat
          </CommandItem>
        ))}
      </CommandGroup>
      <CommandGroup heading="Görevler">
        {tasks.map((t) => (
          <CommandItem key={t.id} value={`görev ${t.title}`} onSelect={() => run(() => ui().openTask(t.id))}>
            {t.status === "done" ? <CircleCheck /> : <ListTodo />}
            <span className="truncate">{t.title}</span>
          </CommandItem>
        ))}
      </CommandGroup>
      <CommandGroup heading="Notlar">
        {notes.map((n) => (
          <CommandItem key={n.id} value={`not ${n.title}`} onSelect={() => run(() => { nav.push("/notlar"); setTimeout(() => ui().openNote(n.id), 60); })}>
            <NotebookPen />
            <span className="truncate">{n.title || "Başlıksız not"}</span>
          </CommandItem>
        ))}
      </CommandGroup>
      <CommandGroup heading="Sözler">
        {quotes.map((q) => (
          <CommandItem key={q.id} value={`söz aforizma ${q.text} ${q.author ?? ""}`} onSelect={() => run(() => ui().open({ type: "quote", quoteId: q.id }))}>
            <Quote />
            <span className="truncate">{q.text}</span>
          </CommandItem>
        ))}
      </CommandGroup>
      <CommandGroup heading="Kaynaklar">
        {resources.map((r) => {
          const Icon = TYPE_META[r.type].icon;
          return (
            <CommandItem key={r.id} value={`kaynak ${r.title} ${r.author ?? ""}`} onSelect={() => run(() => ui().open({ type: "resource", resourceId: r.id }))}>
              <Icon />
              <span className="truncate">{r.title}</span>
            </CommandItem>
          );
        })}
      </CommandGroup>
    </>
  );
}
