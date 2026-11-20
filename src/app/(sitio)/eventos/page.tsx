import type { Metadata } from "next";
import Link from "next/link";
import { upcomingEvents } from "@/lib/data";
import { calendarParts, formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Eventos y festividades" };
export const dynamic = "force-dynamic";

export default async function EventosPage() {
  const events = await upcomingEvents();
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <p className="kicker">Agenda cultural</p>
      <h1 className="text-3xl">Eventos y festividades</h1>
      {events.length === 0 ? (
        <p className="mt-6 text-texto">No hay eventos próximos publicados.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {events.map((e) => {
            const cal = calendarParts(e.starts_at);
            return (
              <li key={e.id}>
                <Link href={`/eventos/${e.slug}`} className="card group flex gap-4 p-4 hover:border-verde-700">
                  <div className="w-20 shrink-0 rounded-md bg-marino p-2 text-center text-white">
                    <span className="block font-display text-2xl font-bold">{cal.day}</span>
                    <span className="text-xs uppercase">{cal.month}</span>
                  </div>
                  <div>
                    <h2 className="panel-title group-hover:text-verde-700">{e.title}</h2>
                    <p className="text-sm text-texto">
                      {formatDateTime(e.starts_at)}
                      {e.location && ` · ${e.location}`}
                    </p>
                    {e.summary && <p className="mt-1 text-sm">{e.summary}</p>}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
