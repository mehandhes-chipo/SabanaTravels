"use client";
import { useState } from "react";
import { KIND_ORDER, KINDS, type PlaceKind } from "@/lib/config";
import type { PlaceListItem } from "@/lib/data";
import { TarjetaLugar } from "./TarjetaLugar";

/** Pestañas por categoría y tarjetas de lugares (portada). */
export function Lugares({ lugares }: { lugares: PlaceListItem[] }) {
  const [filtro, setFiltro] = useState<PlaceKind | "todos">("todos");
  const lista = (filtro === "todos" ? lugares : lugares.filter((l) => l.kind === filtro)).slice(0, 6);
  const filtros: { valor: PlaceKind | "todos"; label: string }[] = [{ valor: "todos", label: "Todos" }, ...KIND_ORDER.map((k) => ({ valor: k, label: KINDS[k].many }))];
  return (
    <>
      <div role="group" aria-label="Filtrar por categoría" className="mt-10 flex flex-wrap justify-center gap-3">
        {filtros.map((f) => {
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
      {lista.length === 0 ? (
        <p className="mt-12 text-center">Todavía no hay lugares publicados en esta categoría.</p>
      ) : (
        <ul className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
          {lista.map((l) => <li key={l.id}><TarjetaLugar lugar={l} /></li>)}
        </ul>
      )}
    </>
  );
}
