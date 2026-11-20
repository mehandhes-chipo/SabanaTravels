const TONES = {
  ok: "bg-verde-100 text-verde-700",
  aviso: "bg-naranja-100 text-marino",
  neutro: "bg-nube text-texto",
  peligro: "bg-peligro-100 text-peligro",
} as const;

export type BadgeTone = keyof typeof TONES;

/** Insignia pequeña de estado (Publicada, Oculto, Suspendida…). Todas comparten tamaño y colores. */
export function Badge({ tone, children, className = "" }: { tone: BadgeTone; children: React.ReactNode; className?: string }) {
  return <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${TONES[tone]} ${className}`}>{children}</span>;
}
