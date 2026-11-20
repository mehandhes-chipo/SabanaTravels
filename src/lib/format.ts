import { TIME_ZONE } from "./config";

const cop = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

/** 120000 → "$ 120.000" */
export const formatPrice = (n: number) => cop.format(n);

// Todas las fechas se muestran en hora de Colombia, sin importar dónde corra el servidor (Vercel usa UTC).
const dateFmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "long", timeZone: TIME_ZONE });
export const formatDate = (d: Date) => dateFmt.format(d);

const dateTimeFmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "full", timeStyle: "short", timeZone: TIME_ZONE });
export const formatDateTime = (d: Date) => dateTimeFmt.format(d);

const timeFmt = new Intl.DateTimeFormat("es-CO", { timeStyle: "short", timeZone: TIME_ZONE });
export const formatTime = (d: Date) => timeFmt.format(d);

/** Día y mes abreviado para la "hoja de calendario" de los eventos: { day: "15", month: "dic" }. */
export function calendarParts(d: Date) {
  const parts = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", timeZone: TIME_ZONE }).formatToParts(d);
  return {
    day: parts.find((p) => p.type === "day")?.value ?? "",
    month: (parts.find((p) => p.type === "month")?.value ?? "").replace(".", ""),
  };
}

/** Colombia está siempre en UTC−5 (no tiene horario de verano). */
const CO_OFFSET = "-05:00";

/** Valor de un <input type="datetime-local"> ("2026-12-15T18:00"), leído como hora de Colombia. */
export function fromLocalInput(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const d = new Date(`${value}:00${CO_OFFSET}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Fecha → valor para <input type="datetime-local"> en hora de Colombia. */
export function toLocalInput(d: Date): string {
  const co = new Date(d.getTime() - 5 * 3600_000);
  return co.toISOString().slice(0, 16);
}

/** Medianoche de hoy en Colombia, como instante UTC. */
export function startOfTodayCO(): Date {
  const today = toLocalInput(new Date()).slice(0, 10);
  return new Date(`${today}T00:00:00${CO_OFFSET}`);
}

/** Convierte un nombre en un identificador para la URL: "Hotel El Dorado" → "hotel-el-dorado". */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Versión pequeña (640 px) de una foto de /fotos/…: "01.webp" → "01-sm.webp".
 * Para cualquier otra URL (fotos subidas en el futuro) devuelve la misma.
 */
export const thumbUrl = (url: string) => (url.startsWith("/fotos/") ? url.replace(/\.webp$/, "-sm.webp") : url);

/** Ruta en Google Maps desde la ubicación del visitante hasta el lugar (abre la app en el celular). */
export const directionsHref = (lat: number, lng: number) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

/** Enlace de WhatsApp con mensaje prellenado. */
export const whatsappHref = (number: string, text: string) =>
  `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
