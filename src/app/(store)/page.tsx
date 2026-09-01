import { BannerCarousel } from "@/components/store/banner-carousel";
import { CategoryGrid } from "@/components/store/category-grid";
import { PromoBanner, PromoSquareBanner } from "@/components/store/promo-banner";
import { ProductSection } from "@/components/store/product-section";
import { Reveal } from "@/components/store/reveal";
import { storeConfig } from "@/config/store";
import {
  getActiveBanners,
  getCategories,
  getProductsByHomeSection,
} from "@/lib/queries";

export default async function HomePage() {
  const [banners, categories, maisVendidos, novidades, ofertas] = await Promise.all([
    getActiveBanners(),
    getCategories(),
    getProductsByHomeSection("mais_vendidos"),
    getProductsByHomeSection("novidades"),
    getProductsByHomeSection("ofertas"),
  ]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-14 px-4 py-6 sm:py-8">
      <BannerCarousel banners={banners} />

      <Reveal>
        <CategoryGrid categories={categories} />
      </Reveal>

      <Reveal>
        <ProductSection title="Mais vendidos" href="/produtos" products={maisVendidos} />
      </Reveal>

      <Reveal className="grid gap-4 sm:grid-cols-2">
        <PromoBanner
          imageUrl="https://images.unsplash.com/photo-1569845177077-2a37322a60c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
          eyebrow="Fé em oração"
          title="Terços e crucifixos para todos os momentos"
          description="Peças abençoadas para fortalecer sua fé e presentear quem você ama."
          buttonLabel="Ver terços"
          href="/categoria/tercos"
        />
        <PromoBanner
          imageUrl="https://images.unsplash.com/photo-1497621122273-f5cfb6065c56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
          eyebrow="Palavra de Deus"
          title="Bíblias e livros católicos"
          description="Edições para todas as idades, para ler, estudar e meditar todos os dias."
          buttonLabel="Ver bíblias"
          href="/categoria/biblias"
          imageSide="right"
        />
      </Reveal>

      <Reveal>
        <ProductSection title="Novidades" href="/produtos" products={novidades} />
      </Reveal>

      <Reveal>
        <PromoSquareBanner
          imageUrl="/images/sao-miguel-arcanjo.jpg"
          eyebrow="Devoção"
          title="São Miguel Arcanjo"
        />
      </Reveal>

      <Reveal>
        <ProductSection title="Ofertas" href="/produtos" products={ofertas} />
      </Reveal>

      <Reveal>
        <PromoBanner
          imageUrl="https://images.unsplash.com/photo-1676200259384-b2900d8478a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
          eyebrow="Atendimento"
          title="Ficou com alguma dúvida?"
          description="Nosso time responde rapidinho pelo WhatsApp e te ajuda a escolher o item certo."
          buttonLabel="Chamar no WhatsApp"
          href={`https://wa.me/${storeConfig.contact.whatsapp}`}
        />
      </Reveal>
    </div>
  );
}
