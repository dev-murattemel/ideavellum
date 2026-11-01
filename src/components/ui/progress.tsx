import { cn } from "@/lib/utils";

/** İnce ilerleme çubuğu. Ders renginde göstermek için üst öğeye data-course ver ve tone="course" kullan. */
function Progress({
  value,
  className,
  tone = "accent",
  label,
}: {
  value: number;
  className?: string;
  tone?: "accent" | "course";
  label?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v)}
      aria-label={label}
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-sunken", tone === "course" && "bg-course-solid/15", className)}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500", tone === "course" ? "bg-course-solid" : "bg-primary")}
        style={{ width: `${v}%` }}
      />
    </div>
  );
}

export { Progress };
