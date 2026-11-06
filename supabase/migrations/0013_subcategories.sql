-- Subcategorias de Bíblias (editoras) e Camisetas (corte) — pra filtrar de
-- verdade na loja, não só organizar por trás. "where exists/not exists" pra
-- não dar erro se a categoria pai não existir e não duplicar se rodar de
-- novo.
insert into public.categories (name, slug, parent_id, display_order, is_active)
select 'Editora Ave Maria', 'editora-ave-maria', (select id from public.categories where slug = 'biblias'), 0, true
where exists (select 1 from public.categories where slug = 'biblias')
  and not exists (select 1 from public.categories where slug = 'editora-ave-maria');

insert into public.categories (name, slug, parent_id, display_order, is_active)
select 'Paulus', 'paulus', (select id from public.categories where slug = 'biblias'), 1, true
where exists (select 1 from public.categories where slug = 'biblias')
  and not exists (select 1 from public.categories where slug = 'paulus');

insert into public.categories (name, slug, parent_id, display_order, is_active)
select 'Babylook', 'babylook', (select id from public.categories where slug = 'camisetas'), 0, true
where exists (select 1 from public.categories where slug = 'camisetas')
  and not exists (select 1 from public.categories where slug = 'babylook');

insert into public.categories (name, slug, parent_id, display_order, is_active)
select 'Oversized', 'oversized', (select id from public.categories where slug = 'camisetas'), 1, true
where exists (select 1 from public.categories where slug = 'camisetas')
  and not exists (select 1 from public.categories where slug = 'oversized');
