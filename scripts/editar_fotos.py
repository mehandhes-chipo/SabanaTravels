"""
Edición profesional de las fotos del sitio a partir de los ORIGINALES del celular (HEIC en ../REGISTRO).

Por qué desde los originales: la primera conversión guardó WebP de 1280 px con calidad 70; retocar
esas copias acumulaba compresión. Aquí se parte del HEIC a resolución completa y se comprime una
sola vez, al final, con calidad alta.

Edición (igual para todas, para que el sitio se vea uniforme):
  1. Balance de blancos (quita dominantes amarillas o azules de la luz del lugar).
  2. Niveles: negros profundos y blancos limpios.
  3. Recupera cielos y paredes muy claras (compresión suave de las altas luces).
  4. Levanta sombras en fotos oscuras (bosque, interiores).
  5. Claridad: contraste local, da relieve a texturas (hojas, madera, piedra).
  6. Curva en S suave e intensidad de color (aviva lo apagado sin saturar lo fuerte).
  7. Toque cálido y enfoque final según el tamaño.

Salida en public/fotos/<lugar>/: NN.webp (1600 px, portada y galería) y NN-sm.webp (800 px, tarjetas).
Los nombres no cambian, así que la base de datos no se toca: basta con publicar los archivos.
Los metadatos (GPS, modelo del teléfono) no se copian.

    pip install pillow pillow-heif numpy
    python scripts/editar_fotos.py                          # todas las fotos que usa el sitio
    python scripts/editar_fotos.py --solo el-fogon/09 --comparar hoja.jpg
"""
from __future__ import annotations

import argparse
import re
import sys
import unicodedata
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageOps
from pillow_heif import register_heif_opener

register_heif_opener()

ROOT = Path(__file__).resolve().parents[1]
DESTINO = ROOT / "public" / "fotos"
REGISTRO = ROOT.parent / "REGISTRO"
# Fotos ya editadas a mano y aprobadas (fotos-editadas/<lugar>-<NN>.jpeg): se usan tal cual, solo se
# convierten. Solo entran ediciones que mejoran luz y color; nunca las que agregan personas o cambian el lugar.
EDITADAS = ROOT / "fotos-editadas"
EXTS = {".heic", ".heif", ".jpg", ".jpeg", ".png"}
# Mismo mapeo y numeración que la conversión original (web/scripts/convertir_fotos.py).
OVERRIDES = {"valneario-las-vegas": "balneario-las-vegas"}
# Equilibrio entre nitidez y peso de página (la portada carga la foto grande).
TAMANOS = {"": (1440, 70), "-sm": (800, 70)}
LUMA = np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFD", text).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def originales() -> dict[str, list[Path]]:
    """slug → lista ordenada de originales (la foto NN es la posición NN, empezando en 1)."""
    out: dict[str, list[Path]] = {}
    for d in sorted(p for p in REGISTRO.glob("*/*") if p.is_dir()):
        slug = OVERRIDES.get(slugify(d.name), slugify(d.name))
        out[slug] = sorted(f for f in d.rglob("*") if f.suffix.lower() in EXTS)
    return out


def editar(im: Image.Image) -> Image.Image:
    # Se edita a 2400 px: suficiente detalle para 1600 y mucho más rápido que a 4032.
    im = im.copy()
    im.thumbnail((2400, 2400), Image.Resampling.LANCZOS)
    a = np.asarray(im, dtype=np.float32) / 255.0

    # 1. Balance de blancos "mundo gris" al 55 %.
    medias = a.reshape(-1, 3).mean(axis=0)
    a = a * np.clip(1 + 0.55 * (medias.mean() / np.maximum(medias, 1e-4) - 1), 0.88, 1.15)

    # 2. Niveles sobre la luminancia (misma curva en los tres canales: no cambia el tono).
    lum = a @ LUMA
    bajo, alto = min(np.percentile(lum, 0.4), 0.10), max(np.percentile(lum, 99.7), 0.85)
    a = np.clip((a - bajo) / (alto - bajo), 0, 1)

    # 3. Altas luces: por encima de 0,75 se comprime con una rodilla suave (recupera cielos).
    rod = 0.75
    a = np.where(a > rod, rod + (1 - rod) * np.tanh((a - rod) / (1 - rod) * 1.15) / np.tanh(1.15), a)

    # 4. Sombras: gamma según qué tan oscura es la foto.
    media = float((a @ LUMA).mean())
    if media < 0.45:
        a = a ** (0.80 + 0.30 * media / 0.45)

    # 5. Claridad: realce de contraste local con un desenfoque amplio.
    base = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8))
    borroso = np.asarray(base.filter(ImageFilter.GaussianBlur(radius=max(base.size) / 90)), dtype=np.float32) / 255.0
    a = np.clip(a + 0.35 * (a - borroso) * (1 - np.abs(2 * a - 1)), 0, 1)

    # 6. Curva en S suave e intensidad.
    a = a * 0.84 + (a * a * (3 - 2 * a)) * 0.16
    gris = a.mean(axis=2, keepdims=True)
    sat = a.max(axis=2, keepdims=True) - a.min(axis=2, keepdims=True)
    a = gris + (a - gris) * (1 + 0.28 * (1 - sat))

    # 7. Toque cálido.
    a = a * np.array([1.02, 1.0, 0.975], dtype=np.float32)
    return Image.fromarray((np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8))


