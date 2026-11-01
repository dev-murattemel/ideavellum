import { Body, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from "@react-email/components";

const page = { backgroundColor: "#f6f6f3", fontFamily: "Onest, -apple-system, Segoe UI, sans-serif", color: "#1d1d21" };
const card = { backgroundColor: "#ffffff", border: "1px solid #e4e4df", borderRadius: "14px", padding: "28px", margin: "24px auto", maxWidth: "520px" };

export const COURSE_HEX: Record<string, { bg: string; fg: string; solid: string }> = {
  lavender: { bg: "#EEEAFE", fg: "#4C3A9E", solid: "#7C6CF2" },
  sky: { bg: "#E3F0FD", fg: "#1F5A94", solid: "#4A90E2" },
  mint: { bg: "#DFF5EA", fg: "#1D6B47", solid: "#34B37A" },
  peach: { bg: "#FFEBDD", fg: "#9A4A15", solid: "#F08A3C" },
  rose: { bg: "#FDE4EC", fg: "#9C2A55", solid: "#E2588A" },
  butter: { bg: "#FDF4D3", fg: "#7D6210", solid: "#E3B524" },
  sage: { bg: "#E8EFE2", fg: "#47613A", solid: "#7E9E6B" },
  slate: { bg: "#E9ECF1", fg: "#3B4558", solid: "#6B7A93" },
};

export function EmailLayout({ preview, title, appUrl, children }: { preview: string; title: string; appUrl: string; children: React.ReactNode }) {
  return (
    <Html lang="tr">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={page}>
        <Container style={card}>
          <Text style={{ fontSize: "13px", color: "#6b6b73", margin: 0 }}>ideavellum</Text>
          <Heading as="h1" style={{ fontSize: "22px", fontWeight: 600, margin: "6px 0 18px" }}>{title}</Heading>
          {children}
          <Hr style={{ borderColor: "#e4e4df", margin: "24px 0 16px" }} />
          <Section>
            <Link href={`${appUrl}/bugun`} style={{ backgroundColor: "#4f46e5", color: "#fff", borderRadius: "8px", padding: "10px 16px", fontSize: "14px", fontWeight: 500, textDecoration: "none" }}>
              Bugün ekranını aç
            </Link>
          </Section>
          <Text style={{ fontSize: "12px", color: "#8e8e95", marginTop: "18px" }}>Bu e-postaları Ayarlar → Bildirim kanalları bölümünden kapatabilirsin.</Text>
        </Container>
      </Body>
    </Html>
  );
}

export function Row({ color, title, meta }: { color?: string; title: string; meta?: string }) {
  const c = color ? COURSE_HEX[color] : undefined;
  return (
    <Section style={{ backgroundColor: c?.bg ?? "#eeeeea", borderLeft: `3px solid ${c?.solid ?? "#d6d6d0"}`, borderRadius: "8px", padding: "10px 12px", marginBottom: "8px" }}>
      <Text style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: c?.fg ?? "#1d1d21" }}>{title}</Text>
      {meta && <Text style={{ margin: "2px 0 0", fontSize: "12px", color: c?.fg ?? "#6b6b73", opacity: 0.85 }}>{meta}</Text>}
    </Section>
  );
}
