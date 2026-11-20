import { PlaceInfoForm } from "@/components/panel/PlaceInfoForm";
import { getOwnPlace } from "@/lib/panel";

export default async function FichaInfoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getOwnPlace(id);
  return (
    <PlaceInfoForm
      placeId={p.id}
      kind={p.kind}
      initial={{
        name: p.name,
        summary: p.summary,
        description: p.description,
        address: p.address,
        hours: p.hours,
        phone: p.phone,
        whatsapp: p.whatsapp,
        email: p.email,
        services: p.services.join("\n"),
        payment_methods: p.payment_methods.join("\n"),
        facebook: p.socials.facebook ?? "",
        instagram: p.socials.instagram ?? "",
        tiktok: p.socials.tiktok ?? "",
        web: p.socials.web ?? "",
      }}
    />
  );
}
