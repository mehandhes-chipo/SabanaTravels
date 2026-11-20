# Sabana Travel's v2 — sitio vitrina

Sitio de turismo de Sabana de Torres (Santander) con un estilo de plantilla de viajes: blanco, verde aventura y azul marino, subtítulos manuscritos, secciones menta con dibujos de viaje y una franja verde de cifras.

Es un proyecto aparte de la v1 (`../web`, etiqueta `v1.0`): no tiene base de datos ni paneles. Los 9 lugares están en `src/lib/lugares.ts` con sus fotos reales en `public/fotos/`. **Precios, horarios y coordenadas son de ejemplo.**

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · fuentes Plus Jakarta Sans y Yesteryear.

## Empezar

```bash
npm install
npm run dev -- -p 3200        # http://localhost:3200
npm run typecheck && npm run lint
```

## Estructura

```
src/
  app/
    page.tsx               portada: carrusel, nosotros, lugares, actividades, cifras, sitios, cómo funciona
    lugares/[slug]/        ficha de cada lugar (galería, precios, servicios, mapa)
    globals.css            colores, botones y fondos decorativos
  components/              Encabezado, Portada, Lugares, TarjetaLugar, Contador, Reveal, Pie, Icono
  lib/lugares.ts           datos de los lugares
```

## Colores

| Token | Uso |
|---|---|
| `verde` #4DA528 | Subtítulos manuscritos, íconos y textos grandes |
| `verde-700` #367F1B | Botones, enlaces y la franja de cifras (5:1 con blanco) |
| `marino` #081E2A | Títulos |
| `texto` #4F545A | Texto de párrafos |
| `naranja` #FF970D / `cian` #14B0C3 | Etiquetas (con texto marino) |
| `menta` #F3F8F6 | Fondos de sección |
| `bosque` #1D231F | Pie de página |
