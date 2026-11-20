"use server";
// Acciones del panel del negocio: crear y editar su ficha, fotos, ubicación y envío a revisión.
// Todas pasan por requireOwnPlace / requireBusiness (lib/permissions.ts): un negocio solo toca sus fichas.
import { and, asc, eq, min, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb, schema as s } from "@/db";
import { placeChecklist } from "@/lib/checklist";
import { placeHref, type PlaceKind } from "@/lib/config";
import { fail, type FormState } from "@/lib/form";
import { slugify } from "@/lib/format";
import { guarded, PermissionError, requireBusiness, requireOwnPlace } from "@/lib/permissions";
import { photoProblem, removePhotoFile, savePhoto, UPLOADS_ENABLED } from "@/lib/uploads";

type Place = typeof s.places.$inferSelect;

const text = (form: FormData, key: string, max: number) => String(form.get(key) ?? "").trim().slice(0, max);
const ok = (message: string): FormState => ({ ok: true, message });

/** Lista escrita "una por línea" o separada por comas → arreglo limpio sin repetidos. */
function list(form: FormData, key: string): string[] {
  const items = String(form.get(key) ?? "")
    .split(/[\n,]/)
    .map((x) => x.trim().slice(0, 40))
    .filter(Boolean);
  return [...new Set(items)].slice(0, 20);
}

/** "300 123 4567" → "573001234567". Devuelve null si no parece un número válido. */
function normalizeWhatsapp(raw: string): string | null {
  let d = raw.replace(/\D/g, "");
  if (!d) return "";
  if (d.length === 10 && d.startsWith("3")) d = `57${d}`;
  return d.length >= 11 && d.length <= 15 ? d : null;
}

/** Enlace de red social: acepta "facebook.com/minegocio" y le agrega https://. */
function normalizeUrl(raw: string): string | null {
  const v = raw.trim();
  if (!v) return "";
  const url = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    const u = new URL(url);
    return u.hostname.includes(".") ? u.toString() : null;
  } catch {
    return null;
  }
}

/** "$ 25.000" → 25000. */
function price(raw: string): number | null {
  const d = raw.replace(/[^\d]/g, "");
  if (!d) return null;
  const n = Number(d);
  return n <= 100_000_000 ? n : null;
}

async function uniqueSlug(name: string, exceptId: string | null): Promise<string> {
  const base = slugify(name) || "lugar";
  const db = getDb();
  for (let i = 1; ; i++) {
    const slug = i === 1 ? base : `${base}-${i}`;
    const where = exceptId ? and(eq(s.places.slug, slug), ne(s.places.id, exceptId)) : eq(s.places.slug, slug);
    const [taken] = await db.select({ id: s.places.id }).from(s.places).where(where);
    if (!taken) return slug;
  }
}

function refresh(place: { id: string; kind: PlaceKind; slug: string }) {
  revalidatePath("/");
  revalidatePath("/explorar");
  revalidatePath(placeHref(place));
  revalidatePath("/panel");
  revalidatePath(`/panel/fichas/${place.id}`, "layout");
  revalidatePath("/admin");
  revalidatePath("/admin/publicaciones");
}

/**
 * Flujo de publicación (ALCANCE.md): todo cambio deja la ficha en borrador. Si estaba publicada,
 * deja de verse hasta que el negocio la envíe de nuevo y el administrador la apruebe.
 */
async function afterEdit(place: Place) {
  if (place.status !== "borrador") {
    await getDb().update(s.places).set({ status: "borrador" }).where(eq(s.places.id, place.id));
  }
  refresh(place);
}

/** Precio de referencia para las tarjetas "desde $…": el más bajo de la tabla de precios o del menú. */
async function recomputePriceFrom(place: Place) {
  const db = getDb();
  const table = place.kind === "restaurante" ? s.menuItems : s.priceItems;
  const [row] = await db.select({ v: min(table.price) }).from(table).where(eq(table.place_id, place.id));
  await db.update(s.places).set({ price_from: row?.v ?? null }).where(eq(s.places.id, place.id));
}

