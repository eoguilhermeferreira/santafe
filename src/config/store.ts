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
  cnpj: "09.417.794/0001-68",

  contact: {
    whatsapp: "5514997630452",
    email: "santafeartigoscatolicos@gmail.com",
    instagram: "https://instagram.com/santafeartigoscatolicos",
    tiktok: "",
    facebook: "",
  },

  address: {
    street: "Rua São Paulo",
    number: "935",
    city: "Avaré",
    state: "SP",
    cep: "18700070",
  },

  shipping: {
    /** Frete fixo nacional usado como reserva quando o Melhor Envio não
     * está configurado ou não consegue cotar. Entrega pra todo o Brasil. */
    flatRateCents: 1000,
    /** Compras a partir desse valor (em reais) têm frete grátis — o
     * cliente ainda escolhe a transportadora, só não paga por ela. */
    freeShippingThresholdCents: 20000,
  },

  /** Frases que giram na barra fixa no topo da loja, acima do header. */
  announcements: [
    "Enviamos para todo o Brasil",
    "Bíblias e artigos para sua vida de oração",
    "Sua fé, presente em cada detalhe",
    "Parcelamos no cartão",
    "Somos nota 5 ⭐️ no Google",
    "Compras acima de R$200, frete grátis",
  ],
} as const;
