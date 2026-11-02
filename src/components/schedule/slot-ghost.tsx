import type { CourseColor } from "@/lib/course-colors";
import { minutesToTime } from "@/lib/time";
import { HOUR_PX, minToPx, PX_PER_MIN } from "./constants";

/** İmlecin altındaki boş yer: "+ 19:00" ya da yapıştırma modunda "Yapıştır · 19:00" */
export function SlotGhost({ min, clipColor, clipLen }: { min: number; clipColor?: CourseColor; clipLen: number }) {
  if (clipColor) {
    return (
      <div aria-hidden data-course={clipColor} className="pointer-events-none absolute inset-x-1 z-20 rounded-lg border border-dashed border-course-solid bg-course/80 px-2 py-1 text-xs font-medium text-course-fg" style={{ top: minToPx(min), height: clipLen * PX_PER_MIN }}>
        Yapıştır · {minutesToTime(min)}
      </div>
    );
  }
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-1 rounded-lg border border-dashed border-primary/50 bg-accent-soft/50 px-2 py-1 text-xs font-medium text-accent-text" style={{ top: minToPx(min), height: HOUR_PX }}>
      + {minutesToTime(min)}
    </div>
  );
}
