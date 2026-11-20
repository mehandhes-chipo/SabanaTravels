import { RowsEditor } from "@/components/panel/RowsEditor";
import { getOwnPlace, requireSection } from "@/lib/panel";

export default async function PreciosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getOwnPlace(id);
  requireSection(p.kind, "precios");
  const hotel = p.kind === "hotel";
  return (
    <section aria-labelledby="t">
      <h2 id="t" className="panel-title">Tabla de precios</h2>
      <p className="mb-4 text-sm text-texto">
        {hotel ? "Tipos de habitación y su precio por noche." : "Entradas y tarifas (adultos, niños…)."} El precio más bajo se muestra en el catálogo como «desde $…».
      </p>
      <RowsEditor
        placeId={p.id}
        kind="precios"
        addLabel={hotel ? "Agregar habitación" : "Agregar tarifa"}
        emptyText="Todavía no hay precios."
        columns={[
          { name: "name", label: "Nombre", placeholder: hotel ? "Doble" : "Adulto" },
          { name: "detail", label: "Detalle", placeholder: hotel ? "2 personas, por noche" : "De 3 a 10 años", wide: true },
          { name: "price", label: "Precio ($)", type: "price", placeholder: "90000" },
        ]}
        initial={p.priceItems.map((x) => ({ name: x.name, detail: x.detail, price: String(x.price) }))}
      />
    </section>
  );
}
