"use client";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, Marker } from "leaflet";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { saveLocation } from "@/app/actions/panel";
import { TOWN_CENTER, type PlaceKind } from "@/lib/config";
import { KIND_HEX } from "@/components/site/TownMap";
import { Notice } from "@/components/ui/Notice";
import { FormMessage } from "./FormMessage";

const fmt = (n: number) => n.toFixed(6);

/** El negocio ubica su pin: tocando el mapa, arrastrando el pin, con su ubicación actual o escribiendo coordenadas. */
export function LocationPicker({ placeId, kind, initial }: { placeId: string; kind: PlaceKind; initial: { lat: number; lng: number } | null }) {
  const [state, action, pending] = useActionState(saveLocation.bind(null, placeId), null);
  const [lat, setLat] = useState(initial ? fmt(initial.lat) : "");
  const [lng, setLng] = useState(initial ? fmt(initial.lng) : "");
  const [geoError, setGeoError] = useState("");
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const marker = useRef<Marker | null>(null);
  const L = useRef<typeof import("leaflet") | null>(null);

  function place(la: number, ln: number, pan = false) {
    setLat(fmt(la));
    setLng(fmt(ln));
    const leaflet = L.current;
    if (!leaflet || !map.current) return;
    if (!marker.current) {
      const icon = leaflet.divIcon({ className: "", html: `<span class="town-pin" style="--pin:${KIND_HEX[kind]}"></span>`, iconSize: [26, 26], iconAnchor: [13, 26] });
      marker.current = leaflet.marker([la, ln], { icon, draggable: true, keyboard: true, title: "Tu negocio", alt: "Ubicación de tu negocio" }).addTo(map.current);
      marker.current.on("dragend", () => {
        const p = marker.current!.getLatLng();
        setLat(fmt(p.lat));
        setLng(fmt(p.lng));
      });
    } else {
      marker.current.setLatLng([la, ln]);
    }
    if (pan) map.current.setView([la, ln], Math.max(map.current.getZoom(), 16));
  }

  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((leaflet) => {
      if (cancelled || !container.current || map.current) return;
      L.current = leaflet;
      const start = initial ?? TOWN_CENTER;
      const m = leaflet.map(container.current).setView([start.lat, start.lng], initial ? 16 : 14);
      leaflet
        .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        })
        .addTo(m);
      m.on("click", (e) => place(e.latlng.lat, e.latlng.lng));
      map.current = m;
      if (initial) place(initial.lat, initial.lng);
    });
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
      marker.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Si escriben las coordenadas a mano, el pin se mueve al terminar. */
  function syncFromInputs() {
    const la = Number(lat.replace(",", "."));
    const ln = Number(lng.replace(",", "."));
    if (lat && lng && Number.isFinite(la) && Number.isFinite(ln)) place(la, ln, true);
  }

  function locateMe() {
    setGeoError("");
    if (!navigator.geolocation) return setGeoError("Tu navegador no permite obtener la ubicación.");
    navigator.geolocation.getCurrentPosition(
      (pos) => place(pos.coords.latitude, pos.coords.longitude, true),
      () => setGeoError("No se pudo obtener tu ubicación. Revisa el permiso del navegador o marca el punto en el mapa."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function clear() {
    marker.current?.remove();
    marker.current = null;
    setLat("");
    setLng("");
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      className="flex flex-col gap-4"
    >
      <p className="text-sm text-texto">
        Toca el mapa donde está tu negocio; puedes arrastrar el pin para ajustarlo. Si estás en el local, usa tu ubicación actual.
      </p>
      <div ref={container} role="region" aria-label="Mapa para marcar la ubicación del negocio" className="z-0 h-80 w-full overflow-hidden rounded-card border border-linea bg-verde-100" />
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-outline btn-sm" onClick={locateMe}>Usar mi ubicación actual</button>
        {lat && <button type="button" className="text-sm text-peligro hover:underline" onClick={clear}>Quitar el pin</button>}
      </div>
      {geoError && <Notice tone="error">{geoError}</Notice>}
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="label sm:col-span-2">Coordenadas</legend>
        <div>
          <label htmlFor="lat" className="text-xs text-texto">Latitud</label>
          <input id="lat" name="lat" inputMode="decimal" value={lat} onChange={(e) => setLat(e.target.value)} onBlur={syncFromInputs} className="input" placeholder="7.3925" />
        </div>
        <div>
          <label htmlFor="lng" className="text-xs text-texto">Longitud</label>
          <input id="lng" name="lng" inputMode="decimal" value={lng} onChange={(e) => setLng(e.target.value)} onBlur={syncFromInputs} className="input" placeholder="-73.4972" />
        </div>
      </fieldset>
      <FormMessage state={state} />
      <div>
        <button className="btn-primary" disabled={pending}>{pending ? "Guardando…" : "Guardar ubicación"}</button>
      </div>
    </form>
  );
}
