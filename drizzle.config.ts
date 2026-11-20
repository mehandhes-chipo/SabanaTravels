import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { defineConfig } from "drizzle-kit";

const url = process.env.DATABASE_URL ?? "";
if (url.startsWith("file:")) mkdirSync(dirname(url.slice("file:".length)), { recursive: true });

// npm run db:push   → crea o actualiza las tablas según src/db/schema.ts
// npm run db:studio → explorador visual de la base de datos
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  ...(url.startsWith("file:")
    ? { driver: "pglite" as const, dbCredentials: { url: url.slice("file:".length) } }
    : { dbCredentials: { url } }),
});
