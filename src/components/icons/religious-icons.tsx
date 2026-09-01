/**
 * Ícones desenhados na mão pra categorias que não têm equivalente decente
 * no pacote de ícones (lucide não tem crucifixo, terço nem santo/imagem
 * sacra) — no mesmo estilo de traço fino (stroke) dos ícones do lucide,
 * pra ficar visualmente igual ao resto do site.
 */
type IconProps = { className?: string };

export function CrucifixIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3v18" />
      <path d="M6 9h12" />
      <circle cx="12" cy="6" r="1.4" />
      <path d="M12 16.5 10 21" />
      <path d="M12 16.5 14 21" />
    </svg>
  );
}

export function RosaryIcon({ className }: IconProps) {
  const beads: [number, number][] = [
    [12, 3],
    [16.1, 4.15],
    [18.66, 7.15],
    [18.66, 10.85],
    [16.1, 13.85],
    [7.9, 13.85],
    [5.34, 10.85],
    [5.34, 7.15],
    [7.9, 4.15],
  ];

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {beads.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1" fill="currentColor" stroke="none" />
      ))}
      <path d="M12 15.2v3" />
      <path d="M10.6 19.5h2.8" />
      <path d="M12 18.4v2.8" />
    </svg>
  );
}

export function SaintIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M8.5 4.6c0-1.6 1.6-2.6 3.5-2.6s3.5 1 3.5 2.6" />
      <circle cx="12" cy="8.3" r="2.3" />
      <path d="M7.2 21c0-6 1.9-9.7 4.8-9.7s4.8 3.7 4.8 9.7" />
    </svg>
  );
}
