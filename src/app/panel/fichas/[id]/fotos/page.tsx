import { deletePhoto, setCover } from "@/app/actions/panel";
import { PhotoUpload } from "@/components/panel/PhotoUpload";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { thumbUrl } from "@/lib/format";
import { getOwnPlace } from "@/lib/panel";

export default async function FotosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getOwnPlace(id);
  return (
    <section aria-labelledby="t" className="flex flex-col gap-4">
      <div>
        <h2 id="t" className="panel-title">Fotografías ({p.photos.length})</h2>
        <p className="text-sm text-texto">
          La <strong>portada</strong> es la primera foto de la galería y la que aparece en el catálogo. Usa fotos horizontales, con buena luz.
        </p>
      </div>
      <PhotoUpload placeId={p.id} />
      {p.photos.length === 0 ? (
        <p className="text-sm text-texto">Todavía no hay fotos.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {p.photos.map((ph, i) => {
            const cover = ph.url === p.cover_url;
            return (
              <li key={ph.id} className="card overflow-hidden">
                <div className="relative">
                  <img src={thumbUrl(ph.url)} alt={ph.alt} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                  {cover && <span className="absolute left-2 top-2 rounded bg-naranja px-2 py-0.5 text-xs font-semibold text-marino">Portada</span>}
                </div>
                <div className="flex items-center justify-between gap-2 p-2 text-sm">
                  {cover ? (
                    <span className="text-texto">Foto {i + 1}</span>
                  ) : (
                    <form action={setCover.bind(null, ph.id)}>
                      <button className="font-semibold text-verde-700 hover:underline">Usar de portada</button>
                    </form>
                  )}
                  <form action={deletePhoto.bind(null, ph.id)}>
                    <ConfirmButton message="¿Borrar esta foto? No se puede deshacer." className="text-peligro hover:underline">Borrar</ConfirmButton>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
