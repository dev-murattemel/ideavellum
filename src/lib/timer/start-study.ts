import { toast } from "sonner";

import { data } from "@/lib/data/store";
import type { StudySource } from "@/lib/data/types";
import { useTimer } from "./store";

/** Bugün kartından ya da ders sayfasından çalışmayı başlatır. */
export function startStudy(courseId: string, source: StudySource = "timer") {
  const t = useTimer.getState();
  const name = data().courses[courseId]?.name ?? "Ders";
  if (t.courseId && t.courseId !== courseId) {
    const prev = t.stop();
    if (prev && prev.minutes >= 1) toast(`Önceki çalışma kaydedildi (${prev.minutes} dk)`);
  } else if (t.courseId === courseId) {
    if (!t.runningSince) t.resume();
    return;
  }
  useTimer.getState().start(courseId, source);
  toast.success(`${name} için zamanlayıcı başladı`, { description: "Üst çubuktan duraklatabilir ya da bitirebilirsin." });
}
