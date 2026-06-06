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
    'RETIRADO', 'RETIRADO (A)', 'RETIRADO(A)', 'CANDIDATO RETIRADO',
}

# ── Tabla de equivalencia de partidos históricos ───────────────────────────────
NOMBRES_PARTIDO = {
    # Partidos grandes históricos
    '2003001':  'Partido Liberal Colombiano',
    '2003002':  'Partido Conservador Colombiano',
    '2005001':  'Partido de la U',
    '20050001': 'Partido de la U',
    '20050002': 'Partido de la U',
    '2005002':  'Cambio Radical',
    '20050003': 'Cambio Radical',
    '2003003':  'Polo Democrático Alternativo',
    '2005003':  'Polo Democrático Alternativo',
    '2009001':  'Partido Verde',
    '20090001': 'Partido Verde',
    '20090002': 'Alianza Verde',
    '2009002':  'Alianza Verde',
    '2010001':  'Partido PIN',
    '20100001': 'Partido PIN',
    '2003004':  'Movimiento MIRA',
    '20030004': 'Movimiento MIRA',
    '2011001':  'Opción Ciudadana',
    '20110001': 'Opción Ciudadana',
    '2013001':  'Centro Democrático',
    '20130001': 'Centro Democrático',
    '20130002': 'MAIS',
    '2003005':  'Partido ASI',
    '20140001': 'Colombia Justa Libres',
    '20150001': 'Coalición de Gobierno',
    '20180001': 'Colombia Humana',
    '20180002': 'Partido Liberal Colombiano',
    '20180003': 'Colombia Humana',
    '20180004': 'Partido Conservador Colombiano',
    '20180005': 'Cambio Radical',
    '20180006': 'Centro Democrático',
    '20180007': 'Partido Verde',
    '20180008': 'Polo Democrático',
    '20180009': 'FARC',
    '20050004': 'Partido Liberal Colombiano',
    '20030001': 'Partido Liberal Colombiano',
    '20030002': 'Partido Conservador Colombiano',
    # Otros códigos observados en diagnóstico
    '18480001': 'Partido Liberal Colombiano',    # Liberal fundado 1848
    '18490002': 'Partido Conservador Colombiano', # Conservador fundado 1849
    '19930001': 'Movimiento MIRA',
    '20060003': 'Polo Democrático Alternativo',
    '20100063': 'Partido PIN',
    '19910001': 'Partido ASI',
    '19910006': 'Partido ASI',
    '19850001': 'Partido Liberal Colombiano',
    '19970004': 'Partido Conservador Colombiano',  # Mendieta Poveda, trayectoria conservadora
    '20170002': 'Cambio Radical',
    # Códigos 2015 gobernación Boyacá
    '20150606': 'Alianza Verde',
    '20150607': 'Cambio Radical',
    '20150608': 'Partido Conservador Colombiano',
}

def resolver_partido(row):
    """Resuelve el nombre del partido desde codigo_partido (con fallback a codigo_lista)."""
    for col in ['codigo_partido', 'codigo_lista']:
        if col in row.index:
            val = str(row[col]).strip().split('.')[0]  # quitar decimales si los hay
            if val in NOMBRES_PARTIDO:
                return NOMBRES_PARTIDO[val]
            # Si no es numérico puro, usarlo directamente como nombre
            if val and not val.replace('-', '').isdigit():
                return val
    fallback = str(row.get('codigo_partido', row.get('codigo_lista', 'Sin partido'))).strip()
    return fallback.split('.')[0]

def formatear_nombre(row):
    """Produce 'Nombres Apellido1 Apellido2' en Title Case."""
    _nan = {'nan', 'none', '', 'nat'}

    def _v(s):
        return str(s).strip() if str(s).strip().lower() not in _nan else ''

    nombres    = _v(row.get('nombres', ''))
    p_apellido = _v(row.get('primer_apellido', ''))
    s_apellido = _v(row.get('segundo_apellido', ''))

    if nombres:
        apellidos = ' '.join(x for x in [p_apellido, s_apellido] if x)
        result = (nombres + (' ' + apellidos if apellidos else '')).strip().title()
    elif p_apellido:
        result = (p_apellido + (' ' + s_apellido if s_apellido else '')).strip().title()
    else:
        result = 'Sin nombre'

    # Si el resultado es solo 'Retirado', priorizar apellidos reales
    if result.strip().upper() == 'RETIRADO':
        apellidos_real = ' '.join(x.title() for x in [p_apellido, s_apellido]
                                  if x and x.upper() != 'RETIRADO')
        if apellidos_real:
            return apellidos_real
        nombres_real = nombres if nombres and nombres.upper() != 'RETIRADO' else ''
        return nombres_real.title() if nombres_real else 'Sin nombre'

    return result

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

    # Construir CANNOMBRE con formato "Nombres Apellidos"
    df['CANNOMBRE'] = df.apply(formatear_nombre, axis=1)

    # Construir mapa codigo_partido → nombre partido
    # (filas donde primer_apellido está vacío = 'nombres' tiene el nombre del partido)
    mask_lista = df['primer_apellido'].apply(clean_str) == ''
    partido_map = {}
    for _, r in df[mask_lista].iterrows():
        cod = clean_str(r.get('codigo_partido', ''))
        nom = clean_str(r.get('nombres', ''))
        if (cod and nom and nom.upper() not in EXCLUIR
                and 'RETIRADO' not in nom.upper() and cod not in partido_map):
            partido_map[cod] = nom

    def get_parnombre(row):
        # Fila de lista (sin candidato individual): el nombre del partido está en CANNOMBRE
        if clean_str(row.get('primer_apellido', '')) == '':
            return row['CANNOMBRE']
        cod = clean_str(row.get('codigo_partido', ''))
        # 1) Nombre extraído del propio archivo (partido_map)
        if cod in partido_map:
            return partido_map[cod]
        # 2) Tabla de equivalencia histórica (NOMBRES_PARTIDO)
        if cod in NOMBRES_PARTIDO:
            return NOMBRES_PARTIDO[cod]
        # 3) Fallback: resolver_partido intenta el código y texto libre
        return resolver_partido(row)

    df['PARNOMBRE'] = df.apply(get_parnombre, axis=1)

    # Excluir votos especiales y candidaturas retiradas
    df_valido = df[
        ~df['CANNOMBRE'].str.upper().isin(EXCLUIR) &
        ~df['PARNOMBRE'].str.upper().isin(EXCLUIR)
    ].copy()

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
