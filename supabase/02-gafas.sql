-- ============================================================
-- Actualización: gafas de Shopify en cada creativo.
-- Pega este archivo en Supabase → SQL Editor → Run (una sola vez).
-- Se puede correr de nuevo sin dañar nada.
-- ============================================================

alter table public.creativos add column if not exists productos jsonb not null default '[]';

-- El brief público ahora también muestra las gafas elegidas.
create or replace function public.ver_brief(t text) returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'nombre', c.nombre, 'categoria', c.categoria, 'formato', c.formato, 'producto', c.producto,
    'angulo', c.angulo, 'hook', c.hook, 'mensaje', c.mensaje, 'cta', c.cta,
    'escenas', c.escenas, 'refs', c.refs, 'recursos', c.recursos, 'brief', c.brief,
    'productos', c.productos, 'actualizado', c.actualizado
  )
  from public.creativos c
  where c.brief_token = t and c.brief_activo
  limit 1;
$$;
revoke all on function public.ver_brief(text) from public;
grant execute on function public.ver_brief(text) to anon, authenticated;
