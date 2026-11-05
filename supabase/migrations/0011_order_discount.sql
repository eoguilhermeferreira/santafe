-- Desconto aplicado no pedido (Pix automático e/ou cupom) — guarda o valor
-- e um rótulo legível (ex: "Desconto Pix (5%)", "Cupom SF10 (10%)") pra
-- aparecer certinho no admin. orders.total já sai calculado com o desconto
-- descontado (subtotal - discount + shipping_cost).
alter table public.orders add column discount numeric(10, 2) not null default 0;
alter table public.orders add column discount_label text;
