import "server-only";
// Reglas de permisos en UN solo lugar. Todo Server Action que escribe datos debe pasar por aquí:
// los Server Actions son endpoints públicos y no basta con ocultar botones en la interfaz.
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { getCurrentProfile, type Profile } from "./auth";
import { isBusinessRole } from "./config";

export class PermissionError extends Error {}

export async function requireUser(): Promise<Profile> {
  const me = await getCurrentProfile();
  if (!me) throw new PermissionError("Tu sesión terminó. Vuelve a ingresar.");
  return me;
}

export async function requireAdmin(): Promise<Profile> {
  const me = await requireUser();
  if (me.role !== "admin") throw new PermissionError("Solo el administrador puede hacer este cambio.");
  return me;
}

export async function requireBusiness(): Promise<Profile> {
  const me = await requireUser();
  if (!isBusinessRole(me.role)) throw new PermissionError("Esta acción es solo para cuentas de negocio.");
  return me;
}

/** Admin: cualquier ficha. Negocio: solo las suyas. */
export async function requirePlaceEditor(placeId: string): Promise<Profile> {
  const me = await requireUser();
  if (me.role === "admin") return me;
  const [place] = await getDb()
    .select({ owner_id: schema.places.owner_id })
    .from(schema.places)
    .where(eq(schema.places.id, placeId));
  if (place && place.owner_id === me.id) return me;
  throw new PermissionError("No tienes permiso para editar esta ficha.");
}

/** Negocio dueño de la ficha (panel del negocio). Devuelve la cuenta y la ficha. */
export async function requireOwnPlace(placeId: string) {
  const me = await requireBusiness();
  const [place] = UUID.test(placeId)
    ? await getDb().select().from(schema.places).where(eq(schema.places.id, placeId))
    : [];
  if (!place || place.owner_id !== me.id) throw new PermissionError("No tienes permiso para editar esta ficha.");
  return { me, place };
}

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Convierte errores de permisos en un mensaje para el formulario; los demás se relanzan. */
export async function guarded<T>(fn: () => Promise<T>): Promise<T | { ok: false; message: string }> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof PermissionError) return { ok: false, message: e.message };
    throw e;
  }
}
