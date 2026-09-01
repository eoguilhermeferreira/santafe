"use client";

import * as React from "react";

/**
 * Seção de vídeo em tela cheia, largura total (fora do container da home),
 * que fica "grudada" na tela enquanto a pessoa rola por cima dela — como um
 * buraco que se abre no meio do site. O vídeo não toca sozinho: o avanço dele
 * é controlado pela rolagem, só começa quando a seção chega no topo e some
 * de novo (com degradê) quando ela termina.
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

  React.useEffect(() => {
    const wrapper = wrapperRef.current;
    const video = videoRef.current;
    if (!wrapper || !video) return;

    video.muted = true;

    const viewportHeight = () => window.visualViewport?.height ?? window.innerHeight;

    const updateFrame = () => {
      const duration = durationRef.current;
      if (!duration) return;
      const rect = wrapper.getBoundingClientRect();
      const scrollable = rect.height - viewportHeight();
      if (scrollable <= 0) return;
      const progress = Math.min(1, Math.max(0, -rect.top / scrollable));
      video.currentTime = progress * duration;
    };

    const handleLoadedMetadata = () => {
      durationRef.current = video.duration || 0;
      // Alguns navegadores (principalmente no iOS) só decodificam o primeiro
      // frame depois de um play() de verdade — pausar cedo demais (ex: no
      // .then() da promise) pode acontecer antes de qualquer frame ser
      // pintado na tela, deixando o vídeo em branco. Espera o evento
      // "playing" (decodificação já rodando) antes de pausar.
      const warmUp = () => {
        const onPlaying = () => {
          video.removeEventListener("playing", onPlaying);
          requestAnimationFrame(() => {
            video.pause();
            updateFrame();
          });
        };
        video.addEventListener("playing", onPlaying);
        video.play().catch(() => {
          video.removeEventListener("playing", onPlaying);
        });
      };
      warmUp();
      updateFrame();
    };
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    // Os metadados às vezes já carregam antes desse efeito rodar (preload
    // eager + render rápido), e nesse caso o evento acima nunca dispara.
    if (video.readyState >= 1) {
      handleLoadedMetadata();
    }

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateFrame();
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative h-[250vh] w-full">
      <div className="sticky top-0 h-dvh w-full overflow-hidden">
        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterUrl}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          className="absolute inset-0 size-full object-cover"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-background/80 to-transparent sm:h-16" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background/80 to-transparent sm:h-16" />
      </div>
    </div>
  );
}
