"use client";

import { TaskSheet } from "@/components/board/task-sheet";
import { NotePanel } from "@/components/notes/note-panel";
import { BellRunner } from "@/components/notifications/bell-runner";
import { DataProvider } from "@/components/providers/data-provider";
import { ReminderSync } from "@/components/providers/reminder-sync";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useData } from "@/lib/data/store";
import { AppSidebar } from "./app-sidebar";
import { CommandMenu } from "./command-menu";
import { CommandMenuProvider } from "./command-menu-context";
import { DialogHost } from "./dialog-host";
import { MobileNav } from "./mobile-nav";
import { SidebarProvider } from "./sidebar-context";
import { Topbar } from "./topbar";

/** Uygulamanın ortak çerçevesi: hem Next.js'te hem önizlemede aynı. */
export function AppShell({
  defaultCollapsed,
  banner,
  children,
}: {
  defaultCollapsed: boolean;
  banner?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <DataProvider>
      <TooltipProvider>
        <SidebarProvider defaultCollapsed={defaultCollapsed}>
          <CommandMenuProvider>
            <div className="flex min-h-dvh">
              <AppSidebar />
              <div className="flex min-w-0 flex-1 flex-col">
                <Topbar />
                <main
                  id="icerik"
                  className="mx-auto w-full max-w-[1200px] flex-1 px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-12"
                >
                  {banner}
                  <ReadyGate>{children}</ReadyGate>
                </main>
              </div>
            </div>
            <MobileNav />
            <CommandMenu />
            <DialogHost />
            <TaskSheet />
            <NotePanel />
            <BellRunner />
            <ReminderSync />
          </CommandMenuProvider>
        </SidebarProvider>
      </TooltipProvider>
    </DataProvider>
  );
}

function ReadyGate({ children }: { children: React.ReactNode }) {
  const status = useData((s) => s.status);
  if (status !== "ready") {
    return (
      <div aria-busy="true" aria-label="Yükleniyor" className="flex flex-col gap-6">
        <div className="h-8 w-48 animate-pulse rounded-md bg-sunken" />
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-sunken" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-sunken" />
      </div>
    );
  }
  return <>{children}</>;
}
