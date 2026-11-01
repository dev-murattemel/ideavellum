"use client";

import { BookOpen, CircleCheck, ListTodo, NotebookPen, Play } from "lucide-react";

import { TYPE_META } from "@/components/resources/resource-meta";
import { CommandGroup, CommandItem } from "@/components/ui/command";
import { useActiveCourses, useRows } from "@/lib/data/hooks";
import { useNav } from "@/lib/nav/nav-context";
import { startStudy } from "@/lib/timer/start-study";
import { ui } from "@/lib/ui-store";

/** Komut paletinde verilerde arama: dersler, görevler, notlar, kaynaklar */
export function CommandSearchGroups({ run }: { run: (fn: () => void) => void }) {
  const nav = useNav();
  const courses = useActiveCourses();
  const tasks = useRows("tasks");
  const notes = useRows("notes");
  const resources = useRows("resources");

  return (
    <>
      <CommandGroup heading="Dersler">
        {courses.map((c) => (
          <CommandItem key={c.id} value={`ders ${c.name} ${c.code ?? ""}`} onSelect={() => run(() => nav.push(`/dersler/${c.id}`))}>
            <BookOpen />
            <span data-course={c.color} className="size-2 rounded-full bg-course-solid" aria-hidden />
            {c.name}
          </CommandItem>
        ))}
        {courses.map((c) => (
          <CommandItem key={`t-${c.id}`} value={`zamanlayıcı çalışmayı başlat ${c.name}`} onSelect={() => run(() => startStudy(c.id))}>
            <Play /> {c.name} için çalışmayı başlat
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
