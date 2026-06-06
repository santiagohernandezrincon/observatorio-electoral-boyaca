"""
reconstruir_partido.py
Post-procesa votos_candidato_municipio_*.csv: re-asigna PARNOMBRE
usando CANDIDATOS_MAP año-consciente y regenera votos_partido_*.csv.
Ejecutar después de procesar_raw.py y antes de normalizar_partidos.py.
"""
import re
import sys
import unicodedata
import pandas as pd
from pathlib import Path

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE = Path(__file__).resolve().parent.parent
DATA = BASE / 'data'

EXCLUIR = {
    'CANDIDATOS TOTALES', 'VOTOS EN BLANCO', 'VOTOS NO MARCADOS', 'VOTOS NULOS',
    'VOTOS EN BLANCO TERRITORIAL', 'VOTOS NO MARCADOS TERRITORIAL',
    'VOTOS NULOS TERRITORIAL', 'TARJETAS NO MARCADAS',
    'RETIRADO', 'RETIRADO (A)', 'RETIRADO(A)', 'CANDIDATO RETIRADO',
}


def norm_str(s):
    """Mayúsculas, sin tildes, sin espacios extra."""
    if not s:
        return ''
    try:
        if pd.isna(s):
            return ''
    except TypeError:
        pass
    s = str(s).upper().strip()
    s = unicodedata.normalize('NFKD', s)
    s = ''.join(c for c in s if not unicodedata.combining(c))
    return re.sub(r'\s+', ' ', s).strip()


