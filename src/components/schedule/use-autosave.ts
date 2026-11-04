import * as React from "react";

/** Yazdıkça kısa gecikmeyle kaydeder; panel kapanırken bekleyeni hemen yazar */
export function useAutosave<T>(value: T, save: (v: T) => void) {
  const latest = React.useRef({ value, save, dirty: false });
  React.useEffect(() => {
    latest.current = { value, save, dirty: latest.current.dirty };
  });
  React.useEffect(() => () => {
    if (latest.current.dirty) latest.current.save(latest.current.value);
  }, []);
  React.useEffect(() => {
    if (!latest.current.dirty) return;
    const t = setTimeout(() => {
      latest.current.dirty = false;
      latest.current.save(latest.current.value);
    }, 500);
    return () => clearTimeout(t);
  }, [value]);
  return () => {
    latest.current.dirty = true;
  };
}
