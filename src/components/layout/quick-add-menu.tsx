"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QUICK_ADD_ACTIONS } from "./quick-add";

export function QuickAddMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label="Hızlı ekle" className="max-sm:size-9 max-sm:px-0">
          <Plus className="size-4" strokeWidth={2.2} />
          <span className="max-sm:sr-only">Hızlı ekle</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {QUICK_ADD_ACTIONS.map(({ id, label, icon: Icon, run }) => (
          <DropdownMenuItem key={id} onSelect={run}>
            <Icon /> {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
