-- ============================================================
-- Actualización: medidor de espacio usado (solo para admin).
-- Pega este archivo en Supabase → SQL Editor → Run (una sola vez).
-- ============================================================

create or replace function public.uso_espacio() returns json
language sql stable security definer set search_path = public, storage as $$
  select case when public.es_admin() then json_build_object(
    'archivos', (select coalesce(sum((o.metadata->>'size')::bigint), 0) from storage.objects o where o.bucket_id = 'archivos'),
    'cantidad', (select count(*) from storage.objects o where o.bucket_id = 'archivos'),
    'videos',   (select count(*) from storage.objects o where o.bucket_id = 'archivos' and o.metadata->>'mimetype' like 'video/%'),
    'base',     pg_database_size(current_database())
  ) end;
$$;
revoke all on function public.uso_espacio() from public;
grant execute on function public.uso_espacio() to authenticated;
