import { toast } from "sonner";

import type { StudySource } from "@/lib/data/types";

/** Faz 3'te çalışma zamanlayıcısına bağlanır. */
export function startStudy(courseId: string, source: StudySource = "timer") {
  void courseId;
  void source;
  toast("Çalışma zamanlayıcısı Faz 3'te açılacak");
}
