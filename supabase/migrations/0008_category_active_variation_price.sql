-- Categorias: permite desativar sem excluir (produtos continuam existindo,
-- só some da navegação/loja pro cliente; admin continua vendo e gerenciando).
alter table public.categories add column is_active boolean not null default true;

drop policy if exists "categorias são públicas para leitura" on public.categories;
create policy "categorias ativas são públicas para leitura" on public.categories
  for select using (is_active = true or public.is_admin());

-- Variações de produto: preço opcional por variação (ex: tamanho GG custa
-- mais que P). Quando nulo, usa o preço normal do produto.
alter table public.product_variations add column price numeric(10, 2) check (price is null or price >= 0);
