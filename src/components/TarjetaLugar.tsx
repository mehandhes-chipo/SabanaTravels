import Link from "next/link";
import { KIND_BADGE, KINDS, placeHref } from "@/lib/config";
import type { PlaceListItem } from "@/lib/data";
import { formatPrice, thumbUrl } from "@/lib/format";
import { Icono } from "./Icono";
import { Stars } from "./site/Stars";

export function TarjetaLugar({ lugar }: { lugar: PlaceListItem }) {
  const href = placeHref(lugar);
  return (
    <article className="tarjeta group flex h-full flex-col">
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden bg-nube" tabIndex={-1} aria-hidden="true">
        {lugar.cover_url ? (
          <img src={thumbUrl(lugar.cover_url)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
        ) : (
          <span className="grid h-full place-items-center text-sm text-gris">Foto próximamente</span>
        )}
        <span className={`absolute left-4 top-4 rounded-md px-3 py-1 text-xs font-bold uppercase text-marino ${KIND_BADGE[lugar.kind]}`}>{KINDS[lugar.kind].one}</span>
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-2 text-sm text-gris">
          <span className="flex items-center gap-1.5"><Icono nombre="pin" className="size-4 text-verde-700" /> Sabana de Torres</span>
          {lugar.rating ? <Stars value={lugar.rating} count={lugar.reviews} /> : <span>Sin opiniones</span>}
        </div>
        <h3 className="mt-2 text-lg font-bold">
          <Link href={href} className="hover:text-verde-700">{lugar.name}</Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed">{lugar.summary}</p>
        <div className="mt-auto flex items-center justify-between border-t border-linea pt-4">
          {lugar.price_from ? (
            <p className="text-sm">Desde <span className="text-lg font-extrabold text-marino">{formatPrice(lugar.price_from)}</span></p>
          ) : <span />}
          <Link href={href} className="inline-flex items-center gap-1 text-sm font-bold text-verde-700 hover:text-marino">
            Ver más <Icono nombre="flecha" className="size-4" />
            <span className="sr-only">sobre {lugar.name}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
