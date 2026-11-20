import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/AuthForms";
import { getCurrentProfile } from "@/lib/auth";
import { homeFor } from "@/lib/config";

export const metadata: Metadata = { title: "Crear cuenta" };

export default async function RegistroPage() {
  const me = await getCurrentProfile();
  if (me) redirect(homeFor(me.role));
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-3xl">Crear cuenta</h1>
      <p className="mt-1 text-sm text-texto">
        Los negocios publican su ficha desde su panel; el administrador la revisa antes de mostrarla al público.
      </p>
      <div className="card mt-6 p-6">
        <RegisterForm />
      </div>
      <p className="mt-4 text-center text-sm">
        ¿Ya tienes cuenta? <Link href="/ingresar" className="font-semibold text-verde-700 hover:underline">Ingresa</Link>
      </p>
    </div>
  );
}
