-- ============================================================
-- Pixxiesx · Desarrollo creativo
-- Pega todo este archivo en Supabase → SQL Editor → Run.
-- Se puede correr más de una vez sin dañar datos.
-- ============================================================

-- ---------- Perfiles y roles ----------
create table if not exists public.perfiles (
  id      uuid primary key references auth.users(id) on delete cascade,
  nombre  text not null default '',
  email   text not null default '',
  rol     text not null default 'contenido' check (rol in ('admin','contenido')),
  creado  timestamptz not null default now()
);

create or replace function public.es_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin');
$$;

-- Cada usuario nuevo recibe un perfil. El primero que se crea queda como admin.
create or replace function public.nuevo_usuario() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfiles (id, nombre, email, rol)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'nombre',''), split_part(new.email,'@',1)),
    coalesce(new.email,''),
    case when exists (select 1 from public.perfiles where rol = 'admin') then 'contenido' else 'admin' end
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario after insert on auth.users
  for each row execute function public.nuevo_usuario();

-- Un usuario de contenido no puede subirse a admin a sí mismo.
create or replace function public.proteger_rol() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.rol is distinct from old.rol and not public.es_admin() then
    raise exception 'Solo un admin puede cambiar roles';
  end if;
  if new.rol <> 'admin' and old.rol = 'admin'
     and (select count(*) from public.perfiles where rol = 'admin') <= 1 then
    raise exception 'Debe quedar al menos un admin';
  end if;
  return new;
end $$;
drop trigger if exists proteger_rol on public.perfiles;
create trigger proteger_rol before update on public.perfiles
  for each row execute function public.proteger_rol();

-- ---------- Creativos (lo que ve todo el equipo) ----------
create table if not exists public.creativos (
  id             uuid primary key default gen_random_uuid(),
  ejemplo        boolean not null default false,
  nombre         text not null default '',
  categoria      text not null default 'Gafas de sol',
  etapa          text not null default 'TOFU' check (etapa in ('TOFU','MOFU','BOFU')),
  formato        text not null default 'UGC',
  estado         text not null default 'Idea',
  producto       text not null default '',
  angulo         text not null default '',
  insight        text not null default '',
  fecha          date,
  responsable    uuid references public.perfiles(id) on delete set null,
  refs           jsonb not null default '[]',
  hook           text not null default '',
  mensaje        text not null default '',
  cta            text not null default '',
  escenas        jsonb not null default '[]',
  recursos       text not null default '',
  copy_principal text not null default '',
  copy_titulo    text not null default '',
  copy_desc      text not null default '',
  brief          jsonb not null default '{}',
  brief_token    text not null unique default replace(gen_random_uuid()::text,'-',''),
  brief_activo   boolean not null default false,
  creado_por     uuid default auth.uid(),
  creado         timestamptz not null default now(),
  actualizado    timestamptz not null default now()
);
create index if not exists creativos_responsable on public.creativos(responsable);

-- ---------- Pauta y resultados (solo admin) ----------
create table if not exists public.pauta (
  creativo_id  uuid primary key references public.creativos(id) on delete cascade,
  campana      text not null default '',
  campana_id   text not null default '',
  conjunto     text not null default '',
  conjunto_id  text not null default '',
  anuncio      text not null default '',
  anuncio_id   text not null default '',
  ventanas     jsonb not null default '{}',
  ctr          text not null default '',
  clasif       text not null default '',
  elementos    jsonb not null default '[]',
  aprendizaje  text not null default '',
  actualizado  timestamptz not null default now()
);

-- ---------- Banco de referentes ----------
create table if not exists public.banco (
  id          uuid primary key default gen_random_uuid(),
  ejemplo     boolean not null default false,
  plataforma  text not null default 'Meta Ad Library',
  url         text not null default '',
  categoria   text not null default '',
  etapa       text not null default '',
  formato     text not null default '',
  nota        text not null default '',
  media       text not null default '',
  media_type  text not null default '',
  creado_por  uuid default auth.uid(),
  creado      timestamptz not null default now()
);

-- ---------- Configuración (una sola fila) ----------
create table if not exists public.config (
  id          int primary key default 1 check (id = 1),
  meta_cpa    numeric not null default 35000,
  meta_roas   numeric not null default 3,
  min_compras int not null default 3,
  brief_base  jsonb not null default '{}'
);
insert into public.config (id) values (1) on conflict (id) do nothing;

