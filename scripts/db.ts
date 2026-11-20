// Conexión para los scripts de consola (fuera de Next.js).
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "../src/db/schema";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Falta DATABASE_URL en .env.local");
  process.exit(1);
}

if (url.startsWith("file:")) mkdirSync(dirname(url.slice("file:".length)), { recursive: true });

export const db = url.startsWith("file:")
  ? (drizzlePglite(new PGlite(url.slice("file:".length)), { schema }) as unknown as ReturnType<typeof drizzleNeon<typeof schema>>)
  : drizzleNeon(neon(url), { schema });

export { schema };
