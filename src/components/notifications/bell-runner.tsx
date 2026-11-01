"use client";

import * as React from "react";
import { BellRing, ListTodo } from "lucide-react";
import { toast } from "sonner";

import { useProfile, useRows } from "@/lib/data/hooks";
import { taskReminderAt } from "@/lib/domain/tasks";
import { playBell } from "@/lib/notifications/bell-sounds";
import { useBellState } from "@/lib/notifications/bell-state";
import { bellEvents, inQuietHours } from "@/lib/reminders/bell-events";
import { minutesOfDay, zonedNow } from "@/lib/time";
import { ui } from "@/lib/ui-store";

const WINDOW_MS = 90_000; // bu süreden eski olaylar artık çalınmaz
const fired = new Set<string>();

function systemNotify(title: string, body: string) {
  try {
    if (typeof Notification !== "undefined" && Notification.permission === "granted" && document.hidden) {
      new Notification(title, { body, icon: "/icons/icon-192.png", tag: title });
    }
  } catch {
    /* önizleme çerçevesinde desteklenmeyebilir */
  }
}

/**
 * Uygulama açıkken zil: yaklaşan olayları her 10 sn'de bir kontrol eder,
 * zamanı gelince ses çalar ve bildirim gösterir.
 */
export function BellRunner() {
  const sessions = useRows("class_sessions");
  const courses = useRows("courses");
  const tasks = useRows("tasks");
  const profile = useProfile();
  const enabled = useBellState((s) => s.enabled);

  const check = React.useCallback(() => {
    const now = Date.now();
    const wall = zonedNow(profile.timezone);
    const settings = profile.bell_settings;
    const prefs = profile.notification_prefs.channels;
    const quiet = inQuietHours(settings, minutesOfDay(wall));
    const courseMap = Object.fromEntries(courses.map((c) => [c.id, c]));

    if (prefs.bell.in_app) {
      bellEvents(sessions, courseMap, settings, wall, 1, profile.timezone)
        .filter((e) => e.fireAt.getTime() <= now && now - e.fireAt.getTime() < WINDOW_MS && !fired.has(e.id))
        .forEach((e) => {
          fired.add(e.id);
          if (enabled && !quiet) void playBell(settings.sound, settings.volume);
          toast(e.title, { description: e.body, icon: <BellRing className="size-4" />, duration: 12_000 });
          systemNotify(e.title, e.body);
        });
    }
    if (prefs.task_due.in_app) {
      tasks
        .filter((t) => t.status !== "done" && t.due_at)
        .forEach((t) => {
          const at = taskReminderAt(t.due_at!, profile.timezone).getTime();
          const id = `task|${t.id}|${t.due_at}`;
          if (at <= now && now - at < WINDOW_MS && !fired.has(id)) {
            fired.add(id);
            toast("Görev hatırlatması", {
              description: t.title,
              icon: <ListTodo className="size-4" />,
              action: { label: "Aç", onClick: () => ui().openTask(t.id) },
              duration: 12_000,
            });
            systemNotify("Görev hatırlatması", t.title);
          }
        });
    }
  }, [sessions, courses, tasks, profile, enabled]);

  React.useEffect(() => {
    check();
    const i = setInterval(check, 10_000);
    return () => clearInterval(i);
  }, [check]);

  return null;
}
