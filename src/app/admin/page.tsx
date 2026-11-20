import { count, eq } from "drizzle-orm";
import Link from "next/link";
import { getDb, schema as s } from "@/db";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const db = getDb();
  const [[users], [published], [pending], [reviews], [events]] = await Promise.all([
    db.select({ n: count() }).from(s.users),
    db.select({ n: count() }).from(s.places).where(eq(s.places.status, "aprobado")),
    db.select({ n: count() }).from(s.places).where(eq(s.places.status, "pendiente")),
    db.select({ n: count() }).from(s.reviews).where(eq(s.reviews.status, "pendiente")),
    db.select({ n: count() }).from(s.events),
  ]);

  const stats: { label: string; value: number; href?: string; alert?: boolean }[] = [
    { label: "Usuarios", value: Number(users.n) },
    { label: "Fichas publicadas", value: Number(published.n), href: "/admin/publicaciones?estado=aprobado" },
    { label: "Fichas por revisar", value: Number(pending.n), href: "/admin/publicaciones", alert: true },
    { label: "Opiniones por moderar", value: Number(reviews.n), href: "/admin/opiniones", alert: true },
    { label: "Eventos", value: Number(events.n), href: "/admin/eventos" },
  ];

  return (
    <div>
      <p className="kicker">Administración</p>
      <h1 className="text-3xl">Resumen</h1>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((st) => {
          const highlight = st.alert && st.value > 0;
          const body = (
            <>
              <span className="block text-sm text-texto">{st.label}</span>
              <span className={`font-display text-3xl font-bold ${highlight ? "text-verde-700" : ""}`}>{st.value}</span>
            </>
          );
          return (
            <li key={st.label}>
              {st.href ? (
                <Link href={st.href} className={`card block p-4 hover:border-marino ${highlight ? "border-verde-700" : ""}`}>{body}</Link>
              ) : (
                <div className="card p-4">{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
