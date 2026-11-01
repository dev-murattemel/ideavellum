"use client";

import * as React from "react";

import { useProfile } from "@/lib/data/hooks";
import { zonedNow } from "@/lib/time";

/** Kullanıcı saat dilimindeki "şimdi"; varsayılan olarak 30 sn'de bir tazelenir. */
export function useNow(intervalMs = 30_000) {
  const tz = useProfile().timezone;
  const [now, setNow] = React.useState(() => zonedNow(tz));
  React.useEffect(() => {
    const t = setInterval(() => setNow(zonedNow(tz)), intervalMs);
    return () => clearInterval(t);
  }, [tz, intervalMs]);
  return now;
}