# ── CANDIDATOS_MAP: (año_str, nombre_norm) → partido ─────────────────────────
CANDIDATOS_MAP = {
    # PRESIDENCIA
    ('2010', 'JUAN MANUEL SANTOS CALDERON'):              'Partido de la U',
    ('2010', 'AURELIJUS RUTENIS ANTANAS MOCKUS SIVICKAS'): 'Alianza Verde',
    ('2010', 'GERMAN VARGAS LLERAS'):                      'Cambio Radical',
    ('2010', 'GUSTAVO FRANCISCO PETRO URREGO'):            'Polo Democrático Alternativo',
    ('2010', 'MARTA NOEMI DEL ESPIRITU SANTO SANIN POSADA DE RUBIO'):
                                                'Partido Conservador Colombiano',
    ('2010', 'RAFAEL PARDO RUEDA'):             'Partido Liberal Colombiano',
    ('2014', 'JUAN MANUEL SANTOS CALDERON'):    'Partido de la U',
    ('2014', 'OSCAR IVAN ZULUAGA ESCOBAR'):     'Centro Democrático',
    ('2014', 'MARTHA LUCIA RAMIREZ DE RINCON'): 'Partido Conservador Colombiano',
    ('2014', 'CLARA EUGENIA LOPEZ OBREGON'):    'Polo Democrático Alternativo',
    ('2014', 'ENRIQUE PENALOSA LONDONO'):       'Alianza Verde',
    ('2018', 'IVAN DUQUE MARQUEZ'):             'Centro Democrático',
    ('2018', 'GUSTAVO FRANCISCO PETRO URREGO'): 'Pacto Histórico',
    ('2018', 'SERGIO FAJARDO VALDERRAMA'):      'Centro Esperanza',
    ('2018', 'HUMBERTO DE LA CALLE LOMBANA'):   'Partido Liberal Colombiano',
    ('2018', 'GERMAN VARGAS LLERAS'):           'Cambio Radical',
    ('2018', 'JORGE ANTONIO TRUJILLO SARMIENTO'): 'Todos Somos Colombia',
    ('2018', 'VIVIANE ALEIDA MORALES HOYOS'):   'Partido Somos',
    ('2022', 'GUSTAVO FRANCISCO PETRO URREGO'): 'Pacto Histórico',
    ('2022', 'RODOLFO HERNANDEZ SUAREZ'):       'Liga de Gobernantes',
    ('2022', 'FEDERICO GUTIERREZ ZULUAGA'):     'Equipo por Colombia',
    ('2026', 'ENRIQUE GOMEZ MARTINEZ'):         'Salvación Nacional',
    ('2026', 'ABELARDO DE LA ESPRIELLA OSORIO'): 'Salvación Nacional',
    ('2026', 'JUAN DANIEL OVIEDO ARANGO'):      'Con Toda por Colombia',
    ('2026', 'VICKY DAVILA HOYOS'):             'Valientes',
    ('2026', 'VICTORIA EUGENIA DAVILA HOYOS'):  'Valientes',
    ('2026', 'OLMEDO VARGAS HERNANDEZ'):        'Colombia Renaciente',
    ('2026', 'JAIRO CRISTO CORREA'):            'Partido de la U',
    ('2026', 'PALOMA ANDREA VALENCIA LASERNA'): 'Centro Democrático',
    # GOBERNACIÓN BOYACÁ
    ('2011', 'JUAN CARLOS GRANADOS BECERRA'):   'Partido de la U',
    ('2015', 'CARLOS ANDRES AMAYA RODRIGUEZ'):  'Alianza Verde',
    ('2015', 'OSMAN HIPOLITO ROA SARMIENTO'):   'Cambio Radical',
    ('2015', 'CESAR AUGUSTO PACHON ACHURY'):    'MAIS',
    ('2015', 'GONZALO GUARIN VIVAS'):           'Centro Democrático',
    ('2015', 'JUAN DE JESUS CORDOBA SUAREZ'):   'Partido Conservador Colombiano',
    ('2019', 'RAMIRO BARRAGAN ADAME'):          'Alianza Verde',
    ('2019', 'JONATAN ANDRES SANCHEZ CUBIDES'):  'Centro Democrático',
    ('2019', 'JOSE GIOVANY PINZON BAEZ'):       'MAIS',
    ('2019', 'OLMEDO VARGAS HERNANDEZ'):        'Colombia Renaciente',
    ('2023', 'RODRIGO ARTURO ROJAS'):           'Partido Liberal Colombiano',
    ('2023', 'GIOVANNY PINZON'):                'Pacto Histórico',
    # ALCALDÍA DUITAMA
    ('2011', 'CONSTANZA ISABEL RAMIREZ ACEVEDO'): 'Partido de la U',
    ('2015', 'ALFONSO MIGUEL SILVA PESCA'):        'Partido Conservador Colombiano',
    ('2019', 'CONSTANZA ISABEL RAMIREZ ACEVEDO'): 'Cambio Radical',
    # ALCALDÍAS 2015 — verificado por Santiago Hernández, politólogo boyacense
    ('2015', 'PABLO EMILIO CEPEDA NOVOA'):          'Cambio Radical',
    ('2015', 'GILBERTO RONDON GONZALEZ'):           'Partido Liberal Colombiano',
    ('2015', 'LUIS EDUARDO RODRIGUEZ PEREZ'):       'Partido de la U',
    # ALCALDÍAS 2011
    ('2011', 'VIRGILIO FARFAN ROJAS'):              'Movimiento Ciudadano',
    ('2015', 'OSCAR FERNANDO BOTERO ALZATE'):       'Partido Conservador Colombiano',
    ('2015', 'YAMIT NOE HURTADO NEIRA'):            'Alianza Verde',
    ('2015', 'WILSON CASTIBLANCO GIL'):             'Partido de la U',
    ('2015', 'ENRIQUE JAVIER CAMARGO VALENCIA'):    'Alianza Social Independiente',
    ('2015', 'WILMAR ANCISAR TRIANA GONZALEZ'):     'Cambio Radical',
    ('2015', 'WILMAR ANCIZAR TRIANA GONZALEZ'):     'Cambio Radical',
    ('2015', 'LEONARDO JONHY PATINO QUIJANO'):      'Cambio Radical',
    ('2015', 'LUIS HERNANDO CALIXTO PAIPA'):        'Cambio Radical',
    ('2015', 'CARLOS JULIO MELO ALDANA'):           'Partido de la U',
    ('2015', 'MARIO ERNESTO OCHOA PLAZAS'):         'Cambio Radical',
    ('2015', 'NELSON BOHORQUEZ OTALORA'):           'Partido Conservador Colombiano',
    ('2015', 'LUIS ALEJANDRO MILLAN DIAZ'):         'Cambio Radical',
    ('2015', 'ELIN JOSE BOHORQUEZ ARIZA'):          'Cambio Radical',
    ('2015', 'LISSETH CAROLINA TORRES MANCHEGO'):   'Partido de la U',
    ('2015', 'ZAMIR SOTELO MONROY'):                'Alianza Verde',
    ('2015', 'HUGO ALEXANDER REYES PARRA'):         'Partido Liberal Colombiano',
    ('2015', 'ISAIAS NEIRA RIOS'):                  'Partido Liberal Colombiano',
    ('2015', 'JOSE DEL CARMEN DELGADO ZARATE'):     'Cambio Radical',
    ('2015', 'JOSE DEL DELGADO ZARATE'):            'Cambio Radical',
    ('2015', 'WILMER YAIR CASTELLANOS HERNANDEZ'):  'Cambio Radical',
    ('2015', 'JUSTO PASTOR RODRIGUEZ HERRERA'):     'Alianza Social Independiente',
    ('2015', 'HERIBERTO SUAREZ MUNOZ'):             'Partido de la U',
    ('2015', 'JORGE ALBERTO HURTADO LEON'):         'Cambio Radical',
    ('2015', 'JUAN JOSE SUAREZ OTALORA'):           'Partido de la U',
    ('2015', 'JOSUE JAVIER CASTELLANOS MORALES'):   'Alianza Verde',
    ('2015', 'MILTON OSWALDO FERNANDEZ ALFONSO'):   'Partido de la U',
    ('2015', 'FREDY ALEXANDER HOLGUIN RUIZ'):       'Cambio Radical',
    ('2015', 'SEGUNDO JACINTO PEREZ ARCHILA'):      'Movimiento Ciudadano',
    ('2015', 'NIDIA CAROLINA PUENTES AGUILAR'):     'Partido Conservador Colombiano',
    ('2015', 'JULIO CESAR NEIRA CASTRO'):           'Partido Liberal Colombiano',
    ('2015', 'ALBEIRO ACOSTA RENDON'):              'Partido de la U',
    ('2015', 'REYES BERNARDO PEREZ ALVAREZ'):       'Cambio Radical',
    ('2015', 'LUIS CARLOS CHIA HERNANDEZ'):         'Partido de la U',
    ('2015', 'JHON ALEXANDER LOPEZ MENDOZA'):       'Partido Conservador Colombiano',
    ('2015', 'HENRY ARGUELLO RINCON'):              'Centro Democrático',
    ('2015', 'VICTOR HUGO SILVA MOTTA'):            'Partido Liberal Colombiano',
    ('2015', 'WILLINTON EDUARDO PULIDO IBANEZ'):    'Partido Liberal Colombiano',
    ('2015', 'VLADIMIR RISCANEVO POBLADOR'):        'Movimiento Ciudadano',
    ('2015', 'FABIO FIGUEROA JIMENEZ'):             'Cambio Radical',
    ('2015', 'JAVIER ORLANDO SUESCUN CARDENAS'):    'Centro Democrático',
    ('2015', 'JAIRO GRIJALBA LANCHEROS'):           'Centro Democrático',
    ('2015', 'ERIVERTO CRUZ RIANO'):                'Partido Liberal Colombiano',
    ('2015', 'ANGELA PATRICIA AVILA HAMON'):        'Movimiento Ciudadano',
    ('2015', 'JORGE EDICSON SAAVEDRA VELASCO'):     'Movimiento Ciudadano',
    ('2015', 'NELSON HUMBERTO MELGAREJO ANGARITA'): 'Partido de la U',
    ('2015', 'EDUARDO VEGA GUERRERO'):              'Alianza Verde',
    ('2015', 'FRANCISCO DIAZ BONILLA'):             'Alianza Verde',
    ('2015', 'YAMITH RODRIGO RODRIGUEZ LOPEZ'):     'Partido Conservador Colombiano',
    ('2015', 'MAURICIO NEISA ALVARADO'):            'Cambio Radical',
    ('2015', 'JOSE FERNANDO MORALES ACUNA'):        'Partido Conservador Colombiano',
    ('2015', 'EDWIN JAVIER MANRIQUE GUERRERO'):     'Cambio Radical',
    ('2015', 'FELICIANO HERNANDEZ MORENO'):         'Partido de la U',
    ('2015', 'JUAN EVANGELISTA FARFAN CORZO'):      'Opción Ciudadana',
    ('2015', 'JAIME ENRIQUE GALVIS HERNANDEZ'):     'Centro Democrático',
    ('2015', 'CARLOS ALBERTO ACEVEDO VELASQUEZ'):   'Centro Democrático',
    ('2015', 'RUBEN SANCHEZ NINO'):                 'Alianza Verde',
    ('2015', 'WILLIAM CAMILO BARRETO GONZALEZ'):    'Centro Democrático',
    ('2015', 'NAUL ALBEIRO VEGA VEGA'):             'Partido Conservador Colombiano',
    ('2015', 'MARCO AURELIO NINO CHAPARRO'):        'Cambio Radical',
    ('2015', 'ALVARO HENRY BARRERA DIAZ'):          'Movimiento Ciudadano',
    ('2015', 'HECTOR MIGUEL MOJICA MOJICA'):        'Alianza Social Independiente',
    ('2015', 'FRANKY ARIEL FONSECA SALAMANCA'):     'Cambio Radical',
    ('2015', 'JAVIER ARMANDO ROJAS CUERVO'):        'Partido Conservador Colombiano',
    ('2015', 'JAIRO CESAR FUQUENE RAMOS'):          'Movimiento Ciudadano',
    ('2015', 'JOSE DEL CARMEN BARRERA PASTRANA'):   'Partido Liberal Colombiano',
    ('2015', 'JOSE DEL BARRERA PASTRAN'):           'Partido Liberal Colombiano',
    ('2015', 'LUIS CARLOS CRISTANCHO GUERRERO'):    'Alianza Verde',
    ('2015', 'LUIS ENRIQUE GIL VARGAS'):            'Partido de la U',
    ('2015', 'JAVIER ADRIANO SANABRIA SUAREZ'):     'Cambio Radical',
    ('2015', 'EDBERTO JOSE JAIME COCUNUBO'):        'Partido de la U',
    ('2015', 'ELKIN ALEJANDRO RINCON SALAMANCA'):   'Movimiento Ciudadano',
    ('2015', 'WILMAR JULIAN RINCON MARINO'):        'Movimiento Ciudadano',
    ('2015', 'EDGAR ANTONIO MORENO CHAPARRO'):      'Movimiento Ciudadano',
    ('2015', 'CARLOS AUGUSTO SALINAS MEDINA'):      'Movimiento Ciudadano',
    ('2015', 'DANIEL LOPEZ VALLEJO'):               'Movimiento Ciudadano',
    ('2015', 'JAVIER CRISTOBAL RODRIGUEZ TORRES'):  'Partido Conservador Colombiano',
    ('2015', 'YUBER ALEXANDER FAGUA CONTRERAS'):    'Alianza Verde',
    ('2015', 'JULIO ALBERTO MOLANO BOLIVAR'):       'Opción Ciudadana',
    ('2015', 'RICARDO SALAMANCA ALVAREZ'):          'Movimiento Ciudadano',
}

