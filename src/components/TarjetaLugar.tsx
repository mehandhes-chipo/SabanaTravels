import Link from "next/link";
import { precio, sm, TIPOS, type Lugar } from "@/lib/lugares";
import { Icono } from "./Icono";

export function TarjetaLugar({ lugar }: { lugar: Lugar }) {
  const t = TIPOS[lugar.tipo];
  return (
    <article className="tarjeta group flex h-full flex-col">
      <Link href={`/lugares/${lugar.slug}`} className="relative block aspect-[4/3] overflow-hidden" tabIndex={-1} aria-hidden="true">
        <img src={sm(lugar.fotos[0])} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <span className={`absolute left-4 top-4 rounded-md px-3 py-1 text-xs font-bold uppercase text-marino ${t.color}`}>{t.uno}</span>
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <p className="flex items-center gap-1.5 text-sm text-gris">
          <Icono nombre="pin" className="size-4 text-verde-700" /> Sabana de Torres
        </p>
        <h3 className="mt-2 text-lg font-bold">
          <Link href={`/lugares/${lugar.slug}`} className="hover:text-verde-700">{lugar.nombre}</Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed">{lugar.resumen}</p>
        <div className="mt-auto flex items-center justify-between border-t border-linea pt-4">
          <p className="text-sm">
            Desde <span className="text-lg font-extrabold text-marino">{precio(lugar.desde)}</span>
          </p>
          <Link href={`/lugares/${lugar.slug}`} className="inline-flex items-center gap-1 text-sm font-bold text-verde-700 hover:text-marino">
            Ver más <Icono nombre="flecha" className="size-4" />
            <span className="sr-only">sobre {lugar.nombre}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
