import "server-only";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDb, schema } from "@/db";
import { homeFor, isBusinessRole, type Role } from "./config";

export type Profile = { id: string; email: string; full_name: string; role: Role };

/** Usuario actual con su rol leído de la base de datos, o null si no hay sesión o la cuenta está suspendida. */
export async function getCurrentProfile(): Promise<Profile | null> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;
  const [user] = await getDb()
    .select({
      id: schema.users.id,
      email: schema.users.email,
      full_name: schema.users.full_name,
      role: schema.users.role,
      active: schema.users.active,
    })
    .from(schema.users)
    .where(eq(schema.users.id, id));
  if (!user?.active) return null;
  return { id: user.id, email: user.email, full_name: user.full_name, role: user.role };
}

/** Para páginas: exige sesión y redirige si el rol no corresponde. */
export async function requirePage(kind: "admin" | "negocio" | "usuario"): Promise<Profile> {
  const me = await getCurrentProfile();
  if (!me) redirect("/ingresar");
  if (kind === "admin" && me.role !== "admin") redirect(homeFor(me.role));
  if (kind === "negocio" && !isBusinessRole(me.role)) redirect(homeFor(me.role));
  return me;
}
