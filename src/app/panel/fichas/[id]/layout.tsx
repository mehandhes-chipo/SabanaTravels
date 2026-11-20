import Link from "next/link";
import { SectionTabs } from "@/components/panel/SectionTabs";
import { StatusBadge } from "@/components/panel/StatusBadge";
import { SubmitPlace } from "@/components/panel/SubmitPlace";
import { placeChecklist } from "@/lib/checklist";
import { KINDS, placeHref } from "@/lib/config";
import { getOwnPlace, PLACE_SECTIONS } from "@/lib/panel";

export const dynamic = "force-dynamic";

/** Marco de edición de una ficha: estado, envío a revisión y pestañas por sección. */
export default async function FichaLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getOwnPlace(id);
  const checks = placeChecklist(p);
  const base = `/panel/fichas/${p.id}`;

  return (
    <div className="max-w-4xl">
      <Link href="/panel" className="text-sm text-texto hover:underline">← Mis fichas</Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl">{p.name}</h1>
        <StatusBadge status={p.status} />
      </div>
      <p className="text-sm text-texto">
        {KINDS[p.kind].one}
        {p.status === "aprobado" && (
          <> · <Link href={placeHref(p)} className="font-semibold text-verde-700 hover:underline">Ver ficha pública →</Link></>
        )}
      </p>

      {p.status === "rechazado" && p.rejection_reason && (
        <p className="mt-3 rounded-md bg-peligro-100 px-3 py-2 text-sm text-peligro">
          <strong>El administrador pidió cambios:</strong> {p.rejection_reason}
        </p>
      )}
      {(p.status === "aprobado" || p.status === "pendiente") && (
        <p className="mt-3 rounded-md bg-naranja-100 px-3 py-2 text-sm">
          {p.status === "aprobado"
            ? "Tu ficha está publicada. Si guardas un cambio, vuelve a borrador y deja de verse en el sitio hasta que la envíes y el administrador la apruebe de nuevo."
            : "Tu ficha está en revisión. Si guardas un cambio, vuelve a borrador y tendrás que enviarla otra vez."}
        </p>
      )}

      <SubmitPlace placeId={p.id} status={p.status} checks={checks} />

      <SectionTabs base={base} sections={PLACE_SECTIONS[p.kind]} />
      <div className="mt-6">{children}</div>
    </div>
  );
}
