import Link from "next/link";
import { XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata = { title: "Erro no pagamento" };

export default function CheckoutErroPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <XCircle className="size-16 text-destructive" />
      <h1 className="font-display text-2xl font-semibold">Não foi possível concluir o pagamento</h1>
      <p className="text-muted-foreground">
        Verifique os dados do pagamento e tente novamente, ou escolha outra forma de pagamento.
      </p>
      <Button asChild size="lg">
        <Link href="/checkout">Tentar novamente</Link>
      </Button>
    </div>
  );
}
