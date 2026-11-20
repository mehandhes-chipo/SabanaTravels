import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TownMap } from "@/components/site/TownMap";
import { getEvent } from "@/lib/data";
import { calendarParts, directionsHref, formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

async function load(params: Params) {
  const event = await getEvent((await params).slug);
  if (!event) notFound();
  return event;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const e = await load(params);
  return { title: e.title, description: e.summary || undefined };
}

export default async function EventoPage({ params }: { params: Params }) {
  const e = await load(params);
  const cal = calendarParts(e.starts_at);

  return (
    <article className="mx-auto max-w-4xl px-4 py-8">
      <nav aria-label="Ruta" className="text-sm text-texto">
        <Link href="/" className="hover:underline">Inicio</Link> ›{" "}
        <Link href="/eventos" className="hover:underline">Eventos</Link> › <span aria-current="page">{e.title}</span>
      </nav>

      <header className="mt-4 flex gap-4">
        <div className="w-20 shrink-0 self-start rounded-md bg-marino p-2 text-center text-white">
          <span className="block font-display text-3xl font-bold">{cal.day}</span>
          <span className="text-xs uppercase">{cal.month}</span>
        </div>
        <div>
          <p className="kicker">Evento</p>
          <h1 className="text-4xl">{e.title}</h1>
          {e.summary && <p className="mt-2 text-texto">{e.summary}</p>}
        </div>
      </header>

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_300px]">
        <div>
          {e.description ? (
            <p className="whitespace-pre-line">{e.description}</p>
          ) : (
            <p className="text-texto">Pronto publicaremos la programación completa.</p>
          )}
        </div>
        <aside className="flex flex-col gap-4">
          <dl className="card flex flex-col gap-2 p-4 text-sm">
            <div>
              <dt className="font-semibold">Inicio</dt>
              <dd className="first-letter:uppercase">{formatDateTime(e.starts_at)}</dd>
            </div>
            {e.ends_at && (
              <div>
                <dt className="font-semibold">Fin</dt>
                <dd className="first-letter:uppercase">{formatDateTime(e.ends_at)}</dd>
              </div>
            )}
            {e.location && (
              <div>
                <dt className="font-semibold">Lugar</dt>
                <dd>{e.location}</dd>
              </div>
            )}
          </dl>
          {e.lat !== null && e.lng !== null && (
            <>
              <div className="h-56">
                <TownMap
                  single
                  className="min-h-56"
                  label={`Ubicación de ${e.title}`}
                  places={[{ id: e.id, kind: "sitio", slug: e.slug, name: e.location || e.title, lat: e.lat, lng: e.lng, price_from: null }]}
                />
              </div>
              <a href={directionsHref(e.lat, e.lng)} target="_blank" rel="noopener noreferrer" className="btn-outline btn-sm">
                Cómo llegar
              </a>
            </>
          )}
        </aside>
      </div>
    </article>
  );
}
