import type { DeliveryMethod, DeliveryStatus } from "@/types/database.types";

/**
 * Entrega libera avaliação quando o status é "entregue". Retirada na loja
 * não tem um status de "cliente retirou" separado — "pronto_para_retirar"
 * já é o último passo que o admin controla, então é o equivalente pra
 * liberar a avaliação nesse fluxo.
 */
export function isReviewEligible(deliveryStatus: DeliveryStatus, deliveryMethod: DeliveryMethod): boolean {
  if (deliveryMethod === "retirada") return deliveryStatus === "pronto_para_retirar";
  return deliveryStatus === "entregue";
}

export const REVIEW_LIMITS = {
  maxPhotos: 5,
  maxPhotoBytes: 5 * 1024 * 1024,
  maxVideoBytes: 50 * 1024 * 1024,
  allowedPhotoTypes: ["image/jpeg", "image/png", "image/webp"] as string[],
  allowedVideoTypes: ["video/mp4", "video/webm", "video/quicktime"] as string[],
};
