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

interface ReviewEligibility {
  error?: string;
  orderId?: string;
  customerName?: string;
  email?: string;
  productId?: string;
}

/**
 * Reverificação central usada tanto pra pedir as URLs de upload quanto pra
 * confirmar o envio final — sem conta de cliente, então tudo depende de
 * número do pedido + e-mail baterem (igual ao lookup) e o item comprado
 * pertencer a esse pedido, estar entregue e ainda não ter sido avaliado.
 */
async function verifyReviewEligibility(
  orderNumber: number,
  email: string,
  orderItemId: string
): Promise<ReviewEligibility> {
  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, email, customer_name, delivery_status, delivery_method, order_items(id, product_id)")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (!order || order.email.toLowerCase() !== email.toLowerCase()) {
    return { error: "Pedido não encontrado. Confira o número e o e-mail informados." };
  }
  if (!isReviewEligible(order.delivery_status, order.delivery_method)) {
    return { error: "A avaliação só fica disponível depois que o pedido é entregue." };
  }

  const item = order.order_items.find((orderItem) => orderItem.id === orderItemId);
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

  return { orderId: order.id, customerName: order.customer_name, email: order.email, productId: item.product_id };
}

const uploadUrlsInput = z.object({
  orderNumber: z.coerce.number().int().positive(),
  email: z.string().trim().email(),
  orderItemId: z.string().uuid(),
  photos: z
    .array(z.object({ size: z.number(), type: z.string() }))
    .max(REVIEW_LIMITS.maxPhotos),
  video: z.object({ size: z.number(), type: z.string() }).nullable(),
});

export interface ReviewUploadSlot {
  path: string;
  token: string;
}

export interface CreateReviewUploadUrlsResult {
  error?: string;
  photoSlots?: ReviewUploadSlot[];
  videoSlot?: ReviewUploadSlot | null;
}

/**
 * Gera URLs assinadas pro navegador subir os arquivos DIRETO no Supabase
 * Storage — os bytes nunca passam pela server action. Isso evita o limite
 * de tamanho de corpo da requisição da Vercel/Next.js (que travava ou
 * derrubava o envio de foto/vídeo antes de chegar aqui).
 */
export async function createReviewUploadUrls(input: unknown): Promise<CreateReviewUploadUrlsResult> {
  const parsed = uploadUrlsInput.safeParse(input);
  if (!parsed.success) return { error: "Dados inválidos." };

  for (const photo of parsed.data.photos) {
    if (!REVIEW_LIMITS.allowedPhotoTypes.includes(photo.type)) {
      return { error: "As fotos precisam ser JPG, PNG ou WEBP." };
    }
    if (photo.size > REVIEW_LIMITS.maxPhotoBytes) {
      return { error: "Cada foto pode ter no máximo 5 MB." };
    }
  }
  if (parsed.data.video) {
    if (!REVIEW_LIMITS.allowedVideoTypes.includes(parsed.data.video.type)) {
      return { error: "O vídeo precisa ser MP4, WEBM ou MOV." };
    }
    if (parsed.data.video.size > REVIEW_LIMITS.maxVideoBytes) {
      return { error: "O vídeo pode ter no máximo 50 MB." };
    }
  }

  const eligibility = await verifyReviewEligibility(
    parsed.data.orderNumber,
    parsed.data.email,
    parsed.data.orderItemId
  );
  if (eligibility.error) return { error: eligibility.error };

  const supabase = createAdminClient();
  const photoSlots: ReviewUploadSlot[] = [];
  for (let i = 0; i < parsed.data.photos.length; i++) {
    const path = `${parsed.data.orderItemId}/${crypto.randomUUID()}`;
    const { data, error } = await supabase.storage.from("reviews").createSignedUploadUrl(path);
    if (error || !data) return { error: "Não foi possível preparar o envio das fotos." };
    photoSlots.push({ path: data.path, token: data.token });
  }

  let videoSlot: ReviewUploadSlot | null = null;
  if (parsed.data.video) {
    const path = `${parsed.data.orderItemId}/${crypto.randomUUID()}`;
    const { data, error } = await supabase.storage.from("reviews").createSignedUploadUrl(path);
    if (error || !data) return { error: "Não foi possível preparar o envio do vídeo." };
    videoSlot = { path: data.path, token: data.token };
  }

  return { photoSlots, videoSlot };
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
  photoPaths: z.array(z.string()).max(REVIEW_LIMITS.maxPhotos),
  videoPath: z.string().nullable(),
});

export interface SubmitReviewResult {
  error?: string;
  review?: OrderLookupReview;
}

/**
 * Confirmação final — os arquivos já foram enviados direto pro Storage
 * (ver createReviewUploadUrls); aqui só reverificamos tudo de novo (defesa
 * em profundidade contra uma corrida entre as duas chamadas) e gravamos a
 * avaliação com as URLs públicas dos arquivos já enviados.
 */
export async function submitReview(input: unknown): Promise<SubmitReviewResult> {
  const parsed = submitReviewInput.safeParse(input);
  if (!parsed.success) {
    return { error: "Selecione de 1 a 5 estrelas pra avaliar." };
  }

  const eligibility = await verifyReviewEligibility(
    parsed.data.orderNumber,
    parsed.data.email,
    parsed.data.orderItemId
  );
  if (eligibility.error || !eligibility.productId) {
    return { error: eligibility.error ?? "Não encontramos esse produto no seu pedido." };
  }

  const supabase = createAdminClient();
  const photoUrls = parsed.data.photoPaths.map(
    (path) => supabase.storage.from("reviews").getPublicUrl(path).data.publicUrl
  );
  const videoUrl = parsed.data.videoPath
    ? supabase.storage.from("reviews").getPublicUrl(parsed.data.videoPath).data.publicUrl
    : null;

  const { data: review, error: insertError } = await supabase
    .from("reviews")
    .insert({
      product_id: eligibility.productId,
      order_id: eligibility.orderId!,
      order_item_id: parsed.data.orderItemId,
      customer_name: eligibility.customerName!,
      email: eligibility.email!,
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
