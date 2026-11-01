import { Cloud } from "lucide-react";

import { SettingsSection } from "./settings-section";

/** Cihaz modunda sunucu gerektiren özellikler için kısa açıklama */
export function DeviceOnlyNote({ title }: { title: string }) {
  return (
    <SettingsSection title={title} description="Sunucu üzerinden gönderildiği için bulut hesabı gerektirir.">
      <p className="flex items-start gap-2 rounded-lg bg-sunken/60 p-3 text-13 text-ink-muted">
        <Cloud className="mt-0.5 size-4 shrink-0" aria-hidden />
        Verilerin yalnızca bu cihazda olduğu için bu özellik kapalı. Uygulama açıkken çalan zil çalışmaya devam eder. Kullanmak istersen yukarıdaki “Buluta taşı” ile hesabına geçebilirsin.
      </p>
    </SettingsSection>
  );
}
