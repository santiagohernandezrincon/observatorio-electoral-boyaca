"""
reducir_precision_geojson.py
Trunca la precision de las coordenadas de un GeoJSON a N decimales (por
defecto 5, ~1.1m en el ecuador -- muy por debajo de cualquier diferencia
visible a escala departamental). No cambia el numero de vertices ni la
topologia, solo el numero de digitos por coordenada.

Uso: python scripts/reducir_precision_geojson.py <archivo.geojson> [decimales]
Sobreescribe el archivo in-place.
"""
import json
import sys
from pathlib import Path

DECIMALES_DEFECTO = 5


def truncar(obj, decimales):
    if isinstance(obj, float):
        return round(obj, decimales)
    if isinstance(obj, list):
        return [truncar(x, decimales) for x in obj]
    return obj


def main():
    if len(sys.argv) < 2:
        print("Uso: python scripts/reducir_precision_geojson.py <archivo.geojson> [decimales]")
        sys.exit(1)
    ruta = Path(sys.argv[1])
    decimales = int(sys.argv[2]) if len(sys.argv) > 2 else DECIMALES_DEFECTO

    geojson = json.loads(ruta.read_text(encoding='utf-8'))
    for feature in geojson['features']:
        feature['geometry']['coordinates'] = truncar(feature['geometry']['coordinates'], decimales)

    antes = ruta.stat().st_size
    ruta.write_text(json.dumps(geojson, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    despues = ruta.stat().st_size
    print(f"{ruta.name}: {antes:,} -> {despues:,} bytes ({(1 - despues/antes)*100:.1f}% menos)")


if __name__ == '__main__':
    main()
