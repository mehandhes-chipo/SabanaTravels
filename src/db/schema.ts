// Esquema de la base de datos (PostgreSQL) con Drizzle ORM.
// Para crear o actualizar las tablas: npm run db:push
// Los nombres de columna van en snake_case para coincidir con la base de datos.
import { relations } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

/** Roles: el visitante sin cuenta no existe en la base; "cliente" puede opinar; los negocios publican su ficha. */
export const userRole = pgEnum("user_role", ["admin", "cliente", "hotel", "restaurante", "sitio"]);
export const placeKind = pgEnum("place_kind", ["hotel", "restaurante", "sitio"]);
/** Flujo de publicación: borrador → pendiente → aprobado | rechazado. Solo "aprobado" es público. */
export const placeStatus = pgEnum("place_status", ["borrador", "pendiente", "aprobado", "rechazado"]);
export const reviewStatus = pgEnum("review_status", ["pendiente", "aprobada", "rechazada"]);

const created_at = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updated_at = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

export type SocialLinks = { facebook?: string; instagram?: string; tiktok?: string; web?: string };

// ---------- Cuentas ----------
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  full_name: text("full_name").notNull().default(""),
  role: userRole("role").notNull().default("cliente"),
  password_hash: text("password_hash").notNull(),
  /** El administrador puede suspender una cuenta sin borrarla. */
  active: boolean("active").notNull().default(true),
  created_at: created_at(),
});

// ---------- Fichas (hoteles, restaurantes y sitios turísticos) ----------
export const places = pgTable(
  "places",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kind: placeKind("kind").notNull(),
    /** Cuenta del negocio dueño de la ficha (null = la administra la plataforma). */
    owner_id: uuid("owner_id").references(() => users.id, { onDelete: "set null" }),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    summary: text("summary").notNull().default(""),
    description: text("description").notNull().default(""),
    address: text("address").notNull().default(""),
    lat: doublePrecision("lat"),
    lng: doublePrecision("lng"),
    phone: text("phone").notNull().default(""),
    /** Número con indicativo, solo dígitos (ej. 573001234567). Se usa para el botón de WhatsApp. */
    whatsapp: text("whatsapp").notNull().default(""),
    email: text("email").notNull().default(""),
    socials: jsonb("socials").$type<SocialLinks>().notNull().default({}),
    /** Texto libre, ej. "Lunes a domingo, 11:00–21:00". */
    hours: text("hours").notNull().default(""),
    /** Hotel: Wi-Fi, piscina…  Sitio: guía, sendero… */
    services: text("services").array().notNull().default([]),
    /** Restaurante (y opcional en otros): efectivo, tarjeta, Nequi… */
    payment_methods: text("payment_methods").array().notNull().default([]),
    /** Precio de referencia en pesos para las tarjetas "desde $…". */
    price_from: integer("price_from"),
    cover_url: text("cover_url"),
    status: placeStatus("status").notNull().default("borrador"),
    rejection_reason: text("rejection_reason"),
    reviewed_by: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
    published_at: timestamp("published_at", { withTimezone: true }),
    created_at: created_at(),
    updated_at: updated_at(),
  },
  (t) => [index("places_kind_status_idx").on(t.kind, t.status), index("places_owner_idx").on(t.owner_id)],
);

export const placePhotos = pgTable(
  "place_photos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    place_id: uuid("place_id")
      .notNull()
      .references(() => places.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    alt: text("alt").notNull().default(""),
    position: integer("position").notNull().default(0),
    created_at: created_at(),
  },
  (t) => [index("place_photos_place_idx").on(t.place_id)],
);

/** Tabla de precios: habitaciones (hotel) o entradas (sitio turístico). */
export const priceItems = pgTable(
  "price_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    place_id: uuid("place_id")
      .notNull()
      .references(() => places.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    /** Ej. "2 personas", "por noche", "niños de 3 a 10 años". */
    detail: text("detail").notNull().default(""),
    price: integer("price").notNull(),
    position: integer("position").notNull().default(0),
  },
  (t) => [index("price_items_place_idx").on(t.place_id)],
);

