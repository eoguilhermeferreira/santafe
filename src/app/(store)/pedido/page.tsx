import { OrderLookup } from "@/components/pedido/order-lookup";

export const metadata = { title: "Consultar pedido" };

export default async function PedidoPage({
  searchParams,
}: {
  searchParams: Promise<{ numero?: string }>;
}) {
  const { numero } = await searchParams;

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="font-display text-2xl font-semibold">Consultar meu pedido</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Informe o número do pedido e o e-mail usado na compra pra acompanhar o
        status ou finalizar o pagamento, sem precisar fazer um novo pedido.
      </p>
      <OrderLookup initialOrderNumber={numero} />
    </div>
  );
}
