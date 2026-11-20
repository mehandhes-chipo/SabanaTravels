// Carga datos de demostración: cuentas de prueba, los 9 lugares registrados en REGISTRO/ y un evento.
//   npm run db:push   (primero, para crear las tablas)
//   npm run seed
// Las cuentas de prueba usan la contraseña SEED_PASSWORD de .env.local. Es seguro ejecutarlo varias veces.
//
// ⚠ Teléfonos, precios, horarios y coordenadas son DE EJEMPLO: reemplazarlos con los datos reales de cada negocio.
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import { hashPassword } from "../src/lib/password";
import { db, schema as s } from "./db";

type Kind = "hotel" | "restaurante" | "sitio";

/** Foto de portada elegida para cada lugar (archivo en public/fotos/<slug>/), revisando las hojas de contacto. */
const COVERS: Record<string, string> = {
  "hotel-el-dorado": "22.webp",
  "hotel-el-nuevo-despertar": "06.webp",
  "hotel-santa-maria-real": "10.webp",
  "brasas-la-14": "12.webp",
  "el-fogon": "09.webp",
  "el-marquez": "12.webp",
  "estadero-villa-juliana": "11.webp",
  "reserva-natural-cabildo-verde": "27.webp",
  "balneario-las-vegas": "06.webp",
};


const ACCOUNTS = [
  { email: "admin@sabanatravels.test", full_name: "Administrador Sabana Travels", role: "admin" },
  { email: "cliente@sabanatravels.test", full_name: "Cliente de prueba", role: "cliente" },
  { email: "hotel@sabanatravels.test", full_name: "Hotel de prueba", role: "hotel" },
  { email: "restaurante@sabanatravels.test", full_name: "Restaurante de prueba", role: "restaurante" },
  { email: "sitio@sabanatravels.test", full_name: "Sitio turístico de prueba", role: "sitio" },
] as const;

// Coordenadas aproximadas alrededor del casco urbano (7.3925, -73.4972). Ajustar con Google Maps.
const PLACES: {
  kind: Kind;
  slug: string;
  name: string;
  summary: string;
  lat: number;
  lng: number;
  price_from: number;
  services?: string[];
  payment_methods?: string[];
  owner?: string;
}[] = [
  { kind: "hotel", slug: "hotel-el-dorado", name: "Hotel El Dorado", summary: "Habitaciones cómodas en el centro del municipio.", lat: 7.3931, lng: -73.4968, price_from: 90000, services: ["Wi-Fi", "Aire acondicionado", "Parqueadero"], owner: "hotel@sabanatravels.test" },
  { kind: "hotel", slug: "hotel-el-nuevo-despertar", name: "Hotel El Nuevo Despertar", summary: "Descanso tranquilo a pocos pasos del parque principal.", lat: 7.3918, lng: -73.4985, price_from: 80000, services: ["Wi-Fi", "Ventilador", "Desayuno"] },
  { kind: "hotel", slug: "hotel-santa-maria-real", name: "Hotel Santa María Real", summary: "Hospedaje con piscina y zonas verdes.", lat: 7.3942, lng: -73.4951, price_from: 120000, services: ["Wi-Fi", "Piscina", "Aire acondicionado", "Parqueadero"] },
  { kind: "restaurante", slug: "brasas-la-14", name: "Brasas La 14", summary: "Carnes a la brasa y asados santandereanos.", lat: 7.3912, lng: -73.4962, price_from: 25000, payment_methods: ["Efectivo", "Nequi"], owner: "restaurante@sabanatravels.test" },
  { kind: "restaurante", slug: "el-fogon", name: "El Fogón", summary: "Comida típica casera y sancochos de leña.", lat: 7.3936, lng: -73.4990, price_from: 18000, payment_methods: ["Efectivo", "Tarjeta"] },
  { kind: "restaurante", slug: "el-marquez", name: "El Márquez", summary: "Platos de la región y menú del día.", lat: 7.3924, lng: -73.4944, price_from: 20000, payment_methods: ["Efectivo", "Nequi", "Tarjeta"] },
  { kind: "sitio", slug: "estadero-villa-juliana", name: "Estadero Villa Juliana", summary: "Piscina, kiosco y comida para pasar el día en familia.", lat: 7.3995, lng: -73.4890, price_from: 15000, services: ["Piscina", "Kiosco", "Parqueadero"] },
  { kind: "sitio", slug: "reserva-natural-cabildo-verde", name: "Reserva Natural Cabildo Verde", summary: "Bosque, fauna rescatada y senderos: hogar del jaguar.", lat: 7.3600, lng: -73.4700, price_from: 25000, services: ["Guía local", "Senderismo", "Avistamiento de fauna"], owner: "sitio@sabanatravels.test" },
  { kind: "sitio", slug: "balneario-las-vegas", name: "Balneario Las Vegas", summary: "Río, piscinas naturales y descanso al aire libre.", lat: 7.4100, lng: -73.5100, price_from: 10000, services: ["Baño en río", "Kiosco", "Parqueadero"] },
];

