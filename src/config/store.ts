/**
 * Dados fixos da loja. Centralizado aqui para trocar em um único lugar
 * quando a loja mudar de nome, contato ou política de frete.
 */
export const storeConfig = {
  name: "Santa Fé",
  shortName: "Santa Fé",
  description:
    "Artigos religiosos católicos: bíblias, terços, crucifixos, imagens, escapulários e muito mais.",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  contact: {
    whatsapp: "5514997630452",
    email: "santafeartigoscatolicos@gmail.com",
    instagram: "https://instagram.com/santafeartigoscatolicos",
    tiktok: "",
    facebook: "",
  },

  address: {
    city: "Avaré",
    state: "SP",
  },

  /**
   * Frete simplificado: valor fixo, sem gratuidade por faixa de valor.
   *
   * Entrega restrita à cidade da loja por enquanto — `deliveryCity`/
   * `deliveryState` são checados no schema de checkout (client e server).
   */
  shipping: {
    flatRateCents: 1000,
    deliveryCity: "Avaré",
    deliveryState: "SP",
  },
} as const;
