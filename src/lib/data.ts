import "server-only";
// Consultas de lectura para el sitio público. Solo devuelven contenido aprobado / publicado.
import { and, asc, avg, count, desc, eq, gte, isNull, or } from "drizzle-orm";
import { getDb, schema as s } from "@/db";
import type { PlaceKind } from "./config";
import { startOfTodayCO } from "./format";

export async function getCounts(): Promise<Record<PlaceKind, number>> {
  const rows = await getDb()
    .select({ kind: s.places.kind, n: count() })
    .from(s.places)
    .where(eq(s.places.status, "aprobado"))
    .groupBy(s.places.kind);
  const out: Record<PlaceKind, number> = { hotel: 0, restaurante: 0, sitio: 0 };
  for (const r of rows) out[r.kind] = Number(r.n);
  return out;
}

export async function listPlaces(kind?: PlaceKind) {
  const db = getDb();
  const where = kind ? and(eq(s.places.status, "aprobado"), eq(s.places.kind, kind)) : eq(s.places.status, "aprobado");
  const places = await db
    .select({
      id: s.places.id,
      kind: s.places.kind,
      slug: s.places.slug,
      name: s.places.name,
      summary: s.places.summary,
      cover_url: s.places.cover_url,
      price_from: s.places.price_from,
      lat: s.places.lat,
      lng: s.places.lng,
    })
    .from(s.places)
    .where(where)
    .orderBy(asc(s.places.name));

  const ratings = await db
    .select({ place_id: s.reviews.place_id, avg: avg(s.reviews.rating), n: count() })
    .from(s.reviews)
    .where(eq(s.reviews.status, "aprobada"))
    .groupBy(s.reviews.place_id);
  const byPlace = new Map(ratings.map((r) => [r.place_id, { rating: Number(r.avg), reviews: Number(r.n) }]));

  return places.map((p) => ({ ...p, ...(byPlace.get(p.id) ?? { rating: null, reviews: 0 }) }));
}

export type PlaceListItem = Awaited<ReturnType<typeof listPlaces>>[number];

/** Ficha pública por slug (único en toda la base). Solo las aprobadas. */
export async function getPlace(slug: string) {
  return getDb().query.places.findFirst({
    where: and(eq(s.places.slug, slug), eq(s.places.status, "aprobado")),
    with: {
      photos: { orderBy: asc(s.placePhotos.position) },
      priceItems: { orderBy: asc(s.priceItems.position) },
      // Orden que el negocio eligió en su panel; las categorías salen en el orden de su primer plato.
      menuItems: { orderBy: asc(s.menuItems.position) },
      packages: { orderBy: asc(s.packages.position) },
      // Activas y sin vencer.
      promotions: { where: and(eq(s.promotions.active, true), or(isNull(s.promotions.valid_until), gte(s.promotions.valid_until, new Date()))) },
      reviews: {
        where: eq(s.reviews.status, "aprobada"),
        orderBy: desc(s.reviews.created_at),
        with: { user: { columns: { full_name: true } } },
      },
    },
  });
}

/** Opinión que el usuario ya dejó en un lugar (cualquier estado), para mostrarle su estado y permitirle editarla. */
export async function getMyReview(placeId: string, userId: string) {
  const [row] = await getDb()
    .select({ rating: s.reviews.rating, comment: s.reviews.comment, status: s.reviews.status })
    .from(s.reviews)
    .where(and(eq(s.reviews.place_id, placeId), eq(s.reviews.user_id, userId)));
  return row ?? null;
}

/** Eventos publicados que no han terminado (los de varios días siguen visibles mientras duran). */
export async function upcomingEvents(limit = 20) {
  const today = startOfTodayCO();
  return getDb()
    .select()
    .from(s.events)
    .where(and(eq(s.events.published, true), or(gte(s.events.starts_at, today), gte(s.events.ends_at, today))))
    .orderBy(asc(s.events.starts_at))
    .limit(limit);
}

export async function getEvent(slug: string) {
  const [row] = await getDb()
    .select()
    .from(s.events)
    .where(and(eq(s.events.slug, slug), eq(s.events.published, true)));
  return row ?? null;
}
