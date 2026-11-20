"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string };

/** Menú lateral de los paneles: marca la sección actual (la ruta más específica que coincide). */
export function PanelNav({ items }: { items: NavItem[] }) {
  const path = usePathname();
  const current = items
    .filter((n) => n.href !== "/" && (path === n.href || path.startsWith(`${n.href}/`)))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <nav aria-label="Panel" className="mt-6 flex flex-wrap gap-1 md:flex-col">
      {items.map((n) => {
        const active = n.href === current;
        return (
          <Link
            key={n.href}
            href={n.href}
            aria-current={active ? "page" : undefined}
            className={`rounded border-l-4 px-3 py-2 text-sm ${
              active ? "border-verde-700 bg-white/10 font-semibold" : "border-transparent hover:bg-white/10"
            }`}
          >
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}
