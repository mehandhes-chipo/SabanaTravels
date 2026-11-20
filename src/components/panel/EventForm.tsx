"use client";
import Link from "next/link";
import { useActionState } from "react";
import { saveEvent } from "@/app/actions/events";
import { FormMessage } from "./FormMessage";

export type EventFormValues = {
  title: string;
  summary: string;
  description: string;
  location: string;
  starts_at: string; // "YYYY-MM-DDTHH:mm" en hora de Colombia
  ends_at: string;
  lat: string;
  lng: string;
  published: boolean;
};

/** Formulario para crear o editar un evento (id = null crea uno nuevo). */
export function EventForm({ id, initial }: { id: string | null; initial?: EventFormValues }) {
  const [state, action, pending] = useActionState(saveEvent.bind(null, id), null);
  // Tras un error se muestran los valores que se enviaron (React vacía el formulario al enviarlo).
  const sent = state?.values;
  const v: EventFormValues | undefined = sent
    ? {
        title: sent.title ?? "",
        summary: sent.summary ?? "",
        description: sent.description ?? "",
        location: sent.location ?? "",
        starts_at: sent.starts_at ?? "",
        ends_at: sent.ends_at ?? "",
        lat: sent.lat ?? "",
        lng: sent.lng ?? "",
        published: sent.published === "on",
      }
    : initial;

  return (
    <form action={action} className="card flex max-w-2xl flex-col gap-4 p-6">
      <div>
        <label htmlFor="title" className="label">Nombre del evento *</label>
        <input id="title" name="title" required minLength={3} maxLength={120} defaultValue={v?.title} className="input" placeholder="Fiestas patronales" />
      </div>
      <div>
        <label htmlFor="summary" className="label">Resumen (una línea)</label>
        <input id="summary" name="summary" maxLength={200} defaultValue={v?.summary} className="input" placeholder="Música, desfiles y comida típica en el parque principal" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="starts_at" className="label">Inicio *</label>
          <input id="starts_at" name="starts_at" type="datetime-local" required defaultValue={v?.starts_at} className="input" />
        </div>
        <div>
          <label htmlFor="ends_at" className="label">Fin (opcional)</label>
          <input id="ends_at" name="ends_at" type="datetime-local" defaultValue={v?.ends_at} className="input" />
        </div>
      </div>
      <p className="-mt-2 text-xs text-texto">Hora de Colombia.</p>
      <div>
        <label htmlFor="location" className="label">Lugar</label>
        <input id="location" name="location" maxLength={160} defaultValue={v?.location} className="input" placeholder="Parque principal" />
      </div>
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="label sm:col-span-2">Ubicación en el mapa (opcional)</legend>
        <div>
          <label htmlFor="lat" className="text-xs text-texto">Latitud</label>
          <input id="lat" name="lat" inputMode="decimal" defaultValue={v?.lat} className="input" placeholder="7.3925" />
        </div>
        <div>
          <label htmlFor="lng" className="text-xs text-texto">Longitud</label>
          <input id="lng" name="lng" inputMode="decimal" defaultValue={v?.lng} className="input" placeholder="-73.4972" />
        </div>
        <p className="text-xs text-texto sm:col-span-2">
          En Google Maps, mantén presionado el punto y copia los dos números que aparecen.
        </p>
      </fieldset>
      <div>
        <label htmlFor="description" className="label">Descripción</label>
        <textarea id="description" name="description" rows={6} maxLength={5000} defaultValue={v?.description} className="input" placeholder="Programación, horarios, recomendaciones…" />
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" name="published" defaultChecked={v?.published ?? true} className="h-4 w-4 accent-marino" />
        <span className="text-sm font-semibold">Publicado (visible en la agenda)</span>
      </label>

      <FormMessage state={state} />
      <div className="flex gap-3">
        <button className="btn-primary" disabled={pending}>{pending ? "Guardando…" : "Guardar evento"}</button>
        <Link href="/admin/eventos" className="btn-outline">Cancelar</Link>
      </div>
    </form>
  );
}
