-- Avaliações de produtos: estrelas (obrigatório) + comentário/fotos/vídeo
-- (opcionais). Só pode existir uma avaliação por item de pedido (compra
-- verificada), e só fica visível pro público depois de aprovada pelo admin.

create type public.review_status as enum ('pendente', 'publicada', 'oculta');

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  order_id uuid not null references public.orders (id) on delete cascade,
  order_item_id uuid not null unique references public.order_items (id) on delete cascade,
  customer_name text not null,
  email text not null,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  photo_urls text[] not null default '{}',
  video_url text,
  status public.review_status not null default 'pendente',
  verified_purchase boolean not null default true,
  created_at timestamptz not null default now()
);

create index reviews_product_id_idx on public.reviews (product_id);
create index reviews_status_idx on public.reviews (status);
create index reviews_order_id_idx on public.reviews (order_id);

alter table public.reviews enable row level security;

-- Sem conta de cliente: o envio da avaliação é feito pelo servidor (service
-- role, mesma lógica de verificação de pedido+e-mail do lookup de pedido),
-- então não existe policy de insert pra anônimo — só admin (painel) e
-- service role (que ignora RLS) escrevem nessa tabela.
create policy "avaliações publicadas são públicas" on public.reviews
  for select using (status = 'publicada' or public.is_admin());

create policy "admin gerencia avaliações" on public.reviews
  for all using (public.is_admin()) with check (public.is_admin());

-- =========================================================
-- Storage — bucket público pra fotos/vídeos de avaliação
-- =========================================================

insert into storage.buckets (id, name, public, file_size_limit)
values ('reviews', 'reviews', true, 52428800)
on conflict (id) do nothing;

create policy "leitura pública das mídias de avaliação" on storage.objects
  for select using (bucket_id = 'reviews');

create policy "admin gerencia as mídias de avaliação" on storage.objects
  for all using (bucket_id = 'reviews' and public.is_admin())
  with check (bucket_id = 'reviews' and public.is_admin());
