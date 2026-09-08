"use client";

import Link from "next/link";
import * as React from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import {
  createCheckoutPreference,
  createOrder,
  getShippingOptions,
} from "@/app/(store)/checkout/actions";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkoutSchema, type CheckoutFormValues } from "@/lib/checkout-schema";
import { formatCep, formatPrice, onlyDigits } from "@/lib/format";
import { calculateShipping } from "@/lib/shipping";
import { fetchAddressByCep } from "@/lib/viacep";
import type { PaymentMethod } from "@/types/database.types";
import type { ShippingOption } from "@/lib/melhor-envio";

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "pix", label: "Pix" },
  { value: "cartao_credito", label: "Cartão de crédito" },
  { value: "cartao_debito", label: "Cartão de débito" },
  { value: "boleto", label: "Boleto" },
];

type FormState = Omit<CheckoutFormValues, "paymentMethod">;

const EMPTY_FORM: FormState = {
  customerName: "",
  email: "",
  phone: "",
  cep: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
};

export function CheckoutForm() {
  const { items, subtotal, totalWeightGrams, isHydrated } = useCart();

  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>("pix");
  const [errors, setErrors] = React.useState<Partial<Record<string, string>>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const flatShipping = calculateShipping();
  const [shippingOptions, setShippingOptions] = React.useState<ShippingOption[]>([
    { id: "flat", label: flatShipping.label, cost: flatShipping.cost },
  ]);
  const [selectedShippingId, setSelectedShippingId] = React.useState("flat");
  const [isShippingLoading, setIsShippingLoading] = React.useState(false);

  const shipping =
    shippingOptions.find((option) => option.id === selectedShippingId) ?? shippingOptions[0];

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleCepBlur() {
    const digits = onlyDigits(form.cep);

    const address = await fetchAddressByCep(form.cep);
    if (address) {
      setForm((current) => ({
        ...current,
        street: address.street || current.street,
        neighborhood: address.neighborhood || current.neighborhood,
        city: address.city || current.city,
        state: address.state || current.state,
      }));
    }

    if (digits.length === 8) {
      setIsShippingLoading(true);
      const options = await getShippingOptions(digits, totalWeightGrams);
      setShippingOptions(options);
      setSelectedShippingId(options[0]?.id ?? "flat");
      setIsShippingLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrors({});

    const parsed = checkoutSchema.safeParse({
      ...form,
      cep: onlyDigits(form.cep),
      paymentMethod,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[String(issue.path[0])] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("Confira os campos destacados");
      return;
    }

    setIsSubmitting(true);

    const order = await createOrder({
      customer: parsed.data,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        variationValue: item.variationValue,
      })),
      shippingOptionId: selectedShippingId,
    });

    if (order.error || !order.orderId) {
      setIsSubmitting(false);
      toast.error(order.error ?? "Não foi possível criar o pedido");
      return;
    }

    const preference = await createCheckoutPreference(order.orderId);
    if (preference.error || !preference.initPoint) {
      setIsSubmitting(false);
      toast.error(preference.error ?? "Não foi possível iniciar o pagamento");
      return;
    }

    // Redireciona pra página de pagamento do Mercado Pago (Checkout Pro) —
    // navegação de página inteira, não router.push, já que sai do site.
    window.location.href = preference.initPoint;
  }

  if (isHydrated && items.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
        <ShoppingBag className="size-12 text-muted-foreground" />
        <h1 className="font-display text-2xl font-semibold">Seu carrinho está vazio</h1>
        <Button asChild size="lg">
          <Link href="/produtos">Ver produtos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="space-y-4 p-6">
            <h2 className="font-display text-lg font-semibold">Seus dados</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome completo" error={errors.customerName} className="sm:col-span-2">
                <Input
                  value={form.customerName}
                  onChange={(e) => updateField("customerName", e.target.value)}
                />
              </Field>
              <Field label="E-mail" error={errors.email}>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </Field>
              <Field label="Telefone (WhatsApp)" error={errors.phone}>
                <Input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
              </Field>
            </div>
          </Card>

          <Card className="space-y-4 p-6">
            <h2 className="font-display text-lg font-semibold">Endereço de entrega</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="CEP" error={errors.cep}>
                <Input
                  value={formatCep(form.cep)}
                  onChange={(e) => updateField("cep", e.target.value)}
                  onBlur={handleCepBlur}
                  inputMode="numeric"
                />
              </Field>
              <Field label="Rua" error={errors.street} className="sm:col-span-2">
                <Input value={form.street} onChange={(e) => updateField("street", e.target.value)} />
              </Field>
              <Field label="Número" error={errors.number}>
                <Input value={form.number} onChange={(e) => updateField("number", e.target.value)} />
              </Field>
              <Field label="Complemento" error={errors.complement}>
                <Input
                  value={form.complement}
                  onChange={(e) => updateField("complement", e.target.value)}
                />
              </Field>
              <Field label="Bairro" error={errors.neighborhood}>
                <Input
                  value={form.neighborhood}
                  onChange={(e) => updateField("neighborhood", e.target.value)}
                />
              </Field>
              <Field label="Cidade" error={errors.city}>
                <Input value={form.city} onChange={(e) => updateField("city", e.target.value)} />
              </Field>
              <Field label="UF" error={errors.state}>
                <Input
                  value={form.state}
                  maxLength={2}
                  onChange={(e) => updateField("state", e.target.value.toUpperCase())}
                />
              </Field>
            </div>
          </Card>

          <Card className="space-y-4 p-6">
            <h2 className="font-display text-lg font-semibold">Forma de pagamento</h2>
            <p className="text-sm text-muted-foreground">
              Você confirma e paga na página segura do Mercado Pago — Pix, cartão de
              crédito, débito (de qualquer banco) ou boleto.
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {PAYMENT_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => setPaymentMethod(option.value)}
                  className={`rounded-md border px-3 py-3 text-sm font-medium transition-colors ${
                    paymentMethod === option.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input hover:bg-secondary"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </Card>

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Ir para pagamento
          </Button>
        </form>
      </div>

      <Card className="h-fit space-y-3 p-6">
        <h2 className="font-display text-lg font-semibold">Resumo do pedido</h2>
        <ul className="space-y-2 text-sm">
          {items.map((item) => (
            <li key={`${item.productId}-${item.variationValue ?? ""}`} className="flex justify-between gap-2">
              <span className="text-muted-foreground">
                {item.quantity}x {item.name}
                {item.variationValue ? ` (${item.variationValue})` : ""}
              </span>
              <span>{formatPrice(item.unitPrice * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-2 border-t border-border pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          {isShippingLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" /> Calculando frete…
            </div>
          ) : shippingOptions.length > 1 ? (
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Escolha o frete
              </span>
              {shippingOptions.map((option) => (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                    selectedShippingId === option.id
                      ? "border-primary bg-secondary"
                      : "border-input hover:bg-secondary/50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="shippingOption"
                      checked={selectedShippingId === option.id}
                      onChange={() => setSelectedShippingId(option.id)}
                      className="accent-primary"
                    />
                    {option.label}
                  </span>
                  <span>{formatPrice(option.cost)}</span>
                </label>
              ))}
            </div>
          ) : (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{shipping.label}</span>
                <span>{formatPrice(shipping.cost)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Valor final do frete confirmado ao preencher o CEP.
              </p>
            </>
          )}
        </div>
        <div className="flex justify-between border-t border-border pt-3 font-display text-lg font-semibold">
          <span>Total</span>
          <span>{formatPrice(subtotal + shipping.cost)}</span>
        </div>
      </Card>
    </div>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
