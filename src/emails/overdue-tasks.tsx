import { Text } from "@react-email/components";

import { EmailLayout, Row } from "./layout";

export type OverdueProps = { appUrl: string; tasks: { title: string; due: string; course?: string | null; color?: string | null }[] };

/** Geciken görev uyarısı */
export default function OverdueTasks({ appUrl, tasks }: OverdueProps) {
  return (
    <EmailLayout appUrl={appUrl} preview={`${tasks.length} görev gecikti`} title={`${tasks.length} görev gecikti`}>
      <Text style={{ fontSize: "14px", color: "#6b6b73", margin: "0 0 16px" }}>Yeni bir tarih ver ya da bugün bitir; ikisi de ilerlemedir.</Text>
      {tasks.map((t, i) => <Row key={i} color={t.color ?? undefined} title={t.title} meta={`${t.due}${t.course ? ` · ${t.course}` : ""}`} />)}
    </EmailLayout>
  );
}
