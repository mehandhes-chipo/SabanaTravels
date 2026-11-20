"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb, schema as s } from "@/db";
import { placeHref } from "@/lib/config";
import { fail, type FormState } from "@/lib/form";
import { guarded, requireAdmin } from "@/lib/permissions";

function refresh(place: { kind: "hotel" | "restaurante" | "sitio"; slug: string }) {
  revalidatePath("/");
  revalidatePath("/explorar");
  revalidatePath(placeHref(place));
  revalidatePath("/admin");
  revalidatePath("/admin/publicaciones");
  revalidatePath("/panel");
}

/** Aprueba una ficha: queda visible al público. */
export async function approvePlace(placeId: string) {
  const me = await requireAdmin();
  const [row] = await getDb()
    .update(s.places)
    .set({ status: "aprobado", rejection_reason: null, reviewed_by: me.id, published_at: new Date() })
    .where(eq(s.places.id, placeId))
    .returning({ kind: s.places.kind, slug: s.places.slug });
  if (row) refresh(row);
  redirect("/admin/publicaciones");
}

/** Rechaza una ficha (o retira una ya publicada) explicando el motivo, que el negocio ve en su panel. */
export async function rejectPlace(placeId: string, _: FormState, form: FormData): Promise<FormState> {
  const result = await guarded(async () => {
    const me = await requireAdmin();
    const reason = String(form.get("reason") ?? "").trim().slice(0, 500);
    if (reason.length < 10) return fail(form, "Explica el motivo (mínimo 10 caracteres) para que el negocio sepa qué corregir.");
    const [row] = await getDb()
      .update(s.places)
      .set({ status: "rechazado", rejection_reason: reason, reviewed_by: me.id })
      .where(eq(s.places.id, placeId))
      .returning({ kind: s.places.kind, slug: s.places.slug });
    if (!row) return fail(form, "Esta ficha ya no existe.");
    refresh(row);
    return null;
  });
  if (result) return result;
  redirect("/admin/publicaciones");
}
