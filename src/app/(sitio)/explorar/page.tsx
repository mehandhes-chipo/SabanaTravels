import type { Metadata } from "next";
import Link from "next/link";
import { TarjetaLugar } from "@/components/TarjetaLugar";
import { KIND_ORDER, KINDS, ROUTE_TO_KIND } from "@/lib/config";
import { listPlaces } from "@/lib/data";

export const metadata: Metadata = { title: "Explorar" };
export const dynamic = "force-dynamic";

export default async function ExplorarPage({ searchParams }: { searchParams: Promise<{ tipo?: string }> }) {
  const { tipo } = await searchParams;
  const kind = tipo ? ROUTE_TO_KIND[tipo] : undefined;
  const places = await listPlaces(kind);
  const tab = (on: boolean) =>
    `rounded-md px-6 py-3 text-sm font-bold shadow-tarjeta transition-colors ${on ? "bg-verde-700 text-white" : "bg-white text-marino hover:text-verde-700"}`;

  return (
    <>
      <section className="fondo-viaje py-16 text-center">
        <div className="contenedor">
          <p className="guion">{kind ? KINDS[kind].pillar : "Sabor, descanso y placer"}</p>
          <h1 className="titulo-seccion">{kind ? KINDS[kind].many : "Explora Sabana de Torres"}</h1>
          <nav aria-label="Filtrar por categoría" className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/explorar" className={tab(!kind)} aria-current={!kind ? "page" : undefined}>Todos</Link>
            {KIND_ORDER.map((k) => (
              <Link key={k} href={`/explorar?tipo=${KINDS[k].route}`} className={tab(kind === k)} aria-current={kind === k ? "page" : undefined}>
                {KINDS[k].many}
              </Link>
            ))}
          </nav>
        </div>
      </section>
      <section className="contenedor py-16">
        {places.length === 0 ? (
          <p className="text-center">Todavía no hay lugares publicados en esta categoría.</p>
        ) : (
          <ul className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {places.map((p) => <li key={p.id}><TarjetaLugar lugar={p} /></li>)}
          </ul>
        )}
      </section>
    </>
  );
}
