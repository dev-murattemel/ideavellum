import { headers } from "next/headers";

export type Lang = "en" | "tr";

/**
 * Tanıtım sayfalarının dili: önce adresteki ?lang=, sonra tarayıcı dili.
 * Varsayılan İngilizce; tarayıcısı Türkçe olan ziyaretçi Türkçe görür.
 */
export async function resolveLang(param: string | string[] | undefined): Promise<Lang> {
  const p = Array.isArray(param) ? param[0] : param;
  if (p === "en" || p === "tr") return p;
  const accept = (await headers()).get("accept-language") ?? "";
  return /^\s*tr\b/i.test(accept) ? "tr" : "en";
}

/** Dil seçimini bağlantılarda korur: /privacy → /privacy?lang=tr */
export const withLang = (href: string, lang: Lang) => {
  const [path, hash] = href.split("#");
  const url = `${path}${path.includes("?") ? "&" : "?"}lang=${lang}`;
  return hash !== undefined ? `${url}#${hash}` : url;
};
