import type { Metadata } from "next";
import { asc, desc, gte, lt, or, and, isNull } from "drizzle-orm";
import Link from "next/link";
import { setEventPublished } from "@/app/actions/events";
import { Badge } from "@/components/ui/Badge";
import { getDb, schema as s } from "@/db";
import { calendarParts, formatTime, startOfTodayCO } from "@/lib/format";

export const metadata: Metadata = { title: "Eventos" };
export const dynamic = "force-dynamic";

export default async function AdminEventosPage({ searchParams }: { searchParams: Promise<{ ver?: string }> }) {
  const past = (await searchParams).ver === "pasados";
  const today = startOfTodayCO();
  const db = getDb();
  // Próximos: empiezan hoy o después, o siguen en curso. Pasados: ya terminaron.
  const events = past
    ? await db
        .select()
        .from(s.events)
        .where(and(lt(s.events.starts_at, today), or(isNull(s.events.ends_at), lt(s.events.ends_at, today))))
        .orderBy(desc(s.events.starts_at))
        .limit(100)
    : await db
        .select()
        .from(s.events)
        .where(or(gte(s.events.starts_at, today), gte(s.events.ends_at, today)))
        .orderBy(asc(s.events.starts_at));

  const tab = (active: boolean) =>
    `rounded-full border px-4 py-1.5 text-sm font-semibold ${active ? "border-marino bg-marino text-white" : "border-linea bg-white hover:border-marino"}`;

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="kicker">Administración</p>
          <h1 className="text-3xl">Eventos y festividades</h1>
        </div>
        <Link href="/admin/eventos/nuevo" className="btn-primary">+ Nuevo evento</Link>
      </div>

      <nav aria-label="Filtrar eventos" className="mt-4 flex gap-2">
        <Link href="/admin/eventos" className={tab(!past)} aria-current={!past ? "page" : undefined}>Próximos</Link>
        <Link href="/admin/eventos?ver=pasados" className={tab(past)} aria-current={past ? "page" : undefined}>Pasados</Link>
      </nav>

      {events.length === 0 ? (
        <p className="mt-6 text-texto">{past ? "No hay eventos pasados." : "No hay eventos próximos. Crea el primero."}</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {events.map((e) => {
            const cal = calendarParts(e.starts_at);
            return (
              <li key={e.id} className="card flex flex-wrap items-center gap-4 p-4">
                <div className="w-16 shrink-0 rounded-md bg-marino p-2 text-center text-white">
                  <span className="block font-display text-xl font-bold">{cal.day}</span>
                  <span className="text-xs uppercase">{cal.month}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{e.title}</p>
                  <p className="text-sm text-texto">
                    {formatTime(e.starts_at)}
                    {e.location && ` · ${e.location}`}
                  </p>
                  <Badge tone={e.published ? "ok" : "neutro"} className="mt-1">{e.published ? "Publicado" : "Oculto"}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <form action={setEventPublished.bind(null, e.id, !e.published)}>
                    <button className="btn-outline btn-sm">{e.published ? "Ocultar" : "Publicar"}</button>
                  </form>
                  <Link href={`/admin/eventos/${e.id}`} className="btn-primary btn-sm">Editar</Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
