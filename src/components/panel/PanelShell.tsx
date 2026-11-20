import Link from "next/link";
import { logout } from "@/app/actions/auth";
import type { Profile } from "@/lib/auth";
import { ROLE_LABEL, SITE_NAME } from "@/lib/config";
import { PanelNav, type NavItem } from "./PanelNav";

export type { NavItem };

/** Marco común de los paneles (negocio y administrador): menú lateral y contenido. */
export function PanelShell({ me, nav, children }: { me: Profile; nav: NavItem[]; children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="bg-marino p-4 text-white md:min-h-screen">
        <Link href="/" className="card-title font-bold">{SITE_NAME}</Link>
        <p className="mt-1 text-xs text-white/80">
          {ROLE_LABEL[me.role]} · {me.email}
        </p>
        <PanelNav items={nav} />
        <form action={logout} className="mt-6">
          <button className="text-sm text-white/80 underline hover:text-white">Salir</button>
        </form>
      </aside>
      <main id="contenido" className="p-4 md:p-8">{children}</main>
    </div>
  );
}
