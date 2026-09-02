import { Footer } from "@/components/store/footer";
import { Header } from "@/components/store/header";
import { WhatsAppFloatButton } from "@/components/store/whatsapp-float-button";
import { getCategories } from "@/lib/queries";

// Catálogo/carrinho/checkout mudam com frequência (estoque, preço, pedido);
// mantém a loja sempre renderizada por requisição em vez de estática no build.
export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories();

  return (
    <div className="flex min-h-screen flex-col">
      <Header categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFloatButton />
    </div>
  );
}
