import Link from "next/link";
import { Mail, MapPin } from "lucide-react";

import { FacebookIcon } from "@/components/icons/facebook-icon";
import { InstagramIcon } from "@/components/icons/instagram-icon";
import { TikTokIcon } from "@/components/icons/tiktok-icon";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { storeConfig } from "@/config/store";

export function Footer() {
  const { instagram, tiktok, facebook } = storeConfig.contact;
  const hasSocial = Boolean(instagram || tiktok || facebook);

  return (
    <footer className="mt-16 bg-black text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-accent">{storeConfig.name}</h2>
          <p className="mt-2 text-sm text-white/60">{storeConfig.description}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Institucional</h3>
          <nav className="mt-2 flex flex-col gap-1.5 text-sm text-white/60">
            <Link href="/produtos" className="hover:text-accent">Todos os produtos</Link>
            <Link href="/carrinho" className="hover:text-accent">Meu carrinho</Link>
          </nav>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Atendimento</h3>
          <div className="mt-2 flex flex-col gap-2 text-sm text-white/60">
            <a
              href={`https://wa.me/${storeConfig.contact.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 hover:text-accent"
            >
              <WhatsAppIcon className="size-4" /> WhatsApp
            </a>
            <a
              href={`mailto:${storeConfig.contact.email}`}
              className="flex items-center gap-2 hover:text-accent"
            >
              <Mail className="size-4" /> {storeConfig.contact.email}
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="size-4" /> {storeConfig.address.city} - {storeConfig.address.state}
            </span>
          </div>
        </div>

        {hasSocial && (
          <div>
            <h3 className="text-sm font-semibold">Redes sociais</h3>
            <div className="mt-2 flex flex-col gap-2 text-sm text-white/60">
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:text-accent"
                >
                  <InstagramIcon className="size-4" /> Instagram
                </a>
              )}
              {tiktok && (
                <a
                  href={tiktok}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:text-accent"
                >
                  <TikTokIcon className="size-4" /> TikTok
                </a>
              )}
              {facebook && (
                <a
                  href={facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:text-accent"
                >
                  <FacebookIcon className="size-4" /> Facebook
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {storeConfig.name}. Todos os direitos reservados.
      </div>
    </footer>
  );
}
