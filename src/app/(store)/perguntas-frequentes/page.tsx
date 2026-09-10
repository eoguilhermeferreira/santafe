import { ChevronDown } from "lucide-react";

import { storeConfig } from "@/config/store";
import { formatPhone } from "@/lib/format";

export const metadata = { title: "Perguntas frequentes" };

const FAQ_ITEMS = [
  {
    question: "Qual o prazo de entrega?",
    answer:
      "Postamos seu pedido em até 2 dias úteis após a aprovação do pagamento. O prazo de entrega varia de acordo com o seu CEP e é calculado no carrinho e no checkout — enviamos para todo o Brasil. Depois que o pedido for despachado, você pode acompanhar o status quando quiser em \"Consultar meu pedido\", informando o número do pedido e o e-mail usado na compra.",
  },
  {
    question: "Quanto custa o frete?",
    answer:
      "O valor do frete é calculado automaticamente pelo seu CEP, na página do produto e no checkout, considerando sua localização e o peso dos itens.",
  },
  {
    question: "Quais são as formas de pagamento?",
    answer:
      "Pix, cartão de crédito parcelado, cartão de débito e boleto — tudo pela página segura do Mercado Pago.",
  },
  {
    question: "Posso trocar ou devolver um produto?",
    answer:
      "Sim. Por ser uma compra pela internet, você tem até 7 dias corridos após o recebimento para desistir da compra, com reembolso integral. Se o produto apresentar defeito, você pode entrar em contato em até 30 dias (para a maioria dos itens) ou 90 dias (para produtos duráveis). Pra combinar troca ou devolução, é só chamar a gente no WhatsApp.",
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
] as const;

export default function PerguntasFrequentesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">Perguntas frequentes</h1>
      <p className="mt-3 text-sm text-muted-foreground sm:text-base">
        Reunimos aqui as dúvidas mais comuns das nossas famílias. Não encontrou sua resposta?
        Fale com a gente no WhatsApp{" "}
        <a
          href={`https://wa.me/${storeConfig.contact.whatsapp}`}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-accent hover:underline"
        >
          {formatPhone(storeConfig.contact.whatsapp)}
        </a>{" "}
        — respondemos rapidinho.
      </p>

      <div className="mt-8 divide-y divide-border rounded-xl border border-border">
        {FAQ_ITEMS.map((item) => (
          <details key={item.question} className="group p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-base font-semibold sm:text-lg">
              {item.question}
              <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
