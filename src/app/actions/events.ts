"use server";
import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb, schema as s } from "@/db";
import { fromLocalInput, slugify } from "@/lib/format";
import { guarded, requireAdmin } from "@/lib/permissions";
import { fail, type FormState } from "@/lib/form";

const text = (form: FormData, key: string, max: number) => String(form.get(key) ?? "").trim().slice(0, max);

function coord(form: FormData, key: string, min: number, max: number): number | null | "error" {
  const raw = String(form.get(key) ?? "").trim().replace(",", ".");
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= min && n <= max ? n : "error";
}

/** Identificador único para la URL: si "fiestas-patronales" ya existe, usa "fiestas-patronales-2", etc. */
async function uniqueSlug(title: string, exceptId: string | null): Promise<string> {
  const base = slugify(title) || "evento";
  const db = getDb();
  for (let i = 1; ; i++) {
    const slug = i === 1 ? base : `${base}-${i}`;
    const where = exceptId ? and(eq(s.events.slug, slug), ne(s.events.id, exceptId)) : eq(s.events.slug, slug);
    const [taken] = await db.select({ id: s.events.id }).from(s.events).where(where);
    if (!taken) return slug;
  }
}

function refresh(slug?: string) {
  revalidatePath("/eventos");
  if (slug) revalidatePath(`/eventos/${slug}`);
  revalidatePath("/admin/eventos");
  revalidatePath("/admin");
}

/** Crea (id = null) o actualiza un evento. */
export async function saveEvent(id: string | null, _: FormState, form: FormData): Promise<FormState> {
  const result = await guarded(async () => {
    const me = await requireAdmin();

    const title = text(form, "title", 120);
    const summary = text(form, "summary", 200);
    const description = text(form, "description", 5000);
    const location = text(form, "location", 160);
    const startsAt = fromLocalInput(String(form.get("starts_at") ?? ""));
    const endsRaw = String(form.get("ends_at") ?? "");
    const endsAt = endsRaw ? fromLocalInput(endsRaw) : null;
    const lat = coord(form, "lat", -90, 90);
    const lng = coord(form, "lng", -180, 180);
    const published = form.get("published") === "on";

    if (title.length < 3) return fail(form, "Escribe el nombre del evento.");
    if (!startsAt) return fail(form, "Indica la fecha y hora de inicio.");
    if (endsRaw && !endsAt) return fail(form, "La fecha de fin no es válida.");
    if (endsAt && endsAt < startsAt) return fail(form, "La fecha de fin debe ser posterior al inicio.");
    if (lat === "error" || lng === "error") return fail(form, "Revisa las coordenadas (ej. 7.3925 y -73.4972).");
    if ((lat === null) !== (lng === null)) return fail(form, "Escribe latitud y longitud, o deja ambas vacías.");

    const values = { title, summary, description, location, starts_at: startsAt, ends_at: endsAt, lat, lng, published };
    const db = getDb();

    if (id) {
      const [old] = await db.select({ slug: s.events.slug }).from(s.events).where(eq(s.events.id, id));
      if (!old) return fail(form, "Este evento ya no existe.");
      const slug = await uniqueSlug(title, id);
      await db.update(s.events).set({ ...values, slug }).where(eq(s.events.id, id));
      refresh(old.slug);
      refresh(slug);
    } else {
      const slug = await uniqueSlug(title, null);
      await db.insert(s.events).values({ ...values, slug, created_by: me.id });
      refresh(slug);
    }
    return null;
  });
  if (result) return result;
  redirect("/admin/eventos");
}

export async function setEventPublished(id: string, published: boolean) {
  await requireAdmin();
  const [row] = await getDb().update(s.events).set({ published }).where(eq(s.events.id, id)).returning({ slug: s.events.slug });
  refresh(row?.slug);
}

export async function deleteEvent(id: string) {
  await requireAdmin();
  const [row] = await getDb().delete(s.events).where(eq(s.events.id, id)).returning({ slug: s.events.slug });
  refresh(row?.slug);
  redirect("/admin/eventos");
}
