import type { Metadata } from "next";
import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import Link from "next/link";
import { getDb, schema as s } from "@/db";
import { ROLE_LABEL, type Role } from "@/lib/config";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Usuarios y cuentas" };
export const dynamic = "force-dynamic";

const ROLES = Object.keys(ROLE_LABEL) as Role[];

export default async function AdminUsuariosPage({ searchParams }: { searchParams: Promise<{ rol?: string; q?: string; estado?: string }> }) {
  const sp = await searchParams;
  const role = ROLES.includes(sp.rol as Role) ? (sp.rol as Role) : undefined;
  const q = (sp.q ?? "").trim().slice(0, 80);
  const suspended = sp.estado === "suspendidas";

  const filters: SQL[] = [eq(s.users.active, !suspended)];
  if (role) filters.push(eq(s.users.role, role));
  if (q) {
    // Escapar % y _ para que se busquen literalmente.
    const like = `%${q.replace(/[%_\\]/g, "\\$&")}%`;
    filters.push(or(ilike(s.users.email, like), ilike(s.users.full_name, like))!);
  }

  const db = getDb();
  const [users, places] = await Promise.all([
    db.select().from(s.users).where(and(...filters)).orderBy(desc(s.users.created_at)).limit(200),
    db.select({ owner: s.places.owner_id, n: count() }).from(s.places).groupBy(s.places.owner_id),
  ]);
  const placesOf = new Map(places.map((p) => [p.owner, Number(p.n)]));

  const qs = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { rol: role, q: q || undefined, estado: suspended ? "suspendidas" : undefined, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const str = p.toString();
    return `/admin/usuarios${str ? `?${str}` : ""}`;
  };
  const pill = (active: boolean) =>
    `rounded-full border px-3 py-1 text-sm font-semibold ${active ? "border-marino bg-marino text-white" : "border-linea bg-white hover:border-marino"}`;

  return (
    <div className="max-w-5xl">
      <p className="kicker">Administración</p>
      <h1 className="text-3xl">Usuarios y cuentas</h1>

      <form className="mt-4 flex flex-wrap gap-2" role="search">
        {role && <input type="hidden" name="rol" value={role} />}
        {suspended && <input type="hidden" name="estado" value="suspendidas" />}
        <label htmlFor="q" className="sr-only">Buscar por nombre o correo</label>
        <input id="q" name="q" defaultValue={q} placeholder="Buscar por nombre o correo" className="input max-w-sm" />
        <button className="btn-primary">Buscar</button>
        {q && <Link href={qs({ q: undefined })} className="btn-outline">Limpiar</Link>}
      </form>

      <nav aria-label="Filtrar por rol" className="mt-4 flex flex-wrap gap-2">
        <Link href={qs({ rol: undefined })} className={pill(!role)} aria-current={!role ? "page" : undefined}>Todos</Link>
        {ROLES.map((r) => (
          <Link key={r} href={qs({ rol: r })} className={pill(role === r)} aria-current={role === r ? "page" : undefined}>
            {ROLE_LABEL[r]}
          </Link>
        ))}
        <span className="mx-1 self-center text-linea" aria-hidden="true">|</span>
        <Link href={qs({ estado: suspended ? undefined : "suspendidas" })} className={pill(suspended)} aria-pressed={suspended}>
          Suspendidas
        </Link>
      </nav>

      {users.length === 0 ? (
        <p className="mt-6 text-texto">No hay cuentas con estos filtros.</p>
      ) : (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-linea bg-nube/50 text-xs uppercase tracking-wider text-texto">
              <tr>
                <th scope="col" className="px-4 py-2">Nombre</th>
                <th scope="col" className="px-4 py-2">Rol</th>
                <th scope="col" className="px-4 py-2">Fichas</th>
                <th scope="col" className="px-4 py-2">Creada</th>
                <th scope="col" className="px-4 py-2"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-linea last:border-0">
                  <td className="px-4 py-2">
                    <span className="block font-semibold">{u.full_name || "Sin nombre"}</span>
                    <span className="text-xs text-texto">{u.email}</span>
                  </td>
                  <td className="px-4 py-2">{ROLE_LABEL[u.role]}</td>
                  <td className="px-4 py-2">{placesOf.get(u.id) ?? 0}</td>
                  <td className="px-4 py-2 text-texto">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-2 text-right">
                    <Link href={`/admin/usuarios/${u.id}`} className="font-semibold text-verde-700 hover:underline">
                      Gestionar<span className="sr-only"> {u.email}</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
