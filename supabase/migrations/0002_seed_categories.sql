-- Categorias iniciais da Santa Fé — Artigos Religiosos Católicos.
-- Produtos são cadastrados depois, pelo painel em /admin.

insert into public.categories (name, slug, icon, display_order) values
  ('Bíblias', 'biblias', 'biblias', 1),
  ('Camisetas', 'camisetas', 'camisetas', 2),
  ('Crucifixos', 'crucifixos', 'crucifixos', 3),
  ('Terços', 'tercos', 'tercos', 4),
  ('Imagens', 'imagens', 'imagens', 5),
  ('Escapulários', 'escapularios', 'escapularios', 6),
  ('Livros', 'livros', 'livros', 7),
  ('Terços de pulso', 'tercos-de-pulso', 'tercos-de-pulso', 8),
  ('Diário Bíblico 2027', 'diario-biblico-2027', 'diario-biblico-2027', 9)
on conflict (slug) do nothing;
