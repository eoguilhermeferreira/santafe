"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { createOrder, getOrderStatus, type SubmitPaymentResult } from "@/app/(store)/checkout/actions";
import { useCart } from "@/components/cart/cart-provider";
import { PaymentBrickForm } from "@/components/checkout/payment-brick-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { storeConfig } from "@/config/store";
import { checkoutSchema, type CheckoutFormValues } from "@/lib/checkout-schema";
import { formatCep, formatPrice, onlyDigits, slugify } from "@/lib/format";
import { calculateShipping } from "@/lib/shipping";
import { fetchAddressByCep } from "@/lib/viacep";
import type { PaymentMethod } from "@/types/database.types";

const { deliveryCity, deliveryState } = storeConfig.shipping;

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

type Step = "form" | "payment" | "pix";

export function CheckoutForm() {
  const router = useRouter();
  const { items, subtotal, clear, isHydrated } = useCart();

  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>("pix");
  const [errors, setErrors] = React.useState<Partial<Record<string, string>>>({});
  const [step, setStep] = React.useState<Step>("form");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [order, setOrder] = React.useState<{ id: string; number: number; total: number } | null>(
    null
  );
  const [pixData, setPixData] = React.useState<{ code: string; base64?: string } | null>(null);

  const shipping = calculateShipping();

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleCepBlur() {
    const address = await fetchAddressByCep(form.cep);
    if (address) {
      setForm((current) => ({
        ...current,
        street: address.street || current.street,
        neighborhood: address.neighborhood || current.neighborhood,
        city: address.city || current.city,
        state: address.state || current.state,
      }));

      if (
        address.city &&
        (slugify(address.city) !== slugify(deliveryCity) || address.state !== deliveryState)
      ) {
        toast.error(`No momento só entregamos em ${deliveryCity}/${deliveryState}`);
      }
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
    const result = await createOrder({
      customer: parsed.data,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        variationValue: item.variationValue,
      })),
    });
    setIsSubmitting(false);

    if (result.error || !result.orderId || !result.orderNumber || result.total == null) {
      toast.error(result.error ?? "Não foi possível criar o pedido");
      return;
    }

    setOrder({ id: result.orderId, number: result.orderNumber, total: result.total });
    setStep("payment");
  }

  function handlePaymentResult(result: SubmitPaymentResult) {
    if (result.error) {
      toast.error(result.error);
      return;
    }
    if (!order) return;

    if (result.status === "pago") {
      clear();
      router.push(`/checkout/sucesso?pedido=${order.number}`);
      return;
    }

    if (result.status === "pendente" && result.pixQrCode) {
      setPixData({ code: result.pixQrCode, base64: result.pixQrCodeBase64 });
      setStep("pix");
      return;
    }

    clear();
    router.push(`/checkout/pendente?pedido=${order.number}`);
  }

  React.useEffect(() => {
    if (step !== "pix" || !order) return;

    const interval = setInterval(async () => {
      const status = await getOrderStatus(order.id);
      if (status?.paymentStatus === "pago") {
        clear();
        clearInterval(interval);
        router.push(`/checkout/sucesso?pedido=${order.number}`);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [step, order, router, clear]);

  if (isHydrated && items.length === 0 && step === "form") {
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

  if (step === "pix" && pixData && order) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <h1 className="font-display text-2xl font-semibold">Pague com Pix</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pedido #{order.number} — {formatPrice(order.total)}
        </p>
        {pixData.base64 && (
          <Image
            src={`data:image/png;base64,${pixData.base64}`}
            alt="QR Code Pix"
            width={224}
            height={224}
            unoptimized
            className="mx-auto mt-6 size-56"
          />
        )}
        <Label className="mt-4 block text-left">Pix copia e cola</Label>
        <div className="mt-1 flex gap-2">
          <Input readOnly value={pixData.code} className="text-xs" />
          <Button
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(pixData.code);
              toast.success("Código copiado");
            }}
          >
            Copiar
          </Button>
        </div>
        <p className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Aguardando confirmação do pagamento…
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {step === "form" ? (
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
              Continuar para pagamento
            </Button>
          </form>
        ) : (
          order && (
            <Card className="space-y-4 p-6">
              <h2 className="font-display text-lg font-semibold">Pagamento</h2>
              <p className="text-sm text-muted-foreground">
                Pedido #{order.number} — total {formatPrice(order.total)}
              </p>
              <PaymentBrickForm
                orderId={order.id}
                amount={order.total}
                payerEmail={form.email}
                method={paymentMethod}
                onResult={handlePaymentResult}
              />
            </Card>
          )
        )}
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
        <div className="space-y-1 border-t border-border pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{shipping.label}</span>
            <span>{formatPrice(shipping.cost)}</span>
          </div>
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
