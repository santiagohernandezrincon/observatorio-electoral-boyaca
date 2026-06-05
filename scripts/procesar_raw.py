"""
procesar_raw.py
Transforma los CSV crudos de CEDAE en el esquema del dashboard
(separador ;, encoding utf-8, carpeta data/).

Salidas por archivo fuente:
  votos_candidato_municipio_{anio}_{cargo}.csv  → MUNNOMBRE;CANNOMBRE;PARNOMBRE;VOTOS
  votos_partido_municipio_{anio}_{cargo}.csv    → MUNNOMBRE;PARNOMBRE;VOTOS;TOTAL_VOTOS;PORCENTAJE
"""

import re
import sys
import pandas as pd
from pathlib import Path

# Forzar stdout a utf-8 para evitar errores en terminales Windows (cp1252)
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# ── Rutas ────────────────────────────────────────────────────────────────────
BASE   = Path(__file__).resolve().parent.parent
RAW    = BASE / 'data' / 'raw'
OUT    = BASE / 'data'

# ── Mapeo cargo raw → nombre normalizado ─────────────────────────────────────
CARGO_MAP = {
    'camara':                     'camara',
    'senado':                     'senado',
    'presidencia_primera_vuelta': 'presidencia_1v',
    'presidencia_segunda_vuelta': 'presidencia_2v',
    'alcaldia':                   'alcalde',
    'asamblea':                   'asamblea',
    'concejo':                    'concejo',
    'gobernacion':                'gobernador',
}

# Votos especiales a excluir de candidatos/partidos
EXCLUIR = {
    'CANDIDATOS TOTALES', 'VOTOS EN BLANCO', 'VOTOS NO MARCADOS', 'VOTOS NULOS',
    'VOTOS EN BLANCO TERRITORIAL', 'VOTOS NO MARCADOS TERRITORIAL',
    'VOTOS NULOS TERRITORIAL', 'TARJETAS NO MARCADAS',
}

# ── Utilidades ────────────────────────────────────────────────────────────────
def sep(n=60): print('─' * n)

def leer_csv(ruta, separador=',', encoding=None):
    """Lee CSV probando encodings si no se especifica."""
    encs = [encoding] if encoding else ['utf-8', 'utf-8-sig', 'latin-1', 'cp1252']
    for enc in encs:
        try:
            return pd.read_csv(ruta, sep=separador, encoding=enc, dtype=str,
                               low_memory=False)
        except Exception:
            continue
    raise ValueError(f"No se pudo leer {ruta} con ningún encoding.")

def clean_str(val):
    """Devuelve string limpio o '' si es NaN/vacío."""
    if pd.isna(val):
        return ''
    s = str(val).strip()
    return '' if s.upper() == 'NAN' else s

def build_candidato(row):
    """Concatena apellido1, apellido2, nombres eliminando vacíos."""
    partes = [clean_str(row.get(c, ''))
              for c in ('primer_apellido', 'segundo_apellido', 'nombres')]
    return ' '.join(p for p in partes if p)

def excluido(nombre):
    return nombre.strip().upper() in EXCLUIR

def guardar_candidato(df, anio, cargo):
    """Agrupa por municipio+candidato y guarda votos_candidato_..."""
    grp = (df.groupby(['MUNNOMBRE', 'CANNOMBRE', 'PARNOMBRE'], as_index=False)['VOTOS']
             .sum()
             .sort_values(['MUNNOMBRE', 'VOTOS'], ascending=[True, False]))
    ruta = OUT / f'votos_candidato_municipio_{anio}_{cargo}.csv'
    grp.to_csv(ruta, sep=';', index=False, encoding='utf-8')
    print(f"    ✅  {ruta.name}  ({len(grp)} filas)")
    return grp

def guardar_partido(df, anio, cargo):
    """Agrupa por municipio+partido y guarda votos_partido_..."""
    grp = (df.groupby(['MUNNOMBRE', 'PARNOMBRE'], as_index=False)['VOTOS']
             .sum()
             .sort_values(['MUNNOMBRE', 'VOTOS'], ascending=[True, False]))
    totales = grp.groupby('MUNNOMBRE')['VOTOS'].transform('sum')
    grp['TOTAL_VOTOS'] = totales
    grp['PORCENTAJE']  = (grp['VOTOS'] / grp['TOTAL_VOTOS'] * 100).round(6)
    ruta = OUT / f'votos_partido_municipio_{anio}_{cargo}.csv'
    grp.to_csv(ruta, sep=';', index=False, encoding='utf-8')
    print(f"    ✅  {ruta.name}  ({len(grp)} filas)")

