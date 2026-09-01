"use client";

import * as React from "react";

/**
 * Seção de vídeo em tela cheia, largura total (fora do container da home),
 * que fica "grudada" na tela enquanto a pessoa rola por cima dela — como um
 * buraco que se abre no meio do site. O vídeo não avança sozinho visualmente:
 * ele fica tocando (mudo, em loop) só pra manter o Safari decodificando
 * frames de verdade, mas a cada frame de animação a gente força o
 * currentTime pra bater com a posição do scroll — na prática trava o
 * vídeo na posição do scroll, sem deixar ele "andar" sozinho.
 *
 * A altura da área presa é calculada em pixels via JS (não em vh/dvh) —
 * unidades de viewport têm suporte inconsistente entre navegadores mobile,
 * e um valor errado zera a altura da seção inteira, sumindo com o vídeo.
 */
export function ScrollVideoBanner({
  videoUrl,
  posterUrl,
}: {
  videoUrl: string;
  posterUrl?: string;
}) {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const durationRef = React.useRef(0);
  const [viewportPx, setViewportPx] = React.useState<number | null>(null);

  React.useEffect(() => {
    const updateViewport = () => {
      setViewportPx(window.visualViewport?.height ?? window.innerHeight);
    };
    updateViewport();
    window.addEventListener("resize", updateViewport);
    window.visualViewport?.addEventListener("resize", updateViewport);
    return () => {
      window.removeEventListener("resize", updateViewport);
      window.visualViewport?.removeEventListener("resize", updateViewport);
    };
  }, []);

  // O Safari do iOS só baixa os bytes do vídeo de verdade depois de um
  // play() acontecer (preload="auto" é ignorado) — busca o arquivo inteiro
  // (é pequeno, ~2MB) como blob local, assim o carregamento não depende de
  // rede nem de comportamento de streaming específico do navegador.
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let cancelled = false;
    let objectUrl: string | null = null;

    fetch(videoUrl)
      .then((res) => res.blob())
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        video.src = objectUrl;
      })
      .catch(() => {
        if (!cancelled) video.src = videoUrl;
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [videoUrl]);

  React.useEffect(() => {
    const wrapper = wrapperRef.current;
    const video = videoRef.current;
    if (!wrapper || !video) return;

    video.muted = true;

    const targetTime = () => {
      const duration = durationRef.current;
      if (!duration) return null;
      const rect = wrapper.getBoundingClientRect();
      const vh = window.visualViewport?.height ?? window.innerHeight;
      const scrollable = rect.height - vh;
      if (scrollable <= 0) return null;
      const progress = Math.min(1, Math.max(0, -rect.top / scrollable));
      return progress * duration;
    };

    let rafId: number;
    const tick = () => {
      const time = targetTime();
      // Mantém o vídeo tocando (mudo, baixinho no fundo) só pra garantir que
      // o Safari continue decodificando frames de verdade; a gente sempre
      // força o tempo de volta pra posição do scroll, então visualmente ele
      // não "anda" sozinho.
      if (time !== null && Math.abs(video.currentTime - time) > 0.03) {
        video.currentTime = time;
      }
      rafId = requestAnimationFrame(tick);
    };

    const handleLoadedMetadata = () => {
      durationRef.current = video.duration || 0;
      video.play().catch(() => {});
    };
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    // Os metadados às vezes já carregam antes desse efeito rodar (preload
    // eager + render rápido), e nesse caso o evento acima nunca dispara.
    if (video.readyState >= 1) {
      handleLoadedMetadata();
    }

    rafId = requestAnimationFrame(tick);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative h-[250vh] w-full">
      <div
        className="sticky top-0 h-screen w-full overflow-hidden bg-neutral-950"
        style={viewportPx ? { height: viewportPx } : undefined}
      >
        <video
          ref={videoRef}
          poster={posterUrl}
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          className="absolute inset-0 size-full object-contain"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-background/80 to-transparent sm:h-16" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background/80 to-transparent sm:h-16" />
      </div>
    </div>
  );
}
