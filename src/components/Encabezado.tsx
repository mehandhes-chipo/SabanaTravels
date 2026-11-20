"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { logout } from "@/app/actions/auth";
import { Icono } from "./Icono";
import { Marca } from "./Marca";

const ENLACES = [
  { href: "/", label: "Inicio" },
  { href: "/explorar", label: "Explorar lugares" },
  { href: "/explorar?tipo=restaurantes", label: "Restaurantes" },
  { href: "/explorar?tipo=hoteles", label: "Hoteles" },
  { href: "/explorar?tipo=sitios", label: "Sitios turísticos" },
  { href: "/eventos", label: "Eventos y festividades" },
  { href: "/#como-funciona", label: "Cómo funciona" },
];

export type Cuenta = { nombre: string; panel: string | null } | null;

/** Barra superior + encabezado con logo centrado, menú lateral y acceso a la cuenta. */
export function Encabezado({ cuenta }: { cuenta: Cuenta }) {
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
          <p className="font-semibold text-marino">Hoteles · Restaurantes · Sitios turísticos</p>
        </div>
      </div>

      <header className={`sticky top-0 z-40 bg-white transition-shadow ${bajo ? "shadow-tarjeta" : ""}`}>
        <div className={`contenedor grid grid-cols-[1fr_auto_1fr] items-center transition-[padding] ${bajo ? "py-2.5" : "py-3 sm:py-5"}`}>
          <button type="button" onClick={() => setAbierto(true)} aria-label="Abrir menú" aria-expanded={abierto} className="justify-self-start rounded-md p-2 text-marino hover:bg-nube">
            <Icono nombre="menu" className="size-7" />
          </button>
          <Link href="/" aria-label="Sabana Travel's, inicio" className="rounded-md">
            <Marca />
          </Link>
          <div className="flex items-center gap-2 justify-self-end">
            <Link href="/explorar" aria-label="Buscar lugares" className="rounded-md p-2 text-marino hover:bg-nube">
              <Icono nombre="buscar" className="size-6" />
            </Link>
            {cuenta ? (
              <>
                {cuenta.panel && <Link href={cuenta.panel} className="btn-verde hidden px-5 py-3 lg:inline-flex">Mi panel</Link>}
                <form action={logout} className="hidden lg:block">
                  <button className="rounded-md px-3 py-3 text-sm font-bold text-marino hover:text-verde-700">Salir</button>
                </form>
              </>
            ) : (
              <Link href="/ingresar" className="btn-verde hidden px-5 py-3 lg:inline-flex">
                <Icono nombre="usuario" className="size-4" /> Ingresar
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Menú lateral */}
      <div className={`fixed inset-0 z-50 transition ${abierto ? "visible" : "invisible"}`} aria-hidden={!abierto}>
        <button type="button" tabIndex={-1} aria-label="Cerrar menú" onClick={() => setAbierto(false)} className={`absolute inset-0 bg-marino/60 transition-opacity ${abierto ? "opacity-100" : "opacity-0"}`} />
        <nav aria-label="Principal" className={`absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col bg-white p-6 shadow-flotante transition-transform duration-300 ${abierto ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between">
            <Marca compacta />
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
          <div className="mt-auto flex flex-col gap-3 border-t border-linea pt-6">
            {cuenta ? (
              <>
                <p className="text-sm">Hola, <strong className="text-marino">{cuenta.nombre}</strong></p>
                {cuenta.panel && <Link href={cuenta.panel} onClick={() => setAbierto(false)} tabIndex={abierto ? 0 : -1} className="btn-verde">Mi panel</Link>}
                <form action={logout}>
                  <button tabIndex={abierto ? 0 : -1} className="btn-outline w-full">Salir</button>
                </form>
              </>
            ) : (
              <>
                <Link href="/ingresar" onClick={() => setAbierto(false)} tabIndex={abierto ? 0 : -1} className="btn-verde">Ingresar</Link>
                <Link href="/registro" onClick={() => setAbierto(false)} tabIndex={abierto ? 0 : -1} className="btn-outline">Crear cuenta</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}
