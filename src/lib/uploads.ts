import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Fotos subidas desde el panel del negocio.
 * En desarrollo se guardan en public/uploads/<ficha>/ (carpeta ignorada por git) y Next las sirve directo.
 * En Vercel el disco es de solo lectura: para producción hay que conectar un almacenamiento
 * (por ejemplo Vercel Blob) y cambiar solo este archivo.
 */
export const UPLOADS_ENABLED = !process.env.VERCEL;

export const MAX_PHOTO_BYTES = 3.5 * 1024 * 1024;
const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export function photoProblem(file: File): string | null {
  if (!TYPES[file.type]) return "La foto debe ser JPG, PNG o WebP.";
  if (file.size > MAX_PHOTO_BYTES) return "La foto pesa más de 3,5 MB. Redúcela e inténtalo de nuevo.";
  return null;
}

/** Guarda la foto y devuelve su URL pública (/uploads/…). */
export async function savePhoto(placeId: string, file: File): Promise<string> {
  const dir = join(process.cwd(), "public", "uploads", placeId);
  await mkdir(dir, { recursive: true });
  const name = `${randomUUID()}.${TYPES[file.type]}`;
  await writeFile(join(dir, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${placeId}/${name}`;
}

/** Borra el archivo de una foto subida. Las fotos del proyecto (/fotos/…) no se tocan. */
export async function removePhotoFile(url: string) {
  const m = /^\/uploads\/([0-9a-f-]{36})\/([0-9a-f-]{36}\.(?:jpg|png|webp))$/i.exec(url);
  if (!m) return;
  await unlink(join(process.cwd(), "public", "uploads", m[1], m[2])).catch(() => {});
}
