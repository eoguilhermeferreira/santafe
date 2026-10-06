import Image from "next/image";

/**
 * Bloco institucional da home: foto da loja de um lado, texto do outro
 * (no mobile a foto fica em cima, o texto embaixo).
 */
export function AboutSection() {
  return (
    <div className="grid gap-6 overflow-hidden rounded-2xl border border-border bg-card sm:grid-cols-2 sm:gap-0">
      <div className="relative aspect-[923/1280] bg-muted">
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
          A Santa Fé nasceu de uma necessidade e de um propósito.
        </p>
        <p className="text-sm text-muted-foreground sm:text-base">
          Ao participar de encontros e viver a fé de perto, percebi a falta de um espaço em
          nossa cidade onde as pessoas pudessem encontrar artigos católicos com significado e
          propósito.
        </p>
        <p className="text-sm text-muted-foreground sm:text-base">
          Em um momento delicado da minha família, com o adoecimento do meu esposo, deixei meu
          trabalho e, com fé e coragem, dei início à Santa Fé.
        </p>
        <p className="text-sm text-muted-foreground sm:text-base">
          Começamos pela internet e, pelas mãos de Deus, chegamos à nossa loja física.
        </p>
        <p className="text-sm text-muted-foreground sm:text-base">
          Hoje, a Santa Fé é mais do que uma loja: é um lugar para encontrar, viver e
          compartilhar a fé, com carinho, amor e propósito.
        </p>
        <p className="text-sm text-muted-foreground sm:text-base">
          O que começou como uma necessidade, Deus transformou em missão.
        </p>
      </div>
    </div>
  );
}