# ── Procesador archivos .dta.csv (2010-2018) ──────────────────────────────────
def procesar_dta(ruta, anio, cargo_raw):
    cargo = CARGO_MAP[cargo_raw]
    sep(); print(f"  {ruta.name}  →  {anio} / {cargo}")

    df = leer_csv(ruta, separador=',')
    print(f"    filas totales : {len(df)}")
    print(f"    columnas      : {list(df.columns)}")

    # Filtrar Boyacá
    df['coddpto'] = df['coddpto'].astype(str).str.strip().str.zfill(2)
    df = df[df['coddpto'] == '15'].copy()
    print(f"    filas Boyacá  : {len(df)}")
    if df.empty:
        print("    ⚠  Sin datos para Boyacá — archivo omitido.")
        return

    df['VOTOS']    = pd.to_numeric(df['votos'], errors='coerce').fillna(0).astype(int)
    df['MUNNOMBRE'] = df['municipio'].str.strip().str.upper()

    # Construir CANNOMBRE
    df['CANNOMBRE'] = df.apply(build_candidato, axis=1)

    # Construir mapa codigo_partido → nombre partido
    # (filas donde primer_apellido está vacío = el campo 'nombres' tiene el nombre del partido)
    mask_lista = df['primer_apellido'].apply(clean_str) == ''
    partido_map = {}
    for _, r in df[mask_lista].iterrows():
        cod = clean_str(r.get('codigo_partido', ''))
        nom = clean_str(r.get('nombres', ''))
        if cod and nom and cod not in partido_map:
            partido_map[cod] = nom

    def get_parnombre(row):
        # Lista: CANNOMBRE ya es el nombre del partido
        if clean_str(row.get('primer_apellido', '')) == '':
            return row['CANNOMBRE']
        # Candidato individual: buscar en mapa, fallback a codigo_partido
        cod = clean_str(row.get('codigo_partido', ''))
        return partido_map.get(cod, cod)

    df['PARNOMBRE'] = df.apply(get_parnombre, axis=1)

    # Excluir votos especiales
    df_valido = df[~df['CANNOMBRE'].str.upper().isin(EXCLUIR)].copy()

    guardar_candidato(df_valido, anio, cargo)
    guardar_partido(df_valido, anio, cargo)


# ── Procesador 2016 plebiscito ────────────────────────────────────────────────
def procesar_plebiscito():
    ruta = RAW / '2016_plebiscito_boyaca.csv'
    sep(); print(f"  {ruta.name}  →  2016 / plebiscito")

    df = leer_csv(ruta, separador=',')
    df.columns = [c.strip() for c in df.columns]
    print(f"    columnas : {list(df.columns)}")

    # Columnas relevantes
    # "Municipio", "Tipo de votación", "Total"
    mun_col   = 'Municipio'
    tipo_col  = 'Tipo de votación'
    votos_col = 'Total'

    df['MUNNOMBRE'] = df[mun_col].str.strip().str.upper()
    df['CANNOMBRE'] = df[tipo_col].str.strip().str.upper()
    df['VOTOS']     = pd.to_numeric(df[votos_col], errors='coerce').fillna(0).astype(int)

    # Excluir votos nulos/no marcados para totales, pero conservar SI y NO
    df_valido = df[~df['CANNOMBRE'].isin(EXCLUIR)].copy()
    df_valido['PARNOMBRE'] = df_valido['CANNOMBRE']  # SI / NO como "partido"

    # Agrupar por municipio + opción
    df_agg = (df_valido.groupby(['MUNNOMBRE', 'CANNOMBRE', 'PARNOMBRE'], as_index=False)
                       ['VOTOS'].sum()
                       .sort_values(['MUNNOMBRE', 'VOTOS'], ascending=[True, False]))
    ruta_cand = OUT / 'votos_candidato_municipio_2016_plebiscito.csv'
    df_agg.to_csv(ruta_cand, sep=';', index=False, encoding='utf-8')
    print(f"    ✅  {ruta_cand.name}  ({len(df_agg)} filas)")

    # votos_partido (mismo agrupamiento aquí)
    part = df_agg[['MUNNOMBRE', 'CANNOMBRE', 'VOTOS']].copy()
    part.columns = ['MUNNOMBRE', 'PARNOMBRE', 'VOTOS']
    totales = part.groupby('MUNNOMBRE')['VOTOS'].transform('sum')
    part['TOTAL_VOTOS'] = totales
    part['PORCENTAJE']  = (part['VOTOS'] / part['TOTAL_VOTOS'] * 100).round(6)
    ruta_part = OUT / 'votos_partido_municipio_2016_plebiscito.csv'
    part.to_csv(ruta_part, sep=';', index=False, encoding='utf-8')
    print(f"    ✅  {ruta_part.name}  ({len(part)} filas)")


