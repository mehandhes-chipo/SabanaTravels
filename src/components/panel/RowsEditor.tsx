"use client";
import { startTransition, useActionState, useState } from "react";
import { saveRows, type RowsKind } from "@/app/actions/panel";
import { FormMessage } from "./FormMessage";

export type Column = {
  name: string;
  label: string;
  type?: "text" | "price" | "date" | "yesno";
  placeholder?: string;
  /** Ancho relativo en pantallas grandes. */
  wide?: boolean;
};

type Row = Record<string, string> & { _key: string };

let counter = 0;
const newKey = () => `n${++counter}`;

/**
 * Editor de listas (tabla de precios, menú, paquetes, promociones): agregar, quitar y reordenar filas,
 * y guardar todo de una vez. Los valores viven en el estado de React, así no se pierden si hay un error.
 */
export function RowsEditor({
  placeId,
  kind,
  columns,
  initial,
  addLabel,
  emptyText,
}: {
  placeId: string;
  kind: RowsKind;
  columns: Column[];
  initial: Record<string, string>[];
  addLabel: string;
  emptyText: string;
}) {
  const blank = (): Row => ({ _key: newKey(), ...Object.fromEntries(columns.map((c) => [c.name, c.type === "yesno" ? "si" : ""])) });
  const [rows, setRows] = useState<Row[]>(() => initial.map((r) => ({ ...r, _key: newKey() })));
  const [state, action, pending] = useActionState(saveRows.bind(null, placeId, kind), null);

  const update = (i: number, name: string, value: string) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, [name]: value } : r)));
  const move = (i: number, d: -1 | 1) =>
    setRows((rs) => {
      const j = i + d;
      if (j < 0 || j >= rs.length) return rs;
      const copy = [...rs];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  return (
    <form
      // Envío manual: evita que React vacíe el formulario (las filas ya están en el estado).
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      className="flex flex-col gap-4"
    >
      {rows.length === 0 && <p className="card p-4 text-sm text-texto">{emptyText}</p>}
      <ol className="flex flex-col gap-3">
        {rows.map((r, i) => (
          <li key={r._key} className="card p-4">
            <div className="grid gap-3 sm:grid-cols-6">
              {columns.map((c) => {
                const id = `${c.name}-${r._key}`;
                return (
                  <div key={c.name} className={c.wide ? "sm:col-span-3" : c.type === "price" || c.type === "yesno" || c.type === "date" ? "sm:col-span-1" : "sm:col-span-2"}>
                    <label htmlFor={id} className="text-xs font-semibold text-texto">{c.label}</label>
                    {c.type === "yesno" ? (
                      <select id={id} name={c.name} value={r[c.name]} onChange={(e) => update(i, c.name, e.target.value)} className="input">
                        <option value="si">Sí</option>
                        <option value="no">No</option>
                      </select>
                    ) : (
                      <input
                        id={id}
                        name={c.name}
                        type={c.type === "date" ? "date" : "text"}
                        inputMode={c.type === "price" ? "numeric" : undefined}
                        value={r[c.name]}
                        onChange={(e) => update(i, c.name, e.target.value)}
                        placeholder={c.placeholder}
                        className="input"
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex gap-3 text-sm">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-texto hover:underline disabled:opacity-40" aria-label={`Subir fila ${i + 1}`}>↑ Subir</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} className="text-texto hover:underline disabled:opacity-40" aria-label={`Bajar fila ${i + 1}`}>↓ Bajar</button>
              <button type="button" onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))} className="ml-auto text-peligro hover:underline">Quitar</button>
            </div>
          </li>
        ))}
      </ol>
      <div>
        <button type="button" className="btn-outline" onClick={() => setRows((rs) => [...rs, blank()])}>+ {addLabel}</button>
      </div>
      <FormMessage state={state} />
      <div>
        <button className="btn-primary" disabled={pending}>{pending ? "Guardando…" : "Guardar cambios"}</button>
      </div>
    </form>
  );
}
