"use client";
import { useEffect, useRef, useState } from "react";

/** Número que cuenta hasta su valor al aparecer en pantalla. */
export function Contador({ valor, duracion = 1400 }: { valor: number; duracion?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  // Arranca mostrando el valor final: si la animación no llega a correr, el número igual es correcto.
  const [n, setN] = useState(valor);
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min((t - t0) / duracion, 1);
        setN(Math.round(valor * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [valor, duracion]);
  return <span ref={ref}>{n}</span>;
}
