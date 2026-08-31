import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { storeConfig } from "@/config/store";

export const metadata = { title: "Pedido confirmado" };

export default async function CheckoutSucessoPage({
  searchParams,
}: {
  searchParams: Promise<{ pedido?: string }>;
}) {
  const { pedido } = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <CheckCircle2 className="size-16 text-accent" />
      <h1 className="font-display text-2xl font-semibold">Pagamento confirmado!</h1>
      <p className="text-muted-foreground">
        {pedido ? `Seu pedido #${pedido} foi recebido e já está sendo preparado.` :
          "Seu pedido foi recebido e já está sendo preparado."}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/produtos">Continuar comprando</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <a href={`https://wa.me/${storeConfig.contact.whatsapp}`} target="_blank" rel="noreferrer">
            <WhatsAppIcon className="size-4" /> Falar com a loja
          </a>
        </Button>
      </div>
    </div>
  );
}
