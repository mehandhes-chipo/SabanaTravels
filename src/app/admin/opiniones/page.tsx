import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { moderateReview } from "@/app/actions/reviews";
import { Stars } from "@/components/site/Stars";
import { getDb, schema as s } from "@/db";
import { placeHref } from "@/lib/config";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Opiniones" };
export const dynamic = "force-dynamic";

const FILTERS = [
  { value: "pendiente", label: "Por revisar" },
  { value: "aprobada", label: "Publicadas" },
  { value: "rechazada", label: "Rechazadas" },
] as const;
type Filter = (typeof FILTERS)[number]["value"];

export default async function AdminOpinionesPage({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const { estado } = await searchParams;
  const filter: Filter = FILTERS.some((f) => f.value === estado) ? (estado as Filter) : "pendiente";

  const rows = await getDb()
    .select({
      id: s.reviews.id,
      rating: s.reviews.rating,
      comment: s.reviews.comment,
      created_at: s.reviews.created_at,
      author: s.users.full_name,
      email: s.users.email,
      place_name: s.places.name,
      kind: s.places.kind,
      slug: s.places.slug,
    })
    .from(s.reviews)
    .innerJoin(s.users, eq(s.users.id, s.reviews.user_id))
    .innerJoin(s.places, eq(s.places.id, s.reviews.place_id))
    .where(eq(s.reviews.status, filter))
    .orderBy(desc(s.reviews.created_at))
    .limit(100);

  return (
    <div className="max-w-4xl">
      <p className="kicker">Administración</p>
      <h1 className="text-3xl">Opiniones</h1>
      <p className="mt-1 text-sm text-texto">Las opiniones nuevas o editadas no se muestran al público hasta que las apruebes.</p>

      <nav aria-label="Filtrar opiniones" className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={`/admin/opiniones?estado=${f.value}`}
            aria-current={filter === f.value ? "page" : undefined}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${filter === f.value ? "border-marino bg-marino text-white" : "border-linea bg-white hover:border-marino"}`}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <p className="mt-6 text-texto">No hay opiniones en esta lista.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {rows.map((r) => (
            <li key={r.id} className="card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link href={placeHref(r)} className="font-semibold hover:underline">{r.place_name}</Link>
                <span className="text-xs text-texto">{formatDate(r.created_at)}</span>
              </div>
              <div className="mt-1"><Stars value={r.rating} /></div>
              <p className="mt-2 whitespace-pre-line text-sm">{r.comment}</p>
              <p className="mt-2 text-xs text-texto">{r.author} · {r.email}</p>
              <div className="mt-3 flex gap-2">
                {filter !== "aprobada" && (
                  <form action={moderateReview.bind(null, r.id, "aprobada")}>
                    <button className="btn-primary btn-sm">Aprobar</button>
                  </form>
                )}
                {filter !== "rechazada" && (
                  <form action={moderateReview.bind(null, r.id, "rechazada")}>
                    <button className="btn-danger btn-sm">Rechazar</button>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
