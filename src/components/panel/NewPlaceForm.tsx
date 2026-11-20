"use client";
import { useActionState } from "react";
import { createPlace } from "@/app/actions/panel";
import { FormMessage } from "./FormMessage";

export function NewPlaceForm() {
  const [state, action, pending] = useActionState(createPlace, null);
  return (
    <form action={action} className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label htmlFor="new-name" className="label">Nombre del negocio</label>
        <input id="new-name" name="name" required minLength={3} maxLength={120} defaultValue={state?.values?.name} className="input" />
      </div>
      <button className="btn-primary" disabled={pending}>{pending ? "Creando…" : "Crear ficha"}</button>
      <FormMessage state={state} className="sm:basis-full" />
    </form>
  );
}
