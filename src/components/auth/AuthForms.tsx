"use client";
import { useActionState } from "react";
import { login, register } from "@/app/actions/auth";
import { FormMessage } from "@/components/panel/FormMessage";
import { SIGNUP_ROLES } from "@/lib/config";



export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="flex flex-col gap-4">
      {next && <input type="hidden" name="next" value={next} />}
      <div>
        <label htmlFor="email" className="label">Correo electrónico</label>
        <input id="email" name="email" type="email" autoComplete="email" required defaultValue={state?.values?.email} className="input" />
      </div>
      <div>
        <label htmlFor="password" className="label">Contraseña</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="input" />
      </div>
      <FormMessage state={state} />
      <button className="btn-primary" disabled={pending}>{pending ? "Ingresando…" : "Entrar"}</button>
    </form>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(register, null);
  return (
    <form action={action} className="flex flex-col gap-4">
      <fieldset>
        <legend className="label">Tipo de cuenta</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {SIGNUP_ROLES.map((r, i) => (
            <label key={r.role} className="card flex cursor-pointer gap-3 p-3 has-[:checked]:border-marino has-[:checked]:ring-1 has-[:checked]:ring-marino">
              <input type="radio" name="role" value={r.role} defaultChecked={state?.values?.role ? state.values.role === r.role : i === 0} className="mt-1 accent-marino" />
              <span>
                <span className="block font-semibold">{r.label}</span>
                <span className="text-xs text-texto">{r.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="full_name" className="label">Nombre (tuyo o del negocio)</label>
        <input id="full_name" name="full_name" autoComplete="name" required defaultValue={state?.values?.full_name} className="input" />
      </div>
      <div>
        <label htmlFor="email" className="label">Correo electrónico</label>
        <input id="email" name="email" type="email" autoComplete="email" required defaultValue={state?.values?.email} className="input" />
      </div>
      <div>
        <label htmlFor="password" className="label">Contraseña (mínimo 8 caracteres)</label>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className="input" />
      </div>
      <FormMessage state={state} />
      <button className="btn-primary" disabled={pending}>{pending ? "Creando cuenta…" : "Crear cuenta"}</button>
    </form>
  );
}
