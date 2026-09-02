import type * as React from "react";

import { BookOpen, BookMarked, Shirt, NotebookPen, ShoppingBag } from "lucide-react";

import {
  CrucifixIcon,
  RosaryIcon,
  SaintIcon,
  ScapularIcon,
} from "@/components/icons/religious-icons";

type IconComponent = React.ComponentType<{ className?: string }>;

/**
 * Mapa de nome (salvo em categories.icon) -> componente de ícone.
 * Usado na navegação por categorias da home e do menu.
 */
export const CATEGORY_ICONS: Record<string, IconComponent> = {
  biblias: BookOpen,
  camisetas: Shirt,
  crucifixos: CrucifixIcon,
  tercos: RosaryIcon,
  imagens: SaintIcon,
  escapularios: ScapularIcon,
  livros: BookMarked,
  "tercos-de-pulso": RosaryIcon,
  "diario-biblico-2027": NotebookPen,
};

export function getCategoryIcon(name: string | null): IconComponent {
  if (!name) return ShoppingBag;
  return CATEGORY_ICONS[name] ?? ShoppingBag;
}
