"use client";

import { PageHeader } from "@/components/layout/page-header";
import { AiSection } from "./ai-section";
import { BellSection } from "./bell-section";
import { ChannelsSection } from "./channels-section";
import { DataSection } from "./data-section";
import { EmailSection } from "./email-section";
import { ProfileSection } from "./profile-section";
import { PushSection } from "./push-section";

export function SettingsView() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Ayarlar" description="Profil, görünüm, zil ve bildirim tercihlerin." />
      <div className="rounded-xl border border-line bg-surface px-5 py-8 md:px-8">
        <ProfileSection />
        <BellSection />
        <ChannelsSection />
        <PushSection />
        <EmailSection />
        <AiSection />
        <DataSection />
      </div>
    </div>
  );
}