# ── NORMALIZACION: nombre_raw (o variante) → partido canónico ─────────────────
NORMALIZACION = {
    # Partido Liberal
    'PARTIDO LIBERAL COLOMBIANO':       'Partido Liberal Colombiano',
    'PARTIDO LIBERAL':                  'Partido Liberal Colombiano',
    'LIBERAL':                          'Partido Liberal Colombiano',
    # Partido Conservador
    'PARTIDO CONSERVADOR COLOMBIANO':   'Partido Conservador Colombiano',
    'PARTIDO CONSERVADOR':              'Partido Conservador Colombiano',
    'CONSERVADOR':                      'Partido Conservador Colombiano',
    # Partido de la U
    'PARTIDO SOCIAL DE UNIDAD NACIONAL': 'Partido de la U',
    'PARTIDO DE LA U':                  'Partido de la U',
    'DE LA U':                          'Partido de la U',
    # Cambio Radical
    'CAMBIO RADICAL':                   'Cambio Radical',
    'PARTIDO CAMBIO RADICAL':           'Cambio Radical',
    'PARTIDO CAMBIO RADICAL COLOMBIANO': 'Cambio Radical',
    # Alianza Verde
    'PARTIDO VERDE':                    'Alianza Verde',
    'ALIANZA VERDE':                    'Alianza Verde',
    'PARTIDO ALIANZA VERDE':            'Alianza Verde',
    'COALICION COLOMBIA':               'Alianza Verde',
    'COMPROMISO CIUDADANO':             'Alianza Verde',
    'MOVIMIENTO COMPROMISO CIUDADANO':  'Alianza Verde',
    # Centro Democrático
    'CENTRO DEMOCRATICO':               'Centro Democrático',
    'PARTIDO CENTRO DEMOCRATICO':       'Centro Democrático',
    'CENTRO DEMOCRATICO MANO FIRME CORAZON GRANDE': 'Centro Democrático',
    # Pacto Histórico / Colombia Humana
    'COLOMBIA HUMANA':                  'Pacto Histórico',
    'COLOMBIA HUMANA - UP':             'Pacto Histórico',
    'MOVIMIENTO COLOMBIA HUMANA':       'Pacto Histórico',
    'PACTO HISTORICO':                  'Pacto Histórico',
    'PACTO HISTORICO COLOMBIA PUEDE':   'Pacto Histórico',
    'PACTO HISTORICO BOYACA':           'Pacto Histórico',
    'EN MARCHA':                        'Pacto Histórico',
    'AGRUPACION POLITICA EN MARCHA':    'Pacto Histórico',
    # Polo Democrático
    'POLO DEMOCRATICO ALTERNATIVO':     'Polo Democrático Alternativo',
    'POLO DEMOCRATICO':                 'Polo Democrático Alternativo',
    'PDA':                              'Polo Democrático Alternativo',
    # Opción Ciudadana / PIN
    'OPCION CIUDADANA':                 'Opción Ciudadana',
    'PARTIDO DE INTEGRACION NACIONAL':  'Opción Ciudadana',
    'PIN':                              'Opción Ciudadana',
    'CONVERGENCIA CIUDADANA':           'Opción Ciudadana',
    # MIRA
    'MOVIMIENTO MIRA':                  'Movimiento MIRA',
    'MIRA':                             'Movimiento MIRA',
    'MOVIMIENTO DE INTEGRACION Y RENOVACION': 'Movimiento MIRA',
    # ASI
    'ALIANZA SOCIAL INDEPENDIENTE':     'Alianza Social Independiente',
    'ALIANZA SOCIAL INDIGENA':          'Alianza Social Independiente',
    'ASI':                              'Alianza Social Independiente',
    'PARTIDO ALIANZA SOCIAL INDEPENDIENTE': 'Alianza Social Independiente',
    # MAIS
    'MOVIMIENTO ALTERNATIVO INDIGENA Y SOCIAL  MAIS': 'MAIS',
    'MOVIMIENTO ALTERNATIVO INDIGENA Y SOCIAL MAIS':  'MAIS',
    'MOVIMIENTO ALTERNATIVO INDIGENA Y SOCIAL':       'MAIS',
    'MAIS - POLO':                      'MAIS',
    # AICO
    'MOVIMIENTO AUTORIDADES INDIGENAS DE COLOMBIA': 'AICO',
    'AICO':                             'AICO',
    # Centro Esperanza
    'CENTRO ESPERANZA':                 'Centro Esperanza',
    # Equipo por Colombia
    'EQUIPO POR COLOMBIA':              'Equipo por Colombia',
    'COALICION EQUIPO POR COLOMBIA':    'Equipo por Colombia',
    # Liga de Gobernantes
    'LIGA DE GOBERNANTES ANTICORRUPCION': 'Liga de Gobernantes',
    # Colombia Justa Libres
    'COLOMBIA JUSTA LIBRES':            'Colombia Justa Libres',
    # Comunes / FARC
    'FARC':                             'Comunes',
    'PARTIDO COMUNES':                  'Comunes',
    # Nuevo Liberalismo
    'NUEVO LIBERALISMO':                'Nuevo Liberalismo',
    'PARTIDO NUEVO LIBERALISMO':        'Nuevo Liberalismo',
    # Unión Patriótica
    'UNION PATRIOTICA':                 'Unión Patriótica',
    # Fuerza Ciudadana
    'FUERZA CIUDADANA':                 'Fuerza Ciudadana',
    'MOVIMIENTO POLITICO FUERZA CIUDADANA': 'Fuerza Ciudadana',
    # Creemos
    'CREEMOS':                          'Creemos',
    'PARTIDO POLITICO CREEMOS':         'Creemos',
    # Colombia Renaciente
    'COLOMBIA RENACIENTE':              'Colombia Renaciente',
    # ── Coaliciones 2023 Asamblea ──────────────────────────────────────────────
    'COALICION U - EN MARCHA - MIRA':   'Partido de la U',
    'COALICION U - EN MARCHA':          'Partido de la U',
    'U - EN MARCHA - MIRA':             'Partido de la U',
    'RESULTADOS PARA BOYACA':           'Partido Liberal Colombiano',
    'RESULTADOS PARA BOYACÁ':           'Partido Liberal Colombiano',
    # ── Movimientos ciudadanos GSC 2015 ────────────────────────────────────────
    'G.S.C. SOGAMOSO ACTIVA':                                'Movimiento Ciudadano',
    'GSC SOGAMOSO ACTIVA':                                   'Movimiento Ciudadano',
    'G.S.C. COALICION IDEAS NUEVAS':                         'Movimiento Ciudadano',
    'G.S.C SOMOS BUENAVISTA':                                'Movimiento Ciudadano',
    'G.S.C. UNIDOS DEJAREMOS HUELLA':                        'Movimiento Ciudadano',
    'G.S.C. UN BUEN GOBIERNO ES MI COMPROMISO CON EL PUEBLO':'Movimiento Ciudadano',
    'G.S.C. GESTION Y BUEN GOBIERNO':                        'Movimiento Ciudadano',
    'G.S.C MARCANDO LA DIFERENCIA':                          'Movimiento Ciudadano',
    'GSC. UNIDOS DE GACHANTIVA':                             'Movimiento Ciudadano',
    'G.S.C. SI HAY CAMPO PARA TODOS':                        'Movimiento Ciudadano',
    'G.S.C. COALICION POR EL PROGRESO Y DESARROLLO':         'Movimiento Ciudadano',
    'G.S.C. AHORA DI TODOS POR EL CAMBIO':                   'Movimiento Ciudadano',
    'G.S.C. NUEVAS IDEAS PARA UN MEJOR FUTURO':              'Movimiento Ciudadano',
    'G.S.C RENOVACION Y CAMBIO PARA CONSTRUIR FUTURO':       'Movimiento Ciudadano',
    # ── Administrativos ────────────────────────────────────────────────────────
    'SIN PARTIDO':                      None,
    'SIN NOMBRE':                       None,
    'CANDIDATOS TOTALES':               None,
    'CANDIDATURA NO ACEPTADA':          None,
    'REVOCADO (A)':                     None,
}


