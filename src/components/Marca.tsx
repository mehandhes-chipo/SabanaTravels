import { Logo } from "./Icono";

/**
 * Marca de Sabana Travel's con los colores de la bandera de Sabana de Torres:
 * "SABANA" en verde oscuro (6,7:1) y "Travel's" manuscrito en el verde de la bandera (4,5:1, texto grande),
 * con el lema debajo. `claro` para fondos oscuros: blanco y amarillo de la bandera.
 */
export function Marca({ claro = false, compacta = false }: { claro?: boolean; compacta?: boolean }) {
  return (
    <span className="flex items-center gap-2.5 sm:gap-3">
      {/* shrink-0: en columnas angostas (pie) el texto no debe aplastar el logo */}
      <Logo className={`shrink-0 ${compacta ? "size-10" : "size-10 sm:size-14"}`} />
      <span className="flex flex-col leading-none">
        <span className="flex items-baseline gap-1.5">
          <span className={`font-extrabold uppercase tracking-tight ${compacta ? "text-[22px]" : "text-[22px] sm:text-[34px]"} ${claro ? "text-white" : "text-bandera-oscuro"}`}>
            Sabana
          </span>
          <span className={`font-script ${claro ? "text-bandera-amarillo" : "text-bandera"} ${compacta ? "text-[28px]" : "text-[28px] sm:text-[44px]"}`}>Travel&apos;s</span>
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
