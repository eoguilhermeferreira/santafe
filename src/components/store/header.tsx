"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
import type { Category } from "@/types/database.types";

export function Header({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const topLevel = categories.filter((c) => !c.parent_id);

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const search = new FormData(event.currentTarget).get("q");
    if (typeof search === "string" && search.trim()) {
      router.push(`/produtos?busca=${encodeURIComponent(search.trim())}`);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="relative mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col gap-6">
              <SheetHeader>
                <SheetTitle className="font-display text-xl text-accent">{storeConfig.name}</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1">
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

        <Link
          href="/"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-xl font-semibold tracking-tight text-accent"
        >
          {storeConfig.name}
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <form onSubmit={handleSearch} className="hidden md:block">
            <div className="relative w-48 lg:w-64">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input name="q" placeholder="Buscar produtos ou código" className="pl-9" />
            </div>
          </form>
          <Button asChild variant="ghost" size="icon" className="md:hidden" aria-label="Buscar">
            <Link href="/produtos">
              <Search />
            </Link>
          </Button>
          <CartSheet />
        </div>
      </div>
    </header>
  );
}
