"use client";

import * as React from "react";
import { Focus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { remaining, usePomodoro } from "@/lib/timer/pomodoro";
import { formatClock } from "@/lib/timer/store";
import { ui } from "@/lib/ui-store";

/** Üst çubukta odak modu düğmesi; sayaç çalışıyorsa kalan süreyi gösterir */
export function FocusButton() {
  const endsAt = usePomodoro((s) => s.endsAt);
  const p = usePomodoro();
  const [, tick] = React.useState(0);
  React.useEffect(() => {
    if (!endsAt) return;
    const i = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(i);
  }, [endsAt]);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="secondary" size={endsAt ? "default" : "icon"} aria-label="Odak modu (F)" onClick={() => ui().setFocus(true)} className="max-sm:hidden">
          <Focus />
          {endsAt && <span className="tabular text-13">{formatClock(remaining(p))}</span>}
        </Button>
      </TooltipTrigger>
      <TooltipContent>Odak modu <kbd className="ml-1 opacity-70">F</kbd></TooltipContent>
    </Tooltip>
  );
}
