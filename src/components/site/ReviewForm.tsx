"use client";
import { useActionState, useState } from "react";
import { submitReview } from "@/app/actions/reviews";
import { FormMessage } from "@/components/panel/FormMessage";

const LABELS = ["Malo", "Regular", "Bueno", "Muy bueno", "Excelente"];

/** Formulario de opinión: 5 estrellas (radios accesibles con teclado) y comentario. */
export function ReviewForm({ placeId, initial }: { placeId: string; initial?: { rating: number; comment: string } }) {
  const [state, action, pending] = useActionState(submitReview.bind(null, placeId), null);
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const shown = hover || rating;

  if (state?.ok) {
    return <FormMessage state={state} />;
  }

  return (
    <form action={action} className="card flex flex-col gap-3 p-4">
      <fieldset>
        <legend className="label">Tu calificación</legend>
        <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer" onMouseEnter={() => setHover(n)}>
              <input
                type="radio"
                name="rating"
                value={n}
                checked={rating === n}
                onChange={() => setRating(n)}
                className="peer sr-only"
                required
              />
              <span
                aria-hidden="true"
                className={`block text-3xl leading-none transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-verde-700 ${n <= shown ? "text-verde-700" : "text-linea"}`}
              >
                ★
              </span>
              <span className="sr-only">
                {n} {n === 1 ? "estrella" : "estrellas"}: {LABELS[n - 1]}
              </span>
            </label>
          ))}
          <span className="ml-2 text-sm text-texto" aria-hidden="true">
            {shown ? LABELS[shown - 1] : "Elige de 1 a 5"}
          </span>
        </div>
      </fieldset>
      <div>
        <label htmlFor="comment" className="label">Tu comentario</label>
        <textarea
          id="comment"
          name="comment"
          rows={3}
          minLength={10}
          maxLength={1000}
          required
          defaultValue={state?.values?.comment ?? initial?.comment}
          placeholder="¿Qué te gustó? ¿Qué recomendarías a otros visitantes?"
          className="input"
        />
      </div>
      <FormMessage state={state} />
      <button className="btn-primary self-start" disabled={pending}>
        {pending ? "Enviando…" : initial ? "Actualizar opinión" : "Publicar opinión"}
      </button>
    </form>
  );
}
