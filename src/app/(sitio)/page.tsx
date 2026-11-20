import Link from "next/link";
import { Contador } from "@/components/Contador";
import { Icono, type NombreIcono } from "@/components/Icono";
import { Lugares } from "@/components/Lugares";
import { Portada } from "@/components/Portada";
import { Reveal } from "@/components/Reveal";
import { KINDS } from "@/lib/config";
import { getCounts, listPlaces } from "@/lib/data";
import { formatPrice, thumbUrl } from "@/lib/format";

export const dynamic = "force-dynamic";

const ACTIVIDADES: { icono: NombreIcono; titulo: string; texto: string; href: string }[] = [
  { icono: "sendero", titulo: "Senderismo", texto: "Caminos de bosque con guía local en la reserva.", href: "/lugares/reserva-natural-cabildo-verde" },
  { icono: "ojo", titulo: "Avistamiento de fauna", texto: "Animales rescatados y aves en su hábitat.", href: "/lugares/reserva-natural-cabildo-verde" },
  { icono: "agua", titulo: "Baño en río", texto: "Piscinas naturales para refrescarse al aire libre.", href: "/lugares/balneario-las-vegas" },
  { icono: "piscina", titulo: "Piscina y kiosco", texto: "Pasadías en familia con comida incluida.", href: "/lugares/estadero-villa-juliana" },
  { icono: "plato", titulo: "Comida típica", texto: "Sancochos de leña y menú del día santandereano.", href: "/lugares/el-fogon" },
  { icono: "fuego", titulo: "Asados a la brasa", texto: "Carnes y pollo al carbón para compartir.", href: "/lugares/brasas-la-14" },
];

const PASOS: { icono: NombreIcono; titulo: string; texto: string }[] = [
  { icono: "brujula", titulo: "Explora", texto: "Filtra por hoteles, restaurantes o sitios y compara precios y fotos." },
  { icono: "pin", titulo: "Ubica", texto: "Mira dónde queda cada lugar y abre la ruta en tu celular." },
  { icono: "telefono", titulo: "Contacta", texto: "Escribe o llama directamente al negocio para reservar." },
];