// ---------- Crear ----------
export async function createPlace(_: FormState, form: FormData): Promise<FormState> {
  let id = "";
  const result = await guarded(async () => {
    const me = await requireBusiness();
    const name = text(form, "name", 120);
    if (name.length < 3) return fail(form, "Escribe el nombre de tu negocio (mínimo 3 letras).");
    const [row] = await getDb()
      .insert(s.places)
      .values({ kind: me.role as PlaceKind, owner_id: me.id, name, slug: await uniqueSlug(name, null), status: "borrador" })
      .returning({ id: s.places.id });
    id = row.id;
    revalidatePath("/panel");
    return null;
  });
  if (result) return result;
  redirect(`/panel/fichas/${id}`);
}

// ---------- Información ----------
export async function saveInfo(placeId: string, _: FormState, form: FormData): Promise<FormState> {
  return guarded(async () => {
    const { place } = await requireOwnPlace(placeId);
    const name = text(form, "name", 120);
    const email = text(form, "email", 120).toLowerCase();
    const whatsapp = normalizeWhatsapp(text(form, "whatsapp", 30));
    const socials = {
      facebook: normalizeUrl(text(form, "facebook", 200)),
      instagram: normalizeUrl(text(form, "instagram", 200)),
      tiktok: normalizeUrl(text(form, "tiktok", 200)),
      web: normalizeUrl(text(form, "web", 200)),
    };

    if (name.length < 3) return fail(form, "Escribe el nombre del negocio.");
    if (whatsapp === null) return fail(form, "El WhatsApp debe ser un celular, por ejemplo 300 123 4567.");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(form, "Revisa el correo de contacto.");
    if (Object.values(socials).some((v) => v === null)) return fail(form, "Revisa los enlaces de redes sociales (ej. facebook.com/minegocio).");

    const values: Partial<Place> = {
      name,
      summary: text(form, "summary", 200),
      description: text(form, "description", 5000),
      address: text(form, "address", 200),
      hours: text(form, "hours", 120),
      phone: text(form, "phone", 40),
      whatsapp,
      email,
      socials: Object.fromEntries(Object.entries(socials).filter(([, v]) => v)),
    };
    if (place.kind === "restaurante") values.payment_methods = list(form, "payment_methods");
    else values.services = list(form, "services");
    // La dirección de la ficha (slug) solo cambia mientras nunca ha sido publicada, para no romper enlaces.
    if (!place.published_at && name !== place.name) values.slug = await uniqueSlug(name, place.id);

    await getDb().update(s.places).set(values).where(eq(s.places.id, place.id));
    await afterEdit({ ...place, ...values });
    return ok("Información guardada.");
  });
}

// ---------- Listas: precios, menú, paquetes, promociones ----------
export type RowsKind = "precios" | "menu" | "paquetes" | "promociones";

const ROWS_FOR: Record<RowsKind, PlaceKind[]> = {
  precios: ["hotel", "sitio"],
  menu: ["restaurante"],
  paquetes: ["sitio"],
  promociones: ["restaurante"],
};

/**
 * Guarda la lista completa que envía el editor (cada columna llega repetida, una vez por fila).
 * Las filas totalmente vacías se ignoran; la lista anterior se reemplaza.
 */
