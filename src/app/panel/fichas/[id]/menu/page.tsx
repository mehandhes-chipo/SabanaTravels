import { RowsEditor } from "@/components/panel/RowsEditor";
import { getOwnPlace, requireSection } from "@/lib/panel";

export default async function MenuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getOwnPlace(id);
  requireSection(p.kind, "menu");
  return (
    <section aria-labelledby="t">
      <h2 id="t" className="panel-title">Menú</h2>
      <p className="mb-4 text-sm text-texto">
        Agrupa los platos por categoría (Entradas, Fuertes, Bebidas, Postres…). El plato más económico se muestra en el catálogo como «desde $…».
      </p>
      <RowsEditor
        placeId={p.id}
        kind="menu"
        addLabel="Agregar plato"
        emptyText="Todavía no hay platos en el menú."
        columns={[
          { name: "category", label: "Categoría", placeholder: "Fuertes" },
          { name: "name", label: "Plato", placeholder: "Carne a la brasa" },
          { name: "price", label: "Precio ($)", type: "price", placeholder: "25000" },
          { name: "description", label: "Descripción (opcional)", placeholder: "Con yuca, papa y ensalada", wide: true },
        ]}
        initial={p.menuItems.map((x) => ({ category: x.category, name: x.name, price: String(x.price), description: x.description }))}
      />
    </section>
  );
}
