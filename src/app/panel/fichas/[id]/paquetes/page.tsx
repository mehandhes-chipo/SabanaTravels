import { RowsEditor } from "@/components/panel/RowsEditor";
import { getOwnPlace, requireSection } from "@/lib/panel";

export default async function PaquetesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getOwnPlace(id);
  requireSection(p.kind, "paquetes");
  return (
    <section aria-labelledby="t">
      <h2 id="t" className="panel-title">Paquetes de servicios</h2>
      <p className="mb-4 text-sm text-texto">Planes que combinan varios servicios, por ejemplo un pasadía con entrada y almuerzo.</p>
      <RowsEditor
        placeId={p.id}
        kind="paquetes"
        addLabel="Agregar paquete"
        emptyText="Todavía no hay paquetes."
        columns={[
          { name: "name", label: "Nombre", placeholder: "Pasadía" },
          { name: "description", label: "Descripción", placeholder: "Día completo en familia", wide: true },
          { name: "price", label: "Precio ($)", type: "price", placeholder: "45000" },
          { name: "includes", label: "Incluye (separado por comas)", placeholder: "Entrada, almuerzo típico, guía", wide: true },
        ]}
        initial={p.packages.map((x) => ({ name: x.name, description: x.description, price: String(x.price), includes: x.includes.join(", ") }))}
      />
    </section>
  );
}
