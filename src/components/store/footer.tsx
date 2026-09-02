import Image from "next/image";
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
    <footer className="mt-16 bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Image
            src="/logo-santa-fe.png"
            alt={storeConfig.name}
            width={700}
            height={680}
            className="h-16 w-auto"
          />
          <p className="mt-2 text-sm text-primary-foreground/60">{storeConfig.description}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Institucional</h3>
          <nav className="mt-2 flex flex-col gap-1.5 text-sm text-primary-foreground/60">
            <Link href="/produtos" className="hover:text-accent">Todos os produtos</Link>
            <Link href="/carrinho" className="hover:text-accent">Meu carrinho</Link>
          </nav>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Atendimento</h3>
          <div className="mt-2 flex flex-col gap-2 text-sm text-primary-foreground/60">
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
            <div className="mt-2 flex flex-col gap-2 text-sm text-primary-foreground/60">
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

      <div className="border-t border-primary-foreground/10 px-4 py-4 text-center text-xs text-primary-foreground/50">
        <p>
          © {new Date().getFullYear()}, Santa Fé Artigos Católicos. É vedada qualquer reprodução
          total ou parcial, nos termos da Lei nº 9.610/98. Todos os direitos reservados.
        </p>
        <p className="mt-1">CNPJ: {storeConfig.cnpj}</p>
        <p className="mt-3">
          Feito pela{" "}
          <a
            href="https://instagram.com/agencynodex"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-primary-foreground/70 hover:text-accent"
          >
            Agência Nodex
          </a>
        </p>
      </div>
    </footer>
  );
}
