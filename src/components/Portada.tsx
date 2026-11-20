"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Icono } from "./Icono";

const SLIDES = [
  { foto: "/fotos/balneario-las-vegas/06.webp", lugar: "Balneario Las Vegas" },
  { foto: "/fotos/reserva-natural-cabildo-verde/27.webp", lugar: "Reserva Natural Cabildo Verde" },
  { foto: "/fotos/hotel-santa-maria-real/10.webp", lugar: "Hotel Santa María Real" },
];
const PALABRAS = ["Sabor", "Descanso", "Placer"];
const CAMBIO_MS = 6500;

/** Escribe y borra las palabras de la marca, una letra a la vez. */
function useEscribir(palabras: string[], quieto: boolean) {
  const [texto, setTexto] = useState(quieto ? palabras[0] : "");
  useEffect(() => {
    if (quieto) return setTexto(palabras[0]);
    let i = 0, n = 0, borrando = false;
    let t: ReturnType<typeof setTimeout>;
    const paso = () => {
      const p = palabras[i];
      n += borrando ? -1 : 1;
      setTexto(p.slice(0, n));
      let espera = borrando ? 60 : 120;
      if (!borrando && n === p.length) { borrando = true; espera = 1800; }
      else if (borrando && n === 0) { borrando = false; i = (i + 1) % palabras.length; espera = 400; }
      t = setTimeout(paso, espera);
    };
    t = setTimeout(paso, 600);
    return () => clearTimeout(t);
  }, [palabras, quieto]);
  return texto;
}

export function Portada() {
  const [activa, setActiva] = useState(0);
  const [quieto, setQuieto] = useState(false);
  const [pausa, setPausa] = useState(false);
  const palabra = useEscribir(PALABRAS, quieto);

  useEffect(() => setQuieto(matchMedia("(prefers-reduced-motion: reduce)").matches), []);
  useEffect(() => {
    if (quieto || pausa) return;
    const t = setInterval(() => setActiva((a) => (a + 1) % SLIDES.length), CAMBIO_MS);
    return () => clearInterval(t);
  }, [quieto, pausa]);

  const ir = (d: number) => setActiva((a) => (a + d + SLIDES.length) % SLIDES.length);

  return (
    <section id="inicio" aria-roledescription="carrusel" aria-label="Fotos de Sabana de Torres" className="relative isolate overflow-hidden bg-marino" onMouseEnter={() => setPausa(true)} onMouseLeave={() => setPausa(false)} onFocus={() => setPausa(true)} onBlur={() => setPausa(false)}>
      {SLIDES.map((s, i) => (
        <div key={s.foto} className={`hero-slide absolute inset-0 -z-10 ${i === activa ? "is-active" : ""}`} aria-hidden={i !== activa}>
          <img src={s.foto} alt="" className="h-full w-full object-cover" fetchPriority={i === 0 ? "high" : "low"} loading={i === 0 ? "eager" : "lazy"} />
        </div>
      ))}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-marino/85 via-marino/55 to-marino/10" />

      <div className="contenedor relative flex min-h-[calc(100svh-120px)] flex-col justify-center py-24 md:min-h-[640px]">
        <div className="max-w-3xl">
          <p className="font-script text-3xl text-verde sm:text-4xl">Descubre Sabana de Torres</p>
          <h1 className="mt-3 text-4xl uppercase text-white sm:text-6xl lg:text-7xl">
            Turismo, tradición y aventura
            <span className="mt-2 block text-verde" aria-label={PALABRAS.join(", ")}>
              <span aria-hidden="true">{palabra || " "}</span>
              <span className="cursor-escribir h-[0.9em] align-[-0.1em]" aria-hidden="true" />
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/90">
            Hoteles, restaurantes y sitios naturales de Santander en un solo lugar: precios, fotos, ubicación y contacto.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link href="#lugares" className="btn-verde">Explorar lugares <Icono nombre="flecha" className="size-4" /></Link>
            <Link href="#destinos" className="btn-borde">Sitios turísticos</Link>
          </div>
        </div>

        {/* Sello flotante, como una etiqueta de equipaje */}
        <div className="flotar absolute right-8 top-16 hidden rounded-md border-2 border-dashed border-verde bg-white/10 px-6 py-3 font-script text-3xl text-white backdrop-blur-sm lg:block" aria-hidden="true">
          ¡Reserva ya!
        </div>

        <div className="absolute bottom-8 left-5 right-5 flex items-center justify-between sm:left-8 sm:right-8">
          <p className="flex items-center gap-2 text-sm text-white/90" aria-live="polite">
            <Icono nombre="pin" className="size-4 text-verde" /> {SLIDES[activa].lugar}
          </p>
          <div className="flex items-center gap-3">
            {SLIDES.map((s, i) => (
              <button key={s.foto} type="button" onClick={() => setActiva(i)} aria-label={`Ver foto ${i + 1}: ${s.lugar}`} aria-current={i === activa} className={`h-2.5 rounded-full transition-all ${i === activa ? "w-8 bg-verde" : "w-2.5 bg-white/60 hover:bg-white"}`} />
            ))}
            <button type="button" onClick={() => ir(-1)} aria-label="Foto anterior" className="ml-2 grid size-11 place-items-center rounded-full border border-white/50 text-white hover:bg-white hover:text-marino"><Icono nombre="izquierda" /></button>
            <button type="button" onClick={() => ir(1)} aria-label="Foto siguiente" className="grid size-11 place-items-center rounded-full border border-white/50 text-white hover:bg-white hover:text-marino"><Icono nombre="derecha" /></button>
          </div>
        </div>
      </div>
    </section>
  );
}
