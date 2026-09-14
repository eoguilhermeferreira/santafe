-- Código de barras do produto (leitor/scanner). Único quando preenchido —
-- permite reconhecer um produto já cadastrado ao ler o mesmo código de novo.
alter table public.products add column barcode text unique;
