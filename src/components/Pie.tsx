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
          <p><Marca claro /></p>
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
      <div className="border-t border-white/10">
        <p className="contenedor py-6 text-center text-sm">Proyecto estudiantil SENA · Por un turismo digital en Sabana de Torres.</p>
      </div>
    </footer>
  );
}
