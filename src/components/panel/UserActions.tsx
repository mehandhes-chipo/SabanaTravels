"use client";
import { useActionState, useState } from "react";
import { changeUserRole, resetUserPassword, setUserActive } from "@/app/actions/users";
import { ROLE_LABEL, type Role } from "@/lib/config";
import { FormMessage as Feedback } from "./FormMessage";



/** Acciones del administrador sobre una cuenta. `isSelf` desactiva las que no se pueden hacer sobre uno mismo. */
export function UserActions({ id, role, active, isSelf }: { id: string; role: Role; active: boolean; isSelf: boolean }) {
  const [activeState, toggleAction, toggling] = useActionState(setUserActive.bind(null, id, !active), null);
  const [roleState, roleAction, changingRole] = useActionState(changeUserRole.bind(null, id), null);
  const [resetState, resetAction, resetting] = useActionState(resetUserPassword.bind(null, id), null);
  const [copied, setCopied] = useState(false);

  if (isSelf) {
    return (
      <div className="card p-4 text-sm text-texto">
        Esta es tu cuenta. Para evitar quedarte sin acceso, no puedes suspenderla, cambiar su rol ni restablecer su contraseña desde aquí.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="card flex flex-col gap-3 p-4">
        <h2 className="card-title">Rol</h2>
        <form action={roleAction} className="flex flex-wrap items-end gap-2">
          <div>
            <label htmlFor="role" className="label">Tipo de cuenta</label>
            <select id="role" name="role" defaultValue={roleState?.values?.role ?? role} className="input w-auto">
              {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
                <option key={r} value={r}>{ROLE_LABEL[r]}</option>
              ))}
            </select>
          </div>
          <button className="btn-outline" disabled={changingRole}>{changingRole ? "Guardando…" : "Cambiar rol"}</button>
        </form>
        <Feedback state={roleState} />
      </section>

      <section className="card flex flex-col gap-3 p-4">
        <h2 className="card-title">Contraseña</h2>
        <p className="text-sm text-texto">
          Crea una contraseña temporal para entregársela a la persona (por ejemplo por WhatsApp). Se muestra una sola vez.
        </p>
        <form action={resetAction}>
          <button
            className="btn-outline"
            disabled={resetting}
            onClick={(e) => {
              if (!window.confirm("¿Crear una contraseña nueva? La actual dejará de funcionar.")) e.preventDefault();
            }}
          >
            {resetting ? "Creando…" : "Restablecer contraseña"}
          </button>
        </form>
        <Feedback state={resetState} />
        {resetState?.password && (
          <div className="flex flex-wrap items-center gap-2">
            <code className="rounded bg-nube px-3 py-1.5 font-mono text-base">{resetState.password}</code>
            <button
              type="button"
              className="btn-outline btn-sm"
              onClick={() => navigator.clipboard.writeText(resetState.password!).then(() => setCopied(true))}
            >
              {copied ? "Copiada" : "Copiar"}
            </button>
          </div>
        )}
      </section>

      <section className={`flex flex-col gap-3 rounded-card border p-4 ${active ? "border-peligro-200 bg-peligro-100" : "border-linea bg-white"}`}>
        <h2 className="card-title">{active ? "Suspender cuenta" : "Cuenta suspendida"}</h2>
        <p className="text-sm text-texto">
          {active
            ? "La persona no podrá ingresar y su sesión se cierra de inmediato. Sus fichas publicadas siguen visibles; retíralas desde Publicaciones si hace falta."
            : "Esta cuenta no puede ingresar. Al reactivarla podrá volver a usar su contraseña."}
        </p>
        <form action={toggleAction}>
          <button
            className={active ? "btn-danger" : "btn-primary"}
            disabled={toggling}
            onClick={(e) => {
              if (active && !window.confirm("¿Suspender esta cuenta?")) e.preventDefault();
            }}
          >
            {toggling ? "Guardando…" : active ? "Suspender" : "Reactivar"}
          </button>
        </form>
        <Feedback state={activeState} />
      </section>
    </div>
  );
}
