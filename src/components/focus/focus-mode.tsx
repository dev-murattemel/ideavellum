"use client";

import * as React from "react";
import { Coffee, Pause, Play, RotateCcw, SkipForward, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { kindOf } from "@/lib/area-kinds";
import { useActiveCourses, useProfile } from "@/lib/data/hooks";
import { data } from "@/lib/data/store";
import { playBell } from "@/lib/notifications/bell-sounds";
import { formatDuration } from "@/lib/time";
import { formatClock, useTimer } from "@/lib/timer/store";
import { phaseMinutes, PRESETS, remaining, usePomodoro, type Phase, type PresetId } from "@/lib/timer/pomodoro";
import { useUI, ui } from "@/lib/ui-store";
import { cn } from "@/lib/utils";

const PHASE_LABEL: Record<Phase, string> = { focus: "Odak", break: "Kısa mola", long: "Uzun mola" };
const NONE = "none";

/** Tam ekran odak modu (Pomodoro). Odak turu bitince süre seçili alana kaydedilir, zil çalar. */
export function FocusMode() {
  const open = useUI((s) => s.focusOpen);
  const running = usePomodoro((s) => !!s.endsAt);
  const bell = useProfile().bell_settings;

  // Ekran kapalıyken de tur bitişini yakala (süre kaydı + zil)
  React.useEffect(() => {
    if (!running) return;
    const i = setInterval(() => {
      if (remaining(usePomodoro.getState()) <= 0) completePhase(false, bell);
    }, 500);
    return () => clearInterval(i);
  }, [running, bell]);

  if (!open) return null;
  return <FocusScreen />;
}

function nextPhase(after: Phase, done: number): Phase {
  if (after !== "focus") return "focus";
  return done % 4 === 0 ? "long" : "break";
}

/** Turu bitirir: odak turuysa süreyi kaydeder, sıradaki aşamaya geçer */
function completePhase(skipped: boolean, bell: { sound: Parameters<typeof playBell>[0]; volume: number }) {
  const st = usePomodoro.getState();
  const minutes = Math.round((phaseMinutes(st) * 60_000 - remaining(st)) / 60_000);
  let done = st.done;
  if (st.phase === "focus") {
    if (minutes >= 1 && st.courseId) {
      data().insert("study_logs", {
        course_id: st.courseId, topic_id: null,
        started_at: st.startedAt ?? new Date(Date.now() - minutes * 60_000).toISOString(),
        ended_at: new Date().toISOString(), duration_minutes: minutes, source: "timer",
      });
    }
    if (!skipped) {
      done += 1;
      toast.success(`Odak turu tamam: ${formatDuration(minutes)}`, { description: st.courseId ? "Süre alana kaydedildi. Biraz mola ver." : "Biraz mola ver." });
    }
  } else if (!skipped) {
    toast("Mola bitti, yeni tura hazırsın");
  }
  if (!skipped) void playBell(bell.sound, bell.volume);
  const phase = nextPhase(st.phase, done);
  st.set({ phase, done, endsAt: null, remainingMs: phaseMinutes({ preset: st.preset, phase }) * 60_000, startedAt: null });
}

function toggle() {
  const st = usePomodoro.getState();
  if (st.endsAt) st.set({ endsAt: null, remainingMs: remaining(st) });
  else st.set({ endsAt: Date.now() + st.remainingMs, startedAt: st.startedAt ?? new Date().toISOString() });
}

function FocusScreen() {
  const s = usePomodoro();
  const courses = useActiveCourses();
  const bell = useProfile().bell_settings;
  const course = courses.find((c) => c.id === s.courseId);
  const [, tick] = React.useState(0);
  const running = !!s.endsAt;
  const total = phaseMinutes(s) * 60_000;
  const left = remaining(s);

  // Açılınca alan seçili gelsin: çalışan zamanlayıcının alanı ya da ilk aktif alan
  React.useEffect(() => {
    const st = usePomodoro.getState();
    if (!st.courseId && courses.length) st.set({ courseId: useTimer.getState().courseId ?? courses[0].id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Yarım saniyede bir ekranı yenile
  React.useEffect(() => {
    if (!running) return;
    const i = setInterval(() => tick((n) => n + 1), 500);
    return () => clearInterval(i);
  }, [running]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input,textarea,[role=listbox]")) return;
      if (e.key === "Escape") ui().setFocus(false);
      if (e.key === " ") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const reset = () => s.set({ endsAt: null, remainingMs: total, startedAt: null });
  const setPreset = (id: PresetId) =>
    s.set({ preset: id, phase: "focus", endsAt: null, startedAt: null, remainingMs: phaseMinutes({ preset: id, phase: "focus" }) * 60_000 });

  const pct = Math.min(1, 1 - left / total);
  const R = 120;
  const C = 2 * Math.PI * R;
  const onBreak = s.phase !== "focus";
  const KindIcon = course ? kindOf(course).icon : null;

  return (
    <div role="dialog" aria-modal="true" aria-label="Odak modu" data-course={course?.color ?? "slate"} className="page-in fixed inset-0 z-[60] flex flex-col bg-page">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_45%,var(--color-course)_0%,transparent_70%)] opacity-80" />

      <header className="relative flex items-center justify-between gap-3 p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <Select value={s.courseId ?? NONE} onValueChange={(v) => s.set({ courseId: v === NONE ? null : v })}>
            <SelectTrigger className="h-9 w-56 bg-surface/80" aria-label="Alan"><SelectValue /></SelectTrigger>
            <SelectContent className="z-[70]">
              <SelectItem value={NONE}>Alan seçmeden</SelectItem>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <span data-course={c.color} className="size-2 rounded-full bg-course-solid" aria-hidden /> {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div role="radiogroup" aria-label="Süre" className="hidden gap-1 rounded-lg bg-surface/70 p-1 sm:flex">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={s.preset === p.id}
                onClick={() => setPreset(p.id)}
                className={cn("tabular h-7 cursor-pointer rounded-md px-2.5 text-xs font-medium transition-colors", s.preset === p.id ? "bg-foreground text-surface" : "text-ink-muted hover:text-foreground")}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <Button variant="ghost" size="icon" aria-label="Odak modunu kapat (Esc)" onClick={() => ui().setFocus(false)}><X /></Button>
      </header>

      <main className="relative flex flex-1 flex-col items-center justify-center gap-8 px-4 pb-16">
        <div className="flex items-center gap-2 text-sm font-medium text-ink-muted">
          {onBreak ? <Coffee className="size-4" aria-hidden /> : KindIcon && <KindIcon className="size-4 text-course-solid" aria-hidden />}
          {PHASE_LABEL[s.phase]}{course && !onBreak ? ` · ${course.name}` : ""}
        </div>

        <div className="relative flex size-[280px] items-center justify-center sm:size-[320px]">
          <svg viewBox="0 0 280 280" className="absolute inset-0 size-full -rotate-90" aria-hidden>
            <circle cx="140" cy="140" r={R} fill="none" stroke="var(--line)" strokeWidth="6" />
            <circle
              cx="140" cy="140" r={R} fill="none"
              stroke={onBreak ? "var(--ink-subtle)" : "var(--color-course-solid)"}
              strokeWidth="6" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct)}
              className="transition-[stroke-dashoffset] duration-500 ease-linear"
            />
          </svg>
          <div className="flex flex-col items-center gap-1" role="timer">
            <span className="tabular text-6xl font-semibold tracking-[-0.04em] sm:text-7xl">{formatClock(left)}</span>
            <span className="text-13 text-ink-muted">{running ? "sürüyor" : left === total ? "hazır" : "duraklatıldı"}</span>
          </div>
        </div>

        <input
          value={s.intent}
          onChange={(e) => s.set({ intent: e.target.value })}
          placeholder="Bu turda neye odaklanıyorsun?"
          aria-label="Odak niyeti"
          className="w-full max-w-md border-b border-line bg-transparent px-2 py-2 text-center text-base outline-none placeholder:text-ink-subtle focus:border-foreground"
        />

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="icon" aria-label="Sıfırla" onClick={reset}><RotateCcw /></Button>
          <Button size="lg" className="h-12 min-w-40 rounded-full text-base" onClick={toggle}>
            {running ? <><Pause className="fill-current" /> Duraklat</> : <><Play className="fill-current" /> {left === total ? "Başlat" : "Devam et"}</>}
          </Button>
          <Button variant="secondary" size="icon" aria-label="Turu atla" onClick={() => completePhase(true, bell)}><SkipForward /></Button>
        </div>

        <div className="flex items-center gap-2" aria-label={`${s.done} odak turu tamamlandı`}>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={cn("size-2 rounded-full transition-colors", i < s.done % 4 ? "bg-course-solid" : "bg-line-strong")} />
          ))}
          <span className="tabular ml-1 text-xs text-ink-subtle">{s.done} tur</span>
        </div>
      </main>

      <p className="relative pb-5 text-center text-xs text-ink-subtle">Boşluk: başlat / duraklat · Esc: kapat</p>
    </div>
  );
}
