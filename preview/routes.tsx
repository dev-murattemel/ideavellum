import { BoardView } from "@/components/board/board-view";
import { CourseDetailView } from "@/components/course/course-detail-view";
import { CoursesView } from "@/components/course/courses-view";
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
  "/alanlar": "Alanlar",
  "/notlar": "Notlar",
  "/kaynaklar": "Kaynaklar",
  "/gunluk": "Günlük",
  "/aforizmalar": "Aforizmalar",
  "/raporlar": "Raporlar",
  "/arsiv": "Arşiv",
  "/ayarlar": "Ayarlar",
};

export function titleFor(pathname: string) {
  return pathname.startsWith("/alanlar/") ? "Alan" : (TITLES[pathname] ?? "Bugün");
}

export function resolveView(pathname: string) {
  if (pathname.startsWith("/alanlar/")) {
    const id = pathname.slice("/alanlar/".length);
    return <CourseDetailView key={id} courseId={id} />;
  }
  switch (pathname) {
    case "/takvim":
      return <ScheduleView />;
    case "/pano":
      return <BoardView />;
    case "/alanlar":
      return <CoursesView />;
    case "/notlar":
      return <NotesView />;
    case "/gunluk":
      return <JournalView />;
    case "/aforizmalar":
      return <QuotesView />;
    case "/kaynaklar":
      return <ResourcesView />;
    case "/raporlar":
      return <ReportsView />;
    case "/arsiv":
      return <TranscriptView />;
    case "/ayarlar":
      return <SettingsView />;
    default:
      return <TodayView />;
  }
}
