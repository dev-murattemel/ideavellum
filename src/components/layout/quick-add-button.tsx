"use client";

import { Button } from "@/components/ui/button";
import { ADD_COURSE_ACTION, QUICK_ADD_ACTIONS } from "./quick-add";

const ACTIONS = Object.fromEntries(
  [ADD_COURSE_ACTION, ...QUICK_ADD_ACTIONS].map((a) => [a.id, a]),
);

/** Sunucu sayfalarından hızlı ekle eylemlerini tetiklemek için. */
export function QuickAddButton({
  action,
  label,
  variant = "default",
}: {
  action: "course" | "task" | "note" | "resource";
  label?: string;
  variant?: "default" | "secondary";
}) {
  const a = ACTIONS[action];
  const Icon = a.icon;
  return (
    <Button variant={variant} onClick={a.run}>
      <Icon />
      {label ?? a.label}
    </Button>
  );
}
