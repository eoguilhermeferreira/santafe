"use client";

import * as React from "react";

import { storeConfig } from "@/config/store";
import { cn } from "@/lib/utils";

const ROTATE_MS = 3800;
const EXIT_MS = 450;

type Phase = "idle" | "exiting" | "entering";

/**
 * Barra fixa no topo da loja com frases que giram sozinhas: a frase atual
 * desce e desaparece, a próxima entra por cima e desce até o lugar — dá
 * a sensação de uma esteira descendo, não um corte seco.
 */
export function AnnouncementBar() {
  const messages = storeConfig.announcements;
  const [index, setIndex] = React.useState(0);
  const [phase, setPhase] = React.useState<Phase>("idle");

  React.useEffect(() => {
    if (messages.length <= 1) return;

    let exitTimeout: ReturnType<typeof setTimeout>;
    const interval = setInterval(() => {
      setPhase("exiting");
      exitTimeout = setTimeout(() => {
        setIndex((current) => (current + 1) % messages.length);
        setPhase("entering");
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setPhase("idle"));
        });
      }, EXIT_MS);
    }, ROTATE_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(exitTimeout);
    };
  }, [messages.length]);

  return (
    <div className="h-9 overflow-hidden bg-primary text-primary-foreground">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-center px-4">
        <p
          className={cn(
            "text-center text-xs font-medium tracking-wide sm:text-sm",
            phase === "entering" ? "transition-none" : "transition-all duration-500 ease-in-out",
            phase === "exiting" && "translate-y-4 opacity-0",
            phase === "entering" && "-translate-y-4 opacity-0",
            phase === "idle" && "translate-y-0 opacity-100"
          )}
        >
          {messages[index]}
        </p>
      </div>
    </div>
  );
}
