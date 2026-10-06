import Link from "next/link";

import { AboutSection } from "@/components/store/about-section";
import { BannerCarousel } from "@/components/store/banner-carousel";
import { CategoryGrid } from "@/components/store/category-grid";
import { FaqAccordion } from "@/components/store/faq-accordion";
import { PromoBanner, PromoSquareBanner } from "@/components/store/promo-banner";
import { ProductSection } from "@/components/store/product-section";
import { Reveal } from "@/components/store/reveal";
import { storeConfig } from "@/config/store";
import { FAQ_ITEMS } from "@/lib/faq";
import {
  getBannersBySlot,
  getCategories,
  getProducts,
  getProductsByHomeSection,
} from "@/lib/queries";
import { withTimeout } from "@/lib/with-timeout";
import type { Banner, BannerSlot } from "@/types/database.types";

const HIGHLIGHT_FAQ_ITEMS = FAQ_ITEMS.filter((item) => item.highlight);

const EMPTY_PRODUCTS = { products: [], total: 0 };

const EMPTY_BANNER_SLOTS: Record<BannerSlot, Banner[]> = {
  topo: [],
  meio_esquerda: [],
  meio_direita: [],
  quadrado_1: [],
  quadrado_2: [],
};

export default async function HomePage() {
  // Teto de 6s por consulta — se o Supabase estiver lento, a home renderiza
  // com essa seção vazia em vez de a página inteira estourar o timeout da
  // Vercel e cair com "Gateway Timeout".
  const [bannerSlots, categories, maisVendidos, novidades, ofertas, imagens, tercos] =
    await Promise.all([
      withTimeout(getBannersBySlot(), 6000, EMPTY_BANNER_SLOTS),
      withTimeout(getCategories(), 6000, []),
      withTimeout(getProductsByHomeSection("mais_vendidos", 8, { random: true }), 6000, []),
      withTimeout(getProductsByHomeSection("novidades", 8, { random: true }), 6000, []),
      withTimeout(getProductsByHomeSection("ofertas", 8, { random: true }), 6000, []),
      withTimeout(getProducts({ categorySlug: "imagens", pageSize: 8 }), 6000, EMPTY_PRODUCTS),
      withTimeout(getProducts({ categorySlug: "tercos", pageSize: 8 }), 6000, EMPTY_PRODUCTS),
    ]);

  // Banners promocionais do meio da home: se ela já configurou um banner
  // pra esse local no admin, usa ele; senão cai no texto/imagem padrão.
  const tercosCrucifixosBanner = bannerSlots.meio_esquerda[0];
  const bibliasBanner = bannerSlots.meio_direita[0];
  const saoMiguelBanner = bannerSlots.quadrado_1[0];
  const sagradaFamiliaBanner = bannerSlots.quadrado_2[0];

  return (
    <div className="flex flex-col gap-14 pb-6 sm:pb-8">
      <div className="relative left-1/2 -mt-[81px] w-screen -translate-x-1/2 sm:-mt-[97px]">
        <BannerCarousel banners={bannerSlots.topo} />
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-4">
        <Reveal>
          <AboutSection />
        </Reveal>

        <Reveal>
          <CategoryGrid categories={categories} />
        </Reveal>

        <Reveal>
          <ProductSection
            title="Mais vendidos"
            href="/produtos?secao=mais_vendidos"
            products={maisVendidos}
          />
        </Reveal>

        <Reveal className="grid gap-4 sm:grid-cols-2">
          <PromoBanner
            imageUrl={
              tercosCrucifixosBanner?.image_url ??
              "https://images.unsplash.com/photo-1569845177077-2a37322a60c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
            }
            eyebrow={tercosCrucifixosBanner?.eyebrow ?? "Fé em oração"}
            title={tercosCrucifixosBanner?.title ?? "Terços e crucifixos para todos os momentos"}
            description={
              tercosCrucifixosBanner?.description ??
              "Peças abençoadas para fortalecer sua fé e presentear quem você ama."
            }
            buttonLabel={tercosCrucifixosBanner?.button_label ?? "Ver crucifixos"}
            href={tercosCrucifixosBanner?.button_link ?? "/categoria/crucifixos"}
          />
          <PromoBanner
            imageUrl={
              bibliasBanner?.image_url ??
              "https://images.unsplash.com/photo-1497621122273-f5cfb6065c56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
            }
            eyebrow={bibliasBanner?.eyebrow ?? "Palavra de Deus"}
            title={bibliasBanner?.title ?? "Bíblias e livros católicos"}
            description={
              bibliasBanner?.description ??
              "Edições para todas as idades, para ler, estudar e meditar todos os dias."
            }
            buttonLabel={bibliasBanner?.button_label ?? "Ver bíblias"}
            href={bibliasBanner?.button_link ?? "/categoria/biblias"}
            imageSide="right"
          />
        </Reveal>

        <Reveal>
          <ProductSection title="Novidades" href="/produtos?secao=novidades" products={novidades} />
        </Reveal>

        <Reveal>
          <PromoSquareBanner
            imageUrl={saoMiguelBanner?.image_url ?? "/images/sao-miguel-arcanjo.jpg"}
            eyebrow={saoMiguelBanner?.eyebrow ?? "Devoção"}
            title={saoMiguelBanner?.title ?? "São Miguel Arcanjo"}
            description={saoMiguelBanner?.description ?? undefined}
            buttonLabel={saoMiguelBanner?.button_label ?? undefined}
            href={saoMiguelBanner?.button_link ?? undefined}
          />
        </Reveal>

        <Reveal>
          <ProductSection title="Ofertas" href="/produtos?secao=ofertas" products={ofertas} />
        </Reveal>

        <Reveal>
          <PromoSquareBanner
            imageUrl={sagradaFamiliaBanner?.image_url ?? "/images/sagrada-familia.jpg"}
            eyebrow={sagradaFamiliaBanner?.eyebrow ?? "Devoção"}
            title={sagradaFamiliaBanner?.title ?? "Sagrada Família"}
            description={sagradaFamiliaBanner?.description ?? undefined}
            buttonLabel={sagradaFamiliaBanner?.button_label ?? undefined}
            href={sagradaFamiliaBanner?.button_link ?? undefined}
          />
        </Reveal>

        <Reveal>
          <ProductSection title="Imagens" href="/categoria/imagens" products={imagens.products} />
        </Reveal>

        <Reveal>
          <ProductSection title="Terços" href="/categoria/tercos" products={tercos.products} />
        </Reveal>

        <Reveal className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-xl font-semibold sm:text-2xl">
              Perguntas frequentes
            </h2>
            <Link
              href="/perguntas-frequentes"
              className="text-sm font-medium text-accent hover:underline"
            >
              Ver todas as perguntas
            </Link>
          </div>
          <FaqAccordion items={HIGHLIGHT_FAQ_ITEMS} />
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
    </div>
  );
}
