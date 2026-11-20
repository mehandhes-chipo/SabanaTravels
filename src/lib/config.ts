export type PlaceKind = "hotel" | "restaurante" | "sitio";
export type Role = "admin" | "cliente" | "hotel" | "restaurante" | "sitio";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const SITE_NAME = "Sabana Travel's";
export const SLOGAN = "Sabor, Descanso & Placer";
export const TOWN = "Sabana de Torres, Santander";
export const TIME_ZONE = "America/Bogota";

/** Centro aproximado del casco urbano de Sabana de Torres (para el mapa). */
export const TOWN_CENTER = { lat: 7.3925, lng: -73.4972 };

/** Cada categoría es uno de los tres pilares de la marca. */
export const KINDS: Record<PlaceKind, { one: string; many: string; route: string; pillar: string }> = {
  hotel: { one: "Hotel", many: "Hoteles", route: "hoteles", pillar: "Descanso" },
  restaurante: { one: "Restaurante", many: "Restaurantes", route: "restaurantes", pillar: "Sabor" },
  sitio: { one: "Sitio turístico", many: "Sitios turísticos", route: "sitios", pillar: "Placer" },
};

export const KIND_ORDER: PlaceKind[] = ["restaurante", "hotel", "sitio"];

export const ROUTE_TO_KIND: Record<string, PlaceKind> = {
  hoteles: "hotel",
  restaurantes: "restaurante",
  sitios: "sitio",
};

/** En la v2 todas las fichas viven en /lugares/<slug> (el slug es único en toda la base). */
export const placeHref = (p: { slug: string }) => `/lugares/${p.slug}`;

/** Color de la etiqueta de cada categoría (texto marino encima: contraste AA). */
export const KIND_BADGE: Record<PlaceKind, string> = { restaurante: "bg-naranja", hotel: "bg-cian", sitio: "bg-verde" };

/** Tipos de cuenta que una persona puede elegir al registrarse (el admin no se registra). */
export const SIGNUP_ROLES: { role: Exclude<Role, "admin">; label: string; hint: string }[] = [
  { role: "cliente", label: "Cliente", hint: "Quiero opinar sobre los lugares que visito" },
  { role: "hotel", label: "Hotel", hint: "Quiero publicar mi hotel u hospedaje" },
  { role: "restaurante", label: "Restaurante", hint: "Quiero publicar mi restaurante" },
  { role: "sitio", label: "Sitio turístico", hint: "Quiero publicar mi sitio, finca o balneario" },
];

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Administrador",
  cliente: "Cliente",
  hotel: "Hotel",
  restaurante: "Restaurante",
  sitio: "Sitio turístico",
};

/** Roles de negocio: su rol coincide con el tipo de ficha que publican. */
export const isBusinessRole = (r: Role): r is PlaceKind => r === "hotel" || r === "restaurante" || r === "sitio";

/** Solo rutas internas ("/algo"), nunca "//otro-sitio.com" ni URLs completas: evita redirecciones abiertas. */
export function safeNext(value: unknown): string | null {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : null;
}

/** Ruta de inicio después de ingresar, según el rol. */
export const homeFor = (r: Role) => (r === "admin" ? "/admin" : isBusinessRole(r) ? "/panel" : "/");
