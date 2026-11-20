import type { Metadata } from "next";
import { count, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/panel/StatusBadge";
import { UserActions } from "@/components/panel/UserActions";
import { Badge } from "@/components/ui/Badge";
import { getDb, schema as s } from "@/db";
import { requirePage } from "@/lib/auth";
import { KINDS, ROLE_LABEL } from "@/lib/config";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Gestionar cuenta" };
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function GestionarUsuarioPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requirePage("admin");
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const db = getDb();
  const [user] = await db
    .select({ id: s.users.id, email: s.users.email, full_name: s.users.full_name, role: s.users.role, active: s.users.active, created_at: s.users.created_at })
    .from(s.users)
    .where(eq(s.users.id, id));
  if (!user) notFound();

  const [places, [reviews]] = await Promise.all([
    db.select({ id: s.places.id, name: s.places.name, kind: s.places.kind, status: s.places.status }).from(s.places).where(eq(s.places.owner_id, id)),
    db.select({ n: count() }).from(s.reviews).where(eq(s.reviews.user_id, id)),
  ]);

  return (
    <div className="max-w-4xl">
      <Link href="/admin/usuarios" className="text-sm text-texto hover:underline">← Usuarios</Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl">{user.full_name || user.email}</h1>
        <Badge tone={user.active ? "ok" : "peligro"}>{user.active ? "Activa" : "Suspendida"}</Badge>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-4">
          <dl className="card grid grid-cols-[120px_1fr] gap-x-4 gap-y-2 p-4 text-sm">
            <dt className="font-semibold text-texto">Correo</dt>
            <dd>{user.email}</dd>
            <dt className="font-semibold text-texto">Rol</dt>
            <dd>{ROLE_LABEL[user.role]}</dd>
            <dt className="font-semibold text-texto">Creada</dt>
            <dd>{formatDate(user.created_at)}</dd>
            <dt className="font-semibold text-texto">Opiniones</dt>
            <dd>{Number(reviews.n)}</dd>
          </dl>

          <section className="card p-4">
            <h2 className="card-title">Fichas ({places.length})</h2>
            {places.length === 0 ? (
              <p className="mt-1 text-sm text-texto">Esta cuenta no tiene fichas.</p>
            ) : (
              <ul className="mt-2 divide-y divide-linea text-sm">
                {places.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                    <span>
                      <Link href={`/admin/publicaciones/${p.id}`} className="font-semibold hover:underline">{p.name}</Link>
                      <span className="text-texto"> · {KINDS[p.kind].one}</span>
                    </span>
                    <StatusBadge status={p.status} audience="admin" />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <UserActions id={user.id} role={user.role} active={user.active} isSelf={user.id === me.id} />
      </div>
    </div>
  );
}
