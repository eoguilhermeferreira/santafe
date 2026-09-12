"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import type { Review, ReviewStatus } from "@/types/database.types";

export interface ReviewWithContext extends Review {
  product_name: string;
  product_slug: string | null;
  order_number: number | null;
}

export async function getReviews(): Promise<ReviewWithContext[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*, products(name, slug), orders(order_number)")
    .order("created_at", { ascending: false })
    .limit(200);

  return ((data ?? []) as unknown as Array<
    Review & { products: { name: string; slug: string } | null; orders: { order_number: number } | null }
  >).map((review) => ({
    ...review,
    product_name: review.products?.name ?? "Produto removido",
    product_slug: review.products?.slug ?? null,
    order_number: review.orders?.order_number ?? null,
  }));
}

const statusSchema = z.enum(["pendente", "publicada", "oculta"]);

export async function updateReviewStatus(
  id: string,
  status: ReviewStatus
): Promise<{ error?: string }> {
  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) return { error: "Status inválido." };

  const supabase = await createClient();
  const { error } = await supabase.from("reviews").update({ status: parsed.data }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/avaliacoes");
  return {};
}

function storagePathFromUrl(url: string): string | null {
  const marker = "/object/public/reviews/";
  const index = url.indexOf(marker);
  return index === -1 ? null : url.slice(index + marker.length);
}

export async function deleteReview(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: review } = await supabase
    .from("reviews")
    .select("photo_urls, video_url")
    .eq("id", id)
    .maybeSingle();

  const paths = [
    ...((review?.photo_urls ?? []).map(storagePathFromUrl)),
    review?.video_url ? storagePathFromUrl(review.video_url) : null,
  ].filter((path): path is string => Boolean(path));

  if (paths.length > 0) {
    await supabase.storage.from("reviews").remove(paths);
  }

  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/avaliacoes");
  return {};
}
