import { BookOpenText, CreditCard, Star, Truck } from "lucide-react";

import { CrucifixIcon } from "@/components/icons/religious-icons";
import { storeConfig } from "@/config/store";

// Um ícone pra cada frase de storeConfig.announcements, na mesma ordem.
const ICONS = [Truck, BookOpenText, CrucifixIcon, CreditCard, Star];

/**
 * Barra fixa no topo da loja com as frases passando em esteira contínua
 * (direita pra esquerda), sem parar. O conteúdo é duplicado uma vez e a
 * animação anda exatamente 50% da largura — quando a cópia chega no lugar
 * da original, o CSS reinicia o loop sem dar pra perceber a emenda.
 */
export function AnnouncementBar() {
  const messages = storeConfig.announcements;

  const track = (
    <div className="flex shrink-0 items-center">
      {messages.map((message, index) => {
        const Icon = ICONS[index % ICONS.length];
        return (
          <span key={index} className="flex items-center gap-2 px-6">
            <Icon className="size-3.5 shrink-0 sm:size-4" />
            <span className="whitespace-nowrap text-xs font-medium tracking-wide sm:text-sm">
              {message}
            </span>
          </span>
        );
      })}
    </div>
  );

  return (
    <div className="h-9 overflow-hidden bg-primary text-primary-foreground">
      <div className="flex h-full w-max animate-marquee items-center">
        {track}
        {track}
      </div>
    </div>
  );
}
