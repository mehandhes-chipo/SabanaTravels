import type { Metadata } from "next";
import { PanelShell, type NavItem } from "@/components/panel/PanelShell";
import { requirePage } from "@/lib/auth";

export const metadata: Metadata = { title: "Mi panel", robots: { index: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const me = await requirePage("negocio");
  // Las secciones de cada ficha (información, fotos, precios…) se muestran dentro de la ficha.
  const nav: NavItem[] = [
    { href: "/panel", label: "Mis fichas" },
    { href: "/", label: "Ver el sitio" },
  ];
  return <PanelShell me={me} nav={nav}>{children}</PanelShell>;
}
