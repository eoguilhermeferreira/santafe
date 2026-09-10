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

  /**
   * Frete simplificado: valor fixo nacional, sem gratuidade por faixa de
   * valor. Entrega pra todo o Brasil. Provisório até entrar a integração
   * com o Melhor Envio (cotação real por CEP/peso).
   */
  shipping: {
    flatRateCents: 1000,
  },

  /** Frases que giram na barra fixa no topo da loja, acima do header. */
  announcements: [
    "Enviamos para todo o Brasil",
    "Bíblias e artigos para sua vida de oração",
    "Sua fé, presente em cada detalhe",
    "Parcelamos no cartão",
  ],
} as const;