export async function saveRows(placeId: string, kind: RowsKind, _: FormState, form: FormData): Promise<FormState> {
  return guarded(async () => {
    const { place } = await requireOwnPlace(placeId);
    if (!ROWS_FOR[kind].includes(place.kind)) throw new PermissionError("Esta sección no aplica a tu tipo de negocio.");

    const col = (k: string) => form.getAll(k).map((v) => String(v).trim());
    const names = col(kind === "promociones" ? "title" : "name");
    const rows: Record<string, string>[] = names.map((_, i) =>
      Object.fromEntries(["name", "title", "detail", "category", "description", "includes", "price", "active", "valid_until"].map((k) => [k, col(k)[i] ?? ""])),
    );
    const filled = rows.filter((r) => Object.entries(r).some(([k, v]) => v && k !== "active"));
    if (filled.length > 60) return { ok: false, message: "Máximo 60 filas." };

    const db = getDb();
    for (const [i, r] of filled.entries()) {
      const n = i + 1;
      if (kind === "promociones") {
        if (!r.title) return { ok: false, message: `Fila ${n}: escribe el título de la promoción.` };
        if (r.valid_until && !/^\d{4}-\d{2}-\d{2}$/.test(r.valid_until)) return { ok: false, message: `Fila ${n}: la fecha no es válida.` };
        continue;
      }
      if (!r.name) return { ok: false, message: `Fila ${n}: escribe el nombre.` };
      if (kind === "menu" && !r.category) return { ok: false, message: `Fila ${n}: escribe la categoría (ej. Fuertes, Bebidas).` };
      if (price(r.price) === null) return { ok: false, message: `Fila ${n}: escribe el precio en pesos (ej. 25000).` };
    }

    const place_id = place.id;
    if (kind === "precios") {
      await db.delete(s.priceItems).where(eq(s.priceItems.place_id, place_id));
      if (filled.length)
        await db.insert(s.priceItems).values(filled.map((r, position) => ({ place_id, position, name: r.name.slice(0, 80), detail: r.detail.slice(0, 120), price: price(r.price)! })));
    } else if (kind === "menu") {
      await db.delete(s.menuItems).where(eq(s.menuItems.place_id, place_id));
      if (filled.length)
        await db.insert(s.menuItems).values(
          filled.map((r, position) => ({ place_id, position, category: r.category.slice(0, 40), name: r.name.slice(0, 80), description: r.description.slice(0, 200), price: price(r.price)! })),
        );
    } else if (kind === "paquetes") {
      await db.delete(s.packages).where(eq(s.packages.place_id, place_id));
      if (filled.length)
        await db.insert(s.packages).values(
          filled.map((r, position) => ({
            place_id,
            position,
            name: r.name.slice(0, 80),
            description: r.description.slice(0, 300),
            includes: r.includes.split(",").map((x) => x.trim().slice(0, 60)).filter(Boolean).slice(0, 15),
            price: price(r.price)!,
          })),
        );
    } else {
      await db.delete(s.promotions).where(eq(s.promotions.place_id, place_id));
      if (filled.length)
        await db.insert(s.promotions).values(
          filled.map((r) => ({
            place_id,
            title: r.title.slice(0, 80),
            description: r.description.slice(0, 300),
            active: r.active !== "no",
            valid_until: r.valid_until ? new Date(`${r.valid_until}T23:59:59-05:00`) : null,
          })),
        );
    }

    if (kind === "precios" || kind === "menu") await recomputePriceFrom(place);
    await afterEdit(place);
    return ok("Cambios guardados.");
  });
}

// ---------- Fotos ----------
const MAX_PHOTOS = 30;

export async function uploadPhoto(placeId: string, _: FormState, form: FormData): Promise<FormState> {
  return guarded(async () => {
    const { place } = await requireOwnPlace(placeId);
    if (!UPLOADS_ENABLED) return { ok: false, message: "La subida de fotos todavía no está disponible en el sitio publicado." };
    const file = form.get("photo");
    if (!(file instanceof File) || file.size === 0) return { ok: false, message: "Elige una foto." };
    const problem = photoProblem(file);
    if (problem) return { ok: false, message: problem };

    const db = getDb();
    const photos = await db.select({ position: s.placePhotos.position }).from(s.placePhotos).where(eq(s.placePhotos.place_id, place.id));
    if (photos.length >= MAX_PHOTOS) return { ok: false, message: `Máximo ${MAX_PHOTOS} fotos por ficha. Borra alguna para subir otra.` };

    const url = await savePhoto(place.id, file);
    const position = photos.reduce((m, p) => Math.max(m, p.position + 1), 0);
    await db.insert(s.placePhotos).values({ place_id: place.id, url, alt: `${place.name}, foto ${photos.length + 1}`, position });
    if (!place.cover_url) await db.update(s.places).set({ cover_url: url }).where(eq(s.places.id, place.id));
    await afterEdit(place);
    return ok("Foto subida.");
  });
}

