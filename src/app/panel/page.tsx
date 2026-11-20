import { asc, eq } from "drizzle-orm";
import Link from "next/link";
import { NewPlaceForm } from "@/components/panel/NewPlaceForm";
import { StatusBadge } from "@/components/panel/StatusBadge";
import { getDb, schema } from "@/db";
import { requirePage } from "@/lib/auth";
import { KINDS, placeHref, type PlaceKind } from "@/lib/config";

export const dynamic = "force-dynamic";

const HINT = {
  borrador: "Complétala y envíala a revisión para que aparezca en el sitio.",
  pendiente: "El administrador la está revisando.",
  aprobado: "Visible en el sitio.",
  rechazado: "Corrige lo que indica el administrador y vuelve a enviarla.",
} as const;

export default async function PanelPage() {
  const me = await requirePage("negocio");
  const kind = me.role as PlaceKind;
  const places = await getDb()
    .select()
    .from(schema.places)
    .where(eq(schema.places.owner_id, me.id))
    .orderBy(asc(schema.places.created_at));

  return (
    <div className="max-w-3xl">
      <p className="kicker">Panel de {KINDS[kind].one.toLowerCase()}</p>
      <h1 className="text-3xl">Hola, {me.full_name || me.email}</h1>

      {places.length === 0 ? (
        <div className="card mt-6 p-6">
          <h2 className="panel-title">Crea la ficha de tu {KINDS[kind].one.toLowerCase()}</h2>
          <p className="mt-1 text-sm text-texto">
            Empieza con el nombre; después completas información, fotos, precios y ubicación. Cuando la envíes, el administrador la revisa antes de publicarla.
          </p>
          <div className="mt-4"><NewPlaceForm /></div>
        </div>
      ) : (
        <>
          <ul className="mt-6 flex flex-col gap-3">
            {places.map((p) => (
              <li key={p.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{p.name}</p>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="text-sm text-texto">{HINT[p.status]}</p>
                  {p.status === "rechazado" && p.rejection_reason && (
                    <p className="mt-1 text-sm text-peligro">Motivo: {p.rejection_reason}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {p.status === "aprobado" && (
                    <Link href={placeHref(p)} className="btn-outline btn-sm">Ver ficha pública</Link>
                  )}
                  <Link href={`/panel/fichas/${p.id}`} className="btn-primary btn-sm">Editar</Link>
                </div>
              </li>
            ))}
          </ul>
          <details className="mt-6">
            <summary className="cursor-pointer text-sm font-semibold text-verde-700">¿Tienes otro {KINDS[kind].one.toLowerCase()}? Crear otra ficha</summary>
            <div className="card mt-3 p-4"><NewPlaceForm /></div>
          </details>
        </>
      )}
    </div>
  );
}
