import Link from "next/link";
import { LUGARES, TIPOS } from "@/lib/lugares";
import { Icono, Logo } from "./Icono";

export function Pie() {
  return (
    <footer className="bg-bosque text-white/80">
      <div className="contenedor grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="flex items-center gap-2 text-2xl font-extrabold text-white"><Logo /> Sabana Travel&apos;s</p>
          <p className="mt-4 text-sm leading-relaxed">Sabor, Descanso &amp; Placer. Hoteles, restaurantes y sitios turísticos de Sabana de Torres, Santander.</p>
        </div>
        {(["sitio", "hotel"] as const).map((tipo) => (
          <div key={tipo}>
            <h2 className="text-lg font-bold text-white">{TIPOS[tipo].varios}</h2>
            <ul className="mt-4 flex flex-col gap-2 text-sm">
              {LUGARES.filter((l) => l.tipo === tipo).map((l) => (
                <li key={l.slug}><Link href={`/lugares/${l.slug}`} className="hover:text-verde">{l.nombre}</Link></li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <h2 className="text-lg font-bold text-white">Visítanos</h2>
          <p className="mt-4 flex items-start gap-2 text-sm"><Icono nombre="pin" className="mt-0.5 size-4 shrink-0 text-verde" /> Sabana de Torres, Santander, Colombia</p>
          <p className="mt-3 flex items-start gap-2 text-sm"><Icono nombre="reloj" className="mt-0.5 size-4 shrink-0 text-verde" /> Clima cálido todo el año</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="contenedor py-6 text-center text-sm">Proyecto estudiantil SENA · Por un turismo digital en Sabana de Torres.</p>
      </div>
    </footer>
  );
}
