const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** Recebe um valor em reais (numeric do banco) e formata como R$ 1.234,56 */
export function formatPrice(value: number): string {
  return currencyFormatter.format(value);
}

/** Percentual de desconto entre o preço cheio e o preço promocional. */
export function discountPercent(price: number, promoPrice: number | null): number | null {
  if (promoPrice == null || promoPrice >= price || price <= 0) return null;
  return Math.round(((price - promoPrice) / price) * 100);
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

export function formatDateTime(value: string | Date): string {
  return dateFormatter.format(new Date(value));
}

export function formatCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** Formata telefone BR (com ou sem código do país "55") como (14) 99763-0452 */
export function formatPhone(value: string): string {
  const digits = onlyDigits(value).replace(/^55(?=\d{10,11}$)/, "");
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return value;
}

const DIACRITICS_REGEX = new RegExp("[̀-ͯ]", "g");

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(DIACRITICS_REGEX, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
