import { BoardView } from "@/components/board/board-view";
import { CourseDetailView } from "@/components/course/course-detail-view";
import { CoursesView } from "@/components/course/courses-view";
import { NotesView } from "@/components/notes/notes-view";
import { ReportsView } from "@/components/reports/reports-view";
import { TranscriptView } from "@/components/reports/transcript-view";
import { ResourcesView } from "@/components/resources/resources-view";
import { ScheduleView } from "@/components/schedule/schedule-view";
import { SettingsView } from "@/components/settings/settings-view";
import { TodayView } from "@/components/today/today-view";

const TITLES: Record<string, string> = {
  "/bugun": "Bugün",
  "/program": "Ders programı",
  "/pano": "Pano",
  "/dersler": "Dersler",
  "/notlar": "Notlar",
  "/kaynaklar": "Kaynaklar",
  "/raporlar": "Raporlar",
  "/transkript": "Transkript",
  "/ayarlar": "Ayarlar",
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
    case "/program":
      return <ScheduleView />;
    case "/pano":
      return <BoardView />;
    case "/dersler":
      return <CoursesView />;
    case "/notlar":
      return <NotesView />;
    case "/kaynaklar":
      return <ResourcesView />;
    case "/raporlar":
      return <ReportsView />;
    case "/transkript":
      return <TranscriptView />;
    case "/ayarlar":
      return <SettingsView />;
    default:
      return <TodayView />;
  }
}
