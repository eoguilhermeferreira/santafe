type IconProps = { className?: string };

/**
 * Selo do Pix no mesmo formato de "cartão" (750x471, cantos arredondados)
 * dos ícones de bandeira em public/payment-icons, pra ficar visualmente
 * igual na fileira do rodapé. Cor e marca oficiais do Pix (Bacen).
 */
export function PixBadge({ className }: IconProps) {
  return (
    <svg viewBox="0 0 750 471" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pix" className={className}>
      <rect width="750" height="471" rx="40" fill="#32BCAD" />
      <path
        transform="translate(255 115.5) scale(10)"
        fill="#fff"
        d="M5.283 18.36a3.505 3.505 0 0 0 2.493-1.032l3.6-3.6a.684.684 0 0 1 .946 0l3.613 3.613a3.504 3.504 0 0 0 2.493 1.032h.71l-4.56 4.56a3.647 3.647 0 0 1-5.156 0L4.85 18.36ZM18.428 5.627a3.505 3.505 0 0 0-2.493 1.032l-3.613 3.614a.67.67 0 0 1-.946 0l-3.6-3.6A3.505 3.505 0 0 0 5.283 5.64h-.434l4.573-4.572a3.646 3.646 0 0 1 5.156 0l4.559 4.559ZM1.068 9.422 3.79 6.699h1.492a2.483 2.483 0 0 1 1.744.722l3.6 3.6a1.73 1.73 0 0 0 2.443 0l3.614-3.613a2.482 2.482 0 0 1 1.744-.723h1.767l2.737 2.737a3.646 3.646 0 0 1 0 5.156l-2.736 2.736h-1.768a2.482 2.482 0 0 1-1.744-.722l-3.613-3.613a1.77 1.77 0 0 0-2.444 0l-3.6 3.6a2.483 2.483 0 0 1-1.744.722H3.791l-2.723-2.723a3.646 3.646 0 0 1 0-5.156"
      />
    </svg>
  );
}

/**
 * Selo do boleto no mesmo formato de "cartão" — não é uma bandeira/marca,
 * então usa um código de barras genérico (sem trademark) + texto.
 */
export function BoletoBadge({ className }: IconProps) {
  return (
    <svg viewBox="0 0 750 471" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Boleto" className={className}>
      <rect width="750" height="471" rx="40" fill="#fff" stroke="#D1D5DB" strokeWidth="2" />
      <rect x="256.0" y="140.5" width="4" height="190" fill="#111827" />
      <rect x="266.0" y="140.5" width="2" height="190" fill="#111827" />
      <rect x="274.0" y="140.5" width="6" height="190" fill="#111827" />
      <rect x="286.0" y="140.5" width="3" height="190" fill="#111827" />
      <rect x="295.0" y="140.5" width="2" height="190" fill="#111827" />
      <rect x="303.0" y="140.5" width="5" height="190" fill="#111827" />
      <rect x="314.0" y="140.5" width="3" height="190" fill="#111827" />
      <rect x="323.0" y="140.5" width="7" height="190" fill="#111827" />
      <rect x="336.0" y="140.5" width="2" height="190" fill="#111827" />
      <rect x="344.0" y="140.5" width="4" height="190" fill="#111827" />
      <rect x="354.0" y="140.5" width="6" height="190" fill="#111827" />
      <rect x="366.0" y="140.5" width="2" height="190" fill="#111827" />
      <rect x="374.0" y="140.5" width="3" height="190" fill="#111827" />
      <rect x="383.0" y="140.5" width="5" height="190" fill="#111827" />
      <rect x="394.0" y="140.5" width="2" height="190" fill="#111827" />
      <rect x="402.0" y="140.5" width="4" height="190" fill="#111827" />
      <rect x="412.0" y="140.5" width="7" height="190" fill="#111827" />
      <rect x="425.0" y="140.5" width="3" height="190" fill="#111827" />
      <rect x="434.0" y="140.5" width="2" height="190" fill="#111827" />
      <rect x="442.0" y="140.5" width="6" height="190" fill="#111827" />
      <rect x="454.0" y="140.5" width="4" height="190" fill="#111827" />
      <rect x="464.0" y="140.5" width="2" height="190" fill="#111827" />
      <rect x="472.0" y="140.5" width="5" height="190" fill="#111827" />
      <rect x="483.0" y="140.5" width="3" height="190" fill="#111827" />
      <rect x="492.0" y="140.5" width="2" height="190" fill="#111827" />
      <text
        x="375"
        y="370"
        textAnchor="middle"
        fill="#111827"
        fontFamily="Arial, sans-serif"
        fontSize="52"
        fontWeight="700"
        letterSpacing="2"
      >
        BOLETO
      </text>
    </svg>
  );
}
