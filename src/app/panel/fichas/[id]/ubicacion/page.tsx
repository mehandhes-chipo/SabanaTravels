import { LocationPicker } from "@/components/panel/LocationPicker";
import { getOwnPlace } from "@/lib/panel";

export default async function UbicacionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getOwnPlace(id);
  return (
    <section aria-labelledby="t" className="flex flex-col gap-2">
      <h2 id="t" className="panel-title">Ubicación en el mapa</h2>
      <LocationPicker placeId={p.id} kind={p.kind} initial={p.lat !== null && p.lng !== null ? { lat: p.lat, lng: p.lng } : null} />
    </section>
  );
}
