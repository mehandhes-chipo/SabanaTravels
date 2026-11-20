import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export type DB = NeonHttpDatabase<typeof schema>;

const url = process.env.DATABASE_URL ?? "";

/**
 * DATABASE_URL=postgres://…    → Neon (producción en Vercel)
 * DATABASE_URL=file:./.data/db → PostgreSQL embebido (PGlite) para desarrollar sin cuenta ni Internet
 */
function create(): DB {
  if (url.startsWith("file:")) {
    if (process.env.NEXT_PHASE === "phase-production-build") {
      throw new Error(
        "La base local (PGlite) no sirve para `npm run build`: la compilación usa varios procesos. Usa la DATABASE_URL de Neon para compilar.",
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PGlite } = require("@electric-sql/pglite");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { drizzle } = require("drizzle-orm/pglite");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { mkdirSync } = require("node:fs");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { dirname } = require("node:path");
    const dir = url.slice("file:".length);
    mkdirSync(dirname(dir), { recursive: true });
    const g = globalThis as unknown as { __pglite?: unknown };
    // Una sola instancia por proceso (en desarrollo Next recarga los módulos).
    g.__pglite ??= new PGlite(dir);
    return drizzle(g.__pglite, { schema }) as DB;
  }
  return drizzleNeon(neon(url), { schema });
}

let instance: DB | null = null;

/** Conexión a la base de datos (se crea al primer uso). */
export function getDb(): DB {
  if (!url) throw new Error("Falta DATABASE_URL en .env.local (copia .env.example).");
  instance ??= create();
  return instance;
}

export { schema };
