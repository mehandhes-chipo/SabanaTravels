import { Notice } from "@/components/ui/Notice";
import type { FormState } from "@/lib/form";

/** Resultado de un formulario (Server Action): verde si se guardó, rojo si hay un error. */
export function FormMessage({ state, className }: { state: FormState; className?: string }) {
  if (!state?.message) return null;
  return <Notice tone={state.ok ? "ok" : "error"} className={className}>{state.message}</Notice>;
}
