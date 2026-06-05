import pandas as pd
import os
import glob
import re

# ============================================================
# TABLA 1: NORMALIZACIÓN DE PARTIDOS
# Para elecciones legislativas y territoriales
# ============================================================

NORMALIZACION = {
  # PARTIDO LIBERAL
  'PARTIDO LIBERAL COLOMBIANO': 'Partido Liberal Colombiano',
  'PARTIDO LIBERAL': 'Partido Liberal Colombiano',
  'Partido Liberal': 'Partido Liberal Colombiano',
  'LIBERAL': 'Partido Liberal Colombiano',

  # PARTIDO CONSERVADOR
  'PARTIDO CONSERVADOR COLOMBIANO': 'Partido Conservador Colombiano',
  'PARTIDO CONSERVADOR': 'Partido Conservador Colombiano',
  'Partido Conservador': 'Partido Conservador Colombiano',
  'CONSERVADOR': 'Partido Conservador Colombiano',

  # PARTIDO DE LA U
  'PARTIDO SOCIAL DE UNIDAD NACIONAL': 'Partido de la U',
  'Partido Social de Unidad Nacional': 'Partido de la U',
  'PARTIDO DE LA U': 'Partido de la U',
  'Partido de La U': 'Partido de la U',
  'DE LA U': 'Partido de la U',

  # CAMBIO RADICAL
  'CAMBIO RADICAL': 'Cambio Radical',
  'Cambio radical': 'Cambio Radical',
  'PARTIDO CAMBIO RADICAL': 'Cambio Radical',

  # ALIANZA VERDE — DIFERENTE de Verde Oxígeno
  # El Partido Verde pasó a llamarse Alianza Verde en 2013
  'PARTIDO VERDE': 'Alianza Verde',
  'Partido Verde': 'Alianza Verde',
  'ALIANZA VERDE': 'Alianza Verde',
  'Alianza verde': 'Alianza Verde',
  'PARTIDO ALIANZA VERDE': 'Alianza Verde',
  'Partido Alianza Verde': 'Alianza Verde',
  # Coalición Colombia 2018 (Fajardo): Alianza Verde + Polo + Compromiso Ciudadano
  'COALICION COLOMBIA': 'Alianza Verde',
  'Coalición Colombia': 'Alianza Verde',
  'COMPROMISO CIUDADANO': 'Alianza Verde',
  'Compromiso Ciudadano': 'Alianza Verde',
  'MOVIMIENTO COMPROMISO CIUDADANO': 'Alianza Verde',

  # PARTIDO VERDE OXÍGENO — partido diferente, escisión del Verde, fundado 2024
  'PARTIDO VERDE OXIGENO': 'Partido Verde Oxígeno',
  'Partido Verde Oxígeno': 'Partido Verde Oxígeno',
  'VERDE OXIGENO': 'Partido Verde Oxígeno',
  'OXIGENO': 'Partido Verde Oxígeno',

  # CENTRO DEMOCRÁTICO
  'CENTRO DEMOCRATICO': 'Centro Democrático',
  'Centro Democratico': 'Centro Democrático',
  'PARTIDO CENTRO DEMOCRATICO': 'Centro Democrático',

  # PACTO HISTÓRICO y sus componentes históricos
  'COLOMBIA HUMANA': 'Pacto Histórico',
  'Colombia Humana': 'Pacto Histórico',
  'COLOMBIA HUMANA - UP': 'Pacto Histórico',
  'MOVIMIENTO COLOMBIA HUMANA': 'Pacto Histórico',
  'PACTO HISTORICO': 'Pacto Histórico',
  'Pacto Historico': 'Pacto Histórico',
  'PACTO HISTÓRICO COLOMBIA PUEDE': 'Pacto Histórico',
  'EN MARCHA': 'Pacto Histórico',

  # POLO DEMOCRÁTICO (mantener separado del Pacto para análisis histórico)
  'POLO DEMOCRATICO ALTERNATIVO': 'Polo Democrático Alternativo',
  'POLO DEMOCRATICO': 'Polo Democrático Alternativo',
  'Polo Democrático': 'Polo Democrático Alternativo',
  'Polo Democratico Alternativo': 'Polo Democrático Alternativo',
  'PDA': 'Polo Democrático Alternativo',

  # OPCIÓN CIUDADANA / PIN / Convergencia (mismo partido, tres nombres históricos)
  'OPCION CIUDADANA': 'Opción Ciudadana',
  'Opcion Ciudadana': 'Opción Ciudadana',
  'PARTIDO DE INTEGRACION NACIONAL': 'Opción Ciudadana',
  'PARTIDO INTEGRACION NACIONAL': 'Opción Ciudadana',
  'PIN': 'Opción Ciudadana',
  'CONVERGENCIA CIUDADANA': 'Opción Ciudadana',
  'Convergencia Ciudadana': 'Opción Ciudadana',

  # MIRA
  'MOVIMIENTO MIRA': 'Movimiento MIRA',
  'MIRA': 'Movimiento MIRA',
  'MOVIMIENTO DE INTEGRACION Y RENOVACION': 'Movimiento MIRA',

  # ASI
  'ALIANZA SOCIAL INDEPENDIENTE': 'Alianza Social Independiente',
  'ALIANZA SOCIAL INDIGENA': 'Alianza Social Independiente',
  'ASI': 'Alianza Social Independiente',

  # COMUNES (antes FARC)
  'FARC': 'Comunes',
  'PARTIDO COMUNES': 'Comunes',
  'FUERZA ALTERNATIVA REVOLUCIONARIA DEL COMUN': 'Comunes',

  # COLOMBIA JUSTA LIBRES
  'COLOMBIA JUSTA LIBRES': 'Colombia Justa Libres',
  'JUSTA LIBRES': 'Colombia Justa Libres',

  # UNIÓN PATRIÓTICA
  'UNION PATRIOTICA': 'Unión Patriótica',
  'UP': 'Unión Patriótica',

  # COALICIONES PRESIDENCIALES — se mantienen con su nombre
  # porque cada una representa un candidato distinto
  'EQUIPO POR COLOMBIA': 'Equipo por Colombia',
  'CENTRO ESPERANZA': 'Centro Esperanza',
  'GRAN CONSULTA POR COLOMBIA': 'Gran Consulta por Colombia',
  'Gran Consulta por Colombia': 'Gran Consulta por Colombia',

  # LIGA DE GOBERNANTES (Rodolfo Hernández 2022)
  'LIGA DE GOBERNANTES ANTICORRUPCION': 'Liga de Gobernantes',
  'LIGA DE GOBERNANTES ANTICORRUPCIÓN': 'Liga de Gobernantes',

  # COALICIONES 2022 — formato "COALICION X"
  'COALICION PACTO HISTÓRICO': 'Pacto Histórico',
  'COALICION PACTO HISTORICO': 'Pacto Histórico',
  'COALICION EQUIPO POR COLOMBIA': 'Equipo por Colombia',
  'COALICION CENTRO ESPERANZA': 'Centro Esperanza',

  # CANDIDATOS MENORES 2022
  'COLOMBIA PIENSA EN GRANDE': 'Colombia Piensa en Grande',
  'PARTIDO MOVIMIENTO DE SALVACION NACIONAL': 'Mov. Salvación Nacional',

  # VOTOS ESPECIALES — no son partidos, se conservan como etiqueta
  'VOTOS NULOS': 'Votos nulos',
  'VOTOS EN BLANCO': 'Votos en blanco',
  'VOTOS NO MARCADOS': 'Votos no marcados',

  # FUERZA CIUDADANA
  'FUERZA CIUDADANA': 'Fuerza Ciudadana',

  # NUEVO LIBERALISMO
  'NUEVO LIBERALISMO': 'Nuevo Liberalismo',

  # PLEBISCITO 2016
  'SI': 'Sí', 'Sí': 'Sí', 'si': 'Sí',
  'NO': 'No', 'No': 'No', 'no': 'No',
}


