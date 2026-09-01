import {
  BookOpen,
  BookMarked,
  Shirt,
  Cross,
  CircleDashed,
  Image as ImageIcon,
  HandHeart,
  Link as LinkIcon,
  NotebookPen,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";

/**
 * Mapa de nome (salvo em categories.icon) -> componente de ícone.
 * Usado na navegação por categorias da home e do menu.
 */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  biblias: BookOpen,
  camisetas: Shirt,
  crucifixos: Cross,
  tercos: CircleDashed,
  imagens: ImageIcon,
  escapularios: HandHeart,
  livros: BookMarked,
  "tercos-de-pulso": LinkIcon,
  "diario-biblico-2027": NotebookPen,
};

export function getCategoryIcon(name: string | null): LucideIcon {
  if (!name) return ShoppingBag;
  return CATEGORY_ICONS[name] ?? ShoppingBag;
}
