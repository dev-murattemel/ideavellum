import type { CatalogGroup } from "./types";

const NAMES = "Fâtiha,Bakara,Âl-i İmrân,Nisâ,Mâide,En'âm,A'râf,Enfâl,Tevbe,Yûnus,Hûd,Yûsuf,Ra'd,İbrâhîm,Hicr,Nahl,İsrâ,Kehf,Meryem,Tâhâ,Enbiyâ,Hac,Mü'minûn,Nûr,Furkân,Şuarâ,Neml,Kasas,Ankebût,Rûm,Lokmân,Secde,Ahzâb,Sebe',Fâtır,Yâsîn,Sâffât,Sâd,Zümer,Mü'min,Fussilet,Şûrâ,Zuhruf,Duhân,Câsiye,Ahkâf,Muhammed,Fetih,Hucurât,Kâf,Zâriyât,Tûr,Necm,Kamer,Rahmân,Vâkıa,Hadîd,Mücâdele,Haşr,Mümtehine,Saff,Cuma,Münâfikûn,Teğâbün,Talâk,Tahrîm,Mülk,Kalem,Hâkka,Meâric,Nûh,Cin,Müzzemmil,Müddessir,Kıyâme,İnsân,Mürselât,Nebe',Nâziât,Abese,Tekvîr,İnfitâr,Mutaffifîn,İnşikâk,Bürûc,Târık,A'lâ,Gâşiye,Fecr,Beled,Şems,Leyl,Duhâ,İnşirâh,Tîn,Alak,Kadr,Beyyine,Zilzâl,Âdiyât,Kâria,Tekâsür,Asr,Hümeze,Fîl,Kureyş,Mâûn,Kevser,Kâfirûn,Nasr,Tebbet,İhlâs,Felak,Nâs".split(",");

/** Kuran sureleri (sırasıyla); okunan bölüm sayfa ya da ayet olarak yazılır */
export const SURAHS: CatalogGroup[] = [
  { name: "Sureler", metric: "amount", unit: "sayfa", items: NAMES.map((n, i) => `${i + 1}. ${n}`) },
  { name: "Diğer", metric: "amount", unit: "sayfa", items: ["Cüz okuma", "Meal okuma", "Tefsir", "Ezber tekrarı", "Dua"] },
];
