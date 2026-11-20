"use client";
import { useActionState } from "react";
import { submitPlace } from "@/app/actions/panel";
import type { CheckItem } from "@/lib/checklist";
import { FormMessage } from "./FormMessage";
import type { PlaceStatus } from "./StatusBadge";

/** Lista de verificación y botón "Enviar a revisión" (solo en borrador o rechazada). */
export function SubmitPlace({ placeId, status, checks }: { placeId: string; status: PlaceStatus; checks: CheckItem[] }) {
  const [state, action, pending] = useActionState(submitPlace.bind(null, placeId), null);
  const canSend = status === "borrador" || status === "rechazado";
  const blocked = checks.some((c) => c.required && !c.ok);

  return (
    <div className="card mt-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm" aria-label="Lista de verificación">
        {checks.map((c) => (
          <li key={c.label} className={c.ok ? "text-verde-700" : c.required ? "text-peligro" : "text-texto"}>
            <span aria-hidden="true">{c.ok ? "✓" : "○"}</span> {c.label}
            {c.required && !c.ok && <span className="text-xs"> (obligatorio)</span>}
            <span className="sr-only">{c.ok ? ": completo" : ": falta"}</span>
          </li>
        ))}
      </ul>
      {canSend && (
        <form action={action} className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
          <button className="btn-accent" disabled={pending || blocked}>{pending ? "Enviando…" : "Enviar a revisión"}</button>
          {blocked && <p className="text-xs text-texto">Completa lo obligatorio para enviar.</p>}
        </form>
      )}
      <FormMessage state={state} className="sm:basis-full" />
    </div>
  );
}
