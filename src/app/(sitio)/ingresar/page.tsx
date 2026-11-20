import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/AuthForms";
import { getCurrentProfile } from "@/lib/auth";
import { homeFor, safeNext } from "@/lib/config";

export const metadata: Metadata = { title: "Ingresar" };

export default async function IngresarPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next) ?? undefined;
  const me = await getCurrentProfile();
  if (me) redirect(next ?? homeFor(me.role));
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl">Ingresar</h1>
      <p className="mt-1 text-sm text-texto">Para clientes, negocios y administradores.</p>
      <div className="card mt-6 p-6">
        <LoginForm next={next} />
      </div>
      <p className="mt-4 text-center text-sm">
        ¿No tienes cuenta? <Link href="/registro" className="font-semibold text-verde-700 hover:underline">Regístrate</Link>
      </p>
    </div>
  );
}
