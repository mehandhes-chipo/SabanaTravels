"use client";
import { useActionState, useRef } from "react";
import { uploadPhoto } from "@/app/actions/panel";
import { FormMessage } from "./FormMessage";

/** Sube una foto a la vez (el límite de los Server Actions es 4 MB por envío). */
export function PhotoUpload({ placeId }: { placeId: string }) {
  const [state, action, pending] = useActionState(uploadPhoto.bind(null, placeId), null);
  const form = useRef<HTMLFormElement>(null);
  return (
    <form ref={form} action={action} className="card flex flex-col gap-3 p-4">
      <label htmlFor="photo" className="label">Subir una foto (JPG, PNG o WebP, máximo 3,5 MB)</label>
      <input
        id="photo"
        name="photo"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        required
        className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-marino file:px-3 file:py-2 file:font-semibold file:text-white"
        // Se sube apenas la eligen: un paso menos.
        onChange={(e) => e.currentTarget.files?.length && form.current?.requestSubmit()}
        disabled={pending}
      />
      {pending && <p role="status" className="text-sm text-texto">Subiendo…</p>}
      <FormMessage state={pending ? null : state} />
    </form>
  );
}
