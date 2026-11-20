import { Badge, type BadgeTone } from "@/components/ui/Badge";

export type PlaceStatus = "borrador" | "pendiente" | "aprobado" | "rechazado";

const TONE: Record<PlaceStatus, BadgeTone> = { borrador: "neutro", pendiente: "aviso", aprobado: "ok", rechazado: "peligro" };

/** Mismo estado, dicho según quién lo lee: el negocio espera ("En revisión"), el admin tiene que actuar ("Por aprobar"). */
const LABEL: Record<"negocio" | "admin", Record<PlaceStatus, string>> = {
  negocio: { borrador: "Borrador", pendiente: "En revisión", aprobado: "Publicada", rechazado: "Rechazada" },
  admin: { borrador: "Borrador", pendiente: "Por aprobar", aprobado: "Publicada", rechazado: "Rechazada" },
};

export function StatusBadge({ status, audience = "negocio" }: { status: PlaceStatus; audience?: "negocio" | "admin" }) {
  return <Badge tone={TONE[status]}>{LABEL[audience][status]}</Badge>;
}
