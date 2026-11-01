"use client";

import * as React from "react";
import { Pause, Play, Square } from "lucide-react";
import { toast } from "sonner";

import { useRow } from "@/lib/data/hooks";
import { elapsedMs, formatClock, useTimer } from "@/lib/timer/store";
import { cn } from "@/lib/utils";

/** Üst çubukta çalışan zamanlayıcı: ders renginde, duraklat / bitir */
export function TimerPill() {
  const t = useTimer();
  const course = useRow("courses", t.courseId);
  const [, tick] = React.useState(0);

  React.useEffect(() => {
    if (!t.runningSince) return;
    const i = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(i);
  }, [t.runningSince]);

  if (!t.courseId || !course) return null;
  const running = !!t.runningSince;

  const stop = () => {
    const res = useTimer.getState().stop();
    if (!res) return;
    if (res.minutes >= 1) toast.success(`${res.minutes} dk çalışma kaydedildi`, { description: course.name });
    else toast("1 dakikadan kısa sürdüğü için kaydedilmedi");
  };

  return (
    <div data-course={course.color} role="timer" aria-label={`${course.name} çalışma süresi`} className="flex h-9 items-center gap-1 rounded-full bg-course pr-1 pl-3 text-course-fg">
      <span className={cn("size-2 rounded-full bg-course-solid", running && "animate-pulse motion-reduce:animate-none")} aria-hidden />
      <span className="ml-1 hidden max-w-32 truncate text-13 font-medium lg:block">{course.name}</span>
      <span className="tabular ml-1 text-13 font-semibold">{formatClock(elapsedMs(t))}</span>
      <button
        type="button"
        onClick={() => (running ? t.pause() : t.resume())}
        aria-label={running ? "Duraklat" : "Devam et"}
        className="ml-1 flex size-7 cursor-pointer items-center justify-center rounded-full hover:bg-surface/60"
      >
        {running ? <Pause className="size-3.5 fill-current" /> : <Play className="size-3.5 fill-current" />}
      </button>
      <button type="button" onClick={stop} aria-label="Bitir ve kaydet" className="flex size-7 cursor-pointer items-center justify-center rounded-full hover:bg-surface/60">
        <Square className="size-3.5 fill-current" />
      </button>
    </div>
  );
}
