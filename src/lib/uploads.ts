import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { del, put } from "@vercel/blob";

/**
 * Fotos subidas desde el panel del negocio.
 * - Producción (Vercel): se guardan en Vercel Blob. Vercel crea BLOB_READ_WRITE_TOKEN al conectar
 *   un Blob store al proyecto (Storage → Blob).
 * - Desarrollo: si no hay token, se guardan en public/uploads/<ficha>/ (carpeta ignorada por git).
 * En Vercel sin Blob conectado el disco es de solo lectura, así que la subida se desactiva con un aviso.
 */
const BLOB = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
export const UPLOADS_ENABLED = BLOB || !process.env.VERCEL;

export const MAX_PHOTO_BYTES = 3.5 * 1024 * 1024;
const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export function photoProblem(file: File): string | null {
  if (!TYPES[file.type]) return "La foto debe ser JPG, PNG o WebP.";
  if (file.size > MAX_PHOTO_BYTES) return "La foto pesa más de 3,5 MB. Redúcela e inténtalo de nuevo.";
  return null;
}

/** Guarda la foto y devuelve su URL pública (Blob en producción, /uploads/… en desarrollo). */
export async function savePhoto(placeId: string, file: File): Promise<string> {
  const name = `${randomUUID()}.${TYPES[file.type]}`;
  if (BLOB) {
    const blob = await put(`fichas/${placeId}/${name}`, file, { access: "public", contentType: file.type });
    return blob.url;
  }
  const dir = join(process.cwd(), "public", "uploads", placeId);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${placeId}/${name}`;
}

/** Solo URLs del Blob store de este proyecto (nunca borra algo que no subimos nosotros). */
const isBlobUrl = (url: string) => {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && u.hostname.endsWith(".public.blob.vercel-storage.com") && u.pathname.startsWith("/fichas/");
  } catch {
    return false;
  }
};

/** Borra el archivo de una foto subida. Las fotos del proyecto (/fotos/…) no se tocan. */
export async function removePhotoFile(url: string) {
  if (isBlobUrl(url)) {
    if (BLOB) await del(url).catch(() => {});
    return;
  }
  const m = /^\/uploads\/([0-9a-f-]{36})\/([0-9a-f-]{36}\.(?:jpg|png|webp))$/i.exec(url);
  if (!m) return;
  await unlink(join(process.cwd(), "public", "uploads", m[1], m[2])).catch(() => {});
}