# ============================================================
# TABLA 2: CANDIDATOS PRESIDENCIALES → PARTIDO/COALICIÓN
# Solución al bug: dos candidatos distintos con el mismo partido
# La clave es el apellido del candidato en el dato original
# ============================================================

CANDIDATOS_PRESIDENCIALES = {
  # ── 2010 ──
  'SANTOS CALDERON':   'Partido de la U',
  'SANTOS':            'Partido de la U',
  'MOCKUS SIVICKAS':   'Partido Verde',
  'MOCKUS':            'Partido Verde',
  'VARGAS LLERAS':     'Cambio Radical',
  'SANIN POSADA':      'Partido Conservador Colombiano',
  'SANIN':             'Partido Conservador Colombiano',
  'PARDO RUEDA':       'Partido Liberal Colombiano',
  'PARDO':             'Partido Liberal Colombiano',

  # ── 2014 ──
  'ZULUAGA ESCOBAR':   'Centro Democrático',
  'ZULUAGA':           'Centro Democrático',
  'RAMIREZ BLANCO':    'Partido Conservador Colombiano',
  'RAMIREZ':           'Partido Conservador Colombiano',
  'LOPEZ OBREGON':     'Polo Democrático Alternativo',
  'LOPEZ':             'Polo Democrático Alternativo',
  'PEÑALOSA LONDONO':  'Alianza Verde',
  'PEÑALOSA':          'Alianza Verde',
  'PENALOSA':          'Alianza Verde',

  # ── 2018 ──
  'DUQUE MARQUEZ':     'Centro Democrático',
  'DUQUE':             'Centro Democrático',
  'FAJARDO VALDERRAMA':'Coalición Colombia',
  'FAJARDO':           'Coalición Colombia',
  'DE LA CALLE LOMBANA':'Partido Liberal Colombiano',
  'DE LA CALLE':       'Partido Liberal Colombiano',

  # ── 2022 ──
  'GUTIERREZ ZULUAGA': 'Equipo por Colombia',
  'GUTIERREZ':         'Equipo por Colombia',
  'HERNANDEZ SUAREZ':  'Liga de Gobernantes',
  'HERNANDEZ':         'Liga de Gobernantes',
  'BETANCOURT PULECIO':'Centro Esperanza',
  'BETANCOURT':        'Centro Esperanza',

  # ── 2026 ──
  'DE LA ESPRIELLA':   'Centro Democrático',
  'CEPEDA CASTRO':     'Pacto Histórico',
  'CEPEDA':            'Pacto Histórico',
  'OVIEDO ARANGO':     'Gran Consulta por Colombia',
  'OVIEDO':            'Gran Consulta por Colombia',
  'GALAN PACHON':      'Gran Consulta por Colombia',
  'GALAN':             'Gran Consulta por Colombia',
}

