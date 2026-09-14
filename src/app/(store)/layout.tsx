import { AnnouncementBar } from "@/components/store/announcement-bar";
import { Footer } from "@/components/store/footer";
import { Header } from "@/components/store/header";
import { WhatsAppFloatButton } from "@/components/store/whatsapp-float-button";
import { getCategories } from "@/lib/queries";
import { withTimeout } from "@/lib/with-timeout";

// Catálogo/carrinho/checkout mudam com frequência (estoque, preço, pedido);
// mantém a loja sempre renderizada por requisição em vez de estática no build.
export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  // Carrega em toda página da loja (é o menu do topo) — se o Supabase
  // estiver lento, mostra o menu vazio em vez de derrubar a página inteira.
  const categories = await withTimeout(getCategories(), 6000, []);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="sticky top-0 z-40">
        <AnnouncementBar />
        <Header categories={categories} />
      </div>
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFloatButton />
    </div>
  );
}
