-- Santa Fé — Artigos Religiosos Católicos — schema inicial
-- Tabelas, enums, função is_admin() e políticas de RLS.
-- Rode este arquivo no SQL Editor do Supabase (ou via `supabase db push`)
-- em um projeto novo, na ordem em que aparece.

create extension if not exists pgcrypto;

-- =========================================================
-- Enums
-- =========================================================

create type public.home_section as enum ('mais_vendidos', 'novidades', 'ofertas');
create type public.payment_method as enum ('pix', 'cartao_credito', 'cartao_debito', 'boleto');
create type public.payment_status as enum ('pendente', 'pago', 'falhou', 'reembolsado');
create type public.delivery_status as enum ('recebido', 'preparando', 'enviado', 'entregue', 'cancelado');

-- =========================================================
-- Tabelas
-- =========================================================

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  parent_id uuid references public.categories (id) on delete set null,
  icon text,
  image_url text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create sequence public.product_code_seq start 1001;

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  code text not null unique default ('SF-' || nextval('public.product_code_seq')::text),
  description text,
  brand text,
  category_id uuid references public.categories (id) on delete set null,
  price numeric(10, 2) not null check (price >= 0),
  promo_price numeric(10, 2) check (promo_price is null or promo_price >= 0),
  stock int not null default 0 check (stock >= 0),
  weight_grams int not null default 200 check (weight_grams > 0),
  is_active boolean not null default true,
  home_section public.home_section,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_id_idx on public.products (category_id);
create index products_home_section_idx on public.products (home_section) where home_section is not null;

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,
  display_order int not null default 0
);

create index product_images_product_id_idx on public.product_images (product_id);

create table public.product_variations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  label text not null,
  value text not null,
  stock int not null default 0 check (stock >= 0)
);

create index product_variations_product_id_idx on public.product_variations (product_id);

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  image_url text not null,
  button_label text,
  button_link text,
  is_active boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  cpf text,
  cep text,
  street text,
  address_number text,
  complement text,
  neighborhood text,
  city text,
  state text,
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number int generated always as identity,
  customer_name text not null,
  email text not null,
  phone text not null,
  customer_id uuid references public.customers (id) on delete set null,
  shipping_address jsonb not null,
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  shipping_cost numeric(10, 2) not null default 0 check (shipping_cost >= 0),
  total numeric(10, 2) not null check (total >= 0),
  shipping_method text,
  tracking_code text,
  payment_method public.payment_method not null,
  payment_status public.payment_status not null default 'pendente',
  delivery_status public.delivery_status not null default 'recebido',
  mercadopago_payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_payment_status_idx on public.orders (payment_status);
create index orders_delivery_status_idx on public.orders (delivery_status);
create index orders_mercadopago_payment_id_idx on public.orders (mercadopago_payment_id);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  quantity int not null check (quantity > 0),
  variation_label text,
  variation_value text
);

create index order_items_order_id_idx on public.order_items (order_id);

-- Vínculo 1:1 com auth.users — quem tem uma linha aqui acessa o /admin.
create table public.admin_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

-- =========================================================
-- Função auxiliar usada nas policies de RLS
-- =========================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_profiles where id = auth.uid()
  );
$$;

-- =========================================================
-- Row Level Security
-- =========================================================

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variations enable row level security;
alter table public.banners enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.admin_profiles enable row level security;

-- Catálogo: leitura pública, escrita só para admin.
create policy "categorias são públicas para leitura" on public.categories
  for select using (true);
create policy "admin gerencia categorias" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

create policy "produtos são públicos para leitura" on public.products
  for select using (true);
create policy "admin gerencia produtos" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

create policy "imagens de produto são públicas para leitura" on public.product_images
  for select using (true);
create policy "admin gerencia imagens de produto" on public.product_images
  for all using (public.is_admin()) with check (public.is_admin());

create policy "variações de produto são públicas para leitura" on public.product_variations
  for select using (true);
create policy "admin gerencia variações de produto" on public.product_variations
  for all using (public.is_admin()) with check (public.is_admin());

-- Banners: só os ativos aparecem para o público; admin vê e gerencia todos.
create policy "banners ativos são públicos" on public.banners
  for select using (is_active = true or public.is_admin());
create policy "admin gerencia banners" on public.banners
  for all using (public.is_admin()) with check (public.is_admin());

-- Não há conta de cliente: pedidos, itens e clientes só são lidos/escritos
-- pelo painel admin (is_admin()) ou pelo servidor via service role key
-- (checkout, criação de pagamento e webhook do Mercado Pago), que ignora RLS.
create policy "admin gerencia clientes" on public.customers
  for all using (public.is_admin()) with check (public.is_admin());

create policy "admin gerencia pedidos" on public.orders
  for all using (public.is_admin()) with check (public.is_admin());

create policy "admin gerencia itens de pedido" on public.order_items
  for all using (public.is_admin()) with check (public.is_admin());

create policy "admin vê o próprio perfil" on public.admin_profiles
  for select using (public.is_admin());

-- =========================================================
-- Storage — buckets públicos para imagens
-- =========================================================

insert into storage.buckets (id, name, public)
values
  ('products', 'products', true),
  ('categories', 'categories', true),
  ('banners', 'banners', true)
on conflict (id) do nothing;

create policy "leitura pública das imagens da loja" on storage.objects
  for select using (bucket_id in ('products', 'categories', 'banners'));

create policy "admin faz upload das imagens da loja" on storage.objects
  for insert with check (
    bucket_id in ('products', 'categories', 'banners') and public.is_admin()
  );

create policy "admin atualiza as imagens da loja" on storage.objects
  for update using (
    bucket_id in ('products', 'categories', 'banners') and public.is_admin()
  );

create policy "admin remove as imagens da loja" on storage.objects
  for delete using (
    bucket_id in ('products', 'categories', 'banners') and public.is_admin()
  );