async function ownPhoto(photoId: string) {
  const [photo] = await getDb().select().from(s.placePhotos).where(eq(s.placePhotos.id, photoId));
  if (!photo) throw new PermissionError("Esta foto ya no existe.");
  const { place } = await requireOwnPlace(photo.place_id);
  return { photo, place };
}

/** La portada es la primera foto de la galería y la imagen de la tarjeta en el catálogo. */
export async function setCover(photoId: string) {
  const { photo, place } = await ownPhoto(photoId);
  const db = getDb();
  const photos = await db.select({ id: s.placePhotos.id }).from(s.placePhotos).where(eq(s.placePhotos.place_id, place.id)).orderBy(asc(s.placePhotos.position));
  const order = [photo.id, ...photos.map((p) => p.id).filter((id) => id !== photo.id)];
  for (const [position, id] of order.entries()) await db.update(s.placePhotos).set({ position }).where(eq(s.placePhotos.id, id));
  await db.update(s.places).set({ cover_url: photo.url }).where(eq(s.places.id, place.id));
  await afterEdit(place);
}

export async function deletePhoto(photoId: string) {
  const { photo, place } = await ownPhoto(photoId);
  const db = getDb();
  await db.delete(s.placePhotos).where(eq(s.placePhotos.id, photo.id));
  await removePhotoFile(photo.url);
  if (place.cover_url === photo.url) {
    const [next] = await db.select({ url: s.placePhotos.url }).from(s.placePhotos).where(eq(s.placePhotos.place_id, place.id)).orderBy(asc(s.placePhotos.position)).limit(1);
    await db.update(s.places).set({ cover_url: next?.url ?? null }).where(eq(s.places.id, place.id));
  }
  await afterEdit(place);
}

// ---------- Ubicación ----------
export async function saveLocation(placeId: string, _: FormState, form: FormData): Promise<FormState> {
  return guarded(async () => {
    const { place } = await requireOwnPlace(placeId);
    const num = (k: string) => {
      const raw = text(form, k, 30).replace(",", ".");
      return raw ? Number(raw) : null;
    };
    const lat = num("lat");
    const lng = num("lng");
    if ((lat === null) !== (lng === null)) return fail(form, "Marca el punto en el mapa o escribe latitud y longitud.");
    // Colombia, aproximadamente: evita coordenadas invertidas o con errores de digitación.
    if (lat !== null && lng !== null && !(lat >= -5 && lat <= 14 && lng >= -82 && lng <= -66)) {
      return fail(form, "Esas coordenadas quedan fuera de Colombia. Revisa que no estén invertidas.");
    }
    await getDb().update(s.places).set({ lat, lng }).where(eq(s.places.id, place.id));
    await afterEdit(place);
    return ok(lat === null ? "Ubicación borrada." : "Ubicación guardada.");
  });
}

// ---------- Enviar a revisión ----------
export async function submitPlace(placeId: string, _: FormState): Promise<FormState> {
  return guarded(async () => {
    const { place } = await requireOwnPlace(placeId);
    if (place.status === "pendiente") return { ok: false, message: "La ficha ya está esperando la revisión del administrador." };
    if (place.status === "aprobado") return { ok: false, message: "La ficha ya está publicada." };
    const full = await getDb().query.places.findFirst({
      where: eq(s.places.id, place.id),
      with: { photos: { columns: { id: true } }, priceItems: { columns: { id: true } }, menuItems: { columns: { id: true } } },
    });
    const missing = placeChecklist(full!).filter((c) => c.required && !c.ok);
    if (missing.length) return { ok: false, message: `Antes de enviar completa: ${missing.map((c) => c.label.toLowerCase()).join(" y ")}.` };
    await getDb().update(s.places).set({ status: "pendiente", rejection_reason: null }).where(eq(s.places.id, place.id));
    refresh(place);
    return ok("¡Enviada! El administrador la revisará; verás el resultado en tu panel.");
  });
}
