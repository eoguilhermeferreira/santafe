import { storeConfig } from "@/config/store";
import { formatPhone } from "@/lib/format";

export interface FaqItem {
  question: string;
  answer: string;
  /** Aparece também no resumo da home, além da página completa. */
  highlight?: boolean;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Qual o prazo de entrega?",
    answer:
      "Postamos seu pedido em até 2 dias úteis após a aprovação do pagamento. O prazo de entrega varia de acordo com o seu CEP e é calculado no carrinho e no checkout — enviamos para todo o Brasil. Depois que o pedido for despachado, você pode acompanhar o status quando quiser em \"Consultar meu pedido\", informando o número do pedido e o e-mail usado na compra.",
    highlight: true,
  },
  {
    question: "Quanto custa o frete?",
    answer:
      "O valor do frete é calculado automaticamente pelo seu CEP, na página do produto e no checkout, considerando sua localização e o peso dos itens.",
    highlight: true,
  },
  {
    question: "Quais são as formas de pagamento?",
    answer:
      "Pix, cartão de crédito parcelado, cartão de débito e boleto — tudo pela página segura do Mercado Pago.",
    highlight: true,
  },
  {
    question: "Posso trocar ou devolver um produto?",
    answer:
      "Sim. Por ser uma compra pela internet, você tem até 7 dias corridos após o recebimento para desistir da compra, com reembolso integral. Se o produto apresentar defeito, você pode entrar em contato em até 30 dias (para a maioria dos itens) ou 90 dias (para produtos duráveis). Pra combinar troca ou devolução, é só chamar a gente no WhatsApp.",
    highlight: true,
  },
  {
    question: "A loja é confiável?",
    answer: `Sim! A ${storeConfig.name} é uma empresa registrada (CNPJ ${storeConfig.cnpj}), com endereço em ${storeConfig.address.street}, ${storeConfig.address.number} - ${storeConfig.address.city}/${storeConfig.address.state}, e pagamento processado com segurança pelo Mercado Pago. Nosso WhatsApp, e-mail e redes sociais estão no rodapé do site — é só chamar se tiver qualquer dúvida antes de comprar.`,
  },
  {
    question: "Os produtos servem para presentear?",
    answer:
      "Sim! Nossos terços, imagens, bíblias e demais artigos chegam prontos para presentear em batizados, primeira comunhão, crisma, casamentos e aniversários. Enviamos tudo com muito cuidado.",
  },
  {
    question: "Como falo com vocês?",
    answer: `Pelo WhatsApp (${formatPhone(storeConfig.contact.whatsapp)}) ou pelo Instagram @${storeConfig.contact.instagram.split("/").pop()}. Será uma alegria te atender!`,
  },
];
