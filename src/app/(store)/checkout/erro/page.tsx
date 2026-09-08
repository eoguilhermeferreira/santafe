import Link from "next/link";
import { XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata = { title: "Erro no pagamento" };

export default async function CheckoutErroPage({
  searchParams,
}: {
  searchParams: Promise<{ pedido?: string }>;
}) {
  const { pedido } = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <XCircle className="size-16 text-destructive" />
      <h1 className="font-display text-2xl font-semibold">Não foi possível concluir o pagamento</h1>
      <p className="text-muted-foreground">
        {pedido ? `Seu pedido #${pedido} não teve o pagamento concluído. ` : ""}
        Você pode tentar de novo com o mesmo pedido, sem precisar refazer a compra.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button asChild size="lg">
          <Link href={pedido ? `/pedido?numero=${pedido}` : "/pedido"}>Pagar este pedido</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/checkout">Fazer um novo pedido</Link>
        </Button>
      </div>
    </div>
  );
}