# Petro cambia de partido según el año
PETRO_POR_AÑO = {
  '2010': 'Polo Democrático Alternativo',
  '2018': 'Colombia Humana',
  '2022': 'Pacto Histórico',
  '2026': 'Pacto Histórico',
}


# ============================================================
# COLORES CANÓNICOS — un color por partido, estables en todos los años
# ============================================================

COLORES_PARTIDO = {
  'Partido Liberal Colombiano':     '#C0392B',
  'Partido Conservador Colombiano': '#154360',
  'Partido de la U':                '#D35400',
  'Cambio Radical':                 '#2471A3',
  'Alianza Verde':                  '#1D8348',
  'Partido Verde Oxígeno':          '#58D68D',
  'Centro Democrático':             '#E67E22',
  'Polo Democrático Alternativo':   '#922B21',
  'Pacto Histórico':                '#641E16',
  'Opción Ciudadana':               '#F39C12',
  'Movimiento MIRA':                '#148F77',
  'Alianza Social Independiente':   '#7D3C98',
  'Comunes':                        '#6D4C41',
  'Colombia Justa Libres':          '#1A5276',
  'Unión Patriótica':               '#A93226',
  'Fuerza Ciudadana':               '#1ABC9C',
  'Nuevo Liberalismo':              '#EC407A',
  'Liga de Gobernantes':            '#839192',
  # Coaliciones presidenciales (colores propios por candidato)
  'Coalición Colombia':             '#5DADE2',
  'Centro Esperanza':               '#A9CCE3',
  'Equipo por Colombia':            '#7F8C8D',
  'Gran Consulta por Colombia':     '#F0B27A',
  # Plebiscito
  'Sí':                             '#27AE60',
  'No':                             '#E74C3C',
  # Candidatos menores 2022
  'Colombia Piensa en Grande':      '#85929E',
  'Mov. Salvación Nacional':        '#6C3483',
  # Votos especiales
  'Votos nulos':                    '#EAECEE',
  'Votos en blanco':                '#D5D8DC',
  'Votos no marcados':              '#F2F3F4',
  # Partido Verde (histórico pre-2013, para 2010)
  'Partido Verde':                  '#27AE60',
  # Coalición Colombia 2018 (Fajardo)
  'Coalición Colombia':             '#5DADE2',
  # Códigos numéricos sin tabla de decodificación
  'Partido sin identificar':        '#B2BEB5',
  # Catch-all
  'Sin partido':                    '#BDC3C7',
  'Otro':                           '#D5D8DC',
}


