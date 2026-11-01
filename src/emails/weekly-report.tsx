import { Section, Text } from "@react-email/components";

import { COURSE_HEX, EmailLayout } from "./layout";

export type WeeklyProps = {
  appUrl: string;
  rangeLabel: string;
  totalLabel: string;
  completedTasks: number;
  attendanceRate: number | null;
  streak: number;
  courses: { name: string; color: string; minutesLabel: string; pct: number }[];
};

/** Haftalık rapor: ders bazında süre, tamamlanan görev, yoklama oranı */
export default function WeeklyReport(p: WeeklyProps) {
  const stat = (label: string, value: string) => (
    <td style={{ padding: "0 12px 0 0" }}>
      <Text style={{ margin: 0, fontSize: "22px", fontWeight: 600 }}>{value}</Text>
      <Text style={{ margin: 0, fontSize: "12px", color: "#6b6b73" }}>{label}</Text>
    </td>
  );
  return (
    <EmailLayout appUrl={p.appUrl} preview={`Bu hafta ${p.totalLabel} çalıştın`} title="Haftalık rapor">
      <Text style={{ fontSize: "14px", color: "#6b6b73", margin: "0 0 16px" }}>{p.rangeLabel}</Text>
      <table role="presentation" style={{ width: "100%", marginBottom: "18px" }}>
        <tbody><tr>{stat("çalışma", p.totalLabel)}{stat("görev bitti", String(p.completedTasks))}{stat("yoklama", p.attendanceRate === null ? "—" : `%${p.attendanceRate}`)}{stat("gün seri", String(p.streak))}</tr></tbody>
      </table>
      {p.courses.map((c) => {
        const hex = COURSE_HEX[c.color] ?? COURSE_HEX.slate;
        return (
          <Section key={c.name} style={{ marginBottom: "10px" }}>
            <Text style={{ margin: "0 0 4px", fontSize: "13px" }}><span style={{ fontWeight: 600 }}>{c.name}</span> · {c.minutesLabel}</Text>
            <div style={{ height: "8px", borderRadius: "4px", backgroundColor: hex.bg }}>
              <div style={{ width: `${Math.max(4, c.pct)}%`, height: "8px", borderRadius: "4px", backgroundColor: hex.solid }} />
            </div>
          </Section>
        );
      })}
    </EmailLayout>
  );
}
