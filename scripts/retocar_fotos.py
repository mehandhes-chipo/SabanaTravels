"""
Retoque profesional y uniforme de las fotos del sitio (las tomadas con celular en los negocios).

Para cada foto aplica, con intensidad moderada para que siga viéndose natural:
  1. Balance de blancos (corrige dominantes amarillas o azules de la luz del lugar).
  2. Niveles automáticos: negros más profundos y blancos limpios, sin quemar.
  3. Levanta sombras en fotos oscuras (bosque, interiores).
  4. Curva en S suave: más contraste en los medios tonos.
  5. Intensidad (vibrance): aviva los colores apagados sin saturar los que ya son fuertes.
  6. Un toque cálido, acorde con el clima de Sabana de Torres.
  7. Enfoque fino después de redimensionar.

NO modifica los originales: lee de la v1 (../web/public/fotos, conversión directa de los HEIC)
y escribe en public/fotos de la v2 las dos versiones que usa el sitio (NN.webp y NN-sm.webp).

    python scripts/retocar_fotos.py                    # todas las fotos que ya tiene la v2
    python scripts/retocar_fotos.py --comparar salida.jpg   # además, hoja antes/después
"""
from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
DESTINO = ROOT / "public" / "fotos"
ORIGEN = ROOT.parent / "web" / "public" / "fotos"
GRANDE, PEQUENA = 1280, 640


def retocar(im: Image.Image) -> Image.Image:
    a = np.asarray(im.convert("RGB"), dtype=np.float32) / 255.0

    # 1. Balance de blancos "mundo gris", al 60 % para no lavar el color propio de la escena.
    medias = a.reshape(-1, 3).mean(axis=0)
    gris = medias.mean()
    ganancia = np.clip(1 + 0.6 * (gris / np.maximum(medias, 1e-4) - 1), 0.88, 1.15)
    a = a * ganancia

    # 2. Niveles sobre la luminancia (misma curva en los tres canales: no cambia el tono).
    lum = a @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
    bajo = min(np.percentile(lum, 0.5), 0.10)
    alto = max(np.percentile(lum, 99.6), 0.88)
    a = np.clip((a - bajo) / (alto - bajo), 0, 1)

    # 3. Sombras: si la foto es oscura, una gamma suave.
    lum = a @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
    if lum.mean() < 0.40:
        a = a ** 0.88

    # 4. Curva en S suave (mezcla 18 % con smoothstep).
    s = a * a * (3 - 2 * a)
    a = a * 0.82 + s * 0.18

    # 5. Intensidad: más color donde hay poco.
    media = a.mean(axis=2, keepdims=True)
    sat = (a.max(axis=2, keepdims=True) - a.min(axis=2, keepdims=True))
    a = media + (a - media) * (1 + 0.24 * (1 - sat))

    # 6. Toque cálido.
    a = a * np.array([1.02, 1.0, 0.975], dtype=np.float32)

    return Image.fromarray((np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8))


def a_tamano(im: Image.Image, lado: int) -> Image.Image:
    im = im.copy()
    im.thumbnail((lado, lado), Image.Resampling.LANCZOS)
    # 7. Enfoque fino tras reducir (más suave en la miniatura).
    radio, fuerza = (1.0, 70) if lado == GRANDE else (0.8, 55)
    return im.filter(ImageFilter.UnsharpMask(radius=radio, percent=fuerza, threshold=2))


def procesar(rel: Path) -> tuple[Image.Image, Image.Image]:
    original = Image.open(ORIGEN / rel).convert("RGB")
    final = retocar(original)
    destino = DESTINO / rel
    a_tamano(final, GRANDE).save(destino, "WEBP", quality=84, method=6)
    a_tamano(final, PEQUENA).save(destino.with_name(destino.stem + "-sm.webp"), "WEBP", quality=82, method=6)
    return original, final


def hoja_comparacion(pares: list[tuple[str, Image.Image, Image.Image]], salida: Path):
    ancho, alto = 420, 315
    hoja = Image.new("RGB", (ancho * 2, alto * len(pares)), "white")
    for i, (_, antes, despues) in enumerate(pares):
        for j, im in enumerate((antes, despues)):
            m = im.copy()
            m.thumbnail((ancho, alto))
            hoja.paste(m, (j * ancho, i * alto))
    hoja.save(salida, quality=88)


if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--comparar", type=Path, help="Guarda una hoja antes (izquierda) / después (derecha)")
    p.add_argument("--solo", nargs="*", help="Rutas relativas (ej. el-fogon/09.webp) para probar unas pocas")
    args = p.parse_args()

    if args.solo:
        fotos = [Path(x) for x in args.solo]
    else:
        fotos = sorted(f.relative_to(DESTINO) for f in DESTINO.rglob("*.webp") if not f.stem.endswith("-sm"))
    pares = []
    for rel in fotos:
        if not (ORIGEN / rel).exists():
            print(f"  ! sin original: {rel}")
            continue
        antes, despues = procesar(rel)
        pares.append((str(rel), antes, despues))
        print(f"  ok {rel}")
    if args.comparar and pares:
        hoja_comparacion(pares, args.comparar)
        print(f"Hoja de comparación: {args.comparar}")
    print(f"{len(pares)} fotos retocadas.")
