"use server";
import { randomBytes } from "node:crypto";
import { and, count, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, schema as s } from "@/db";
import { ROLE_LABEL, type Role } from "@/lib/config";
import { fail, type FormState } from "@/lib/form";
import { hashPassword } from "@/lib/password";
import { guarded, PermissionError, requireAdmin } from "@/lib/permissions";

const ROLES = Object.keys(ROLE_LABEL) as Role[];

function refresh(id: string) {
  revalidatePath("/admin/usuarios");
  revalidatePath(`/admin/usuarios/${id}`);
  revalidatePath("/admin");
}

async function getTarget(id: string) {
  const [u] = await getDb().select({ id: s.users.id, role: s.users.role, active: s.users.active }).from(s.users).where(eq(s.users.id, id));
  if (!u) throw new PermissionError("Esta cuenta ya no existe.");
  return u;
}

/** Nunca dejar el sitio sin al menos un administrador activo. */
async function assertAnotherAdmin(exceptId: string) {
  const [{ n }] = await getDb()
    .select({ n: count() })
    .from(s.users)
    .where(and(eq(s.users.role, "admin"), eq(s.users.active, true), ne(s.users.id, exceptId)));
  if (Number(n) === 0) throw new PermissionError("Debe quedar al menos otro administrador activo.");
}

/** Suspender o reactivar. Una cuenta suspendida no puede ingresar y su sesión deja de valer de inmediato. */
export async function setUserActive(id: string, active: boolean, _: FormState): Promise<FormState> {
  return guarded(async () => {
    const me = await requireAdmin();
    if (id === me.id) throw new PermissionError("No puedes suspender tu propia cuenta.");
    const target = await getTarget(id);
    if (!active && target.role === "admin") await assertAnotherAdmin(id);
    await getDb().update(s.users).set({ active }).where(eq(s.users.id, id));
    refresh(id);
    return { ok: true, message: active ? "Cuenta reactivada." : "Cuenta suspendida." };
  });
}

export async function changeUserRole(id: string, _: FormState, form: FormData): Promise<FormState> {
  return guarded(async () => {
    const me = await requireAdmin();
    if (id === me.id) throw new PermissionError("No puedes cambiar tu propio rol.");
    const role = String(form.get("role") ?? "") as Role;
    if (!ROLES.includes(role)) return fail(form, "Elige un rol válido.");
    const target = await getTarget(id);
    if (target.role === role) return { ok: true, message: "El rol no cambió." };
    if (target.role === "admin") await assertAnotherAdmin(id);

    // Una cuenta de negocio con fichas no puede cambiar de tipo: sus fichas quedarían sin panel que las edite.
    const [{ n }] = await getDb().select({ n: count() }).from(s.places).where(eq(s.places.owner_id, id));
    if (Number(n) > 0) {
      return fail(form, `Esta cuenta tiene ${n} ficha(s). Reasígnalas o elimínalas antes de cambiar su rol.`);
    }
    await getDb().update(s.users).set({ role }).where(eq(s.users.id, id));
    refresh(id);
    return { ok: true, message: `Rol cambiado a ${ROLE_LABEL[role]}.` };
  });
}

/**
 * Sin servicio de correo, el administrador genera una contraseña temporal y se la entrega
 * a la persona (por ejemplo por WhatsApp). Se muestra una sola vez; solo se guarda su hash.
 */
export type ResetState = { ok: boolean; message: string; password?: string } | null;

export async function resetUserPassword(id: string, _: ResetState): Promise<ResetState> {
  const result = await guarded(async (): Promise<ResetState> => {
    const me = await requireAdmin();
    if (id === me.id) throw new PermissionError("Para tu propia cuenta usa una contraseña que solo tú conozcas.");
    await getTarget(id);
    const password = `Sabana-${randomBytes(6).toString("base64url")}`;
    await getDb().update(s.users).set({ password_hash: await hashPassword(password) }).where(eq(s.users.id, id));
    return { ok: true, message: "Contraseña temporal creada. Cópiala ahora: no se volverá a mostrar.", password };
  });
  return result;
}
