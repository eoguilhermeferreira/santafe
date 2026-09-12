"use client";

import Image from "next/image";
import * as React from "react";
import { Loader2, Star as StarIcon, X } from "lucide-react";
import { toast } from "sonner";

import {
  createReviewUploadUrls,
  submitReview,
  type OrderLookupReview,
} from "@/app/(store)/pedido/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StarRating } from "@/components/ui/star-rating";
import { Textarea } from "@/components/ui/textarea";
import { REVIEW_LIMITS } from "@/lib/reviews";
import { createClient } from "@/lib/supabase/client";

export function ReviewDialog({
  orderNumber,
  email,
  orderItemId,
  productName,
  productImage,
  onSubmitted,
}: {
  orderNumber: number;
  email: string;
  orderItemId: string;
  productName: string;
  productImage: string | null;
  onSubmitted: (review: OrderLookupReview) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState("");
  const [photos, setPhotos] = React.useState<File[]>([]);
  const [video, setVideo] = React.useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const photoInputRef = React.useRef<HTMLInputElement>(null);
  const videoInputRef = React.useRef<HTMLInputElement>(null);

  const photoPreviews = React.useMemo(
    () => photos.map((file) => URL.createObjectURL(file)),
    [photos]
  );
  const videoPreview = React.useMemo(
    () => (video ? URL.createObjectURL(video) : null),
    [video]
  );

  React.useEffect(() => {
    return () => photoPreviews.forEach((url) => URL.revokeObjectURL(url));
  }, [photoPreviews]);

  React.useEffect(() => {
    return () => {
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, [videoPreview]);

  function resetForm() {
    setRating(0);
    setComment("");
    setPhotos([]);
    setVideo(null);
  }

  function handlePhotoSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    if (files.some((file) => !REVIEW_LIMITS.allowedPhotoTypes.includes(file.type))) {
      toast.error("Envie fotos em JPG, PNG ou WEBP.");
      return;
    }
    if (files.some((file) => file.size > REVIEW_LIMITS.maxPhotoBytes)) {
      toast.error("Cada foto pode ter no máximo 5 MB.");
      return;
    }

    setPhotos((current) => {
      const next = [...current, ...files].slice(0, REVIEW_LIMITS.maxPhotos);
      if (current.length + files.length > REVIEW_LIMITS.maxPhotos) {
        toast.error(`Envie no máximo ${REVIEW_LIMITS.maxPhotos} fotos.`);
      }
      return next;
    });
  }

  function handleVideoSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!REVIEW_LIMITS.allowedVideoTypes.includes(file.type)) {
      toast.error("Envie um vídeo em MP4, WEBM ou MOV.");
      return;
    }
    if (file.size > REVIEW_LIMITS.maxVideoBytes) {
      toast.error("O vídeo pode ter no máximo 50 MB.");
      return;
    }
    setVideo(file);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (rating === 0) {
      toast.error("Selecione de 1 a 5 estrelas.");
      return;
    }

    setIsSubmitting(true);

    const prepared = await createReviewUploadUrls({
      orderNumber,
      email,
      orderItemId,
      photos: photos.map((file) => ({ size: file.size, type: file.type })),
      video: video ? { size: video.size, type: video.type } : null,
    });

    if (prepared.error || !prepared.photoSlots) {
      setIsSubmitting(false);
      toast.error(prepared.error ?? "Não foi possível preparar o envio.");
      return;
    }

    // Upload direto pro Supabase Storage — os arquivos não passam pelo
    // servidor da loja, então não travam nem esbarram em limite de tamanho
    // de requisição.
    const supabase = createClient();
    const photoPaths: string[] = [];
    for (let i = 0; i < photos.length; i++) {
      const slot = prepared.photoSlots[i];
      const { error } = await supabase.storage
        .from("reviews")
        .uploadToSignedUrl(slot.path, slot.token, photos[i], { contentType: photos[i].type });
      if (error) {
        setIsSubmitting(false);
        toast.error("Falha ao enviar as fotos. Tente novamente.");
        return;
      }
      photoPaths.push(slot.path);
    }

    let videoPath: string | null = null;
    if (video && prepared.videoSlot) {
      const { error } = await supabase.storage
        .from("reviews")
        .uploadToSignedUrl(prepared.videoSlot.path, prepared.videoSlot.token, video, {
          contentType: video.type,
        });
      if (error) {
        setIsSubmitting(false);
        toast.error("Falha ao enviar o vídeo. Tente novamente.");
        return;
      }
      videoPath = prepared.videoSlot.path;
    }

    const result = await submitReview({
      orderNumber,
      email,
      orderItemId,
      rating,
      comment,
      photoPaths,
      videoPath,
    });
    setIsSubmitting(false);

    if (result.error || !result.review) {
      toast.error(result.error ?? "Não foi possível enviar sua avaliação.");
      return;
    }

    toast.success("Avaliação enviada! Obrigado por avaliar.");
    onSubmitted(result.review);
    setOpen(false);
    resetForm();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <StarIcon className="size-3.5" /> Avaliar produto
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Avalie este produto</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3">
            {productImage && (
              <div className="relative size-14 shrink-0 overflow-hidden rounded-md border border-border">
                <Image src={productImage} alt="" fill className="object-cover" />
              </div>
            )}
            <p className="text-sm font-medium">{productName}</p>
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-medium">Como você avalia sua experiência?</p>
            <StarRating value={rating} onChange={setRating} size="lg" />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="review-comment" className="text-sm font-medium">
              Conte o que você achou (opcional)
            </label>
            <Textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={2000}
              placeholder="Conte o que você achou do produto..."
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-medium">📷 Adicionar fotos (opcional)</p>
            <div className="flex flex-wrap gap-2">
              {photoPreviews.map((url, index) => (
                <div key={url} className="relative size-16 overflow-hidden rounded-md border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element -- preview local (blob:), next/image não otimiza */}
                  <img src={url} alt="" className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos((current) => current.filter((_, i) => i !== index))}
                    className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-black/60 text-white"
                  >
                    <X className="size-2.5" />
                  </button>
                </div>
              ))}
              {photos.length < REVIEW_LIMITS.maxPhotos && (
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="flex size-16 items-center justify-center rounded-md border border-dashed border-input text-xs text-muted-foreground hover:bg-secondary"
                >
                  + Foto
                </button>
              )}
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handlePhotoSelect}
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-medium">🎥 Adicionar vídeo (opcional)</p>
            {videoPreview ? (
              <div className="relative w-40">
                <video src={videoPreview} controls className="w-40 rounded-md border border-border" />
                <button
                  type="button"
                  onClick={() => setVideo(null)}
                  className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white"
                >
                  <X className="size-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="flex h-16 w-40 items-center justify-center rounded-md border border-dashed border-input text-xs text-muted-foreground hover:bg-secondary"
              >
                + Vídeo
              </button>
            )}
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="hidden"
              onChange={handleVideoSelect}
            />
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Enviar avaliação
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
