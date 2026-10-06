import { Quote } from "lucide-react";

import { StarRating } from "@/components/ui/star-rating";
import { cn } from "@/lib/utils";

interface Testimonial {
  name: string;
  initial: string;
  color: string;
  text: string;
}

// Avaliações reais da loja no Google — texto transcrito a pedido da dona,
// sem usar os prints originais (sem foto de perfil real de ninguém).
const TESTIMONIALS: Testimonial[] = [
  {
    name: "Luzia Diniz",
    initial: "L",
    color: "bg-rose-400",
    text: "Artigos que evangelizam e ótimas opções para presentear, peças de muito bom gosto. Local com facilidade para estacionar o veículo e atendimento nota mil.",
  },
  {
    name: "Sonia Sorba",
    initial: "S",
    color: "bg-sky-500",
    text: "Sempre que preciso de algum mimo de artigos religiosos, em Avaré, sempre busco na Santa Fé. Tem bons preços e artigos de boa procedência, além da simpatia da proprietária. Atendimento em excelência.",
  },
  {
    name: "Artes da Lê",
    initial: "A",
    color: "bg-violet-500",
    text: "Entrar na sua loja é uma experiência linda. O atendimento é impecável e o bom gosto está em cada detalhe, mas o que mais me impressionou foi a atmosfera de paz — dá para sentir a presença de Deus em cada canto desse espaço.",
  },
  {
    name: "Amanda Fidêncio Carlota",
    initial: "A",
    color: "bg-emerald-500",
    text: "Loja maravilhosa, atendimento excelente, recomendo de olhos fechados — você encontra lindos presentes para batizado, casamento, entre outros!",
  },
];

/**
 * Prova social com avaliações reais do Google, reescritas em texto (sem usar
 * os prints originais) com avatares de iniciais coloridas no estilo Google.
 */
export function GoogleReviews() {
  return (
    <section className="space-y-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="text-xs font-semibold uppercase tracking-wide text-accent">
          Avaliações reais de clientes
        </span>
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">
          O que dizem sobre a Santa Fé
        </h2>
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 shadow-sm">
          <span className="font-display text-2xl font-bold leading-none">5.0</span>
          <StarRating value={5} size="sm" />
          <span className="text-sm text-muted-foreground">no Google</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TESTIMONIALS.map((testimonial) => (
          <div
            key={testimonial.name}
            className="relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <Quote className="absolute -right-2 -top-2 size-16 rotate-12 text-accent/10" />
            <div className="relative flex items-center gap-3">
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white",
                  testimonial.color
                )}
              >
                {testimonial.initial}
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">{testimonial.name}</p>
                <StarRating value={5} size="sm" />
              </div>
            </div>
            <p className="relative text-sm text-muted-foreground">{testimonial.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
