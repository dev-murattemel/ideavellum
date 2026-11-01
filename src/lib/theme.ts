export type ThemePreference = "light" | "dark" | "system";
export const THEME_STORAGE_KEY = "ideavellum-theme";

/** <head> içine gömülen küçük betik: sayfa çizilmeden önce doğru temayı seçer (beyaz parlama olmaz). */
export const themeInitScript = `(function(){try{var p=localStorage.getItem("${THEME_STORAGE_KEY}")||"system";var d=p==="dark"||(p==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

export function applyTheme(pref: ThemePreference) {
  localStorage.setItem(THEME_STORAGE_KEY, pref);
  const dark =
    pref === "dark" || (pref === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function readTheme(): ThemePreference {
  const v = localStorage.getItem(THEME_STORAGE_KEY);
  return v === "light" || v === "dark" ? v : "system";
}