def guardar(im: Image.Image, destino: Path, enfocar: bool = True):
    for sufijo, (lado, calidad) in TAMANOS.items():
        c = im.copy()
        c.thumbnail((lado, lado), Image.Resampling.LANCZOS)
        if enfocar:
            radio, fuerza = (0.9, 55) if sufijo == "" else (0.7, 45)
            c = c.filter(ImageFilter.UnsharpMask(radius=radio, percent=fuerza, threshold=2))
        c.save(destino.with_name(destino.stem + sufijo + ".webp"), "WEBP", quality=calidad, method=6)


# ---------- Portada (carrusel a pantalla completa) ----------
# Las fotos editadas a mano miden 1200 px y se ven borrosas a pantalla completa. Para la portada se parte
# del original HEIC (nitidez completa) y se le copian los colores de la versión editada.
PORTADA = [("balneario-las-vegas", "06"), ("reserva-natural-cabildo-verde", "27"), ("hotel-santa-maria-real", "10")]
PORTADA_DIR = DESTINO / "portada"


def copiar_colores(base: Image.Image, referencia: Image.Image) -> Image.Image:
    """Ajusta media y contraste de cada canal de `base` a los de `referencia` (transferencia de color)."""
    b = np.asarray(base, dtype=np.float32)
    r = np.asarray(referencia, dtype=np.float32)
    out = (b - b.mean(axis=(0, 1))) / (b.std(axis=(0, 1)) + 1e-3) * r.std(axis=(0, 1)) + r.mean(axis=(0, 1))
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))


def portada(fuentes: dict[str, list[Path]]):
    PORTADA_DIR.mkdir(exist_ok=True)
    for slug, nn in PORTADA:
        with Image.open(fuentes[slug][int(nn) - 1]) as src:
            im = ImageOps.exif_transpose(src).convert("RGB")
        im.thumbnail((2400, 2400), Image.Resampling.LANCZOS)
        editada = EDITADAS / f"{slug}-{nn}.jpeg"
        if editada.exists():
            with Image.open(editada) as ref:
                im = copiar_colores(im, ImageOps.exif_transpose(ref).convert("RGB"))
            im = ImageEnhance.Color(im).enhance(1.08)  # la transferencia apaga un poco el color
            origen = f"colores de {editada.name}"
        else:
            im = editar(im)
            origen = "edición automática"
        im.thumbnail((1920, 1920), Image.Resampling.LANCZOS)
        # Suavizado mínimo antes del enfoque: quita el ruido del sensor (pesa mucho y no aporta detalle).
        im = im.filter(ImageFilter.GaussianBlur(0.6)).filter(ImageFilter.UnsharpMask(radius=1.2, percent=70, threshold=4))
        im.save(PORTADA_DIR / f"{slug}-{nn}.webp", "WEBP", quality=62, method=6)
        print(f"  ok portada/{slug}-{nn}.webp  ({origen})")


def hoja(pares: list[tuple[Image.Image, Image.Image]], salida: Path):
    """Antes (izquierda) / después (derecha), más un recorte al 100 % para ver el detalle."""
    an, al = 520, 390
    h = Image.new("RGB", (an * 3, al * len(pares)), "white")
    for i, (antes, despues) in enumerate(pares):
        for j, im in enumerate((antes, despues)):
            m = im.copy()
            m.thumbnail((an, al))
            h.paste(m, (j * an, i * al))
        w, hh = despues.size
        h.paste(despues.crop((w // 2 - an // 2, hh // 2 - al // 2, w // 2 + an // 2, hh // 2 + al // 2)), (2 * an, i * al))
    h.save(salida, quality=88)


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--solo", nargs="*", help="lugar/NN, ej. el-fogon/09")
    p.add_argument("--comparar", type=Path, help="hoja antes / después / detalle")
    p.add_argument("--portada", action="store_true", help="solo las 3 fotos del carrusel en 1920 px")
    args = p.parse_args()

    fuentes = originales()
    if args.portada:
        portada(fuentes)
        sys.exit(0)
    if args.solo:
        objetivos = [tuple(x.split("/")) for x in args.solo]
    else:
        objetivos = sorted((f.parent.name, f.stem) for f in DESTINO.rglob("*.webp") if not f.stem.endswith("-sm"))
    pares = []
    for slug, nn in objetivos:
        editada = EDITADAS / f"{slug}-{nn}.jpeg"
        if editada.exists():
            # Ya viene editada a mano: solo se convierte (sin retoque ni enfoque extra).
            with Image.open(editada) as src:
                final = ImageOps.exif_transpose(src).convert("RGB")
            antes = Image.open(DESTINO / slug / f"{nn}.webp").convert("RGB") if args.comparar else None
            guardar(final, DESTINO / slug / f"{nn}.webp", enfocar=False)
            if antes is not None:
                pares.append((antes, final))
            print(f"  ok {slug}/{nn}  (editada a mano: {editada.name})")
            continue
        lista = fuentes.get(slug, [])
        idx = int(nn) - 1
        if not (0 <= idx < len(lista)):
            print(f"  ! sin original para {slug}/{nn}")
            continue
        with Image.open(lista[idx]) as src:
            original = ImageOps.exif_transpose(src).convert("RGB")
        antes = Image.open(DESTINO / slug / f"{nn}.webp").convert("RGB") if args.comparar else None
        final = editar(original)
        guardar(final, DESTINO / slug / f"{nn}.webp")
        if antes is not None:
            pares.append((antes, final))
        print(f"  ok {slug}/{nn}  ({lista[idx].name})")
    if args.comparar and pares:
        hoja(pares, args.comparar)
        print(f"Hoja: {args.comparar}")
    print(f"{len(objetivos)} fotos procesadas.")
