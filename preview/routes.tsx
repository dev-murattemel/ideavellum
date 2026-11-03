import { BoardView } from "@/components/board/board-view";
import { CourseDetailView } from "@/components/course/course-detail-view";
import { CoursesView } from "@/components/course/courses-view";
import { HabitsView } from "@/components/habits/habits-view";
import { GuideView } from "@/components/guides/guide-view";
import { StickiesView } from "@/components/stickies/stickies-view";
import { JournalView } from "@/components/journal/journal-view";
import { NotesView } from "@/components/notes/notes-view";
import { QuotesView } from "@/components/quotes/quotes-view";
import { ReportsView } from "@/components/reports/reports-view";
import { TranscriptView } from "@/components/reports/transcript-view";
import { ResourcesView } from "@/components/resources/resources-view";
import { ScheduleView } from "@/components/schedule/schedule-view";
import { SettingsView } from "@/components/settings/settings-view";
import { TodayView } from "@/components/today/today-view";

const TITLES: Record<string, string> = {
  "/bugun": "Bugün",
  "/takvim": "Takvim",
  "/pano": "Pano",
  "/dersler": "Müfredat",
  "/notlar": "Notlar",
  "/kaynaklar": "Kaynaklar",
  "/gunluk": "Günlük",
  "/aliskanliklar": "Alışkanlıklar",
  "/aforizmalar": "Aforizmalar",
  "/karne": "Karne",
  "/transkript": "Transkript",
  "/ayarlar": "Ayarlar",
  "/rehber": "Rehber",
  "/mantar-pano": "Mantar pano",
};

export function titleFor(pathname: string) {
  return pathname.startsWith("/dersler/") ? "Ders" : (TITLES[pathname] ?? "Bugün");
}

export function resolveView(pathname: string) {
  if (pathname.startsWith("/dersler/")) {
    const id = pathname.slice("/dersler/".length);
    return <CourseDetailView key={id} courseId={id} />;
  }
  switch (pathname) {
    case "/takvim":
      return <ScheduleView />;
    case "/pano":
      return <BoardView />;
    case "/dersler":
      return <CoursesView />;
    case "/notlar":
      return <NotesView />;
    case "/aliskanliklar":
      return <HabitsView />;
    case "/rehber":
      return <GuideView />;
    case "/mantar-pano":
      return <StickiesView />;
    case "/gunluk":
      return <JournalView />;
    case "/aforizmalar":
      return <QuotesView />;
    case "/kaynaklar":
      return <ResourcesView />;
    case "/karne":
      return <ReportsView />;
    case "/transkript":
      return <TranscriptView />;
    case "/ayarlar":
      return <SettingsView />;
    default:
      return <TodayView />;
  }
}
