"use client";

import { TaskSheet } from "@/components/board/task-sheet";
import { NotePanel } from "@/components/notes/note-panel";
import { ClipBar } from "@/components/schedule/clip-bar";
import { OccurrencePanel } from "@/components/schedule/occurrence-panel";
import { BellRunner } from "@/components/notifications/bell-runner";
import { DataProvider } from "@/components/providers/data-provider";
import { ReminderSync } from "@/components/providers/reminder-sync";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useData } from "@/lib/data/store";
import { useNav } from "@/lib/nav/nav-context";
import { AppSidebar } from "./app-sidebar";
import { CommandMenu } from "./command-menu";
import { CommandMenuProvider } from "./command-menu-context";
import { DialogHost } from "./dialog-host";
import { MobileNav } from "./mobile-nav";
import { Shortcuts } from "./shortcuts";
import { FocusMode } from "@/components/focus/focus-mode";
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
            <div className="flex min-h-dvh md:bg-shell">
              <AppSidebar />
              {/* Masaüstünde içerik, gri çerçevenin içinde beyaz ve köşeleri yuvarlak bir tuvalde durur */}
              <div className="flex min-w-0 flex-1 flex-col md:my-2 md:mr-2 md:min-h-[calc(100dvh-1rem)] md:rounded-2xl md:border md:border-line md:bg-surface md:shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
                <Topbar />
                <main
                  id="icerik"
                  className="mx-auto w-full max-w-[1600px] flex-1 px-4 pt-6 pb-28 md:px-8 md:pt-6 md:pb-12 2xl:px-10"
                >
                  {banner}
                  <ReadyGate>{children}</ReadyGate>
                </main>
              </div>
            </div>
            <MobileNav />
            <CommandMenu />
            <Shortcuts />
            <FocusMode />
            <DialogHost />
            <TaskSheet />
            <NotePanel />
            <OccurrencePanel />
            <ClipBar />
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
  return <PageTransition>{children}</PageTransition>;
}

/** Sayfa değişince içerik yumuşakça belirir */
function PageTransition({ children }: { children: React.ReactNode }) {
  const { pathname } = useNav();
  return (
    <div key={pathname} className="page-in">
      {children}
    </div>
  );
}
