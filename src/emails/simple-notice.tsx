import { Text } from "@react-email/components";

import { EmailLayout } from "./layout";

/** Zil ve görev hatırlatmaları için sade e-posta */
export default function SimpleNotice({ appUrl, title, body }: { appUrl: string; title: string; body?: string | null }) {
  return (
    <EmailLayout appUrl={appUrl} preview={body ?? title} title={title}>
      {body && <Text style={{ fontSize: "15px", margin: 0 }}>{body}</Text>}
    </EmailLayout>
  );
}
