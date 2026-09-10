import { FaqAccordion } from "@/components/store/faq-accordion";
import { storeConfig } from "@/config/store";
import { formatPhone } from "@/lib/format";
import { FAQ_ITEMS } from "@/lib/faq";

export const metadata = { title: "Perguntas frequentes" };

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

      <div className="mt-8">
        <FaqAccordion items={FAQ_ITEMS} />
      </div>
    </div>
  );
}
