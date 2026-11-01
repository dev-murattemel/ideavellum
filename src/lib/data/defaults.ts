import type { BellSettings, NotificationPrefs, Profile } from "./types";

export const DEFAULT_BELL: BellSettings = {
  before_minutes: 5,
  start_bell: true,
  end_bell: true,
  sound: "bell-soft",
  volume: 0.6,
  quiet_hours: { enabled: true, from: "23:00", to: "07:00" },
};

const on = { in_app: true, push: true, email: false };

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  channels: {
    bell: { ...on },
    task_due: { ...on },
    overdue: { in_app: true, push: false, email: true },
    daily_digest: { in_app: false, push: false, email: true },
    weekly_report: { in_app: false, push: false, email: true },
  },
  daily_digest_time: "07:30",
  weekly_report: { weekday: 7, time: "20:00" },
};

export function defaultProfile(id: string, email: string | null = null): Profile {
  return {
    id,
    full_name: null,
    email,
    timezone: "Europe/Istanbul",
    locale: "tr",
    bell_settings: DEFAULT_BELL,
    notification_prefs: DEFAULT_NOTIFICATION_PREFS,
    ai_enabled: false,
  };
}

export const LOCAL_USER_ID = "00000000-0000-4000-8000-000000000001";
