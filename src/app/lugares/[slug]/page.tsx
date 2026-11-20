import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icono } from "@/components/Icono";
import { Reveal } from "@/components/Reveal";
import { TarjetaLugar } from "@/components/TarjetaLugar";
import { comoLlegar, getLugar, LUGARES, precio, sm, TIPOS } from "@/lib/lugares";

type Params = Promise<{ slug: string }>;

export const generateStaticParams = () => LUGARES.map((l) => ({ slug: l.slug }));

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const l = getLugar((await params).slug);
  return l ? { title: l.nombre, description: l.resumen } : {};
}

export default async function LugarPage({ params }: { params: Params }) {
  const l = getLugar((await params).slug);
  if (!l) notFound();
  const t = TIPOS[l.tipo];
  const otros = LUGARES.filter((x) => x.tipo === l.tipo && x.slug !== l.slug).slice(0, 3);
  const d = 0.008;
  const mapa = `https://www.openstreetmap.org/export/embed.html?bbox=${l.lng - d},${l.lat - d},${l.lng + d},${l.lat + d}&layer=mapnik&marker=${l.lat},${l.lng}`;

  return (
    <>
      {/* Banner con la foto principal */}
      <section className="relative isolate overflow-hidden bg-marino py-24 text-white lg:py-32">
        <img src={l.fotos[0]} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <span className="absolute inset-0 -z-10 bg-marino/65" />
        <div className="contenedor text-center">
          <p className="font-script text-3xl text-verde sm:text-4xl">{t.pilar}</p>
          <h1 className="mt-2 text-4xl text-white sm:text-5xl lg:text-6xl">{l.nombre}</h1>
          <nav aria-label="Ruta" className="mt-5 text-sm text-white/90">
            <Link href="/" className="hover:text-verde">Inicio</Link> <span aria-hidden="true">/</span>{" "}
            <Link href="/#lugares" className="hover:text-verde">{t.varios}</Link> <span aria-hidden="true">/</span>{" "}
            <span aria-current="page">{l.nombre}</span>
          </nav>
        </div>
      </section>

      <div className="contenedor grid gap-12 py-20 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-12">
          <Reveal>
            <span className={`inline-block rounded-md px-3 py-1 text-xs font-bold uppercase text-marino ${t.color}`}>{t.uno}</span>
            <p className="mt-4 text-xl leading-relaxed text-marino">{l.resumen}</p>
          </Reveal>

          <Reveal>
            <h2 className="text-2xl">Galería</h2>
            <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {l.fotos.map((f, i) => (
                <li key={f} className={i === 0 ? "col-span-2 row-span-2" : ""}>
                  <img src={i === 0 ? f : sm(f)} alt={`${l.nombre}, foto ${i + 1}`} loading="lazy" className="h-full w-full rounded-tarjeta object-cover" />
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal>
            <h2 className="text-2xl">{l.tipo === "restaurante" ? "Menú" : l.tipo === "hotel" ? "Habitaciones" : "Tarifas"}</h2>
            <ul className="mt-5 divide-y divide-linea rounded-tarjeta border border-linea">
              {l.precios.map((p) => (
                <li key={p.nombre} className="flex items-center justify-between gap-4 px-6 py-4">
                  <span>
                    <span className="block font-bold text-marino">{p.nombre}</span>
                    <span className="text-sm">{p.detalle}</span>
                  </span>
                  <span className="text-lg font-extrabold text-verde-700">{precio(p.precio)}</span>
                </li>
              ))}
            </ul>
            {l.paquete && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-tarjeta bg-verde-100 p-6">
                <span>
                  <span className="block text-lg font-bold text-marino">Paquete {l.paquete.nombre}</span>
                  <span className="text-sm">Incluye: {l.paquete.incluye.join(", ")}</span>
                </span>
                <span className="text-2xl font-extrabold text-verde-700">{precio(l.paquete.precio)}</span>
              </div>
            )}
            <p className="mt-3 text-xs text-gris">Precios de referencia; confírmalos con el negocio.</p>
          </Reveal>
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
          <div className="tarjeta p-7">
            <p className="text-sm">Desde</p>
            <p className="text-3xl font-extrabold text-marino">{precio(l.desde)}</p>
            <h2 className="mt-6 text-lg">Servicios</h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {l.servicios.map((s) => (
                <li key={s} className="flex items-center gap-2"><Icono nombre="check" className="size-4 text-verde-700" grosor={2.5} /> {s}</li>
              ))}
            </ul>
            {l.pagos && <p className="mt-4 text-sm"><strong className="text-marino">Pagos:</strong> {l.pagos.join(", ")}</p>}
            <a href={comoLlegar(l)} target="_blank" rel="noopener noreferrer" className="btn-verde mt-6 w-full">Cómo llegar <Icono nombre="flecha" className="size-4" /></a>
          </div>
          <div className="tarjeta">
            <iframe title={`Mapa de ubicación de ${l.nombre}`} src={mapa} loading="lazy" className="h-64 w-full border-0" />
          </div>
        </aside>
      </div>

      {otros.length > 0 && (
        <section className="fondo-viaje py-20">
          <div className="contenedor">
            <p className="guion text-center">Sigue explorando</p>
            <h2 className="titulo-seccion text-center">Otros {t.varios.toLowerCase()}</h2>
            <ul className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {otros.map((o) => <li key={o.slug}><TarjetaLugar lugar={o} /></li>)}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
