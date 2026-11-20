const TONES = {
  ok: { role: "status", cls: "bg-verde-100 text-verde-700" },
  error: { role: "alert", cls: "bg-peligro-100 text-peligro" },
  info: { role: "status", cls: "bg-nube text-texto" },
} as const;

export type NoticeTone = keyof typeof TONES;

/** Aviso único del sitio: verde si algo salió bien, rojo si hay un error, crema para información. */
export function Notice({ tone, children, className = "" }: { tone: NoticeTone; children: React.ReactNode; className?: string }) {
  const t = TONES[tone];
  return (
    <p role={t.role} className={`rounded-md px-3 py-2 text-sm ${t.cls} ${className}`}>
      {children}
    </p>
  );
}
