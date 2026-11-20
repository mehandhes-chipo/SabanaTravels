"use client";
import "leaflet/dist/leaflet.css";
import type { LayerGroup, Map as LeafletMap } from "leaflet";
import { useEffect, useRef } from "react";
import { KINDS, placeHref, TOWN_CENTER, type PlaceKind } from "@/lib/config";
import { formatPrice } from "@/lib/format";

export type MapPlace = {
  id: string;
  kind: PlaceKind;
  slug: string;
  name: string;
  lat: number;
  lng: number;
  price_from: number | null;
};

/** Mismos colores que las etiquetas de la v2: naranja (restaurante), cian (hotel), verde (sitio). */
export const KIND_HEX: Record<PlaceKind, string> = { restaurante: "#ff970d", hotel: "#14b0c3", sitio: "#4da528" };
/** Versión oscura de cada color para texto pequeño sobre blanco (contraste AA). */
export const KIND_TEXT_HEX: Record<PlaceKind, string> = { restaurante: "#9a5300", hotel: "#0b6f7c", sitio: "#367f1b" };

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/**
 * Mapa del municipio con un pin por lugar (Leaflet + OpenStreetMap, sin llave de API).
 * Leaflet necesita `window`, por eso se carga dentro de useEffect.
 */
export function TownMap({
  places,
  visible,
  single = false,
  label = "Mapa de Sabana de Torres con los lugares publicados",
  className = "min-h-[360px]",
}: {
  places: MapPlace[];
  /** Categorías a mostrar; sin este valor se muestran todas. */
  visible?: Set<PlaceKind>;
  /** Modo ficha: un solo lugar, sin precio ni enlace "Ver ficha" en el globo (ya se está en ella). */
  single?: boolean;
  label?: string;
  className?: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const layer = useRef<LayerGroup | null>(null);
  const L = useRef<typeof import("leaflet") | null>(null);

  // Crear el mapa una sola vez.
  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((leaflet) => {
      if (cancelled || !container.current || map.current) return;
      L.current = leaflet;
      const m = leaflet.map(container.current, { scrollWheelZoom: false }).setView([TOWN_CENTER.lat, TOWN_CENTER.lng], 13);
      leaflet
        .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        })
        .addTo(m);
      map.current = m;
      layer.current = leaflet.layerGroup().addTo(m);
      drawPins();
    });
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redibujar los pines cuando cambia el filtro.
  useEffect(drawPins);

  function drawPins() {
    const leaflet = L.current;
    if (!leaflet || !map.current || !layer.current) return;
    layer.current.clearLayers();
    const shown = visible ? places.filter((p) => visible.has(p.kind)) : places;
    for (const p of shown) {
      const icon = leaflet.divIcon({
        className: "",
        html: `<span class="town-pin" style="--pin:${KIND_HEX[p.kind]}"></span>`,
        iconSize: [26, 26],
        iconAnchor: [13, 26],
        popupAnchor: [0, -24],
      });
      const price = p.price_from ? `<p class="town-pop-price">desde ${formatPrice(p.price_from)}</p>` : "";
      const link = single ? "" : `<a class="town-pop-link" href="${placeHref(p)}">Ver ficha →</a>`;
      leaflet
        .marker([p.lat, p.lng], { icon, title: p.name, alt: `${KINDS[p.kind].one}: ${p.name}`, keyboard: true })
        .bindPopup(
          `<p class="town-pop-kind" style="color:${KIND_TEXT_HEX[p.kind]}">${KINDS[p.kind].one}</p>` +
            `<p class="town-pop-name">${esc(p.name)}</p>${single ? "" : price}${link}`,
        )
        .addTo(layer.current);
    }
    if (shown.length > 1) {
      map.current.fitBounds(leaflet.latLngBounds(shown.map((p) => [p.lat, p.lng])), { padding: [40, 40], maxZoom: 15 });
    } else if (shown.length === 1) {
      map.current.setView([shown[0].lat, shown[0].lng], 15);
    }
  }

  return (
    <div
      ref={container}
      role="region"
      aria-label={label}
      className={`z-0 h-full w-full overflow-hidden rounded-card border border-linea bg-verde-100 ${className}`}
    />
  );
}
