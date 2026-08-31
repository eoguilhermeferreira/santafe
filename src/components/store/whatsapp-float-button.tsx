import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { storeConfig } from "@/config/store";

export function WhatsAppFloatButton() {
  return (
    <a
      href={`https://wa.me/${storeConfig.contact.whatsapp}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in motion-safe:duration-500"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
