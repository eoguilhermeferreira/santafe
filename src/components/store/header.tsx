"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { Menu, Search } from "lucide-react";

import { CartSheet } from "@/components/store/cart-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { storeConfig } from "@/config/store";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/database.types";

export function Header({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const topLevel = categories.filter((c) => !c.parent_id);
  const [scrolled, setScrolled] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  // Na home, enquanto não rolou, o header flutua transparente por cima do
  // banner (que preenche até o topo da página) em vez de empurrá-lo pra
  // baixo. Nas outras páginas (e assim que rola) ele volta a ser sólido.
  const isHomeOverlay = pathname === "/" && !scrolled;

  React.useEffect(() => {
    // Uma única marca de 24px faz a logo "piscar" entre os dois tamanhos:
    // ao encolher, o header fica mais baixo e a página some um pouco pra
    // cima, o que pode oscilar o scroll bem em cima da marca e disparar o
    // encolher/crescer várias vezes seguidas. Com duas marcas diferentes
    // pra entrar e sair do estado "rolado" sobra uma faixa sem troca no
    // meio, então isso não fica se repetindo.
    const onScroll = () => {
      setScrolled((prev) => (prev ? window.scrollY > 8 : window.scrollY > 40));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const search = new FormData(event.currentTarget).get("q");
    if (typeof search === "string" && search.trim()) {
      setSearchOpen(false);
      router.push(`/produtos?busca=${encodeURIComponent(search.trim())}`);
    }
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-colors duration-300",
        isHomeOverlay
          ? "bg-gradient-to-b from-black/45 via-black/10 to-transparent"
          : "border-b border-border bg-background/95 backdrop-blur"
      )}
    >
      <div
        className={cn(
          "relative mx-auto flex max-w-7xl items-center gap-4 px-4 transition-[padding] duration-300",
          scrolled ? "py-3" : "py-5 sm:py-7",
          isHomeOverlay && "text-white"
        )}
      >
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col gap-6">
              <SheetHeader>
                <SheetTitle>
                  <Image
                    src="/logo-santa-fe.png"
                    alt={storeConfig.name}
                    width={700}
                    height={680}
                    className="h-12 w-auto"
                  />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1">
                <SheetClose asChild>
                  <Link href="/" className="rounded-md px-2 py-2 text-sm font-medium hover:bg-secondary">
                    Início
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link href="/produtos" className="rounded-md px-2 py-2 text-sm font-medium hover:bg-secondary">
                    Todos os produtos
                  </Link>
                </SheetClose>
                {topLevel.map((category) => (
                  <SheetClose asChild key={category.id}>
                    <Link
                      href={`/categoria/${category.slug}`}
                      className="rounded-md px-2 py-2 text-sm hover:bg-secondary"
                    >
                      {category.name}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <div className="absolute inset-y-0 left-1/2 flex -translate-x-1/2 items-center">
          <Link href="/" aria-label={storeConfig.name}>
            <Image
              src="/logo-santa-fe.png"
              alt={storeConfig.name}
              width={700}
              height={680}
              priority
              className={cn(
                "w-auto transition-[height] duration-300",
                scrolled ? "h-14 sm:h-16" : "h-20 sm:h-24"
              )}
            />
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <form onSubmit={handleSearch} className="hidden md:block">
            <div className="relative w-48 lg:w-64">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input name="q" placeholder="Buscar produtos ou código" className="pl-9" />
            </div>
          </form>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Buscar"
            onClick={() => setSearchOpen(true)}
          >
            <Search />
          </Button>
          <CartSheet />
        </div>
      </div>

      <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
        <SheetContent side="top" className="md:hidden">
          <SheetHeader className="sr-only">
            <SheetTitle>Buscar produtos</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSearch} className="pr-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Buscar produtos ou código"
                className="pl-9"
                autoFocus
              />
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </header>
  );
}
