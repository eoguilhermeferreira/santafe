-- CPF vira obrigatório no checkout (entrega ou retirada) — pedido sem CPF
-- obrigava a loja a mandar mensagem pro cliente pedindo depois. Pedidos
-- antigos ficam com '' (não tinham CPF coletado); daqui pra frente o
-- checkout sempre envia um.
alter table public.orders add column cpf text not null default '';
alter table public.orders alter column cpf drop default;
