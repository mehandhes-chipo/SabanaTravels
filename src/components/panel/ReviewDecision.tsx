"use client";
import { useActionState, useState } from "react";
import { approvePlace, rejectPlace } from "@/app/actions/places";
import { FormMessage } from "./FormMessage";

/** Panel de decisión del administrador: aprobar, o rechazar/retirar con un motivo obligatorio. */
export function ReviewDecision({ placeId, status }: { placeId: string; status: "borrador" | "pendiente" | "aprobado" | "rechazado" }) {
  const [state, rejectAction, rejecting] = useActionState(rejectPlace.bind(null, placeId), null);
  // Si el envío falló, se deja abierto el formulario de rechazo para corregir el motivo.
  const [showReject, setShowReject] = useState(false);
  const open = showReject || Boolean(state && !state.ok);
  const canApprove = status !== "aprobado";
  const rejectLabel = status === "aprobado" ? "Retirar del sitio" : "Rechazar";

  return (
    <div className="card flex flex-col gap-3 p-4">
      <h2 className="card-title">Decisión</h2>
      {status === "borrador" && (
        <p className="text-sm text-texto">El negocio aún no ha enviado esta ficha a revisión. Puedes aprobarla igualmente si ya está completa.</p>
      )}
      <div className="flex flex-wrap gap-2">
        {canApprove && (
          <form action={approvePlace.bind(null, placeId)}>
            <button className="btn-primary">Aprobar y publicar</button>
          </form>
        )}
        {!open && (
          <button type="button" className="btn-danger" onClick={() => setShowReject(true)}>
            {rejectLabel}…
          </button>
        )}
      </div>

      {open && (
        <form action={rejectAction} className="flex flex-col gap-2 border-t border-linea pt-3">
          <label htmlFor="reason" className="label">Motivo (lo verá el negocio en su panel)</label>
          <textarea
            id="reason"
            name="reason"
            rows={3}
            required
            minLength={10}
            maxLength={500}
            defaultValue={state?.values?.reason}
            placeholder="Faltan fotos de las habitaciones y el número de WhatsApp."
            className="input"
            autoFocus
          />
          <FormMessage state={state} />
          <div className="flex gap-2">
            <button className="btn-danger" disabled={rejecting}>{rejecting ? "Enviando…" : rejectLabel}</button>
            <button type="button" className="btn-outline" onClick={() => setShowReject(false)}>Cancelar</button>
          </div>
        </form>
      )}
    </div>
  );
}
