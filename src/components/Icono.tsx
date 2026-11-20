// Íconos dibujados a mano (sin librerías). Decorativos: el texto o el aria-label del botón dan el significado.
const PATHS = {
  menu: "M4 7h16M4 12h11M4 17h16",
  cerrar: "M6 6l12 12M18 6L6 18",
  buscar: "M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm9 3-4.5-4.5",
  pin: "M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  flecha: "M5 12h14m-6-6 6 6-6 6",
  izquierda: "M15 6l-6 6 6 6",
  derecha: "M9 6l6 6-6 6",
  arriba: "M12 19V5m-6 6 6-6 6 6",
  check: "M5 12.5l4.5 4.5L19 7.5",
  play: "M8 5v14l11-7z",
  cama: "M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 14h18M7 9V6h5v3",
  plato: "M4 13a8 8 0 0 0 16 0zM12 5v2M3 13h18M8 3c0 1.5 1 1.5 1 3",
  arbol: "M12 21v-5m0 0-5-1 3-4-2-1 4-6 4 6-2 1 3 4z",
  sendero: "M4 20c4-2 4-6 8-6s4 4 8 2M9 4l1.5 3M14 6l1 2.5",
  ojo: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  agua: "M3 15c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 6 0M3 19c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 6 0M12 3l3 5a3 3 0 1 1-6 0z",
  fuego: "M12 21a6 6 0 0 0 6-6c0-4-3-6-4-9-1 2-2 3-3.5 3.5C9 6 8 4.5 8 4.5 6.5 7 6 9.5 6 12a6 6 0 0 0 6 9z",
  piscina: "M3 18c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 6 0M8 15V5a2 2 0 0 1 4 0M16 15V5a2 2 0 0 0-4 0M8 9h8",
  whatsapp: "M4 20l1.3-3.9A8 8 0 1 1 8 19zm5-11.5c0 3 2.5 6 5.5 6l1-1.5-2-1-1 .8c-1-.4-2-1.4-2.3-2.3l.8-1-1-2z",
  telefono: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z",
  reloj: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-13v4l3 2",
  usuario: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 9a7 7 0 0 1 14 0",
  brujula: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm3.5-12.5-2 5-5 2 2-5z",
} as const;

export type NombreIcono = keyof typeof PATHS;

export function Icono({ nombre, className = "size-5", grosor = 1.8 }: { nombre: NombreIcono; className?: string; grosor?: number }) {
  const relleno = nombre === "play";
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill={relleno ? "currentColor" : "none"} stroke={relleno ? "none" : "currentColor"} strokeWidth={grosor} strokeLinecap="round" strokeLinejoin="round">
      <path d={PATHS[nombre]} />
    </svg>
  );
}

/** Logo: corazón con un pin (amor por el lugar), en verde y naranja. */
export function Logo({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
      <path d="M20 35S5 25.5 5 15a8 8 0 0 1 15-3.9A8 8 0 0 1 35 15c0 10.5-15 20-15 20z" fill="#4da528" />
      <path d="M20 35S5 25.5 5 15a8 8 0 0 1 8-8c-3 4-2 13 7 28z" fill="#ff970d" />
      <circle cx="21" cy="16.5" r="4.5" fill="#fff" />
      <circle cx="21" cy="16.5" r="2" fill="#081e2a" />
    </svg>
  );
}
