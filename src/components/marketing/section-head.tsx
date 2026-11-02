/** Bölüm başlığı: büyük başlık ve kısa açıklama, ortalı */
export function SectionHead({ title, lead, id }: { title: string; lead?: string; id?: string }) {
  return (
    <div className="mx-auto flex max-w-[680px] flex-col items-center gap-3 text-center">
      <h2 id={id} className="text-[28px] leading-tight font-semibold tracking-[-0.025em] text-balance sm:text-[36px]">
        {title}
      </h2>
      {lead && <p className="text-base text-pretty text-ink-muted">{lead}</p>}
    </div>
  );
}
