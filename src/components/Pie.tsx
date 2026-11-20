import Link from "next/link";
import { KINDS, placeHref } from "@/lib/config";
import { listPlaces } from "@/lib/data";
import { Icono } from "./Icono";
import { Marca } from "./Marca";

export async function Pie() {
  const lugares = await listPlaces();
  return (
    <footer className="bg-bosque text-white/80">
      <div className="contenedor grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          {/* Versión compacta: la columna del pie es angosta */}
          <Marca claro compacta />
          <p className="mt-4 text-sm leading-relaxed">Sabor, Descanso &amp; Placer. Hoteles, restaurantes y sitios turísticos de Sabana de Torres, Santander.</p>
        </div>
        {(["sitio", "hotel"] as const).map((k) => (
          <div key={k}>
            <h2 className="text-lg font-bold text-white">{KINDS[k].many}</h2>
            <ul className="mt-4 flex flex-col gap-2 text-sm">
              {lugares.filter((l) => l.kind === k).slice(0, 5).map((l) => (
                <li key={l.id}><Link href={placeHref(l)} className="hover:text-verde">{l.name}</Link></li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <h2 className="text-lg font-bold text-white">Participa</h2>
          <ul className="mt-4 flex flex-col gap-2 text-sm">
            <li><Link href="/eventos" className="hover:text-verde">Eventos y festividades</Link></li>
            <li><Link href="/registro" className="hover:text-verde">Publica tu negocio</Link></li>
            <li><Link href="/ingresar" className="hover:text-verde">Ingresar</Link></li>
          </ul>
          <p className="mt-5 flex items-start gap-2 text-sm"><Icono nombre="pin" className="mt-0.5 size-4 shrink-0 text-verde" /> Sabana de Torres, Santander, Colombia</p>
        </div>
      </div>
      {/* Créditos del proyecto */}
      <div className="border-t border-white/10">
        <div className="contenedor flex flex-col items-center gap-6 py-8 text-center md:flex-row md:justify-between md:text-left">
          <div className="flex items-center gap-4">
            <span className="grid size-16 place-items-center rounded-tarjeta bg-white p-1.5">
              <img src="/logos/sena.webp" alt="SENA, Servicio Nacional de Aprendizaje" width={52} height={52} loading="lazy" className="h-full w-full object-contain" />
            </span>
            <span className="grid size-16 place-items-center rounded-full bg-white p-0.5">
              <img src="/logos/cime.webp" alt="CIME, Sabana de Torres" width={60} height={60} loading="lazy" className="h-full w-full rounded-full object-contain" />
            </span>
          </div>
          <div className="text-sm">
            <p className="font-bold text-white">Desarrollado por Aprendices SENA - CIME</p>
            <p className="mt-1">Jordán David Codezo Lopez · Emmanuel Santiago Vera Ávila · Josep Rizo Agudelo</p>
          </div>
          <p className="text-sm md:max-w-56 md:text-right">Proyecto estudiantil · Por un turismo digital en Sabana de Torres.</p>
        </div>
      </div>
    </footer>
  );
}
