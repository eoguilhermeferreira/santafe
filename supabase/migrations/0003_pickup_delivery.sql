-- Retirada na loja: novo método de entrega ("entrega" vs "retirada") e um
-- status extra ("pronto_para_retirar") pro fluxo de retirada em Avaré.
-- Rode este arquivo no SQL Editor do Supabase, depois do 0001 e 0002.

alter type public.delivery_status add value if not exists 'pronto_para_retirar';

create type public.delivery_method as enum ('entrega', 'retirada');

alter table public.orders
  add column delivery_method public.delivery_method not null default 'entrega';
