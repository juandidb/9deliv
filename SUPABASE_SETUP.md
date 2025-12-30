# Supabase setup (9delivery)

Esta app puede funcionar en modo local (localStorage) o en modo Supabase (multiusuario + base de datos + fotos).

## 1) Crear proyecto
- Crear un proyecto en https://supabase.com

## 2) Variables de entorno
1. Copiá `.env.example` a `.env`.
2. En Supabase → Project Settings → API:
   - Pegá `Project URL` en `VITE_SUPABASE_URL`
   - Pegá `anon public` en `VITE_SUPABASE_ANON_KEY`

Luego reiniciá `npm run dev`.

## 3) Crear tablas (SQL)
En Supabase → SQL Editor, ejecutar:

```sql
create table if not exists public.restaurants (
  id text primary key,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text not null default '',
  address text not null default '',
  hours text not null default '',
  categories text[] not null default '{}'::text[],
  image text not null default ''
);

create table if not exists public.menu_items (
  id text primary key,
  restaurant_id text not null references public.restaurants(id) on delete cascade,
  name text not null,
  price numeric not null default 0,
  description text not null default '',
  available boolean not null default true,
  category text not null default 'Otros',
  image text
);

create index if not exists menu_items_restaurant_id_idx on public.menu_items(restaurant_id);
```

## 4) Storage bucket para imágenes
En Supabase → Storage:
- Crear bucket: `menu-images`
- Public: ON (para que el cliente pueda renderizar las imágenes sin backend)

## 5) RLS (recomendado)
Activar Row Level Security (RLS) y políticas para que cada restaurante sólo edite lo suyo.

```sql
alter table public.restaurants enable row level security;
alter table public.menu_items enable row level security;

-- Restaurants: leer público
create policy "restaurants_public_read" on public.restaurants
for select
to anon, authenticated
using (true);

-- Restaurants: escribir sólo dueño
create policy "restaurants_owner_write" on public.restaurants
for all
to authenticated
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

-- MenuItems: leer público
create policy "menu_items_public_read" on public.menu_items
for select
to anon, authenticated
using (true);

-- MenuItems: escribir sólo si el usuario es dueño del restaurant
create policy "menu_items_owner_write" on public.menu_items
for all
to authenticated
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = menu_items.restaurant_id
      and r.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.restaurants r
    where r.id = menu_items.restaurant_id
      and r.owner_user_id = auth.uid()
  )
);
```

## 5.1) Rol admin (opcional)
Si querés que 1 usuario admin pueda editar/eliminar cualquier restaurante (además del dueño), creá una tabla simple `admins` y agregá políticas extra.

```sql
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.admins enable row level security;

-- Sólo un admin puede verse a sí mismo (suficiente para checks de policies)
create policy "admins_self_read" on public.admins
for select
to authenticated
using (auth.uid() = user_id);

-- Helper: ¿es admin?
-- (lo repetimos inline en policies para mantenerlo simple)

-- Restaurants: admin puede escribir cualquiera
create policy "restaurants_admin_write" on public.restaurants
for all
to authenticated
using (
  exists (select 1 from public.admins a where a.user_id = auth.uid())
)
with check (
  exists (select 1 from public.admins a where a.user_id = auth.uid())
);

-- MenuItems: admin puede escribir cualquiera
create policy "menu_items_admin_write" on public.menu_items
for all
to authenticated
using (
  exists (select 1 from public.admins a where a.user_id = auth.uid())
)
with check (
  exists (select 1 from public.admins a where a.user_id = auth.uid())
);
```

Para marcar un usuario como admin:

```sql
-- Encontrar el user_id por email
select id from auth.users where email = 'tu-admin@email.com';

-- Insertar como admin
insert into public.admins (user_id)
values ('<uuid-de-auth.users.id>')
on conflict do nothing;
```

En la app, agregá el email al `.env`:
- `VITE_ADMIN_EMAILS=tu-admin@email.com,otro@email.com`

> Importante: el check de admin en el front es sólo para UX; lo que habilita editar/borrar con seguridad es la policy de RLS.

> Nota: este setup deja el catálogo público y bloquea edición para no-dueños.

## 5.2) Storage policies (recomendado)
Si vas a subir imágenes desde `/admin`, necesitás policies para `storage.objects` (aunque el bucket sea público para lectura).

La app sube imágenes a rutas como:
- `restaurants/<restaurantId>/cover.<ext>`
- `restaurants/<restaurantId>/menu/<itemId>.<ext>`

En Supabase → SQL Editor, ejecutar:

```sql
alter table storage.objects enable row level security;

-- Lectura pública de objetos del bucket
create policy "menu_images_public_read" on storage.objects
for select
to anon, authenticated
using (bucket_id = 'menu-images');

-- Escribir (insert/update/delete) si soy dueño del restaurante o admin
create policy "menu_images_owner_or_admin_write" on storage.objects
for all
to authenticated
using (
  bucket_id = 'menu-images'
  and (
    exists (select 1 from public.admins a where a.user_id = auth.uid())
    or exists (
      select 1
      from public.restaurants r
      where r.id = split_part(name, '/', 2)
        and r.owner_user_id = auth.uid()
    )
  )
)
with check (
  bucket_id = 'menu-images'
  and (
    exists (select 1 from public.admins a where a.user_id = auth.uid())
    or exists (
      select 1
      from public.restaurants r
      where r.id = split_part(name, '/', 2)
        and r.owner_user_id = auth.uid()
    )
  )
);
```

> Nota: `split_part(name, '/', 2)` asume que el path siempre empieza con `restaurants/<restaurantId>/...`.

## 6) Uso
- Abrí `/admin`
- Creá cuenta (email/contraseña) o ingresá
- Creá/edita tu restaurante y platos
- Tocá **Guardar**

La Home y el detalle del restaurante van a leer desde Supabase automáticamente cuando `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén definidos.
