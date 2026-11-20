"use client";
import { useActionState } from "react";
import { saveInfo } from "@/app/actions/panel";
import type { PlaceKind } from "@/lib/config";
import { FormMessage } from "./FormMessage";

export type PlaceInfoValues = {
  name: string;
  summary: string;
  description: string;
  address: string;
  hours: string;
  phone: string;
  whatsapp: string;
  email: string;
  services: string;
  payment_methods: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  web: string;
};

/** Información general, servicios o métodos de pago y redes sociales de la ficha. */
export function PlaceInfoForm({ placeId, kind, initial }: { placeId: string; kind: PlaceKind; initial: PlaceInfoValues }) {
  const [state, action, pending] = useActionState(saveInfo.bind(null, placeId), null);
  // Tras un error se muestran los valores enviados (React vacía el formulario al enviarlo).
  const v = (k: keyof PlaceInfoValues) => (state && !state.ok ? state.values?.[k] : undefined) ?? initial[k];
  // key: al guardar con éxito, el formulario se vuelve a montar con los datos ya guardados.
  const key = state?.ok ? JSON.stringify(initial) : "form";

  return (
    <form key={key} action={action} className="flex flex-col gap-6">
      <fieldset className="card flex flex-col gap-4 p-5">
        <legend className="sr-only">Información general</legend>
        <h2 className="panel-title">Información general</h2>
        <Field id="name" label="Nombre *" defaultValue={v("name")} required minLength={3} maxLength={120} />
        <Field id="summary" label="Resumen (una línea, aparece en la tarjeta del catálogo) *" defaultValue={v("summary")} maxLength={200}
          placeholder={kind === "hotel" ? "Habitaciones cómodas en el centro del municipio" : kind === "restaurante" ? "Comida típica santandereana a la leña" : "Río, piscinas naturales y descanso al aire libre"} />
        <div>
          <label htmlFor="description" className="label">Descripción</label>
          <textarea id="description" name="description" rows={6} maxLength={5000} defaultValue={v("description")} className="input"
            placeholder="Cuéntale al visitante qué encontrará, qué lo hace especial y cómo llegar." />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="address" label="Dirección" defaultValue={v("address")} maxLength={200} placeholder="Calle 14 # 10-25, Sabana de Torres" />
          <Field id="hours" label="Horario" defaultValue={v("hours")} maxLength={120} placeholder="Lunes a domingo, 11:00 a. m. – 9:00 p. m." />
        </div>
      </fieldset>

      <fieldset className="card flex flex-col gap-4 p-5">
        <legend className="sr-only">Contacto</legend>
        <h2 className="panel-title">Contacto</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="whatsapp" label="WhatsApp (para el botón de contacto)" defaultValue={v("whatsapp")} maxLength={30} inputMode="tel" placeholder="300 123 4567" />
          <Field id="phone" label="Teléfono" defaultValue={v("phone")} maxLength={40} inputMode="tel" placeholder="607 123 4567" />
        </div>
        <Field id="email" label="Correo" type="email" defaultValue={v("email")} maxLength={120} />
        <p className="-mt-2 text-xs text-texto">Necesitas al menos WhatsApp o teléfono para enviar la ficha a revisión.</p>
      </fieldset>

      <fieldset className="card flex flex-col gap-4 p-5">
        <legend className="sr-only">{kind === "restaurante" ? "Métodos de pago" : "Servicios"}</legend>
        {kind === "restaurante" ? (
          <>
            <h2 className="panel-title">Métodos de pago</h2>
            <div>
              <label htmlFor="payment_methods" className="label">Uno por línea</label>
              <textarea id="payment_methods" name="payment_methods" rows={4} defaultValue={v("payment_methods")} className="input" placeholder={"Efectivo\nNequi\nTarjeta"} />
            </div>
          </>
        ) : (
          <>
            <h2 className="panel-title">Servicios</h2>
            <div>
              <label htmlFor="services" className="label">Uno por línea</label>
              <textarea id="services" name="services" rows={4} defaultValue={v("services")} className="input"
                placeholder={kind === "hotel" ? "Wi-Fi\nAire acondicionado\nParqueadero" : "Guía local\nKiosco\nParqueadero"} />
            </div>
          </>
        )}
      </fieldset>

      <fieldset className="card flex flex-col gap-4 p-5">
        <legend className="sr-only">Redes sociales</legend>
        <h2 className="panel-title">Redes sociales</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="facebook" label="Facebook" defaultValue={v("facebook")} maxLength={200} placeholder="facebook.com/minegocio" />
          <Field id="instagram" label="Instagram" defaultValue={v("instagram")} maxLength={200} placeholder="instagram.com/minegocio" />
          <Field id="tiktok" label="TikTok" defaultValue={v("tiktok")} maxLength={200} placeholder="tiktok.com/@minegocio" />
          <Field id="web" label="Página web" defaultValue={v("web")} maxLength={200} placeholder="minegocio.com" />
        </div>
      </fieldset>

      <FormMessage state={state} />
      <div>
        <button className="btn-primary" disabled={pending}>{pending ? "Guardando…" : "Guardar información"}</button>
      </div>
    </form>
  );
}

function Field({ id, label, ...props }: { id: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <input id={id} name={id} className="input" {...props} />
    </div>
  );
}
