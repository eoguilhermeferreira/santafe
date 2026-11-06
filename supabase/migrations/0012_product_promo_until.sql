-- Promoção com prazo: quando ela coloca um promo_price e também marca até
-- quando ele vale, o site desliga a promoção sozinho depois desse horário
-- (sem ela precisar lembrar de tirar o preço promocional manualmente).
-- null = promoção sem prazo, continua valendo até ela tirar na mão.
alter table public.products add column promo_price_until timestamptz;
