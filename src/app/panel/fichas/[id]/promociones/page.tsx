import { RowsEditor } from "@/components/panel/RowsEditor";
import { toLocalInput } from "@/lib/format";
import { getOwnPlace, requireSection } from "@/lib/panel";

export default async function PromocionesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getOwnPlace(id);
  requireSection(p.kind, "promociones");
  return (
    <section aria-labelledby="t">
      <h2 id="t" className="panel-title">Promociones</h2>
      <p className="mb-4 text-sm text-texto">
        Se muestran en tu ficha mientras estén activas y no hayan vencido. Deja la fecha vacía si no vence.
      </p>
      <RowsEditor
        placeId={p.id}
        kind="promociones"
        addLabel="Agregar promoción"
        emptyText="Todavía no hay promociones."
        columns={[
          { name: "title", label: "Título", placeholder: "2x1 los jueves" },
          { name: "description", label: "Detalle", placeholder: "En carnes a la brasa, de 6 a 9 p. m.", wide: true },
          { name: "active", label: "Activa", type: "yesno" },
          { name: "valid_until", label: "Válida hasta", type: "date" },
        ]}
        initial={p.promotions.map((x) => ({
          title: x.title,
          description: x.description,
          active: x.active ? "si" : "no",
          valid_until: x.valid_until ? toLocalInput(x.valid_until).slice(0, 10) : "",
        }))}
      />
    </section>
  );
}
