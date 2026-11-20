"use server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, schema as s } from "@/db";
import { placeHref } from "@/lib/config";
import { guarded, PermissionError, requireAdmin, requireUser } from "@/lib/permissions";
import { fail, type FormState } from "@/lib/form";

const MAX_COMMENT = 1000;

/** Un cliente crea o actualiza su opinión de un lugar. Toda opinión nueva o editada vuelve a "pendiente". */
export async function submitReview(placeId: string, _: FormState, form: FormData): Promise<FormState> {
  return guarded(async () => {
    const me = await requireUser();
    if (me.role !== "cliente") throw new PermissionError("Solo las cuentas de cliente pueden opinar.");

    const rating = Number(form.get("rating"));
    const comment = String(form.get("comment") ?? "").trim();
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return fail(form, "Elige de 1 a 5 estrellas.");
    if (comment.length < 10) return fail(form, "Cuéntanos un poco más (mínimo 10 caracteres).");
    if (comment.length > MAX_COMMENT) return fail(form, `El comentario puede tener hasta ${MAX_COMMENT} caracteres.`);

    const db = getDb();
    const [place] = await db
      .select({ kind: s.places.kind, slug: s.places.slug })
      .from(s.places)
      .where(and(eq(s.places.id, placeId), eq(s.places.status, "aprobado")));
    if (!place) return fail(form, "Este lugar ya no está publicado.");

    await db
      .insert(s.reviews)
      .values({ place_id: placeId, user_id: me.id, rating, comment })
      .onConflictDoUpdate({
        target: [s.reviews.place_id, s.reviews.user_id],
        set: { rating, comment, status: "pendiente", created_at: new Date() },
      });

    revalidatePath(placeHref(place));
    revalidatePath("/admin/opiniones");
    return { ok: true, message: "¡Gracias! Tu opinión se publicará cuando el administrador la revise." };
  });
}

/** El administrador aprueba o rechaza una opinión. */
export async function moderateReview(reviewId: string, status: "aprobada" | "rechazada") {
  await requireAdmin();
  const db = getDb();
  const [row] = await db.update(s.reviews).set({ status }).where(eq(s.reviews.id, reviewId)).returning({ place_id: s.reviews.place_id });
  if (row) {
    const [place] = await db.select({ kind: s.places.kind, slug: s.places.slug }).from(s.places).where(eq(s.places.id, row.place_id));
    if (place) revalidatePath(placeHref(place));
  }
  revalidatePath("/admin/opiniones");
  revalidatePath("/admin");
}
