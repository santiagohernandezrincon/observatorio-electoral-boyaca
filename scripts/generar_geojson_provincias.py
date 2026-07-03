"""
generar_geojson_provincias.py
Fusiona los poligonos de geojson/boyaca_municipios_simple.geojson en 14-15
poligonos de provincia, usando el mapeo municipio->provincia de
data/provincias_boyaca.json. Salida: geojson/boyaca_provincias.geojson
(un feature por provincia, properties.PROVINCIA = nombre exacto usado en
provinciasData / obtenerDatosProvincia() en el JS).

Solo geometria — no toca votos, CSVs ni resolverPartido(). Se ejecuta una
vez de forma offline; el resultado se versiona como asset estatico.
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

from shapely.geometry import shape, mapping
from shapely.ops import unary_union

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE = Path(__file__).resolve().parent.parent
GEOJSON_IN = BASE / 'geojson' / 'boyaca_municipios_simple.geojson'
PROVINCIAS_IN = BASE / 'data' / 'provincias_boyaca.json'
GEOJSON_OUT = BASE / 'geojson' / 'boyaca_provincias.geojson'

# Espejo exacto de normalizarNombre() en js/data.js — misma tabla de alias,
# para que el matching municipio<->provincia sea idéntico al que ya usa la app.
ALIAS = {
    'GUICAN': 'GUICAN DE LA SIERRA',
    'VILLA DE LEYVA': 'VILLA DE LEYVA',
    'VILLA DE LEIVA': 'VILLA DE LEYVA',
    'AQUITANIA PUEBLOVIEJO': 'AQUITANIA',
    'AQUITANIA': 'AQUITANIA',
    'PAZ DE RIO': 'PAZ DE RIO',
    'PAZ DE RÍO': 'PAZ DE RIO',
    'BRICEÑO': 'BRICEÑO',
    'BRICENO': 'BRICEÑO',
    'GACHANTIVA': 'GACHANTIVA',
}


def normalizar_nombre(nombre):
    if not nombre:
        return ''
    limpio = nombre.upper().strip()
    limpio = unicodedata.normalize('NFD', limpio)
    limpio = ''.join(c for c in limpio if unicodedata.category(c) != 'Mn')
    limpio = re.sub(r'\([^)]*\)', '', limpio)
    limpio = re.sub(r'\s+', ' ', limpio).strip()
    return ALIAS.get(limpio, limpio)


def main():
    geojson = json.loads(GEOJSON_IN.read_text(encoding='utf-8'))
    provincias = json.loads(PROVINCIAS_IN.read_text(encoding='utf-8'))

    # municipio normalizado -> provincia (nombre original, con tildes, tal
    # como aparece en provincias_boyaca.json / provinciasData en el JS)
    mun_a_provincia = {}
    for prov, muns in provincias.items():
        for m in muns:
            mun_a_provincia[normalizar_nombre(m)] = prov

    shapes_por_provincia = {}
    sin_match = []
    for feature in geojson['features']:
        nombre_raw = feature['properties'].get('MPIO_CNMBR')
        nombre_norm = normalizar_nombre(nombre_raw)
        prov = mun_a_provincia.get(nombre_norm)
        if not prov:
            sin_match.append(nombre_raw)
            continue
        shapes_por_provincia.setdefault(prov, []).append(shape(feature['geometry']))

    print(f"Municipios en geojson: {len(geojson['features'])}")
    print(f"Municipios sin provincia (no deberian existir): {sin_match}")
    print(f"Provincias con geometria: {len(shapes_por_provincia)} / {len(provincias)} esperadas")

    faltantes = set(provincias.keys()) - set(shapes_por_provincia.keys())
    if faltantes:
        print(f"⚠ Provincias del JSON sin ningun municipio encontrado en el geojson: {faltantes}")

    features_out = []
    for prov, geoms in sorted(shapes_por_provincia.items()):
        fusion = unary_union(geoms)
        features_out.append({
            'type': 'Feature',
            'properties': {
                'PROVINCIA': prov,
                'N_MUNICIPIOS': len(geoms),
            },
            'geometry': mapping(fusion),
        })
        print(f"  {prov}: {len(geoms)} municipios fusionados -> {fusion.geom_type}")

    salida = {'type': 'FeatureCollection', 'features': features_out}
    GEOJSON_OUT.write_text(json.dumps(salida, ensure_ascii=False), encoding='utf-8')
    print(f"\n✅ Escrito {GEOJSON_OUT} ({len(features_out)} features, {GEOJSON_OUT.stat().st_size:,} bytes)")


if __name__ == '__main__':
    main()
