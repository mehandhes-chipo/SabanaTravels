import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteEvent } from "@/app/actions/events";
import { EventForm } from "@/components/panel/EventForm";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { getDb, schema as s } from "@/db";
import { toLocalInput } from "@/lib/format";

export const metadata: Metadata = { title: "Editar evento" };
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditarEventoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const [e] = await getDb().select().from(s.events).where(eq(s.events.id, id));
  if (!e) notFound();

  return (
    <div>
      <Link href="/admin/eventos" className="text-sm text-texto hover:underline">← Eventos</Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl">Editar evento</h1>
        {e.published && (
          <Link href={`/eventos/${e.slug}`} className="text-sm font-semibold text-verde-700 hover:underline">Ver página pública →</Link>
        )}
      </div>
      <div className="mt-6">
        <EventForm
          id={e.id}
          initial={{
            title: e.title,
            summary: e.summary,
            description: e.description,
            location: e.location,
            starts_at: toLocalInput(e.starts_at),
            ends_at: e.ends_at ? toLocalInput(e.ends_at) : "",
            lat: e.lat?.toString() ?? "",
            lng: e.lng?.toString() ?? "",
            published: e.published,
          }}
        />
      </div>

      <section className="mt-8 max-w-2xl rounded-card border border-peligro-200 bg-peligro-100 p-4">
        <h2 className="card-title text-peligro">Eliminar evento</h2>
        <p className="text-sm text-peligro">Se borra para siempre. Si solo quieres quitarlo de la agenda, usa “Ocultar”.</p>
        <form action={deleteEvent.bind(null, e.id)} className="mt-3">
          <ConfirmButton message={`¿Eliminar "${e.title}" para siempre?`} className="btn-danger btn-sm">
            Eliminar definitivamente
          </ConfirmButton>
        </form>
      </section>
    </div>
  );
}