/** Menú del restaurante, agrupado por categoría (Entradas, Fuertes, Bebidas, Postres…). */
export const menuItems = pgTable(
  "menu_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    place_id: uuid("place_id")
      .notNull()
      .references(() => places.id, { onDelete: "cascade" }),
    category: text("category").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    price: integer("price").notNull(),
    position: integer("position").notNull().default(0),
  },
  (t) => [index("menu_items_place_idx").on(t.place_id)],
);

/** Paquetes de servicios del sitio turístico (Básico, Full day…). */
export const packages = pgTable(
  "packages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    place_id: uuid("place_id")
      .notNull()
      .references(() => places.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    includes: text("includes").array().notNull().default([]),
    price: integer("price").notNull(),
    position: integer("position").notNull().default(0),
  },
  (t) => [index("packages_place_idx").on(t.place_id)],
);

/** Promociones del restaurante (ej. "2x1 los jueves"). */
export const promotions = pgTable(
  "promotions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    place_id: uuid("place_id")
      .notNull()
      .references(() => places.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    active: boolean("active").notNull().default(true),
    valid_until: timestamp("valid_until", { withTimezone: true }),
    created_at: created_at(),
  },
  (t) => [index("promotions_place_idx").on(t.place_id)],
);

// ---------- Opiniones ----------
// Un cliente puede dejar una sola opinión por lugar; el administrador la modera antes de publicarla.
export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    place_id: uuid("place_id")
      .notNull()
      .references(() => places.id, { onDelete: "cascade" }),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rating: smallint("rating").notNull(),
    comment: text("comment").notNull().default(""),
    status: reviewStatus("status").notNull().default("pendiente"),
    created_at: created_at(),
  },
  (t) => [unique("reviews_place_user_uq").on(t.place_id, t.user_id), index("reviews_place_status_idx").on(t.place_id, t.status)],
);

// ---------- Eventos y festividades ----------
export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    summary: text("summary").notNull().default(""),
    description: text("description").notNull().default(""),
    starts_at: timestamp("starts_at", { withTimezone: true }).notNull(),
    ends_at: timestamp("ends_at", { withTimezone: true }),
    location: text("location").notNull().default(""),
    lat: doublePrecision("lat"),
    lng: doublePrecision("lng"),
    cover_url: text("cover_url"),
    published: boolean("published").notNull().default(false),
    created_by: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    created_at: created_at(),
    updated_at: updated_at(),
  },
  (t) => [index("events_starts_idx").on(t.starts_at)],
);

// ---------- Relaciones (para consultas con `with`) ----------
export const usersRelations = relations(users, ({ many }) => ({
  places: many(places),
  reviews: many(reviews),
}));

export const placesRelations = relations(places, ({ one, many }) => ({
  owner: one(users, { fields: [places.owner_id], references: [users.id] }),
  photos: many(placePhotos),
  priceItems: many(priceItems),
  menuItems: many(menuItems),
  packages: many(packages),
  promotions: many(promotions),
  reviews: many(reviews),
}));

export const placePhotosRelations = relations(placePhotos, ({ one }) => ({
  place: one(places, { fields: [placePhotos.place_id], references: [places.id] }),
}));
export const priceItemsRelations = relations(priceItems, ({ one }) => ({
  place: one(places, { fields: [priceItems.place_id], references: [places.id] }),
}));
export const menuItemsRelations = relations(menuItems, ({ one }) => ({
  place: one(places, { fields: [menuItems.place_id], references: [places.id] }),
}));
export const packagesRelations = relations(packages, ({ one }) => ({
  place: one(places, { fields: [packages.place_id], references: [places.id] }),
}));
export const promotionsRelations = relations(promotions, ({ one }) => ({
  place: one(places, { fields: [promotions.place_id], references: [places.id] }),
}));
export const reviewsRelations = relations(reviews, ({ one }) => ({
  place: one(places, { fields: [reviews.place_id], references: [places.id] }),
  user: one(users, { fields: [reviews.user_id], references: [users.id] }),
}));
