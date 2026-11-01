"use client";

import type { BellSound } from "@/lib/data/types";

/**
 * Zil sesleri tarayıcıda Web Audio ile üretilir (ses dosyası indirmeye gerek yok, her yerde aynı duyulur).
 * Tarayıcılar kullanıcı tıklamadan ses çalmaya izin vermediği için önce unlockBells() bir tıklamayla çağrılmalı.
 */
let ctx: AudioContext | null = null;

export function bellsUnlocked() {
  return !!ctx && ctx.state === "running";
}

export async function unlockBells() {
  try {
    ctx ??= new AudioContext();
    if (ctx.state !== "running") await ctx.resume();
    return ctx.state === "running";
  } catch {
    return false;
  }
}

function strike(at: number, freq: number, duration: number, gain: number, partials: [number, number][] = [[1, 1]]) {
  if (!ctx) return;
  const out = ctx.createGain();
  out.gain.setValueAtTime(0.0001, at);
  out.gain.exponentialRampToValueAtTime(gain, at + 0.01);
  out.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  out.connect(ctx.destination);
  partials.forEach(([ratio, amp]) => {
    const osc = ctx!.createOscillator();
    const g = ctx!.createGain();
    osc.type = "sine";
    osc.frequency.value = freq * ratio;
    g.gain.value = amp;
    osc.connect(g).connect(out);
    osc.start(at);
    osc.stop(at + duration + 0.05);
  });
}

const BELL_PARTIALS: [number, number][] = [[1, 1], [2.0, 0.35], [2.76, 0.22], [5.4, 0.08]];

export const BELL_SOUNDS: { id: BellSound; label: string }[] = [
  { id: "bell-soft", label: "Yumuşak zil" },
  { id: "bell-classic", label: "Klasik okul zili" },
  { id: "chime", label: "Çan sesi" },
];

export async function playBell(sound: BellSound, volume = 0.6) {
  if (!(await unlockBells()) || !ctx) return false;
  const t = ctx.currentTime + 0.02;
  const v = Math.max(0.02, Math.min(1, volume)) * 0.5;
  if (sound === "bell-soft") {
    strike(t, 784, 2.2, v, BELL_PARTIALS);
  } else if (sound === "bell-classic") {
    for (let i = 0; i < 6; i++) strike(t + i * 0.16, i % 2 ? 1046 : 988, 0.5, v * 0.8, BELL_PARTIALS);
  } else {
    [1047, 1319, 1568, 2093].forEach((f, i) => strike(t + i * 0.18, f, 1.6, v * 0.7, [[1, 1], [2, 0.2]]));
  }
  return true;
}
