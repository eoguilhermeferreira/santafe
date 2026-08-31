import Link from "next/link";
import { Clock } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata = { title: "Pagamento pendente" };

export default async function CheckoutPendentePage({
  searchParams,
}: {
  searchParams: Promise<{ pedido?: string }>;
}) {
  const { pedido } = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <Clock className="size-16 text-accent" />
      <h1 className="font-display text-2xl font-semibold">Pagamento em análise</h1>
      <p className="text-muted-foreground">
        {pedido ? `Recebemos seu pedido #${pedido}. ` : "Recebemos seu pedido. "}
        Assim que a confirmação do pagamento chegar, você será avisado.
      </p>
      <Button asChild size="lg">
        <Link href="/produtos">Continuar comprando</Link>
      </Button>
    </div>
  );
}
