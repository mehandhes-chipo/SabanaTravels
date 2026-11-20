import type { Metadata } from "next";
import { PanelShell, type NavItem } from "@/components/panel/PanelShell";
import { requirePage } from "@/lib/auth";

export const metadata: Metadata = {
  title: { default: "Administración", template: "%s · Admin · Sabana Travel's" },
  robots: { index: false },
};

// Secciones del diagrama de casos de uso del administrador. Las páginas se construyen en los siguientes pasos.
const NAV: NavItem[] = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/publicaciones", label: "Publicaciones" },
  { href: "/admin/usuarios", label: "Usuarios y cuentas" },
  { href: "/admin/opiniones", label: "Opiniones" },
  { href: "/admin/eventos", label: "Eventos" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await requirePage("admin");
  return <PanelShell me={me} nav={NAV}>{children}</PanelShell>;
}
