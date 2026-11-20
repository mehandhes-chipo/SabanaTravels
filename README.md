# Sabana Travel's v2

Sitio de turismo de Sabana de Torres (Santander) con un estilo de plantilla de viajes: blanco, verde aventura y azul marino, subtítulos manuscritos, secciones menta con dibujos de viaje y una franja verde de cifras.

Tiene **el mismo flujo y los mismos actores que la v1** (`../web`, etiqueta `v1.0`), con el diseño nuevo:

| Actor | Puede |
|---|---|
| Visitante | Ver portada, catálogo, fichas, eventos y opiniones; contactar por WhatsApp |
| Cliente | Lo anterior + calificar y comentar (el admin modera) |
| Hotel / Restaurante / Sitio turístico | Crear y editar su ficha (información, fotos, precios o menú, paquetes, promociones, ubicación) y enviarla a revisión |
| Administrador | Aprobar o rechazar fichas, moderar opiniones, gestionar usuarios y eventos |

Flujo de una ficha: **borrador → pendiente → aprobado / rechazado**. Solo lo aprobado es público y todo cambio la devuelve a borrador.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · Drizzle ORM · PostgreSQL (PGlite en desarrollo, Neon en producción) · Auth.js · fuentes Plus Jakarta Sans y Yesteryear.

## Empezar

```bash
npm install
cp .env.example .env.local      # y completa AUTH_SECRET y SEED_PASSWORD
npm run db:push                 # crea las tablas en .data/db
npm run seed                    # 5 cuentas de prueba, 9 lugares, 1 ficha pendiente y 1 evento
npm run dev -- -p 3200          # http://localhost:3200
npm run typecheck && npm run lint
```

Cuentas de prueba (contraseña = `SEED_PASSWORD` de `.env.local`): `admin`, `cliente`, `hotel`, `restaurante` y `sitio`, todas `@sabanatravels.test` (ver `scripts/seed.ts`). **Precios, horarios y coordenadas son de ejemplo.**

## Estructura

```
src/
  app/
    (sitio)/             sitio público: portada, explorar, lugares/[slug], eventos, ingresar, registro
    panel/               panel del negocio
    admin/               panel del administrador
    actions/             Server Actions (ingreso, fichas, opiniones, usuarios, eventos)
  components/            diseño público (Encabezado, Portada, TarjetaLugar…), panel/, auth/, ui/, site/
  db/schema.ts           tablas: users, places, place_photos, price_items, menu_items, packages, promotions, reviews, events
  lib/                   config, consultas (data.ts), permisos, formato, subida de fotos
scripts/                 seed, conexión para consola y retocar_fotos.py (retoque uniforme de las fotos)
```

Toda escritura pasa por `src/lib/permissions.ts`.

## Colores

| Token | Uso |
|---|---|
| `verde` #4DA528 | Subtítulos manuscritos, íconos y textos grandes |
| `verde-700` #367F1B | Botones, enlaces y la franja de cifras (5:1 con blanco) |
| `marino` #081E2A | Títulos y botón principal de los paneles |
| `texto` #4F545A | Texto de párrafos |
| `naranja` #FF970D / `cian` #14B0C3 | Etiquetas (con texto marino) y estrellas |
| `menta` #F3F8F6 / `nube` #F4F6F8 | Fondos de sección |
| `peligro` #A61B1B | Errores y acciones destructivas |
| `bosque` #1D231F | Pie de página |

## Desplegar en Vercel

1. Crear una base en Neon y poner su `DATABASE_URL` en Vercel (y `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`).
2. `npm run db:push` apuntando a Neon. `npm run build` no funciona con PGlite: compilar con la URL de Neon.
3. Las fotos que suben los negocios se guardan en `public/uploads/` solo en desarrollo: en Vercel hay que conectar un almacenamiento (por ejemplo Vercel Blob) en `src/lib/uploads.ts`.