# ── Procesador MMV 2022 presidencia ───────────────────────────────────────────
def procesar_mmv(vuelta):
    """vuelta: '1' o '2'"""
    nombre = f'MMV_NACIONAL_PRESIDENTE_2022_{vuelta}v.csv'
    ruta   = RAW / nombre
    sufijo = f'presidencia_{vuelta}v'
    sep(); print(f"  {nombre}  →  2022 / {sufijo}")

    df = leer_csv(ruta, separador=';')
    print(f"    columnas      : {list(df.columns)}")

    # Limpiar nombres de columna (a veces tienen espacios)
    df.columns = [c.strip() for c in df.columns]

    # Filtrar Boyacá por DEPNOMBRE (el código numérico varía según fuente)
    df['DEPNOMBRE_CLEAN'] = df['DEPNOMBRE'].astype(str).str.strip().str.upper()
    df_boy = df[df['DEPNOMBRE_CLEAN'].str.contains('BOYAC', na=False)].copy()
    print(f"    filas Boyacá  : {len(df_boy)}")
    if df_boy.empty:
        print("    ⚠  Sin datos para Boyacá — archivo omitido.")
        return

    df_boy['VOTOS']    = pd.to_numeric(df_boy['VOTOS'], errors='coerce').fillna(0).astype(int)
    df_boy['MUNNOMBRE'] = df_boy['MUNNOMBRE'].str.strip().str.upper()
    df_boy['CANNOMBRE'] = df_boy['CANNOMBRE'].str.strip().str.upper()
    df_boy['PARNOMBRE'] = df_boy['PARNOMBRE'].str.strip()

    df_valido = df_boy[~df_boy['CANNOMBRE'].str.upper().isin(EXCLUIR)].copy()

    guardar_candidato(df_valido, '2022', sufijo)
    guardar_partido(df_valido, '2022', sufijo)


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    OUT.mkdir(exist_ok=True)
    errores = []

    # 1) Archivos .dta.csv
    patron = re.compile(r'^(\d{4})_(.+)\.dta\.csv$')
    for ruta in sorted(RAW.glob('*.dta.csv')):
        m = patron.match(ruta.name)
        if not m:
            print(f"⚠  Nombre no reconocido: {ruta.name}")
            continue
        anio, cargo_raw = m.group(1), m.group(2)
        if cargo_raw not in CARGO_MAP:
            print(f"⚠  Cargo no mapeado: '{cargo_raw}' en {ruta.name}")
            continue
        try:
            procesar_dta(ruta, anio, cargo_raw)
        except Exception as e:
            print(f"❌  ERROR en {ruta.name}: {e}")
            errores.append((ruta.name, str(e)))

    # 2) Plebiscito 2016
    try:
        procesar_plebiscito()
    except Exception as e:
        print(f"❌  ERROR en plebiscito: {e}")
        errores.append(('2016_plebiscito_boyaca.csv', str(e)))

    # 3) Presidencia 2022
    for vuelta in ('1', '2'):
        try:
            procesar_mmv(vuelta)
        except Exception as e:
            nombre = f'MMV_NACIONAL_PRESIDENTE_2022_{vuelta}v.csv'
            print(f"❌  ERROR en {nombre}: {e}")
            errores.append((nombre, str(e)))

    sep()
    if errores:
        print(f"⚠  Proceso terminado con {len(errores)} error(es):")
        for nombre, msg in errores:
            print(f"   • {nombre}: {msg}")
        sys.exit(1)
    else:
        print("✅  Todos los archivos procesados sin errores.")


if __name__ == '__main__':
    main()
