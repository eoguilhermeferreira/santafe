import Image from "next/image";

/**
 * Bloco institucional da home: foto da loja de um lado, texto do outro
 * (no mobile a foto fica em cima, o texto embaixo). Texto é um rascunho —
 * a loja revisa depois.
 */
export function AboutSection() {
  return (
    <div className="grid gap-6 overflow-hidden rounded-2xl border border-border bg-card sm:grid-cols-2 sm:gap-0">
      <div className="relative aspect-[3/4] bg-muted">
        <Image
          src="/images/fachada-loja.jpg"
          alt="Fachada da loja Santa Fé Artigos Católicos"
          fill
          sizes="(min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col justify-center gap-3 p-6 sm:p-10">
        <span className="text-xs font-semibold uppercase tracking-wide text-accent">
          Nossa história
        </span>
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">Sobre a Santa Fé</h2>
        <p className="text-sm text-muted-foreground sm:text-base">
          A Santa Fé Artigos Católicos nasceu do desejo de levar fé e devoção pra dentro de
          cada lar. Em nossa loja física em Avaré/SP, e agora também aqui online, selecionamos
          com carinho bíblias, terços, crucifixos, imagens e escapulários pra acompanhar você
          em cada momento da caminhada — da oração do dia a dia às datas mais especiais da
          família.
        </p>
        <p className="text-sm text-muted-foreground sm:text-base">
          Cada peça é escolhida pensando em qualidade e significado, pra ser presente ou
          lembrança de fé por muitos anos. Agora entregamos pra todo o Brasil, com o mesmo
          cuidado de sempre.
        </p>
      </div>
    </div>
  );
}
