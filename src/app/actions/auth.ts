"use server";
import { eq } from "drizzle-orm";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import { getDb, schema } from "@/db";
import { homeFor, safeNext, SIGNUP_ROLES, type Role } from "@/lib/config";
import { fail, type FormState } from "@/lib/form";
import { hashPassword } from "@/lib/password";

export type { FormState };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function roleOf(email: string): Promise<Role> {
  const [u] = await getDb().select({ role: schema.users.role }).from(schema.users).where(eq(schema.users.email, email));
  return u?.role ?? "cliente";
}

export async function login(_: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (e) {
    if (e instanceof AuthError) return fail(form, "Correo o contraseña incorrectos.");
    throw e;
  }
  redirect(safeNext(form.get("next")) ?? homeFor(await roleOf(email)));
}

export async function register(_: FormState, form: FormData): Promise<FormState> {
  const full_name = String(form.get("full_name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const role = String(form.get("role") ?? "");

  if (!full_name) return fail(form, "Escribe tu nombre o el de tu negocio.");
  if (!EMAIL_RE.test(email)) return fail(form, "Escribe un correo válido.");
  if (password.length < 8) return fail(form, "La contraseña debe tener al menos 8 caracteres.");
  // El rol "admin" nunca se puede elegir desde el formulario.
  const allowed = SIGNUP_ROLES.find((r) => r.role === role);
  if (!allowed) return fail(form, "Elige un tipo de cuenta.");

  const db = getDb();
  const [exists] = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, email));
  if (exists) return fail(form, "Ya existe una cuenta con ese correo. Ingresa con tu contraseña.");

  await db.insert(schema.users).values({ full_name, email, role: allowed.role, password_hash: await hashPassword(password) });
  await signIn("credentials", { email, password, redirect: false });
  redirect(homeFor(allowed.role));
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
