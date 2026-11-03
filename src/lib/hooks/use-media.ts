"use client";

import * as React from "react";

/** CSS medya sorgusunu izler: useMedia("(min-width: 768px)") */
export function useMedia(query: string) {
  return React.useSyncExternalStore(
    (cb) => {
      const m = matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => matchMedia(query).matches,
    () => false,
  );
}
