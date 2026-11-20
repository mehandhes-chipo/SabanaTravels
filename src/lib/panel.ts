import "server-only";
import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb, schema as s } from "@/db";
import { requirePage } from "./auth";
import type { PlaceKind } from "./config";
import { UUID } from "./permissions";

/** Ficha del negocio que ha ingresado, con todo lo que se edita en el panel. 404 si no es suya. */
export async function getOwnPlace(id: string) {
  const me = await requirePage("negocio");
  if (!UUID.test(id)) notFound();
  const place = await getDb().query.places.findFirst({
    where: eq(s.places.id, id),
    with: {
      photos: { orderBy: asc(s.placePhotos.position) },
      priceItems: { orderBy: asc(s.priceItems.position) },
      menuItems: { orderBy: asc(s.menuItems.position) },
      packages: { orderBy: asc(s.packages.position) },
      promotions: { orderBy: asc(s.promotions.created_at) },
    },
  });
  if (!place || place.owner_id !== me.id) notFound();
  return place;
}

export type OwnPlace = Awaited<ReturnType<typeof getOwnPlace>>;

/** Secciones de la ficha según el tipo de negocio (diagramas de casos de uso de la propuesta). */
export const PLACE_SECTIONS: Record<PlaceKind, { slug: string; label: string }[]> = {
  hotel: [
    { slug: "", label: "Información" },
    { slug: "fotos", label: "Fotografías" },
    { slug: "precios", label: "Tabla de precios" },
    { slug: "ubicacion", label: "Ubicación" },
  ],
  restaurante: [
    { slug: "", label: "Información" },
    { slug: "fotos", label: "Fotografías" },
    { slug: "menu", label: "Menú" },
    { slug: "promociones", label: "Promociones" },
    { slug: "ubicacion", label: "Ubicación" },
  ],
  sitio: [
    { slug: "", label: "Información" },
    { slug: "fotos", label: "Fotografías" },
    { slug: "precios", label: "Tabla de precios" },
    { slug: "paquetes", label: "Paquetes" },
    { slug: "ubicacion", label: "Ubicación" },
  ],
};

/** 404 si la sección no corresponde al tipo de negocio (ej. "menú" en un hotel). */
export function requireSection(kind: PlaceKind, slug: string) {
  if (!PLACE_SECTIONS[kind].some((x) => x.slug === slug)) notFound();
}
