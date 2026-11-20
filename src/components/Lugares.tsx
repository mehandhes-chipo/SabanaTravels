"use client";
import { useState } from "react";
import { LUGARES, TIPOS, type Tipo } from "@/lib/lugares";
import { TarjetaLugar } from "./TarjetaLugar";

const FILTROS: { valor: Tipo | "todos"; label: string }[] = [
  { valor: "todos", label: "Todos" },
  { valor: "restaurante", label: TIPOS.restaurante.varios },
  { valor: "hotel", label: TIPOS.hotel.varios },
  { valor: "sitio", label: TIPOS.sitio.varios },
];

/** Pestañas por categoría (como las ciudades de la plantilla) y tarjetas de lugares. */
export function Lugares() {
  const [filtro, setFiltro] = useState<Tipo | "todos">("todos");
  const lista = filtro === "todos" ? LUGARES : LUGARES.filter((l) => l.tipo === filtro);
  return (
    <>
      <div role="group" aria-label="Filtrar por categoría" className="mt-10 flex flex-wrap justify-center gap-3">
        {FILTROS.map((f) => {
          const on = f.valor === filtro;
          return (
            <button
              key={f.valor}
              type="button"
              onClick={() => setFiltro(f.valor)}
              aria-pressed={on}
              className={`relative rounded-md px-6 py-3 text-sm font-bold shadow-tarjeta transition-colors ${on ? "bg-verde-700 text-white after:absolute after:-bottom-1.5 after:left-1/2 after:size-3 after:-translate-x-1/2 after:rotate-45 after:bg-verde-700" : "bg-white text-marino hover:text-verde-700"}`}
            >
              {f.label}
            </button>
          );
        })}
      </div>
      <ul className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
        {lista.map((l) => (
          <li key={l.slug}>
            <TarjetaLugar lugar={l} />
          </li>
        ))}
      </ul>
    </>
  );
}
