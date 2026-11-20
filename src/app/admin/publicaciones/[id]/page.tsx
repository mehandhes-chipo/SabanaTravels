import type { Metadata } from "next";
import { asc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReviewDecision } from "@/components/panel/ReviewDecision";
import { StatusBadge } from "@/components/panel/StatusBadge";
import { TownMap } from "@/components/site/TownMap";
import { getDb, schema as s } from "@/db";
import { placeChecklist } from "@/lib/checklist";
import { KINDS, placeHref } from "@/lib/config";
import { formatDate, formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Revisar publicación" };
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Muestra TODO lo que el negocio cargó, para revisarlo antes de publicarlo. */
export default async function RevisarPublicacionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const p = await getDb().query.places.findFirst({
    where: eq(s.places.id, id),
    with: {
      owner: { columns: { full_name: true, email: true } },
      photos: { orderBy: asc(s.placePhotos.position) },
      priceItems: { orderBy: asc(s.priceItems.position) },
      menuItems: { orderBy: [asc(s.menuItems.category), asc(s.menuItems.position)] },
      packages: { orderBy: asc(s.packages.position) },
      promotions: true,
    },
  });
  if (!p) notFound();

  const socials = Object.entries(p.socials).filter(([, v]) => v);
  const checks = placeChecklist(p);

  return (
    <div className="max-w-5xl">
      <Link href="/admin/publicaciones" className="text-sm text-texto hover:underline">← Publicaciones</Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl">{p.name}</h1>
        <StatusBadge status={p.status} audience="admin" />
      </div>
      <p className="text-sm text-texto">
        {KINDS[p.kind].one} · {p.owner ? `${p.owner.full_name} (${p.owner.email})` : "Sin cuenta de negocio"} · actualizada el {formatDate(p.updated_at)}
      </p>
      {p.status === "aprobado" && (
        <Link href={placeHref(p)} className="text-sm font-semibold text-verde-700 hover:underline">Ver ficha pública →</Link>
      )}
      {p.status === "rechazado" && p.rejection_reason && (
        <p className="mt-2 rounded-md bg-peligro-100 px-3 py-2 text-sm text-peligro">Motivo del rechazo: {p.rejection_reason}</p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <Section title="Información">
            <Field label="Resumen" value={p.summary} />
            <Field label="Descripción" value={p.description} pre />
            <Field label="Dirección" value={p.address} />
            <Field label="Horario" value={p.hours} />
            <Field label="Teléfono" value={p.phone} />
            <Field label="WhatsApp" value={p.whatsapp} />
            <Field label="Correo" value={p.email} />
            <Field label="Precio desde" value={p.price_from ? formatPrice(p.price_from) : ""} />
            <Field label="Servicios" value={p.services.join(", ")} />
            <Field label="Métodos de pago" value={p.payment_methods.join(", ")} />
            <Field label="Redes sociales" value={socials.map(([k, v]) => `${k}: ${v}`).join(" · ")} />
          </Section>

          <Section title={`Fotografías (${p.photos.length})`}>
            {p.photos.length === 0 ? (
              <Empty />
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {p.photos.map((ph) => (
                  <img key={ph.id} src={ph.url} alt={ph.alt} loading="lazy" className="aspect-square w-full rounded object-cover" />
                ))}
              </div>
            )}
          </Section>

          {p.kind !== "restaurante" && (
            <Section title="Tabla de precios">
              {p.priceItems.length === 0 ? <Empty /> : (
                <ul className="divide-y divide-linea text-sm">
                  {p.priceItems.map((i) => (
                    <li key={i.id} className="flex justify-between py-1.5"><span>{i.name} <span className="text-texto">{i.detail}</span></span><span className="font-semibold">{formatPrice(i.price)}</span></li>
                  ))}
                </ul>
              )}
            </Section>
          )}

          {p.kind === "restaurante" && (
            <Section title="Menú y promociones">
              {p.menuItems.length === 0 ? <Empty /> : (
                <ul className="divide-y divide-linea text-sm">
                  {p.menuItems.map((m) => (
                    <li key={m.id} className="flex justify-between py-1.5"><span><span className="text-texto">{m.category} ·</span> {m.name}</span><span className="font-semibold">{formatPrice(m.price)}</span></li>
                  ))}
                </ul>
              )}
              {p.promotions.map((pr) => (
                <p key={pr.id} className="mt-2 text-sm">Promoción: <strong>{pr.title}</strong> {pr.active ? "" : "(inactiva)"}</p>
              ))}
            </Section>
          )}

          {p.kind === "sitio" && (
            <Section title="Paquetes de servicios">
              {p.packages.length === 0 ? <Empty /> : (
                <ul className="divide-y divide-linea text-sm">
                  {p.packages.map((k) => (
                    <li key={k.id} className="flex justify-between py-1.5"><span>{k.name} <span className="text-texto">{k.description}</span></span><span className="font-semibold">{formatPrice(k.price)}</span></li>
                  ))}
                </ul>
              )}
            </Section>
          )}
        </div>

        <aside className="flex flex-col gap-4">
          <ReviewDecision placeId={p.id} status={p.status} />

          <div className="card p-4">
            <h2 className="card-title">Lista de verificación</h2>
            <ul className="mt-2 flex flex-col gap-1 text-sm">
              {checks.map((c) => (
                <li key={c.label} className={c.ok ? "text-verde-700" : "text-peligro"}>
                  <span aria-hidden="true">{c.ok ? "✓" : "✗"}</span> {c.label}
                  <span className="sr-only">{c.ok ? ": completo" : ": falta"}</span>
                </li>
              ))}
            </ul>
          </div>

          {p.lat !== null && p.lng !== null && (
            <div className="h-56">
              <TownMap single className="min-h-56" label={`Ubicación de ${p.name}`} places={[{ id: p.id, kind: p.kind, slug: p.slug, name: p.name, lat: p.lat, lng: p.lng, price_from: null }]} />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-4">
      <h2 className="card-title">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function Field({ label, value, pre }: { label: string; value: string; pre?: boolean }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 border-b border-linea py-1.5 text-sm last:border-0">
      <span className="font-semibold text-texto">{label}</span>
      {value ? <span className={pre ? "whitespace-pre-line" : undefined}>{value}</span> : <span className="text-peligro">Sin completar</span>}
    </div>
  );
}

function Empty() {
  return <p className="text-sm text-peligro">Sin completar</p>;
}
