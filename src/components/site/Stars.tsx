/** Calificación de 1 a 5 con texto accesible. */
export function Stars({ value, count }: { value: number; count?: number }) {
  const rounded = Math.round(value * 10) / 10;
  return (
    <span className="inline-flex items-center gap-1 text-sm" aria-label={`${rounded} de 5 estrellas`}>
      {/* Estrellas naranjas (decorativas: el número al lado da el valor). Heredan el color de texto del contenedor. */}
      <span aria-hidden="true" className="text-naranja">
        {"★".repeat(Math.round(value))}
        <span className="opacity-30">{"★".repeat(5 - Math.round(value))}</span>
      </span>
      <span className="font-semibold">{rounded.toLocaleString("es-CO")}</span>
      {count !== undefined && <span className="opacity-80">({count})</span>}
    </span>
  );
}