-- ---------- Fecha de actualización automática ----------
create or replace function public.tocar() returns trigger language plpgsql as $$
begin new.actualizado = now(); return new; end $$;
drop trigger if exists tocar_creativos on public.creativos;
create trigger tocar_creativos before update on public.creativos for each row execute function public.tocar();
drop trigger if exists tocar_pauta on public.pauta;
create trigger tocar_pauta before update on public.pauta for each row execute function public.tocar();

-- ---------- Permisos (Row Level Security) ----------
alter table public.perfiles  enable row level security;
alter table public.creativos enable row level security;
alter table public.pauta     enable row level security;
alter table public.banco     enable row level security;
alter table public.config    enable row level security;

drop policy if exists "perfiles_ver"      on public.perfiles;
drop policy if exists "perfiles_editar"   on public.perfiles;
create policy "perfiles_ver"    on public.perfiles for select to authenticated using (true);
create policy "perfiles_editar" on public.perfiles for update to authenticated
  using (id = auth.uid() or public.es_admin()) with check (id = auth.uid() or public.es_admin());

drop policy if exists "creativos_ver"     on public.creativos;
drop policy if exists "creativos_crear"   on public.creativos;
drop policy if exists "creativos_editar"  on public.creativos;
drop policy if exists "creativos_borrar"  on public.creativos;
create policy "creativos_ver"    on public.creativos for select to authenticated using (true);
create policy "creativos_crear"  on public.creativos for insert to authenticated with check (true);
create policy "creativos_editar" on public.creativos for update to authenticated using (true) with check (true);
create policy "creativos_borrar" on public.creativos for delete to authenticated using (public.es_admin());

drop policy if exists "pauta_admin" on public.pauta;
create policy "pauta_admin" on public.pauta for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

drop policy if exists "banco_ver"    on public.banco;
drop policy if exists "banco_crear"  on public.banco;
drop policy if exists "banco_editar" on public.banco;
drop policy if exists "banco_borrar" on public.banco;
create policy "banco_ver"    on public.banco for select to authenticated using (true);
create policy "banco_crear"  on public.banco for insert to authenticated with check (true);
create policy "banco_editar" on public.banco for update to authenticated using (true) with check (true);
create policy "banco_borrar" on public.banco for delete to authenticated using (public.es_admin());

drop policy if exists "config_ver"    on public.config;
drop policy if exists "config_editar" on public.config;
create policy "config_ver"    on public.config for select to authenticated using (true);
create policy "config_editar" on public.config for update to authenticated
  using (public.es_admin()) with check (public.es_admin());

grant select, insert, update, delete on public.perfiles, public.creativos, public.pauta, public.banco, public.config to authenticated;
revoke all on public.perfiles, public.creativos, public.pauta, public.banco, public.config from anon;

-- ---------- Brief público para creadores (sin usuario) ----------
-- Solo devuelve la parte creativa de un brief activo. Nunca pauta ni números.
create or replace function public.ver_brief(t text) returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'nombre', c.nombre, 'categoria', c.categoria, 'formato', c.formato, 'producto', c.producto,
    'angulo', c.angulo, 'hook', c.hook, 'mensaje', c.mensaje, 'cta', c.cta,
    'escenas', c.escenas, 'refs', c.refs, 'recursos', c.recursos, 'brief', c.brief,
    'actualizado', c.actualizado
  )
  from public.creativos c
  where c.brief_token = t and c.brief_activo
  limit 1;
$$;
revoke all on function public.ver_brief(text) from public;
grant execute on function public.ver_brief(text) to anon, authenticated;

-- ---------- Archivos (imágenes y videos de referentes) ----------
insert into storage.buckets (id, name, public)
values ('archivos', 'archivos', true)
on conflict (id) do update set public = true;

drop policy if exists "archivos_subir"  on storage.objects;
drop policy if exists "archivos_editar" on storage.objects;
drop policy if exists "archivos_borrar" on storage.objects;
create policy "archivos_subir"  on storage.objects for insert to authenticated with check (bucket_id = 'archivos');
create policy "archivos_editar" on storage.objects for update to authenticated using (bucket_id = 'archivos');
create policy "archivos_borrar" on storage.objects for delete to authenticated using (bucket_id = 'archivos' and public.es_admin());