async function main() {
  const password = process.env.SEED_PASSWORD;
  if (!password || password.length < 8) {
    console.error("Define SEED_PASSWORD (mínimo 8 caracteres) en .env.local antes de ejecutar el seed.");
    process.exit(1);
  }
  const password_hash = await hashPassword(password);

  const ids = new Map<string, string>();
  for (const a of ACCOUNTS) {
    const [existing] = await db.select({ id: s.users.id }).from(s.users).where(eq(s.users.email, a.email));
    if (existing) {
      ids.set(a.email, existing.id);
      continue;
    }
    const [row] = await db.insert(s.users).values({ ...a, password_hash }).returning({ id: s.users.id });
    ids.set(a.email, row.id);
  }

  const now = new Date();
  for (const p of PLACES) {
    const [existing] = await db.select({ id: s.places.id }).from(s.places).where(eq(s.places.slug, p.slug));
    if (existing) continue;
    const { owner, ...data } = p;
    const [place] = await db
      .insert(s.places)
      .values({
        ...data,
        owner_id: owner ? ids.get(owner) : null,
        address: "Sabana de Torres, Santander",
        status: "aprobado",
        published_at: now,
      })
      .returning({ id: s.places.id });

    if (p.kind === "hotel") {
      await db.insert(s.priceItems).values([
        { place_id: place.id, name: "Sencilla", detail: "1 persona", price: p.price_from, position: 0 },
        { place_id: place.id, name: "Doble", detail: "2 personas", price: Math.round(p.price_from * 1.5), position: 1 },
        { place_id: place.id, name: "Familiar", detail: "4 personas", price: Math.round(p.price_from * 2.2), position: 2 },
      ]);
    } else if (p.kind === "restaurante") {
      await db.insert(s.menuItems).values([
        { place_id: place.id, category: "Fuertes", name: "Plato del día", description: "Sopa, seco y jugo", price: p.price_from, position: 0 },
        { place_id: place.id, category: "Fuertes", name: "Carne a la brasa", description: "Con yuca y ensalada", price: p.price_from + 12000, position: 1 },
        { place_id: place.id, category: "Bebidas", name: "Jugo natural", price: 6000, position: 0 },
      ]);
    } else {
      await db.insert(s.priceItems).values([
        { place_id: place.id, name: "Adulto", detail: "Entrada", price: p.price_from, position: 0 },
        { place_id: place.id, name: "Niño", detail: "De 3 a 10 años", price: Math.round(p.price_from * 0.6), position: 1 },
      ]);
      await db.insert(s.packages).values([
        { place_id: place.id, name: "Pasadía", description: "Entrada y almuerzo", includes: ["Entrada", "Almuerzo típico"], price: p.price_from + 30000, position: 0 },
      ]);
    }
  }

  // Fotos reales convertidas con scripts/convertir_fotos.py (public/fotos/<slug>/NN.webp).
  // Solo se cargan en las fichas que aún no tienen fotos; la portada es la indicada en COVERS (o la primera).
  let photoCount = 0;
  for (const p of PLACES) {
    const dir = join(process.cwd(), "public", "fotos", p.slug);
    if (!existsSync(dir)) continue;
    // Las fotos excluidas (ver EXCLUDE en convertir_fotos.py) ni siquiera se generan.
    const files = readdirSync(dir)
      .filter((f) => /^\d+\.webp$/.test(f))
      .sort((a, b) => parseInt(a) - parseInt(b));
    if (files.length === 0) continue;
    const [place] = await db.select({ id: s.places.id }).from(s.places).where(eq(s.places.slug, p.slug));
    if (!place) continue;
    const [has] = await db.select({ id: s.placePhotos.id }).from(s.placePhotos).where(eq(s.placePhotos.place_id, place.id)).limit(1);
    if (has) continue;
    const cover = COVERS[p.slug] && files.includes(COVERS[p.slug]) ? COVERS[p.slug] : files[0];
    // La portada va primero en la galería.
    const ordered = [cover, ...files.filter((f) => f !== cover)];
    await db.insert(s.placePhotos).values(
      ordered.map((f, i) => ({ place_id: place.id, url: `/fotos/${p.slug}/${f}`, alt: `${p.name}, foto ${i + 1}`, position: i })),
    );
    await db.update(s.places).set({ cover_url: `/fotos/${p.slug}/${cover}` }).where(eq(s.places.id, place.id));
    photoCount += files.length;
  }
  if (photoCount) console.log(`  ${photoCount} fotos asociadas a las fichas.`);

  // Una ficha "pendiente" para probar el flujo de aprobación del administrador (incompleta a propósito).
  const pendingSlug = "restaurante-pendiente-de-ejemplo";
  const [pending] = await db.select({ id: s.places.id }).from(s.places).where(eq(s.places.slug, pendingSlug));
  if (!pending) {
    const [place] = await db
      .insert(s.places)
      .values({
        kind: "restaurante",
        slug: pendingSlug,
        name: "Restaurante pendiente (ejemplo)",
        summary: "Ficha de prueba enviada por un negocio, esperando aprobación.",
        owner_id: ids.get("restaurante@sabanatravels.test"),
        address: "Sabana de Torres, Santander",
        whatsapp: "570000000000",
        lat: 7.3929,
        lng: -73.4978,
        price_from: 15000,
        payment_methods: ["Efectivo"],
        status: "pendiente",
      })
      .returning({ id: s.places.id });
    await db.insert(s.menuItems).values([
      { place_id: place.id, category: "Fuertes", name: "Plato de ejemplo", price: 15000, position: 0 },
    ]);
  }

  const [ev] = await db.select({ id: s.events.id }).from(s.events).where(eq(s.events.slug, "evento-de-ejemplo"));
  if (!ev) {
    const start = new Date(now.getFullYear(), now.getMonth() + 1, 15, 18, 0);
    await db.insert(s.events).values({
      slug: "evento-de-ejemplo",
      title: "Evento de ejemplo",
      summary: "Reemplazar con una festividad real del municipio.",
      starts_at: start,
      location: "Parque principal",
      published: true,
      created_by: ids.get("admin@sabanatravels.test"),
    });
  }

  console.log(`✓ Seed listo: ${ACCOUNTS.length} cuentas de prueba, ${PLACES.length} lugares publicados, 1 ficha pendiente y 1 evento.`);
  console.log("  Las cuentas de prueba están en scripts/seed.ts; su contraseña es SEED_PASSWORD de .env.local.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
