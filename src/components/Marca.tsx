import { Logo } from "./Icono";

/**
 * Marca de Sabana Travel's: logo + "Sabana" en mayúscula firme y "Travel's" manuscrito en verde,
 * con el lema debajo. `claro` para fondos oscuros (pie de página).
 * El verde vivo cumple contraste porque el texto manuscrito siempre es grande (≥ 28 px).
 */
export function Marca({ claro = false, compacta = false }: { claro?: boolean; compacta?: boolean }) {
  return (
    <span className="flex items-center gap-2.5 sm:gap-3">
      <Logo className={compacta ? "size-10" : "size-10 sm:size-14"} />
      <span className="flex flex-col leading-none">
        <span className="flex items-baseline gap-1.5">
          <span className={`font-extrabold uppercase tracking-tight ${compacta ? "text-[22px]" : "text-[22px] sm:text-[34px]"} ${claro ? "text-white" : "text-marino"}`}>
            Sabana
          </span>
          <span className={`font-script text-verde ${compacta ? "text-[28px]" : "text-[28px] sm:text-[44px]"}`}>Travel&apos;s</span>
        </span>
        {!compacta && (
          <span className={`mt-1 hidden text-[11px] font-bold uppercase tracking-[0.32em] sm:block ${claro ? "text-white/70" : "text-gris"}`}>
            Sabor · Descanso · Placer
          </span>
        )}
      </span>
    </span>
  );
}
