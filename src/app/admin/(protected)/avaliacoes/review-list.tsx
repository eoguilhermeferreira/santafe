"use client";

import Link from "next/link";
import * as React from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  deleteReview,
  updateReviewStatus,
  type ReviewWithContext,
} from "@/app/admin/(protected)/avaliacoes/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ReviewStatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";

export function ReviewList({ initialReviews }: { initialReviews: ReviewWithContext[] }) {
  const [reviews, setReviews] = React.useState(initialReviews);
  const [, startTransition] = React.useTransition();

  function handleStatus(id: string, status: "publicada" | "oculta") {
    startTransition(async () => {
      const result = await updateReviewStatus(id, status);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setReviews((current) => current.map((r) => (r.id === id ? { ...r, status } : r)));
      toast.success(status === "publicada" ? "Avaliação publicada" : "Avaliação ocultada");
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteReview(id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setReviews((current) => current.filter((r) => r.id !== id));
      toast.success("Avaliação excluída");
    });
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead>Pedido</TableHead>
            <TableHead>Nota</TableHead>
            <TableHead>Avaliação</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-56">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((review) => (
            <TableRow key={review.id}>
              <TableCell className="max-w-40 align-top">
                {review.product_slug ? (
                  <Link
                    href={`/produto/${review.product_slug}`}
                    target="_blank"
                    className="font-medium hover:underline"
                  >
                    {review.product_name}
                  </Link>
                ) : (
                  <span className="font-medium">{review.product_name}</span>
                )}
              </TableCell>
              <TableCell className="align-top text-muted-foreground">
                {review.order_number ? `#${review.order_number}` : "—"}
              </TableCell>
              <TableCell className="align-top">
                <StarRating value={review.rating} size="sm" />
              </TableCell>
              <TableCell className="max-w-sm align-top text-sm">
                <p className="font-medium">{review.customer_name}</p>
                <p className="text-xs text-muted-foreground">{review.email}</p>
                {review.comment && <p className="mt-1 whitespace-pre-line">{review.comment}</p>}
                {(review.photo_urls.length > 0 || review.video_url) && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {review.photo_urls.map((url) => (
                      <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element -- miniatura de moderação */}
                        <img src={url} alt="" className="size-12 rounded border border-border object-cover" />
                      </a>
                    ))}
                    {review.video_url && (
                      <a
                        href={review.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex size-12 items-center justify-center rounded border border-border text-xs text-muted-foreground"
                      >
                        🎥
                      </a>
                    )}
                  </div>
                )}
                <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(review.created_at)}</p>
              </TableCell>
              <TableCell className="align-top">
                <ReviewStatusBadge status={review.status} />
              </TableCell>
              <TableCell className="align-top">
                <div className="flex flex-wrap gap-1.5">
                  {review.status !== "publicada" && (
                    <Button size="sm" variant="outline" onClick={() => handleStatus(review.id, "publicada")}>
                      Aprovar/Publicar
                    </Button>
                  )}
                  {review.status !== "oculta" && (
                    <Button size="sm" variant="outline" onClick={() => handleStatus(review.id, "oculta")}>
                      Ocultar
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost" aria-label="Excluir avaliação">
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir esta avaliação?</AlertDialogTitle>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(review.id)}>Excluir</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {reviews.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                Nenhuma avaliação ainda.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
