-- handle_new_user yalnızca auth.users tetikleyicisinden çalışmalı; API üzerinden çağrılamasın.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
