"use client";

import { Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TimeSelect } from "@/components/ui/time-select";
import { useProfile } from "@/lib/data/hooks";
import { data } from "@/lib/data/store";
import type { BellSettings, BellSound } from "@/lib/data/types";
import { BELL_SOUNDS, playBell } from "@/lib/notifications/bell-sounds";
import { SettingsRow, SettingsSection } from "./settings-section";
import { useBellState } from "@/lib/notifications/bell-state";
import { toast } from "sonner";

function BellUnlock() {
  const { enabled, enable } = useBellState();
  const s = useProfile().bell_settings;
  if (enabled) return <span className="text-13 text-ink-muted">Açık</span>;
  return (
    <Button size="sm" onClick={async () => {
      const ok = await enable(s.sound, s.volume);
      toast[ok ? "success" : "error"](ok ? "Zil sesleri açık" : "Bu tarayıcı ses çalmaya izin vermedi");
    }}>
      Zil seslerini aç
    </Button>
  );
}

export function BellSection() {
  const s = useProfile().bell_settings;
  const set = (patch: Partial<BellSettings>) => data().updateProfile({ bell_settings: { ...s, ...patch } });

  return (
    <SettingsSection title="Zil" description="Başlamadan önce uyarı, başlangıç ve bitiş zili. Bir saate özel ayar o saatin penceresinden yapılır.">
      <div className="flex flex-col divide-y divide-line">
        <SettingsRow label="Zil sesleri" hint="Tarayıcılar sesi ancak bir tıklamadan sonra çalmaya izin verir.">
          <BellUnlock />
        </SettingsRow>
        <SettingsRow label="Başlamadan önce uyarı">
          <Select value={String(s.before_minutes)} onValueChange={(v) => set({ before_minutes: Number(v) })}>
            <SelectTrigger size="sm" className="w-40" aria-label="Başlamadan önce uyarı"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Kapalı</SelectItem>
              {[5, 10, 15, 30].map((m) => <SelectItem key={m} value={String(m)}>{m} dk önce</SelectItem>)}
            </SelectContent>
          </Select>
        </SettingsRow>
        <SettingsRow label="Başlangıç zili"><Switch checked={s.start_bell} onCheckedChange={(v) => set({ start_bell: v })} aria-label="Başlangıç zili" /></SettingsRow>
        <SettingsRow label="Bitiş zili" hint="Teneffüs hatırlatması"><Switch checked={s.end_bell} onCheckedChange={(v) => set({ end_bell: v })} aria-label="Bitiş zili" /></SettingsRow>
        <SettingsRow label="Ses">
          <span className="flex items-center gap-2">
            <Select value={s.sound} onValueChange={(v) => { set({ sound: v as BellSound }); void playBell(v as BellSound, s.volume); }}>
              <SelectTrigger size="sm" className="w-44" aria-label="Zil sesi"><SelectValue /></SelectTrigger>
              <SelectContent>{BELL_SOUNDS.map((b) => <SelectItem key={b.id} value={b.id}>{b.label}</SelectItem>)}</SelectContent>
            </Select>
            <Button variant="secondary" size="icon-sm" aria-label="Sesi dinle" onClick={() => playBell(s.sound, s.volume)}><Play /></Button>
          </span>
        </SettingsRow>
        <SettingsRow label="Ses düzeyi">
          <input
            type="range" min={0.1} max={1} step={0.1} value={s.volume}
            onChange={(e) => set({ volume: Number(e.target.value) })}
            onPointerUp={() => playBell(s.sound, s.volume)}
            aria-label="Ses düzeyi"
            className="w-44 accent-[var(--accent)]"
          />
        </SettingsRow>
        <SettingsRow label="Sessiz saatler" hint="Bu aralıkta ses çalmaz; telefon ve e-posta gönderilmez, uygulama içinde kayıt tutulur.">
          <span className="flex flex-wrap items-center gap-2">
            <Switch checked={s.quiet_hours.enabled} onCheckedChange={(v) => set({ quiet_hours: { ...s.quiet_hours, enabled: v } })} aria-label="Sessiz saatler" />
            {s.quiet_hours.enabled && (
              <>
                <span className="w-28"><TimeSelect label="Başlangıç" from={0} to={23 * 60 + 30} step={30} value={s.quiet_hours.from} onChange={(v) => set({ quiet_hours: { ...s.quiet_hours, from: v } })} /></span>
                <span className="text-ink-muted">–</span>
                <span className="w-28"><TimeSelect label="Bitiş" from={0} to={23 * 60 + 30} step={30} value={s.quiet_hours.to} onChange={(v) => set({ quiet_hours: { ...s.quiet_hours, to: v } })} /></span>
              </>
            )}
          </span>
        </SettingsRow>
      </div>
    </SettingsSection>
  );
}
