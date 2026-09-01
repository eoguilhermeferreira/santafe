"use client";

import * as React from "react";

/**
 * Banner de vídeo cujo "play" é controlado pela rolagem da página: em vez
 * de tocar sozinho, o vídeo avança conforme a seção passa pela tela. Sem
 * áudio e sem controles — é só uma imagem em movimento.
 */
export function ScrollVideoBanner({
  videoUrl,
  posterUrl,
}: {
  videoUrl: string;
  posterUrl?: string;
}) {
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const durationRef = React.useRef(0);

  React.useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;

    video.muted = true;

    const updateFrame = () => {
      const duration = durationRef.current;
      if (!duration) return;
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const total = rect.height + viewportHeight;
      const scrolled = viewportHeight - rect.top;
      const progress = Math.min(1, Math.max(0, scrolled / total));
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
    <div
      ref={sectionRef}
      className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-muted sm:aspect-[16/10] lg:aspect-[16/9]"
    >
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
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background to-transparent sm:h-24" />
    </div>
  );
}
