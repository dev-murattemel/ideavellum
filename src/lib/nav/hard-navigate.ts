/** Veri katmanının baştan kurulması gereken geçişler için tam sayfa yükleme (ör. saklama yeri değişince). */
export function hardNavigate(href: string) {
  window.location.assign(href);
}
