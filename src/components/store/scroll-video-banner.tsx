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

    const updateFrame = () => {
      const duration = durationRef.current;
      if (!duration) return;
      const rect = wrapper.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) return;
      const progress = Math.min(1, Math.max(0, -rect.top / scrollable));
      video.currentTime = progress * duration;
    };

    const handleLoadedMetadata = () => {
      durationRef.current = video.duration || 0;
      // Alguns navegadores (principalmente no iOS) só decodificam frames
      // depois de um play() real, mesmo que pausado logo em seguida.
      video.play().then(() => video.pause()).catch(() => {});
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

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative h-[250vh] w-full">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
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
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent sm:h-40" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent sm:h-40" />
      </div>
    </div>
  );
}
