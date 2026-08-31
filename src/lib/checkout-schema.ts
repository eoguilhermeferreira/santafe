import { z } from "zod";

import { storeConfig } from "@/config/store";
import { slugify } from "@/lib/format";

const { deliveryCity, deliveryState } = storeConfig.shipping;

export const checkoutSchema = z
  .object({
    customerName: z.string().trim().min(3, "Informe seu nome completo"),
    email: z.string().trim().email("E-mail inválido"),
    phone: z.string().trim().min(10, "Informe um telefone com DDD"),
    cep: z.string().trim().length(8, "CEP inválido"),
    street: z.string().trim().min(2, "Informe a rua"),
    number: z.string().trim().min(1, "Informe o número"),
    complement: z.string().trim().optional(),
    neighborhood: z.string().trim().min(2, "Informe o bairro"),
    city: z.string().trim().min(2, "Informe a cidade"),
    state: z.string().trim().length(2, "UF inválida"),
    paymentMethod: z.enum(["pix", "cartao_credito", "cartao_debito", "boleto"]),
  })
  .refine(
    (data) =>
      slugify(data.city) === slugify(deliveryCity) &&
      data.state.trim().toUpperCase() === deliveryState,
    {
      message: `No momento só entregamos em ${deliveryCity}/${deliveryState}`,
      path: ["city"],
    }
  );

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export const checkoutItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  variationValue: z.string().optional(),
});

export type CheckoutItemInput = z.infer<typeof checkoutItemSchema>;
