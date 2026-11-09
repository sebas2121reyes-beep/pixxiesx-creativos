-- ============================================================
-- Actualización: paquetes de briefs por creador (un link, varios videos).
-- Pega este archivo en Supabase → SQL Editor → Run (una sola vez).
-- Se puede correr de nuevo sin dañar nada.
-- ============================================================

create table if not exists public.paquetes (
  id          uuid primary key default gen_random_uuid(),
  creador     text not null default '',
  titulo      text not null default '',
  contacto    text not null default '',
  entrega     date,
  notas       text not null default '',
  creativos   jsonb not null default '[]',
  token       text not null unique default replace(gen_random_uuid()::text,'-',''),
  activo      boolean not null default true,
  creado_por  uuid default auth.uid(),
  creado      timestamptz not null default now(),
  actualizado timestamptz not null default now()
);

drop trigger if exists tocar_paquetes on public.paquetes;
create trigger tocar_paquetes before update on public.paquetes for each row execute function public.tocar();

alter table public.paquetes enable row level security;
drop policy if exists "paquetes_ver"    on public.paquetes;
drop policy if exists "paquetes_crear"  on public.paquetes;
drop policy if exists "paquetes_editar" on public.paquetes;
drop policy if exists "paquetes_borrar" on public.paquetes;
create policy "paquetes_ver"    on public.paquetes for select to authenticated using (true);
create policy "paquetes_crear"  on public.paquetes for insert to authenticated with check (true);
create policy "paquetes_editar" on public.paquetes for update to authenticated using (true) with check (true);
create policy "paquetes_borrar" on public.paquetes for delete to authenticated using (public.es_admin());
grant select, insert, update, delete on public.paquetes to authenticated;
revoke all on public.paquetes from anon;

-- Página pública del paquete: solo la parte creativa de cada video, en el orden elegido.
create or replace function public.ver_paquete(t text) returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'creador', p.creador, 'titulo', p.titulo, 'entrega', p.entrega, 'notas', p.notas,
    'actualizado', p.actualizado,
    'creativos', coalesce((
      select json_agg(json_build_object(
        'nombre', c.nombre, 'categoria', c.categoria, 'formato', c.formato, 'producto', c.producto,
        'angulo', c.angulo, 'hook', c.hook, 'mensaje', c.mensaje, 'cta', c.cta,
        'escenas', c.escenas, 'refs', c.refs, 'recursos', c.recursos, 'brief', c.brief,
        'productos', c.productos, 'actualizado', c.actualizado
      ) order by x.orden)
      from jsonb_array_elements_text(p.creativos) with ordinality as x(cid, orden)
      join public.creativos c on c.id::text = x.cid
    ), '[]'::json)
  )
  from public.paquetes p
  where p.token = t and p.activo
  limit 1;
$$;
revoke all on function public.ver_paquete(text) from public;
grant execute on function public.ver_paquete(text) to anon, authenticated;
