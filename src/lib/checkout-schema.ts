import { z } from "zod";

/**
 * Endereço só é obrigatório quando o cliente escolhe entrega — quem
 * retira na loja não precisa preencher nada disso.
 */
export const checkoutSchema = z
  .object({
    customerName: z.string().trim().min(3, "Informe seu nome completo"),
    email: z.string().trim().email("E-mail inválido"),
    phone: z.string().trim().min(10, "Informe um telefone com DDD"),
    deliveryMethod: z.enum(["entrega", "retirada"]),
    cep: z.string().trim().default(""),
    street: z.string().trim().default(""),
    number: z.string().trim().default(""),
    complement: z.string().trim().optional(),
    neighborhood: z.string().trim().default(""),
    city: z.string().trim().default(""),
    state: z.string().trim().default(""),
    paymentMethod: z.enum(["pix", "cartao_credito", "cartao_debito", "boleto"]),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryMethod !== "entrega") return;
    if (data.cep.length !== 8) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["cep"], message: "CEP inválido" });
    }
    if (data.street.length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["street"], message: "Informe a rua" });
    }
    if (data.number.length < 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["number"], message: "Informe o número" });
    }
    if (data.neighborhood.length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["neighborhood"], message: "Informe o bairro" });
    }
    if (data.city.length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["city"], message: "Informe a cidade" });
    }
    if (data.state.length !== 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["state"], message: "UF inválida" });
    }
  });

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export const checkoutItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  variationValue: z.string().optional(),
});

export type CheckoutItemInput = z.infer<typeof checkoutItemSchema>;
