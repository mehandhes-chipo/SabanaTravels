import type { PlaceKind } from "./config";

type ChecklistInput = {
  kind: PlaceKind;
  summary: string;
  description: string;
  whatsapp: string;
  phone: string;
  lat: number | null;
  lng: number | null;
  photos: unknown[];
  priceItems: unknown[];
  menuItems: unknown[];
};

export type CheckItem = { ok: boolean; label: string; required: boolean };

/**
 * Lo mínimo para que una ficha sea útil al visitante. Lo usan el panel del negocio (antes de enviar)
 * y el administrador (al revisar). Los puntos "required" son obligatorios para enviar a revisión.
 */
export function placeChecklist(p: ChecklistInput): CheckItem[] {
  return [
    { ok: p.summary.trim().length > 0, label: "Resumen", required: true },
    { ok: Boolean(p.whatsapp || p.phone), label: "Teléfono o WhatsApp", required: true },
    { ok: p.description.trim().length > 0, label: "Descripción", required: false },
    { ok: p.lat !== null && p.lng !== null, label: "Ubicación en el mapa", required: false },
    { ok: p.photos.length > 0, label: "Fotografías", required: false },
    {
      ok: p.kind === "restaurante" ? p.menuItems.length > 0 : p.priceItems.length > 0,
      label: p.kind === "restaurante" ? "Menú con precios" : "Tabla de precios",
      required: false,
    },
  ];
}