# ============================================================
# LÓGICA DE NORMALIZACIÓN
# ============================================================

def normalizar_partido(nombre, es_presidencial=False, anio=None, candidato=None):
    if pd.isna(nombre):
        return 'Sin partido'
    nombre_str = str(nombre).strip()

    # Para presidenciales: el candidato es la clave, no el codigo
    if es_presidencial and candidato and not pd.isna(candidato):
        cand = str(candidato).upper().strip()
        # Caso especial Petro (cambia de partido según año)
        if 'PETRO' in cand:
            return PETRO_POR_AÑO.get(str(anio), 'Pacto Histórico')
        # Buscar en tabla de candidatos
        for clave, partido in CANDIDATOS_PRESIDENCIALES.items():
            if clave.upper() in cand:
                return partido

    # Para todos: buscar en tabla de normalización
    if nombre_str in NORMALIZACION:
        return NORMALIZACION[nombre_str]
    nombre_upper = nombre_str.upper()
    for alias, canonico in NORMALIZACION.items():
        if alias.upper() == nombre_upper:
            return canonico

    # Si es código numérico puro sin tabla de decodificación disponible
    if re.match(r'^\d+(\.\d+)?$', nombre_str):
        return 'Partido sin identificar'

    return nombre_str.strip()


def es_presidencial(nombre_archivo):
    return 'presidencia' in nombre_archivo.lower()


# ============================================================
# PROCESAMIENTO DE ARCHIVOS
# ============================================================

columnas_partido   = ['PARNOMBRE', 'partido', 'PARTIDO', 'nombre_partido',
                       'partido_politico', 'lista']
columnas_candidato = ['CANNOMBRE', 'candidato', 'nombres', 'nombre_candidato',
                       'primer_apellido']

procesados     = 0
sin_color      = set()
sin_resolver   = set()
errores        = []

for archivo in glob.glob('data/votos_partido_*.csv'):
    try:
        df = pd.read_csv(archivo, sep=';', encoding='utf-8')
        pres = es_presidencial(archivo)
        anio = re.search(r'_(\d{4})_', archivo)
        anio = anio.group(1) if anio else None

        col_p = next((c for c in columnas_partido   if c in df.columns), None)
        col_c = next((c for c in columnas_candidato if c in df.columns), None)

        if col_p:
            def norm_row(row):
                cand = row[col_c] if col_c else None
                return normalizar_partido(row[col_p], pres, anio, cand)
            df[col_p] = df.apply(norm_row, axis=1)

            for val in df[col_p].dropna().unique():
                if '[SIN RESOLVER' in str(val):
                    sin_resolver.add(val)
                elif val not in COLORES_PARTIDO:
                    sin_color.add(val)

            df.to_csv(archivo, sep=';', index=False, encoding='utf-8')
            procesados += 1
    except Exception as e:
        errores.append(f'{archivo}: {e}')

# Exportar tabla de colores para uso directo en el JS
colores_js = '// Generado automáticamente por normalizar_partidos.py\n'
colores_js += 'const COLORES_PARTIDO = {\n'
for p, c in COLORES_PARTIDO.items():
    colores_js += f"  '{p}': '{c}',\n"
colores_js += '};\n'
os.makedirs('js', exist_ok=True)
with open('js/colores_partido.js', 'w', encoding='utf-8') as f:
    f.write(colores_js)

# Reporte final
print(f'\n✓ Archivos procesados: {procesados}')
if sin_resolver:
    print(f'\n✗ Códigos sin resolver (necesitan entrada manual en NORMALIZACION):')
    for c in sorted(sin_resolver): print(f'  {c}')
if sin_color:
    print(f'\n⚠ Partidos sin color (agregar a COLORES_PARTIDO):')
    for p in sorted(sin_color): print(f'  "{p}"')
if errores:
    print(f'\n⚠ Errores:')
    for e in errores: print(f'  {e}')
print('\n✓ js/colores_partido.js exportado')
