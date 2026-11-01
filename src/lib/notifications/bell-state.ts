"use client";

import { create } from "zustand";

import { playBell, unlockBells } from "./bell-sounds";
import type { BellSound } from "@/lib/data/types";

type BellState = { enabled: boolean; enable: (sound: BellSound, volume: number) => Promise<boolean> };

/** Zil sesleri bu oturumda etkin mi? (Tarayıcı ilk tıklamadan önce ses çalmaya izin vermez.) */
export const useBellState = create<BellState>()((set) => ({
  enabled: false,
  enable: async (sound, volume) => {
    const ok = await unlockBells();
    if (ok) {
      await playBell(sound, volume);
      set({ enabled: true });
    }
    return ok;
  },
}));
