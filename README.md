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

## Publicar gratis: Vercel + Neon + Vercel Blob

Todo con planes gratuitos: **Vercel Hobby** (sitio, uso personal o no comercial), **Neon Free** (PostgreSQL, 1 GB) y **Vercel Blob** (fotos que suben los negocios, incluido en Hobby). El código ya los soporta: con una `DATABASE_URL` `postgresql://…` usa Neon, y con `BLOB_READ_WRITE_TOKEN` guarda las fotos en Blob.

### 1. Base de datos en Neon
1. Crear cuenta en <https://neon.com> (se puede entrar con GitHub) y un proyecto, región **AWS US East (N. Virginia)** o la más cercana.
2. Copiar la **Connection string** (`postgresql://…?sslmode=require`).
3. En esta carpeta, crear las tablas y cargar los datos en Neon (sin tocar el `.env.local` de desarrollo):

```powershell
$env:DATABASE_URL="postgresql://…pegar aquí…"
$env:SEED_PASSWORD="una-contraseña-larga-y-nueva"
npx drizzle-kit push
npx tsx scripts/seed.ts
```

> Las cuentas de prueba del seed quedan publicadas en internet: usa una `SEED_PASSWORD` larga y distinta a la de desarrollo, y suspende o cambia las cuentas que no uses desde **Admin → Usuarios**.

### 2. Sitio en Vercel
1. Crear cuenta en <https://vercel.com> con GitHub y **Add New → Project → importar `sabana-travels-v2`** (framework Next.js, sin cambiar nada más).
2. En **Settings → Environment Variables** agregar:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | La connection string de Neon |
| `AUTH_SECRET` | Texto aleatorio de 32+ caracteres (`npx auth secret` lo genera) |
| `NEXT_PUBLIC_SITE_URL` | `https://<tu-proyecto>.vercel.app` |

3. **Storage → Create Database → Blob → Connect** al proyecto: Vercel agrega solo `BLOB_READ_WRITE_TOKEN`.
4. **Deployments → Redeploy** para que tome las variables. Cada `git push` a `main` vuelve a publicar.

### 3. Comprobar
- Abrir el sitio, ingresar con `admin@sabanatravels.test` y la `SEED_PASSWORD` del paso 1.
- Con la cuenta de un negocio, subir una foto en su ficha: debe quedar guardada en Blob (su dirección empieza por `https://…public.blob.vercel-storage.com/fichas/…`).

`npm run build` no funciona con PGlite (`file:`); Vercel compila con la URL de Neon.
