import type { Metadata } from "next";
import Link from "next/link";
import { EventForm } from "@/components/panel/EventForm";

export const metadata: Metadata = { title: "Nuevo evento" };

export default function NuevoEventoPage() {
  return (
    <div>
      <Link href="/admin/eventos" className="text-sm text-texto hover:underline">← Eventos</Link>
      <h1 className="mt-2 text-3xl">Nuevo evento</h1>
      <div className="mt-6">
        <EventForm id={null} />
      </div>
    </div>
  );
}
