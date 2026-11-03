-- Yapışkan not aktarılınca panoda kalır; nereye aktarıldığı bağlantı olarak tutulur.
alter table public.sticky_notes
  add column task_id uuid references public.tasks on delete set null,
  add column note_id uuid references public.notes on delete set null,
  add column journal_date date;
-- Eski davranışla aktarılıp arşivlenen notlar panoya geri döner
update public.sticky_notes set archived_at = null where converted_to is not null;
create index if not exists sticky_notes_task_id_idx on public.sticky_notes (task_id);
create index if not exists sticky_notes_note_id_idx on public.sticky_notes (note_id);
