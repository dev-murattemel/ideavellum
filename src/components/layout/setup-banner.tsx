import { Info } from "lucide-react";

/** Supabase anahtarları girilmeden çalışırken içeriğin üstünde görünen ince uyarı. */
export function SetupBanner() {
  return (
    <div
      role="status"
      data-course="butter"
      className="mb-6 flex items-start gap-2.5 rounded-lg bg-course px-3 py-2.5 text-13 text-course-fg md:items-center"
    >
      <Info className="mt-px size-4 shrink-0 md:mt-0" aria-hidden />
      <p className="min-w-0">
        <span className="font-medium">Kurulum modu:</span> Supabase henüz bağlı değil; giriş kapalı ve
        hiçbir şey kaydedilmez.
      </p>
    </div>
  );
}
