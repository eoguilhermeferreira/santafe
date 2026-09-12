"use server";

import { z } from "zod";

import { isReviewEligible, REVIEW_LIMITS } from "@/lib/reviews";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DeliveryStatus, PaymentStatus, ReviewStatus } from "@/types/database.types";

const lookupInput = z.object({
  orderNumber: z.coerce.number().int().positive(),
  email: z.string().trim().email(),
});

export interface OrderLookupReview {
  id: string;
  rating: number;
  comment: string | null;
  photoUrls: string[];
  videoUrl: string | null;
  status: ReviewStatus;
}

export interface OrderLookupResult {
  error?: string;
  order?: {
    id: string;
    orderNumber: number;
    subtotal: number;
    shippingCost: number;
    shippingMethod: string | null;
    total: number;
    paymentStatus: PaymentStatus;
    deliveryStatus: DeliveryStatus;
    createdAt: string;
    canReview: boolean;
    items: {
      orderItemId: string;
      productId: string | null;
      productSlug: string | null;
      productImage: string | null;
      productName: string;
      quantity: number;
      unitPrice: number;
      variationValue: string | null;
      review: OrderLookupReview | null;
    }[];
  };
}

/**
 * Consulta pública de pedido sem login: número do pedido + e-mail usado na
 * compra. Não expõe endereço/telefone — só o essencial pra acompanhar o
 * status e, se estiver pendente, pagar de novo sem criar outro pedido.
 */
export async function lookupOrder(input: unknown): Promise<OrderLookupResult> {
  const parsed = lookupInput.safeParse(input);
  if (!parsed.success) {
    return { error: "Informe o número do pedido e o e-mail usado na compra." };
  }

  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*, products(slug, product_images(url, display_order)))")
    .eq("order_number", parsed.data.orderNumber)
    .maybeSingle();

  if (!order || order.email.toLowerCase() !== parsed.data.email.toLowerCase()) {
    return { error: "Pedido não encontrado. Confira o número e o e-mail informados." };
  }

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("order_id", order.id);

  const reviewByItem = new Map((reviews ?? []).map((review) => [review.order_item_id, review]));
  const canReview = isReviewEligible(order.delivery_status, order.delivery_method);

  return {
    order: {
      id: order.id,
      orderNumber: order.order_number,
      subtotal: order.subtotal,
      shippingCost: order.shipping_cost,
      shippingMethod: order.shipping_method,
      total: order.total,
      paymentStatus: order.payment_status,
      deliveryStatus: order.delivery_status,
      createdAt: order.created_at,
      canReview,
      items: order.order_items.map((item) => {
        const images = [...(item.products?.product_images ?? [])].sort(
          (a, b) => a.display_order - b.display_order
        );
        const review = reviewByItem.get(item.id);
        return {
          orderItemId: item.id,
          productId: item.product_id,
          productSlug: item.products?.slug ?? null,
          productImage: images[0]?.url ?? null,
          productName: item.product_name,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          variationValue: item.variation_value,
          review: review
            ? {
                id: review.id,
                rating: review.rating,
                comment: review.comment,
                photoUrls: review.photo_urls,
                videoUrl: review.video_url,
                status: review.status,
              }
            : null,
        };
      }),
    },
  };
}

const submitReviewInput = z.object({
  orderNumber: z.coerce.number().int().positive(),
  email: z.string().trim().email(),
  orderItemId: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((value) => (value ? value : null)),
});

export interface SubmitReviewResult {
  error?: string;
  review?: OrderLookupReview;
}

/**
 * Envio de avaliação — sem conta de cliente, então reverificamos o pedido
 * (número + e-mail, igual ao lookup) e que o item comprado pertence a esse
 * pedido e ainda não foi avaliado, antes de aceitar qualquer arquivo.
 */
export async function submitReview(formData: FormData): Promise<SubmitReviewResult> {
  const parsed = submitReviewInput.safeParse({
    orderNumber: formData.get("orderNumber"),
    email: formData.get("email"),
    orderItemId: formData.get("orderItemId"),
    rating: formData.get("rating"),
    comment: formData.get("comment") ?? undefined,
  });

  if (!parsed.success) {
    return { error: "Selecione de 1 a 5 estrelas pra avaliar." };
  }

  const photos = formData
    .getAll("photos")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
  const videoEntry = formData.get("video");
  const video = videoEntry instanceof File && videoEntry.size > 0 ? videoEntry : null;

  if (photos.length > REVIEW_LIMITS.maxPhotos) {
    return { error: `Envie no máximo ${REVIEW_LIMITS.maxPhotos} fotos.` };
  }
  for (const photo of photos) {
    if (!REVIEW_LIMITS.allowedPhotoTypes.includes(photo.type)) {
      return { error: "As fotos precisam ser JPG, PNG ou WEBP." };
    }
    if (photo.size > REVIEW_LIMITS.maxPhotoBytes) {
      return { error: "Cada foto pode ter no máximo 5 MB." };
    }
  }
  if (video) {
    if (!REVIEW_LIMITS.allowedVideoTypes.includes(video.type)) {
      return { error: "O vídeo precisa ser MP4, WEBM ou MOV." };
    }
    if (video.size > REVIEW_LIMITS.maxVideoBytes) {
      return { error: "O vídeo pode ter no máximo 50 MB." };
    }
  }

  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, email, customer_name, delivery_status, delivery_method, order_items(id, product_id)")
    .eq("order_number", parsed.data.orderNumber)
    .maybeSingle();

  if (!order || order.email.toLowerCase() !== parsed.data.email.toLowerCase()) {
    return { error: "Pedido não encontrado. Confira o número e o e-mail informados." };
  }

  if (!isReviewEligible(order.delivery_status, order.delivery_method)) {
    return { error: "A avaliação só fica disponível depois que o pedido é entregue." };
  }

  const item = order.order_items.find((orderItem) => orderItem.id === parsed.data.orderItemId);
  if (!item || !item.product_id) {
    return { error: "Não encontramos esse produto no seu pedido." };
  }

  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("order_item_id", item.id)
    .maybeSingle();

  if (existingReview) {
    return { error: "Você já avaliou este produto." };
  }

  const photoUrls: string[] = [];
  for (const photo of photos) {
    const ext = photo.name.split(".").pop() || "jpg";
    const path = `${item.id}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("reviews")
      .upload(path, photo, { contentType: photo.type, cacheControl: "3600" });
    if (uploadError) return { error: "Falha ao enviar as fotos. Tente novamente." };
    photoUrls.push(supabase.storage.from("reviews").getPublicUrl(path).data.publicUrl);
  }

  let videoUrl: string | null = null;
  if (video) {
    const ext = video.name.split(".").pop() || "mp4";
    const path = `${item.id}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("reviews")
      .upload(path, video, { contentType: video.type, cacheControl: "3600" });
    if (uploadError) return { error: "Falha ao enviar o vídeo. Tente novamente." };
    videoUrl = supabase.storage.from("reviews").getPublicUrl(path).data.publicUrl;
  }

  const { data: review, error: insertError } = await supabase
    .from("reviews")
    .insert({
      product_id: item.product_id,
      order_id: order.id,
      order_item_id: item.id,
      customer_name: order.customer_name,
      email: order.email,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      photo_urls: photoUrls,
      video_url: videoUrl,
    })
    .select("*")
    .single();

  if (insertError || !review) {
    return { error: "Não foi possível enviar sua avaliação. Tente novamente." };
  }

  return {
    review: {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      photoUrls: review.photo_urls,
      videoUrl: review.video_url,
      status: review.status,
    },
  };
}
