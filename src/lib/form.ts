/**
 * Estado que devuelven los Server Actions de formularios.
 * React 19 vacía el formulario después de cada envío; por eso, cuando hay un error, la acción
 * devuelve también lo que la persona escribió (`values`) y el formulario lo usa como defaultValue.
 */
export type FormState = { ok: boolean; message: string; values?: Record<string, string> } | null;

/** Campos que nunca se devuelven al navegador. */
const NEVER_ECHO = new Set(["password"]);

export function echo(form: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    // Las claves "$ACTION_…" son internas de React.
    if (typeof value === "string" && !key.startsWith("$") && !NEVER_ECHO.has(key)) out[key] = value;
  }
  return out;
}

/** Error de validación conservando lo escrito. */
export const fail = (form: FormData, message: string): FormState => ({ ok: false, message, values: echo(form) });
