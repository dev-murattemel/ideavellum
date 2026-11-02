import type { EntryCheck } from "@/lib/data/types";

const num = (n: number) => String(n).replace(".", ",");

/** Maddenin ölçüsünü kısa metne çevirir: "4×10 · 60 kg", "30 dk · 5 km", "200 g" */
export function checkMeasure(c: EntryCheck) {
  switch (c.metric) {
    case "strength": {
      const sr = c.sets && c.reps ? `${c.sets}×${c.reps}` : c.sets ? `${c.sets} set` : c.reps ? `${c.reps} tekrar` : "";
      return [sr, c.weight ? `${num(c.weight)} kg` : ""].filter(Boolean).join(" · ");
    }
    case "cardio":
      return [c.minutes ? `${num(c.minutes)} dk` : "", c.km ? `${num(c.km)} km` : ""].filter(Boolean).join(" · ");
    case "amount":
      return c.amount ? `${num(c.amount)} ${c.unit ?? ""}`.trim() : "";
    default:
      return "";
  }
}

/** "Bench press — 4×10 · 60 kg" */
export const checkText = (c: EntryCheck) => {
  const m = checkMeasure(c);
  return m ? `${c.label} — ${m}` : c.label;
};
