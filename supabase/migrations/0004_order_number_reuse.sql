-- Faz o order_number reaproveitar o número de um pedido excluído,
-- em vez de continuar de uma sequência que nunca volta atrás.
-- Ex: se o último pedido for o #12 e ele for excluído, o próximo
-- pedido criado volta a ser #12. Se todos os pedidos forem excluídos,
-- o próximo pedido criado é o #1.
alter table public.orders alter column order_number drop identity if exists;

create or replace function public.set_order_number()
returns trigger
language plpgsql
as $$
begin
  if new.order_number is null then
    select coalesce(max(order_number), 0) + 1 into new.order_number from public.orders;
  end if;
  return new;
end;
$$;

create trigger orders_set_order_number
  before insert on public.orders
  for each row
  execute function public.set_order_number();
