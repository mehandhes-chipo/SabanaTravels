import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icono } from "@/components/Icono";
import { Reveal } from "@/components/Reveal";
import { ReviewForm } from "@/components/site/ReviewForm";
import { Stars } from "@/components/site/Stars";
import { TarjetaLugar } from "@/components/TarjetaLugar";
import { getCurrentProfile } from "@/lib/auth";
import { KIND_BADGE, KINDS, placeHref } from "@/lib/config";
import { getMyReview, getPlace, listPlaces } from "@/lib/data";
import { directionsHref, formatDate, formatPrice, thumbUrl, whatsappHref } from "@/lib/format";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const l = await getPlace((await params).slug);
  return l ? { title: l.name, description: l.summary } : {};
}

const SOCIAL_LABEL = { facebook: "Facebook", instagram: "Instagram", tiktok: "TikTok", web: "Página web" } as const;
const MI_ESTADO = { pendiente: "en revisión", aprobada: "publicada", rechazada: "rechazada" } as const;

export default async function LugarPage({ params }: { params: Params }) {
  const l = await getPlace((await params).slug);
  if (!l) notFound();
  const k = KINDS[l.kind];
  const me = await getCurrentProfile();
  const miOpinion = me?.role === "cliente" ? await getMyReview(l.id, me.id) : null;
  const ruta = placeHref(l);
  const promedio = l.reviews.length ? l.reviews.reduce((a, r) => a + r.rating, 0) / l.reviews.length : null;
  const menu = Object.groupBy(l.menuItems, (m) => m.category);
  // Solo enlaces http(s): el panel ya los valida, pero se revisa de nuevo al mostrarlos.
  const redes = (Object.entries(l.socials) as [keyof typeof SOCIAL_LABEL, string | undefined][]).filter(
    (e): e is [keyof typeof SOCIAL_LABEL, string] => Boolean(e[1] && /^https?:\/\//i.test(e[1]) && SOCIAL_LABEL[e[0]]),
  );
  const otros = (await listPlaces(l.kind)).filter((x) => x.id !== l.id).slice(0, 3);
  const portada = l.cover_url ?? l.photos[0]?.url;
  const d = 0.008;
  const mapa = l.lat !== null && l.lng !== null
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${l.lng - d},${l.lat - d},${l.lng + d},${l.lat + d}&layer=mapnik&marker=${l.lat},${l.lng}`
    : null;

  return (
    <>
      {/* Banner con la foto principal */}
      <section className="relative isolate overflow-hidden bg-marino py-24 text-white lg:py-32">
        {portada && <img src={portada} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />}
        <span className="absolute inset-0 -z-10 bg-marino/65" />
        <div className="contenedor text-center">
          <p className="font-script text-3xl text-verde sm:text-4xl">{k.pillar}</p>
          <h1 className="mt-2 text-4xl text-white sm:text-5xl lg:text-6xl">{l.name}</h1>
          {promedio && <div className="mt-3 flex justify-center text-white"><Stars value={promedio} count={l.reviews.length} /></div>}
          <nav aria-label="Ruta" className="mt-5 text-sm text-white/90">
            <Link href="/" className="hover:text-verde">Inicio</Link> <span aria-hidden="true">/</span>{" "}
            <Link href={`/explorar?tipo=${k.route}`} className="hover:text-verde">{k.many}</Link> <span aria-hidden="true">/</span>{" "}
            <span aria-current="page">{l.name}</span>
          </nav>
        </div>
      </section>

      <div className="contenedor grid gap-12 py-20 lg:grid-cols-[1fr_360px]">
        <div className="flex min-w-0 flex-col gap-12">
          <Reveal>
            <span className={`inline-block rounded-md px-3 py-1 text-xs font-bold uppercase text-marino ${KIND_BADGE[l.kind]}`}>{k.one}</span>
            <p className="mt-4 text-xl leading-relaxed text-marino">{l.summary}</p>
            {l.description && <p className="mt-4 whitespace-pre-line leading-relaxed">{l.description}</p>}
          </Reveal>

          {l.photos.length > 0 && (
            <Reveal>
              <h2 className="text-2xl">Galería</h2>
              <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {l.photos.slice(0, 7).map((f, i) => (
                  <li key={f.id} className={i === 0 ? "col-span-2 row-span-2" : ""}>
                    <img src={i === 0 ? f.url : thumbUrl(f.url)} alt={f.alt || `${l.name}, foto ${i + 1}`} loading="lazy" className="aspect-[4/3] h-full w-full rounded-tarjeta object-cover" />
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          {l.services.length > 0 && (
            <Reveal>
              <h2 className="text-2xl">Servicios</h2>
              <ul className="mt-5 flex flex-wrap gap-3">
                {l.services.map((s) => (
                  <li key={s} className="flex items-center gap-2 rounded-full bg-verde-100 px-4 py-2 text-sm font-semibold text-verde-700">
                    <Icono nombre="check" className="size-4" grosor={2.5} /> {s}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          {l.priceItems.length > 0 && (
            <Reveal>
              <h2 className="text-2xl">{l.kind === "hotel" ? "Habitaciones" : "Tarifas"}</h2>
              <ul className="mt-5 divide-y divide-linea rounded-tarjeta border border-linea">
                {l.priceItems.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-4 px-6 py-4">
                    <span><span className="block font-bold text-marino">{p.name}</span><span className="text-sm">{p.detail}</span></span>
                    <span className="text-lg font-extrabold text-verde-700">{formatPrice(p.price)}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          {l.menuItems.length > 0 && (
            <Reveal>
              <h2 className="text-2xl">Menú</h2>
              {Object.entries(menu).map(([cat, items]) => (
                <div key={cat} className="mt-6">
                  <h3 className="font-script text-2xl font-normal text-verde">{cat}</h3>
                  <ul className="mt-2 divide-y divide-linea rounded-tarjeta border border-linea">
                    {items?.map((m) => (
                      <li key={m.id} className="flex items-center justify-between gap-4 px-6 py-4">
                        <span><span className="block font-bold text-marino">{m.name}</span>{m.description && <span className="text-sm">{m.description}</span>}</span>
                        <span className="text-lg font-extrabold text-verde-700">{formatPrice(m.price)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </Reveal>
          )}

          {l.packages.length > 0 && (
            <Reveal>
              <h2 className="text-2xl">Paquetes</h2>
              <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                {l.packages.map((p) => (
                  <li key={p.id} className="rounded-tarjeta bg-verde-100 p-6">
                    <p className="text-lg font-bold text-marino">{p.name}</p>
                    {p.description && <p className="mt-1 text-sm">{p.description}</p>}
                    {p.includes.length > 0 && (
                      <ul className="mt-3 flex flex-col gap-1 text-sm">
                        {p.includes.map((x) => <li key={x} className="flex items-center gap-2"><Icono nombre="check" className="size-4 text-verde-700" grosor={2.5} /> {x}</li>)}
                      </ul>
                    )}
                    <p className="mt-4 text-2xl font-extrabold text-verde-700">{formatPrice(p.price)}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
          {(l.priceItems.length > 0 || l.menuItems.length > 0 || l.packages.length > 0) && (
            <p className="-mt-8 text-xs text-gris">Precios de referencia; confírmalos con el negocio.</p>
          )}

          {/* ---------- Opiniones ---------- */}
          <section id="opiniones" aria-labelledby="opiniones-titulo">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="opiniones-titulo" className="text-2xl">Opiniones</h2>
              {promedio && <Stars value={promedio} count={l.reviews.length} />}
            </div>
            <div className="mt-5">
              {!me ? (
                <p className="rounded-tarjeta bg-menta p-5 text-sm">
                  <Link href={`/ingresar?next=${encodeURIComponent(ruta)}`} className="font-bold text-verde-700 hover:underline">Ingresa</Link> o{" "}
                  <Link href="/registro" className="font-bold text-verde-700 hover:underline">crea una cuenta de cliente</Link> para calificar este lugar.
                </p>
              ) : me.role !== "cliente" ? (
                <p className="text-sm">Las opiniones las dejan las cuentas de cliente.</p>
              ) : (
                <>
                  {miOpinion && <p className="mb-2 text-sm">Tu opinión está <strong className="text-marino">{MI_ESTADO[miOpinion.status]}</strong>. Si la editas, volverá a revisión.</p>}
                  <ReviewForm placeId={l.id} initial={miOpinion ?? undefined} />
                </>
              )}
            </div>
            {l.reviews.length === 0 ? (
              <p className="mt-5">Todavía no hay opiniones de este lugar. ¡Sé el primero!</p>
            ) : (
              <ul className="mt-6 flex flex-col gap-4">
                {l.reviews.map((r) => (
                  <li key={r.id} className="tarjeta p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="flex items-center gap-3">
                        <span className="grid size-11 place-items-center rounded-full bg-verde-100 font-bold text-verde-700" aria-hidden="true">{r.user.full_name.slice(0, 1).toUpperCase()}</span>
                        <span className="font-bold text-marino">{r.user.full_name}</span>
                      </span>
                      <span className="text-xs text-gris">{formatDate(r.created_at)}</span>
                    </div>
                    <div className="mt-3"><Stars value={r.rating} /></div>
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{r.comment}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
          {l.promotions.map((p) => (
            <div key={p.id} className="rounded-tarjeta bg-naranja-100 p-5 text-sm">
              <p className="font-bold text-marino">Promoción: {p.title}</p>
              {p.description && <p className="mt-1">{p.description}</p>}
            </div>
          ))}
          <div className="tarjeta p-7">
            {l.price_from && (
              <>
                <p className="text-sm">Desde</p>
                <p className="text-3xl font-extrabold text-marino">{formatPrice(l.price_from)}</p>
              </>
            )}
            <ul className="mt-5 flex flex-col gap-3 text-sm">
              {l.address && <li className="flex gap-2"><Icono nombre="pin" className="size-4 shrink-0 text-verde-700" /> {l.address}</li>}
              {l.hours && <li className="flex gap-2"><Icono nombre="reloj" className="size-4 shrink-0 text-verde-700" /> {l.hours}</li>}
              {l.phone && <li className="flex gap-2"><Icono nombre="telefono" className="size-4 shrink-0 text-verde-700" /> {l.phone}</li>}
              {l.email && <li className="flex gap-2"><Icono nombre="usuario" className="size-4 shrink-0 text-verde-700" /> <a href={`mailto:${l.email}`} className="hover:underline">{l.email}</a></li>}
            </ul>
            {l.payment_methods.length > 0 && <p className="mt-4 text-sm"><strong className="text-marino">Pagos:</strong> {l.payment_methods.join(", ")}</p>}
            {redes.length > 0 && (
              <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                <strong className="text-marino">Redes:</strong>
                {redes.map(([red, url]) => <a key={red} href={url} target="_blank" rel="noopener noreferrer" className="font-bold text-verde-700 hover:underline">{SOCIAL_LABEL[red]}</a>)}
              </p>
            )}
            <div className="mt-6 flex flex-col gap-3">
              {l.whatsapp && (
                <a href={whatsappHref(l.whatsapp, `Hola, vi ${l.name} en Sabana Travel's y quiero más información.`)} target="_blank" rel="noopener noreferrer" className="btn-verde w-full">
                  <Icono nombre="whatsapp" className="size-5" /> Contactar por WhatsApp
                </a>
              )}
              {l.lat !== null && l.lng !== null && (
                <a href={directionsHref(l.lat, l.lng)} target="_blank" rel="noopener noreferrer" className="btn-outline w-full">Cómo llegar</a>
              )}
            </div>
          </div>
          {mapa ? (
            <div className="tarjeta"><iframe title={`Mapa de ubicación de ${l.name}`} src={mapa} loading="lazy" className="h-64 w-full border-0" /></div>
          ) : (
            <p className="text-sm">Este negocio todavía no ha marcado su ubicación en el mapa.</p>
          )}
        </aside>
      </div>

      {otros.length > 0 && (
        <section className="fondo-viaje py-20">
          <div className="contenedor">
            <p className="guion text-center">Sigue explorando</p>
            <h2 className="titulo-seccion text-center">Otros {k.many.toLowerCase()}</h2>
            <ul className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {otros.map((o) => <li key={o.id}><TarjetaLugar lugar={o} /></li>)}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
