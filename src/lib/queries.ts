import { createClient } from "@/lib/supabase/public";
import type { Category, HomeSection, ProductWithRelations } from "@/types/database.types";

const PRODUCT_SELECT = `
  *,
  product_images ( id, url, display_order ),
  product_variations ( id, label, value, stock ),
  categories:category_id ( id, name, slug )
`;

function sortImages(product: ProductWithRelations): ProductWithRelations {
  return {
    ...product,
    product_images: [...product.product_images].sort(
      (a, b) => a.display_order - b.display_order
    ),
  };
}

export async function getActiveBanners() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getProductsByHomeSection(
  section: HomeSection,
  limit = 8
): Promise<ProductWithRelations[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("home_section", section)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as unknown as ProductWithRelations[]).map(sortImages);
}

export async function getProducts(options: {
  search?: string;
  categorySlug?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<{ products: ProductWithRelations[]; total: number }> {
  const { search, categorySlug, page = 1, pageSize = 24 } = options;
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT, { count: "exact" })
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
  }

  if (categorySlug) {
    const category = await getCategoryBySlug(categorySlug);
    if (!category) return { products: [], total: 0 };

    const { data: subcategories } = await supabase
      .from("categories")
      .select("id")
      .eq("parent_id", category.id);

    const categoryIds = [category.id, ...(subcategories ?? []).map((c) => c.id)];
    query = query.in("category_id", categoryIds);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await query.range(from, to);

  if (error) throw error;
  return {
    products: (data as unknown as ProductWithRelations[]).map(sortImages),
    total: count ?? 0,
  };
}

export async function getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return sortImages(data as unknown as ProductWithRelations);
}

export async function getRelatedProducts(
  categoryId: string | null,
  excludeProductId: string,
  limit = 4
): Promise<ProductWithRelations[]> {
  if (!categoryId) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .neq("id", excludeProductId)
    .limit(limit);

  if (error) throw error;
  return (data as unknown as ProductWithRelations[]).map(sortImages);
}
