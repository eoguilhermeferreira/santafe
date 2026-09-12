import { getReviews } from "@/app/admin/(protected)/avaliacoes/actions";
import { ReviewList } from "@/app/admin/(protected)/avaliacoes/review-list";

export const metadata = { title: "Avaliações" };

export default async function AdminAvaliacoesPage() {
  const reviews = await getReviews();

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-semibold">Avaliações</h1>
      <ReviewList initialReviews={reviews} />
    </div>
  );
}
