import { Encabezado } from "@/components/Encabezado";
import { Pie } from "@/components/Pie";
import { getCurrentProfile } from "@/lib/auth";
import { homeFor } from "@/lib/config";

export default async function SitioLayout({ children }: { children: React.ReactNode }) {
  const me = await getCurrentProfile();
  // Clientes no tienen panel: solo ven "Salir". Negocios y admin ven "Mi panel".
  const cuenta = me ? { nombre: me.full_name || me.email, panel: me.role === "cliente" ? null : homeFor(me.role) } : null;
  return (
    <>
      <Encabezado cuenta={cuenta} />
      <main id="contenido">{children}</main>
      <Pie />
    </>
  );
}
