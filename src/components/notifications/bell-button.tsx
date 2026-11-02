"use client";

import * as React from "react";
import { Bell, BellOff, Settings } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useProfile, useRows } from "@/lib/data/hooks";
import { playBell } from "@/lib/notifications/bell-sounds";
import { useBellState } from "@/lib/notifications/bell-state";
import { AppLink } from "@/lib/nav/nav-context";
import { bellEvents } from "@/lib/reminders/bell-events";
import { fmt, utcToWall, zonedNow } from "@/lib/time";

/** Üst çubuktaki zil: önce sesleri etkinleştir, sonra sıradaki zili gösterir. */
export function BellButton() {
  const { enabled, enable } = useBellState();
  const profile = useProfile();
  const sessions = useRows("class_sessions");
  const courses = useRows("courses");
  const s = profile.bell_settings;

  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(i);
  }, []);

  const next = React.useMemo(() => {
    const map = Object.fromEntries(courses.map((c) => [c.id, c]));
    return bellEvents(sessions, map, s, zonedNow(profile.timezone), 2, profile.timezone).find((e) => e.fireAt.getTime() > now) ?? null;
  }, [sessions, courses, s, profile.timezone, now]);

  // Zil kapalıyken: yalnızca yakında bir ders varsa küçük, sessiz bir ikon (ayar Ayarlar'da)
  if (!enabled) {
    if (!next) return null;
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Zil seslerini aç"
        title="Zil seslerini aç"
        className="text-ink-subtle"
        onClick={async () => {
          const ok = await enable(s.sound, s.volume);
          toast[ok ? "success" : "error"](ok ? "Zil sesleri açık" : "Bu tarayıcı ses çalmaya izin vermedi");
        }}
      >
        <BellOff />
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Zil">
          <Bell />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <p className="text-13 font-semibold">Zil açık</p>
        <p className="mt-1 text-13 text-ink-muted">
          {next ? (
            <>Sıradaki: <span className="font-medium text-foreground">{next.title}</span> · {fmt(utcToWall(next.fireAt.toISOString(), profile.timezone), "EEE HH:mm")}</>
          ) : (
            "Önümüzdeki iki günde zil yok."
          )}
        </p>
        <div className="mt-3 flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => playBell(s.sound, s.volume)}>Zili dene</Button>
          <Button size="sm" variant="ghost" asChild>
            <AppLink href="/ayarlar"><Settings /> Zil ayarları</AppLink>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
