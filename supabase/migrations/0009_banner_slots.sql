-- Banners ganham um "local" (slot): antes só existia o carrossel do topo.
-- Os banners promocionais espalhados pela home (hoje fixos no código) passam
-- a vir do mesmo painel de Banners, pra dar pra trocar imagem/texto/link sem
-- precisar mexer no código.
alter table public.banners add column slot text not null default 'topo';
alter table public.banners add column eyebrow text;

alter table public.banners add constraint banners_slot_check
  check (slot in ('topo', 'meio_esquerda', 'meio_direita', 'quadrado_1', 'quadrado_2'));

-- Semeia os banners que já existiam fixos no código em cada local, pra ela
-- editar em vez de começar do zero. "where not exists" pra ser seguro rodar
-- mais de uma vez sem duplicar.
insert into public.banners (slot, eyebrow, title, description, image_url, button_label, button_link, is_active, display_order)
select 'meio_esquerda', 'Fé em oração', 'Terços e crucifixos para todos os momentos',
       'Peças abençoadas para fortalecer sua fé e presentear quem você ama.',
       'https://images.unsplash.com/photo-1569845177077-2a37322a60c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
       'Ver crucifixos', '/categoria/crucifixos', true, 0
where not exists (select 1 from public.banners where slot = 'meio_esquerda');

insert into public.banners (slot, eyebrow, title, description, image_url, button_label, button_link, is_active, display_order)
select 'meio_direita', 'Palavra de Deus', 'Bíblias e livros católicos',
       'Edições para todas as idades, para ler, estudar e meditar todos os dias.',
       'https://images.unsplash.com/photo-1497621122273-f5cfb6065c56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
       'Ver bíblias', '/categoria/biblias', true, 0
where not exists (select 1 from public.banners where slot = 'meio_direita');

insert into public.banners (slot, eyebrow, title, description, image_url, button_label, button_link, is_active, display_order)
select 'quadrado_1', 'Devoção', 'São Miguel Arcanjo', null, '/images/sao-miguel-arcanjo.jpg', null, null, true, 0
where not exists (select 1 from public.banners where slot = 'quadrado_1');

insert into public.banners (slot, eyebrow, title, description, image_url, button_label, button_link, is_active, display_order)
select 'quadrado_2', 'Devoção', 'Sagrada Família', null, '/images/sagrada-familia.jpg', null, null, true, 0
where not exists (select 1 from public.banners where slot = 'quadrado_2');
