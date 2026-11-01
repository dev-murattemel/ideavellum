import { Text } from "@react-email/components";

import { EmailLayout, Row } from "./layout";

export type DigestProps = {
  appUrl: string;
  dateLabel: string;
  name?: string | null;
  sessions: { course: string; color: string; time: string; location?: string | null }[];
  tasks: { title: string; due: string; course?: string | null; color?: string | null; overdue: boolean }[];
};

/** Sabah özeti: bugünün dersleri ve görevleri */
export default function MorningDigest({ appUrl, dateLabel, name, sessions, tasks }: DigestProps) {
  return (
    <EmailLayout appUrl={appUrl} preview={`${sessions.length} ders, ${tasks.length} görev`} title={`Günaydın${name ? `, ${name}` : ""}`}>
      <Text style={{ fontSize: "14px", color: "#6b6b73", margin: "0 0 16px" }}>{dateLabel}</Text>
      <Text style={{ fontSize: "15px", fontWeight: 600, margin: "0 0 10px" }}>Bugünün programı</Text>
      {sessions.length ? sessions.map((s, i) => <Row key={i} color={s.color} title={s.course} meta={`${s.time}${s.location ? ` · ${s.location}` : ""}`} />) : <Text style={{ fontSize: "14px", color: "#6b6b73" }}>Bugün ders saati yok.</Text>}
      <Text style={{ fontSize: "15px", fontWeight: 600, margin: "20px 0 10px" }}>Bugünün görevleri</Text>
      {tasks.length ? tasks.map((t, i) => <Row key={i} color={t.color ?? undefined} title={t.title} meta={`${t.overdue ? "Gecikti · " : ""}${t.due}${t.course ? ` · ${t.course}` : ""}`} />) : <Text style={{ fontSize: "14px", color: "#6b6b73" }}>Bugün için görev yok.</Text>}
    </EmailLayout>
  );
}

MorningDigest.PreviewProps = {
  appUrl: "http://localhost:3000",
  dateLabel: "4 Kasım 2026, Çarşamba",
  name: "Murat",
  sessions: [{ course: "İngilizce B2", color: "sky", time: "09:00–10:30", location: "Çalışma odası" }],
  tasks: [{ title: "Essay taslağı", due: "Bugün 23:00", course: "İngilizce B2", color: "sky", overdue: false }],
} satisfies DigestProps;
