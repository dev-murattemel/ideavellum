import { BoardView } from "@/components/board/board-view";
import { CourseDetailView } from "@/components/course/course-detail-view";
import { CoursesView } from "@/components/course/courses-view";
import { HabitsView } from "@/components/habits/habits-view";
import { GuideView } from "@/components/guides/guide-view";
import { StickiesView } from "@/components/stickies/stickies-view";
import { CategoryView } from "@/components/forum/category-view";
import { ForumView } from "@/components/forum/forum-view";
import { TopicView } from "@/components/forum/topic-view";
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
  "/aliskanliklar": "Alışkanlıklar",
  "/aforizmalar": "Aforizmalar",
  "/ilerleme": "İlerleme",
  "/arsiv": "Arşiv",
  "/ayarlar": "Ayarlar",
  "/rehber": "Rehber",
  "/mantar-pano": "Mantar pano",
  "/forum": "Forum",
};

export function titleFor(pathname: string) {
  if (pathname.startsWith("/forum/")) return "Forum";
  return pathname.startsWith("/alanlar/") ? "Alan" : (TITLES[pathname] ?? "Bugün");
}

export function resolveView(pathname: string) {
  if (pathname.startsWith("/alanlar/")) {
    const id = pathname.slice("/alanlar/".length);
    return <CourseDetailView key={id} courseId={id} />;
  }
  if (pathname.startsWith("/forum/")) {
    const [cat, topic] = pathname.slice("/forum/".length).split("/");
    return topic ? <TopicView key={topic} categoryId={cat} topicId={topic} /> : <CategoryView key={cat} categoryId={cat} />;
  }
  switch (pathname) {
    case "/forum":
      return <ForumView />;
    case "/takvim":
      return <ScheduleView />;
    case "/pano":
      return <BoardView />;
    case "/alanlar":
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
    case "/ilerleme":
      return <ReportsView />;
    case "/arsiv":
      return <TranscriptView />;
    case "/ayarlar":
      return <SettingsView />;
    default:
      return <TodayView />;
  }
}
