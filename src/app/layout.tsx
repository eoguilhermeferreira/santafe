import type { Metadata } from "next";
import { Fraunces, Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/components/cart/cart-provider";
import { storeConfig } from "@/config/store";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: storeConfig.name,
    template: `%s · ${storeConfig.name}`,
  },
  description: storeConfig.description,
  metadataBase: storeConfig.siteUrl ? new URL(storeConfig.siteUrl) : undefined,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      className={`${poppins.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-clip bg-background text-foreground">
        <CartProvider>
          {children}
          <Toaster position="top-center" richColors closeButton />
        </CartProvider>
      </body>
    </html>
  );
}
