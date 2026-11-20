"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SectionTabs({ base, sections }: { base: string; sections: { slug: string; label: string }[] }) {
  const path = usePathname();
  return (
    <nav aria-label="Secciones de la ficha" className="mt-6 flex gap-1 overflow-x-auto border-b border-linea">
      {sections.map((s) => {
        const href = s.slug ? `${base}/${s.slug}` : base;
        const active = path === href;
        return (
          <Link
            key={s.slug}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-semibold ${
              active ? "border-verde-700 text-marino" : "border-transparent text-texto hover:text-marino"
            }`}
          >
            {s.label}
          </Link>
        );
      })}
    </nav>
  );
}