export default async function Home() {
  const [counts, lugares] = await Promise.all([getCounts(), listPlaces()]);
  const total = counts.hotel + counts.restaurante + counts.sitio;
  const sitios = lugares.filter((l) => l.kind === "sitio").slice(0, 3);
  return (
    <>
      <Portada />

      {/* ---------- Nosotros ---------- */}
      <section id="nosotros" className="contenedor grid items-center gap-14 py-24 lg:grid-cols-2 lg:py-32">
        <Reveal className="relative mx-auto w-full max-w-xl">
          <div className="grid grid-cols-[1.3fr_1fr] gap-4">
            <img src={thumbUrl("/fotos/reserva-natural-cabildo-verde/05.webp")} alt="Letrero del rey gallinazo en la Reserva Natural Cabildo Verde" loading="lazy" className="row-span-2 h-full min-h-[420px] w-full rounded-[120px_16px_16px_16px] object-cover shadow-tarjeta" />
            <img src={thumbUrl("/fotos/el-fogon/09.webp")} alt="Comedor del restaurante El Fogón" loading="lazy" className="aspect-square w-full rounded-tarjeta object-cover shadow-tarjeta" />
            <img src={thumbUrl("/fotos/estadero-villa-juliana/11.webp")} alt="Piscina del Estadero Villa Juliana" loading="lazy" className="aspect-square w-full rounded-[16px_16px_90px_16px] object-cover shadow-tarjeta" />
          </div>
          <div className="absolute -bottom-6 left-6 flex items-center gap-4 rounded-tarjeta bg-white p-5 shadow-flotante">
            <span className="grid size-14 place-items-center rounded-full bg-verde-100 text-verde-700"><Icono nombre="pin" className="size-7" /></span>
            <span>
              <span className="block text-3xl font-extrabold text-marino"><Contador valor={total} /></span>
              <span className="text-sm">lugares para visitar</span>
            </span>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="guion">Sobre Sabana de Torres</p>
          <h2 className="titulo-seccion">Una gran oportunidad para la aventura y el descanso</h2>
          <p className="mt-6 leading-relaxed">
            Sabana de Torres combina naturaleza, buena mesa y hospedaje cómodo. Aquí encuentras los hoteles, restaurantes y sitios turísticos del municipio, con sus fotos reales, precios de referencia y ubicación.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {(["sitio", "restaurante", "hotel"] as const).map((t) => (
              <li key={t} className="flex items-start gap-3">
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-verde-700 text-white"><Icono nombre="check" className="size-4" grosor={2.5} /></span>
                <span><strong className="text-marino">{KINDS[t].pillar}:</strong> {KINDS[t].many.toLowerCase()}</span>
              </li>
            ))}
            <li className="flex items-start gap-3">
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-verde-700 text-white"><Icono nombre="check" className="size-4" grosor={2.5} /></span>
              <span><strong className="text-marino">Ruta:</strong> cómo llegar a cada lugar</span>
            </li>
          </ul>
          <Link href="#lugares" className="btn-verde mt-10">Ver lugares <Icono nombre="flecha" className="size-4" /></Link>
        </Reveal>
      </section>

      {/* ---------- Lugares ---------- */}
      <section id="lugares" className="fondo-viaje py-24 lg:py-32">
        <div className="contenedor">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="guion">Sabor, descanso y placer</p>
            <h2 className="titulo-seccion">Lugares destacados para tu visita</h2>
          </Reveal>
          <Lugares lugares={lugares} />
        </div>
      </section>

      {/* ---------- Actividades ---------- */}
      <section id="actividades" className="contenedor py-24 lg:py-32">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="guion">Qué hacer</p>
          <h2 className="titulo-seccion">Actividades para todos los gustos</h2>
        </Reveal>
        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ACTIVIDADES.map((a, i) => (
            <Reveal as="li" key={a.titulo} delay={i * 0.06}>
              <Link href={a.href} className="group flex h-full gap-5 rounded-tarjeta border border-linea p-7 transition hover:-translate-y-1 hover:border-transparent hover:shadow-flotante">
                <span className="grid size-16 shrink-0 place-items-center rounded-full bg-verde-100 text-verde-700 transition-colors group-hover:bg-verde-700 group-hover:text-white">
                  <Icono nombre={a.icono} className="size-8" grosor={1.6} />
                </span>
                <span>
                  <span className="block text-lg font-bold text-marino">{a.titulo}</span>
                  <span className="mt-1 block text-sm leading-relaxed">{a.texto}</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* ---------- Franja verde con cifras ---------- */}
      <section className="fondo-curvas py-20 text-white lg:py-24">
        <div className="contenedor grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          <Reveal>
            <p className="font-script text-3xl text-white/90 sm:text-4xl">Tu próxima escapada</p>
            <h2 className="titulo-seccion text-white">Listo para vivir la aventura y disfrutar la naturaleza</h2>
            <p className="mt-5 max-w-lg text-white/90">Planea tu visita con información clara de cada lugar y llega sin perderte.</p>
            <Link href="#destinos" className="btn-blanco mt-8">Empezar ahora</Link>
          </Reveal>
          <ul className="grid grid-cols-2 gap-4">
            {[
              { n: total, t: "Lugares" },
              { n: counts.hotel, t: KINDS.hotel.many },
              { n: counts.restaurante, t: KINDS.restaurante.many },
              { n: counts.sitio, t: KINDS.sitio.many },
            ].map((c, i) => (
              <Reveal as="li" key={c.t} delay={i * 0.08} className="rounded-tarjeta border border-white/20 bg-white/10 p-6 text-center backdrop-blur-sm">
                <span className="block text-5xl font-extrabold"><Contador valor={c.n} /></span>
                <span className="mt-1 block font-semibold">{c.t}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Destinos (sitios turísticos) ---------- */}
      <section id="destinos" className="contenedor py-24 lg:py-32">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="guion">Naturaleza y aire libre</p>
            <h2 className="titulo-seccion">Sitios turísticos imperdibles</h2>
          </div>
          <Link href="/explorar?tipo=sitios" className="btn-verde">Ver todos</Link>
        </Reveal>
        <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-rows-2">
          {sitios.map((s, i) => (
            <Reveal as="li" key={s.id} delay={i * 0.08} className={i === 0 ? "lg:row-span-2" : ""}>
              <Link href={`/lugares/${s.slug}`} className="group relative block h-full min-h-[280px] overflow-hidden rounded-tarjeta">
                {s.cover_url && <img src={i === 0 ? s.cover_url : thumbUrl(s.cover_url)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />}
                <span className="absolute inset-0 bg-gradient-to-t from-marino/85 via-marino/20 to-transparent" />
                <span className="absolute inset-x-6 bottom-6 flex items-end justify-between gap-4 text-white">
                  <span>
                    <span className="block text-2xl font-extrabold">{s.name}</span>
                    <span className="mt-1 block text-sm text-white/90">{s.summary}</span>
                  </span>
                  {s.price_from && <span className="shrink-0 rounded-md bg-naranja px-3 py-1.5 text-sm font-bold text-marino">Desde {formatPrice(s.price_from)}</span>}
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* ---------- Cómo funciona ---------- */}
      <section id="como-funciona" className="fondo-viaje py-24 lg:py-32">
        <div className="contenedor">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="guion">Fácil y rápido</p>
            <h2 className="titulo-seccion">Así planeas tu visita</h2>
          </Reveal>
          <ol className="mt-14 grid gap-6 md:grid-cols-3">
            {PASOS.map((p, i) => (
              <Reveal as="li" key={p.titulo} delay={i * 0.1} className="tarjeta relative p-8 text-center">
                <span className="absolute right-6 top-4 text-6xl font-extrabold text-verde/15" aria-hidden="true">0{i + 1}</span>
                <span className="mx-auto grid size-20 place-items-center rounded-full bg-verde-700 text-white"><Icono nombre={p.icono} className="size-9" grosor={1.6} /></span>
                <h3 className="mt-6 text-xl font-bold">{p.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed">{p.texto}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Llamado final ---------- */}
      <section className="contenedor py-24">
        <Reveal className="relative overflow-hidden rounded-[24px] bg-marino px-8 py-14 text-center sm:px-16">
          <img src={thumbUrl("/fotos/balneario-las-vegas/12.webp")} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-25" />
          <div className="relative">
            <p className="font-script text-3xl text-verde sm:text-4xl">¿Tienes un negocio en Sabana de Torres?</p>
            <h2 className="mx-auto mt-2 max-w-3xl text-3xl text-white sm:text-4xl">Muestra tu hotel, restaurante o sitio turístico a quienes visitan el municipio</h2>
            <Link href="/registro" className="btn-verde mt-8">Publica tu negocio</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