def normalizar_partido(par_raw, cand_raw='', anio=''):
    """
    1. Candidato + año  (CANDIDATOS_MAP, más confiable)
    2. Candidato sin año (fallback)
    3. Nombre/alias de partido (NORMALIZACION)
    """
    if pd.isna(par_raw) or str(par_raw).strip() in ('', 'nan', 'NaN'):
        return None

    # 1. Por candidato + año
    if cand_raw and anio:
        cu = norm_str(cand_raw)
        clave = (str(anio), cu)
        if clave in CANDIDATOS_MAP:
            return CANDIDATOS_MAP[clave]

    # 2. Por candidato sin año (primer match)
    if cand_raw:
        cu = norm_str(cand_raw)
        for (a, n), v in CANDIDATOS_MAP.items():
            if norm_str(n) == cu:
                return v

    # 3. Por nombre/alias de partido
    par_str = str(par_raw).strip()
    par_up  = norm_str(par_str)
    for alias, canonico in NORMALIZACION.items():
        if norm_str(alias) == par_up:
            return canonico

    return par_str


def sep(n=60):
    print('─' * n)


def procesar_archivo(f_cand, anio_actual):
    dc = pd.read_csv(str(f_cand), sep=';', encoding='utf-8', low_memory=False, dtype=str)

    col_mun  = next((c for c in dc.columns if 'MUN'  in c.upper()), None)
    col_par  = next((c for c in dc.columns if 'PAR'  in c.upper()), None)
    col_cand = next((c for c in dc.columns if 'CANN' in c.upper()), None)
    col_vot  = next((c for c in dc.columns if c.upper() == 'VOTOS'), None)

    if not col_par:
        print(f"  ⚠ Sin columna PARNOMBRE en {f_cand.name}")
        return

    # Re-asignar PARNOMBRE con lookup año-consciente
    dc['_par_nuevo'] = dc.apply(
        lambda r: normalizar_partido(
            r[col_par]  if col_par  else '',
            r[col_cand] if col_cand else '',
            anio=anio_actual,
        ), axis=1
    )

    dc[col_par] = dc['_par_nuevo']
    dc.drop(columns=['_par_nuevo'], inplace=True)

    # Filtrar filas sin partido válido o con nombre excluido
    mask_ok = ~dc[col_par].apply(lambda x: str(x).upper() in EXCLUIR or pd.isna(x) or str(x).strip() in ('', 'None'))
    if col_cand:
        mask_ok &= ~dc[col_cand].apply(lambda x: str(x).upper() in EXCLUIR)
    dc = dc[mask_ok].copy()

    dc.to_csv(str(f_cand), sep=';', index=False, encoding='utf-8')
    print(f"  ✅ {f_cand.name}  ({len(dc)} filas)")

    # Reconstruir votos_partido
    if not all([col_mun, col_par, col_vot]):
        print(f"  ⚠ Columnas insuficientes para reconstruir votos_partido de {f_cand.name}")
        return

    dc[col_vot] = pd.to_numeric(dc[col_vot], errors='coerce').fillna(0)
    grp = (dc.groupby([col_mun, col_par], as_index=False)[col_vot]
             .sum()
             .sort_values([col_mun, col_vot], ascending=[True, False]))
    grp.columns = ['MUNNOMBRE', 'PARNOMBRE', 'VOTOS']
    totales = grp.groupby('MUNNOMBRE')['VOTOS'].transform('sum')
    grp['TOTAL_VOTOS'] = totales
    grp['PORCENTAJE']  = (grp['VOTOS'] / grp['TOTAL_VOTOS'] * 100).round(6)

    nombre = f_cand.name
    m = re.search(r'votos_candidato_municipio_(\d{4})_(.+)\.csv', nombre)
    if not m:
        return
    f_partido = DATA / f'votos_partido_municipio_{m.group(1)}_{m.group(2)}.csv'
    grp.to_csv(str(f_partido), sep=';', index=False, encoding='utf-8')
    print(f"  ✅ {f_partido.name}  ({len(grp)} filas)")


def main():
    archivos = sorted(DATA.glob('votos_candidato_municipio_*.csv'))
    if not archivos:
        print("⚠ No se encontraron archivos votos_candidato_municipio_*.csv")
        return

    for f_cand in archivos:
        m = re.search(r'_(\d{4})_', f_cand.name)
        anio_actual = m.group(1) if m else ''
        sep()
        print(f"  {f_cand.name}  →  año {anio_actual}")
        procesar_archivo(f_cand, anio_actual)

    sep()
    print("✅ Reconstrucción completada.")


if __name__ == '__main__':
    main()
