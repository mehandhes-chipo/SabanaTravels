"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Icono, Logo } from "./Icono";

const ENLACES = [
  { href: "/#inicio", label: "Inicio" },
  { href: "/#nosotros", label: "Sabana de Torres" },
  { href: "/#lugares", label: "Lugares" },
  { href: "/#actividades", label: "Actividades" },
  { href: "/#destinos", label: "Sitios turísticos" },
  { href: "/#como-funciona", label: "Cómo funciona" },
];

/** Barra superior + encabezado con logo centrado, menú lateral y acceso a los lugares. */
export function Encabezado() {
  const [abierto, setAbierto] = useState(false);
  const [bajo, setBajo] = useState(false);

  useEffect(() => {
    const onScroll = () => setBajo(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [abierto]);

  return (
    <>
      <div className="hidden bg-nube text-sm text-texto md:block">
        <div className="contenedor flex items-center justify-between py-2.5">
          <p className="flex items-center gap-2">
            <Icono nombre="pin" className="size-4 text-verde-700" /> Sabana de Torres, Santander · Colombia
          </p>
          <p className="font-semibold text-marino">Sabor · Descanso · Placer</p>
        </div>
      </div>

      <header className={`sticky top-0 z-40 bg-white transition-shadow ${bajo ? "shadow-tarjeta" : ""}`}>
        <div className="contenedor grid grid-cols-[1fr_auto_1fr] items-center py-4">
          <button type="button" onClick={() => setAbierto(true)} aria-label="Abrir menú" aria-expanded={abierto} className="justify-self-start rounded-md p-2 text-marino hover:bg-nube">
            <Icono nombre="menu" className="size-7" />
          </button>
          <Link href="/" className="flex items-center gap-2 text-2xl font-extrabold text-marino">
            <Logo />
            <span>Sabana Travel&apos;s</span>
          </Link>
          <div className="flex items-center gap-2 justify-self-end">
            <Link href="/#lugares" aria-label="Buscar lugares" className="rounded-md p-2 text-marino hover:bg-nube">
              <Icono nombre="buscar" className="size-6" />
            </Link>
            <Link href="/#lugares" className="btn-verde hidden px-5 py-3 lg:inline-flex">Explorar</Link>
          </div>
        </div>
      </header>

      {/* Menú lateral */}
      <div className={`fixed inset-0 z-50 transition ${abierto ? "visible" : "invisible"}`} aria-hidden={!abierto}>
        <button type="button" tabIndex={-1} aria-label="Cerrar menú" onClick={() => setAbierto(false)} className={`absolute inset-0 bg-marino/60 transition-opacity ${abierto ? "opacity-100" : "opacity-0"}`} />
        <nav aria-label="Principal" className={`absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col bg-white p-6 shadow-flotante transition-transform duration-300 ${abierto ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xl font-extrabold text-marino"><Logo className="size-8" /> Sabana Travel&apos;s</span>
            <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar menú" className="rounded-md p-2 text-marino hover:bg-nube" tabIndex={abierto ? 0 : -1}>
              <Icono nombre="cerrar" className="size-6" />
            </button>
          </div>
          <ul className="mt-8 flex flex-col">
            {ENLACES.map((e) => (
              <li key={e.href}>
                <Link href={e.href} onClick={() => setAbierto(false)} tabIndex={abierto ? 0 : -1} className="flex items-center justify-between border-b border-linea py-4 font-bold text-marino hover:text-verde-700">
                  {e.label} <Icono nombre="derecha" className="size-4" />
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-auto text-sm">Turismo en Sabana de Torres: hoteles, restaurantes y sitios para visitar.</p>
        </nav>
      </div>
    </>
  );
}
