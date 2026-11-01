export const DAY_START = 7 * 60; // 07:00
export const DAY_END = 24 * 60; // 24:00
export const HOUR_PX = 56;
export const SNAP = 15; // dakika
export const PX_PER_MIN = HOUR_PX / 60;

export const minToPx = (min: number) => (min - DAY_START) * PX_PER_MIN;
export const snap = (min: number) => Math.round(min / SNAP) * SNAP;
export const clampMin = (min: number, duration = 0) => Math.max(DAY_START, Math.min(DAY_END - duration, min));
