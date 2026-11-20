import type { Metadata } from "next";
import { asc, count, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { getDb, schema as s } from "@/db";
import { KINDS } from "@/lib/config";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Publicaciones" };
export const dynamic = "force-dynamic";

const FILTERS = [
  { value: "pendiente", label: "Por aprobar" },
  { value: "aprobado", label: "Publicadas" },
  { value: "rechazado", label: "Rechazadas" },
  { value: "borrador", label: "Borradores" },
] as const;
type Status = (typeof FILTERS)[number]["value"];

export default async function AdminPublicacionesPage({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const { estado } = await searchParams;
  const status: Status = FILTERS.some((f) => f.value === estado) ? (estado as Status) : "pendiente";
  const db = getDb();

  const [rows, totals] = await Promise.all([
    db
      .select({
        id: s.places.id,
        kind: s.places.kind,
        name: s.places.name,
        summary: s.places.summary,
        updated_at: s.places.updated_at,
        rejection_reason: s.places.rejection_reason,
        owner: s.users.full_name,
        owner_email: s.users.email,
      })
      .from(s.places)
      .leftJoin(s.users, eq(s.users.id, s.places.owner_id))
      .where(eq(s.places.status, status))
      // Por aprobar: primero lo que lleva más tiempo esperando.
      .orderBy(status === "pendiente" ? asc(s.places.updated_at) : desc(s.places.updated_at)),
    db.select({ status: s.places.status, n: count() }).from(s.places).groupBy(s.places.status),
  ]);
  const totalOf = (st: Status) => Number(totals.find((t) => t.status === st)?.n ?? 0);

  return (
    <div className="max-w-4xl">
      <p className="kicker">Administración</p>
      <h1 className="text-3xl">Publicaciones</h1>
      <p className="mt-1 text-sm text-texto">
        Las fichas que envían los negocios solo aparecen en el sitio cuando las apruebas.
      </p>

      <nav aria-label="Filtrar publicaciones" className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={`/admin/publicaciones?estado=${f.value}`}
            aria-current={status === f.value ? "page" : undefined}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${status === f.value ? "border-marino bg-marino text-white" : "border-linea bg-white hover:border-marino"}`}
          >
            {f.label} <span className="opacity-70">({totalOf(f.value)})</span>
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <p className="mt-6 text-texto">{status === "pendiente" ? "No hay fichas esperando aprobación." : "No hay fichas en esta lista."}</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {rows.map((p) => (
            <li key={p.id}>
              <Link href={`/admin/publicaciones/${p.id}`} className="card flex flex-wrap items-center justify-between gap-3 p-4 hover:border-marino">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-widest text-verde-700">{KINDS[p.kind].one}</p>
                  <p className="font-semibold">{p.name}</p>
                  {p.summary && <p className="line-clamp-1 text-sm text-texto">{p.summary}</p>}
                  <p className="mt-1 text-xs text-texto">
                    {p.owner ? `${p.owner} · ${p.owner_email}` : "Sin cuenta de negocio"} · actualizada el {formatDate(p.updated_at)}
                  </p>
                  {status === "rechazado" && p.rejection_reason && (
                    <p className="mt-1 text-xs text-peligro">Motivo: {p.rejection_reason}</p>
                  )}
                </div>
                <span className="btn-outline btn-sm">{status === "pendiente" ? "Revisar" : "Ver"}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
