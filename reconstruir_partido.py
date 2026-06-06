import pandas as pd, glob, os, re, unicodedata, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# ── Normalización de partido ─────────────────────────────────────
NORMALIZAR = {
    'PARTIDO LIBERAL COLOMBIANO':           'Partido Liberal Colombiano',
    'PARTIDO LIBERAL':                      'Partido Liberal Colombiano',
    'PARTIDO CONSERVADOR COLOMBIANO':       'Partido Conservador Colombiano',
    'PARTIDO CONSERVADOR':                  'Partido Conservador Colombiano',
    'PARTIDO DE LA U':                      'Partido de la U',
    'PARTIDO SOCIAL DE UNIDAD NACIONAL':    'Partido de la U',
    'PARTIDO SOCIAL DE UNIDAD NACIONAL  PARTIDO DE LA U': 'Partido de la U',
    'CAMBIO RADICAL':                       'Cambio Radical',
    'PARTIDO CAMBIO RADICAL':               'Cambio Radical',
    'PARTIDO CAMBIO RADICAL COLOMBIANO':    'Cambio Radical',
    'ALIANZA VERDE':                        'Alianza Verde',
    'PARTIDO ALIANZA VERDE':                'Alianza Verde',
    'PARTIDO VERDE':                        'Alianza Verde',
    'ALIANZA POR COLOMBIA':                 'Alianza Verde',
    'PARTIDO VERDE OXIGENO':                'Partido Verde Oxígeno',
    'PARTIDO VERDE OXÍGENO':                'Partido Verde Oxígeno',
    'CENTRO DEMOCRATICO':                   'Centro Democrático',
    'CENTRO DEMOCRÁTICO':                   'Centro Democrático',
    'PARTIDO CENTRO DEMOCRATICO':           'Centro Democrático',
    'PARTIDO CENTRO DEMOCRÁTICO':           'Centro Democrático',
    'CENTRO DEMOCRATICO MANO FIRME CORAZON GRANDE': 'Centro Democrático',
    'POLO DEMOCRATICO ALTERNATIVO':         'Polo Democrático Alternativo',
    'POLO DEMOCRÁTICO ALTERNATIVO':         'Polo Democrático Alternativo',
    'PARTIDO POLO DEMOCRATICO ALTERNATIVO': 'Polo Democrático Alternativo',
    'PACTO HISTORICO':                      'Pacto Histórico',
    'PACTO HISTÓRICO':                      'Pacto Histórico',
    'COALICION PACTO HISTORICO':            'Pacto Histórico',
    'COALICIÓN PACTO HISTÓRICO':            'Pacto Histórico',
    'PACTO HISTORICO BOYACA':               'Pacto Histórico',
    'PACTO HISTÓRICO BOYACÁ':               'Pacto Histórico',
    'COLOMBIA HUMANA':                      'Pacto Histórico',
    'MOVIMIENTO MIRA':                      'Movimiento MIRA',
    'PARTIDO POLITICO MIRA':                'Movimiento MIRA',
    'MOVIMIENTO INDEPENDIENTE DE RENOVACION ABSOLUTA MIRA': 'Movimiento MIRA',
    'OPCION CIUDADANA':                     'Opción Ciudadana',
    'OPCIÓN CIUDADANA':                     'Opción Ciudadana',
    'PARTIDO OPCION CIUDADANA':             'Opción Ciudadana',
    'ALIANZA SOCIAL INDEPENDIENTE':         'Alianza Social Independiente',
    'PARTIDO ALIANZA SOCIAL INDEPENDIENTE': 'Alianza Social Independiente',
    'ASI': 'Alianza Social Independiente',
    'COMUNES':                              'Comunes',
    'PARTIDO COMUNES':                      'Comunes',
    'PARTIDO FUERZA ALTERNATIVA REVOLUCIONARIA DEL COMUN': 'Comunes',
    'COLOMBIA JUSTA LIBRES':                'Colombia Justa Libres',
    'GSC COLOMBIA JUSTA LIBRES':            'Colombia Justa Libres',
    'LIGA DE GOBERNANTES':                  'Liga de Gobernantes',
    'LIGA DE GOBERNANTES ANTICORRUPCION':   'Liga de Gobernantes',
    'LIGA DE GOBERNANTES ANTICORRUPCIÓN':   'Liga de Gobernantes',
    'CENTRO ESPERANZA':                     'Centro Esperanza',
    'COALICION CENTRO ESPERANZA':           'Centro Esperanza',
    'COALICIÓN CENTRO ESPERANZA':           'Centro Esperanza',
    'COALICION ALIANZA VERDE Y CENTRO ESPERANZA': 'Centro Esperanza',
    'COALICIÓN ALIANZA VERDE Y CENTRO ESPERANZA': 'Centro Esperanza',
    'COMPROMISO CIUDADANO':                 'Centro Esperanza',
    'COALICION COLOMBIA':                   'Centro Esperanza',
    'COALICIÓN COLOMBIA':                   'Centro Esperanza',
    'EQUIPO POR COLOMBIA':                  'Equipo por Colombia',
    'COALICION EQUIPO POR COLOMBIA':        'Equipo por Colombia',
    'GRAN CONSULTA POR COLOMBIA':           'Gran Consulta por Colombia',
    'LA GRAN CONSULTA POR COLOMBIA':        'Gran Consulta por Colombia',
    'MAIS': 'MAIS',
    'MOVIMIENTO ALTERNATIVO INDIGENA Y SOCIAL  MAIS': 'MAIS',
    'MOVIMIENTO ALTERNATIVO INDIGENA Y SOCIAL MAIS': 'MAIS',
    'MOVIMIENTO ALTERNATIVO INDÍGENA Y SOCIAL MAIS': 'MAIS',
    'CREEMOS': 'Creemos',
    'PARTIDO POLITICO CREEMOS': 'Creemos',
    'MIO': 'MIO',
    'MOVIMIENTO DE INCLUSION Y OPORTUNIDADES': 'MIO',
    'NUEVO LIBERALISMO':                    'Nuevo Liberalismo',
    'PARTIDO NUEVO LIBERALISMO':            'Nuevo Liberalismo',
    'CR-NUEVO LIBERALISMO':                 'Nuevo Liberalismo',
    'UNION PATRIOTICA':                     'Unión Patriótica',
    'UNIÓN PATRIÓTICA':                     'Unión Patriótica',
    'PARTIDO UNION PATRIOTICA  UP':         'Unión Patriótica',
    'FUERZA CIUDADANA':                     'Fuerza Ciudadana',
    'MOVIMIENTO POLITICO FUERZA CIUDADANA': 'Fuerza Ciudadana',
    'DIGNIDAD Y COMPROMISO':                'Dignidad y Compromiso',
    'PARTIDO DIGNIDAD Y COMPROMISO':        'Dignidad y Compromiso',
    'SALVACION NACIONAL':                   'Salvación Nacional',
    'SALVACIÓN NACIONAL':                   'Salvación Nacional',
    'CON TODA POR COLOMBIA':                'Con Toda por Colombia',
    'VALIENTES': 'Valientes',
    'COLOMBIA RENACIENTE':                  'Colombia Renaciente',
    'TODOS SOMOS COLOMBIA':                 'Todos Somos Colombia',
    'PARTIDO SOMOS':                        'Partido Somos',
    'SOMOS REGION COLOMBIA':                'Partido Somos',
    'AICO': 'AICO',
    'SI': 'Sí', 'SÍ': 'Sí',
    'NO': 'No',
    # Junk → skip
    'VOTOS NULOS': '__SKIP__',
    'VOTOS EN BLANCO': '__SKIP__',
    'CANDIDATOS TOTALES': '__SKIP__',
    'TARJETAS NO MARCADAS': '__SKIP__',
    'VOTOS EN BLANCO INDIGENAS': '__SKIP__',
    'PROMOTORES VOTO EN BLANCO': '__SKIP__',
}

CANDIDATOS_MAP = {
    'JUAN MANUEL SANTOS CALDERON':          'Partido de la U',
    'AURELIJUS RUTENIS ANTANAS MOCKUS SIVICKAS': 'Alianza Verde',
    'ANTANAS MOCKUS SIVICKAS':              'Alianza Verde',
    'OSCAR IVAN ZULUAGA ESCOBAR':           'Centro Democrático',
    'MARTHA LUCIA RAMIREZ DE RINCON':       'Partido Conservador Colombiano',
    'CLARA EUGENIA LOPEZ OBREGON':          'Polo Democrático Alternativo',
    'ENRIQUE PENALOSA LONDONO':             'Alianza Verde',
    'IVAN DUQUE MARQUEZ':                   'Centro Democrático',
    'SERGIO FAJARDO VALDERRAMA':            'Centro Esperanza',
    'HUMBERTO DE LA CALLE LOMBANA':         'Partido Liberal Colombiano',
    'JORGE ANTONIO TRUJILLO SARMIENTO':     'Todos Somos Colombia',
    'VIVIANE ALEIDA MORALES HOYOS':         'Partido Somos',
    'RODOLFO HERNANDEZ SUAREZ':             'Liga de Gobernantes',
    'RODOLFO HERNANDEZ':                    'Liga de Gobernantes',
    'FEDERICO GUTIERREZ ZULUAGA':           'Equipo por Colombia',
    'FEDERICO GUTIERREZ':                   'Equipo por Colombia',
    'ENRIQUE GOMEZ MARTINEZ':               'Salvación Nacional',
    'ABELARDO DE LA ESPRIELLA OSORIO':      'Salvación Nacional',
    'ABELARDO DE LA ESPRIELLA':             'Salvación Nacional',
    'JUAN DANIEL OVIEDO ARANGO':            'Con Toda por Colombia',
    'JUAN DANIEL OVIEDO':                   'Con Toda por Colombia',
    'VICKY DAVILA HOYOS':                   'Valientes',
    'VICTORIA EUGENIA DAVILA HOYOS':        'Valientes',
    'OLMEDO VARGAS HERNANDEZ':              'Colombia Renaciente',
    'OLMEDO VARGAS':                        'Colombia Renaciente',
    'JAIRO CRISTO CORREA':                  'Partido de la U',
    'JAIRO CRISTO':                         'Partido de la U',
    'PALOMA ANDREA VALENCIA LASERNA':       'Centro Democrático',
    'PALOMA VALENCIA LASERNA':              'Centro Democrático',
    # Gobernación Boyacá
    'JUAN CARLOS GRANADOS BECERRA':         'Partido de la U',
    'CARLOS ANDRES AMAYA RODRIGUEZ':        'Alianza Verde',
    'OSMAN HIPOLITO ROA SARMIENTO':         'Cambio Radical',
    'CESAR AUGUSTO PACHON ACHURY':          'MAIS',
    'GONZALO GUARIN VIVAS':                 'Centro Democrático',
    'JUAN DE JESUS CORDOBA SUAREZ':         'Partido Conservador Colombiano',
    'RAMIRO BARRAGAN ADAME':                'Alianza Verde',
    'RAMIRO BARRAGÁN ADAME':                'Alianza Verde',
    'JONATAN SANCHEZ':                      'Centro Democrático',
    'JONATÁN SÁNCHEZ':                      'Centro Democrático',
    'JONATAN ANDRES SANCHEZ CUBIDES':       'Centro Democrático',
    'JOSE GIOVANY PINZON BAEZ':             'MAIS',
    'JOSÉ GIOVANY PINZÓN BÁEZ':             'MAIS',
    'RODRIGO ARTURO ROJAS':                 'Partido Liberal Colombiano',
    'GIOVANNY PINZON':                      'Pacto Histórico',
    'GIOVANNY PINZÓN':                      'Pacto Histórico',
}

# Normalización de municipios (fix Paz de Rio)
MUN_FIX = {
    'PAZ DEL RIO':  'PAZ DE RIO',
    'PAZ DEL RÍO':  'PAZ DE RIO',
    'PAZ DE RÍO':   'PAZ DE RIO',
}

def strip_accents(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s)
                   if unicodedata.category(c) != 'Mn')

def norm_str(s):
    return re.sub(r'\s+', ' ', strip_accents(str(s)).upper().strip())

def normalizar_partido(par_raw, cand_raw=''):
    # 1. Por nombre de candidato
    if cand_raw:
        cu = norm_str(cand_raw)
        for k, v in CANDIDATOS_MAP.items():
            if norm_str(k) == cu:
                return v

    # 2. Por nombre/código de partido
    pu = norm_str(par_raw)

    # Lookup directo
    if pu in NORMALIZAR:
        r = NORMALIZAR[pu]
        return None if r == '__SKIP__' else r

    # Separador de coalición → primer partido reconocido
    if re.search(r'[-;]', pu):
        partes = re.split(r'\s*[-;]\s+|\s+-\s*', pu)
        pfx = r'^(COALICION|COALICIÓN|PARTIDO|PARTIDOS|MOVIMIENTO|GSC)\s+'
        for parte in partes:
            p = re.sub(pfx, '', parte.strip())
            p2 = re.sub(pfx, '', pu)
            for clave in [p, p2]:
                if clave in NORMALIZAR and NORMALIZAR[clave] != '__SKIP__':
                    return NORMALIZAR[clave]

    # Código numérico → None (omitir)
    if re.match(r'^\d+$', pu):
        return None

    # Desconocido → preservar capitalizado limpio
    return str(par_raw).strip() if str(par_raw).strip() else None

def norm_mun(s):
    u = norm_str(s)
    return MUN_FIX.get(u, u)

# ── Reconstrucción ───────────────────────────────────────────────
candidato_files = sorted(glob.glob(
    'data/**/votos_candidato_*.csv', recursive=True))

reconstruidos, errores = 0, []

for f_cand in candidato_files:
    f_part = f_cand.replace('votos_candidato_', 'votos_partido_')
    if not os.path.exists(f_part):
        continue
    try:
        dc = pd.read_csv(f_cand, encoding='utf-8', low_memory=False, on_bad_lines='skip')

        col_par  = next((c for c in dc.columns
                         if 'PARNOMBRE' in c.upper()
                         or c.upper() == 'PARTIDO'), None)
        col_cand = next((c for c in dc.columns
                         if 'CANTNOMBRE' in c.upper()
                         or ('CAND' in c.upper()
                             and 'NOMBRE' in c.upper())), None)
        col_mun  = next((c for c in dc.columns
                         if 'MUNNOMBRE' in c.upper()
                         or ('MUN' in c.upper()
                             and 'NOMBRE' in c.upper())), None)
        col_vot  = next((c for c in dc.columns
                         if 'TOTALVOT' in c.upper()), None) or \
                   next((c for c in dc.columns
                         if 'TOTAL' in c.upper()
                         and 'VOT' in c.upper()), None) or \
                   next((c for c in dc.columns
                         if 'VOT' in c.upper()), None)

        if not all([col_par, col_mun, col_vot]):
            errores.append(f"Columnas faltantes: {os.path.basename(f_cand)}")
            continue

        # Normalizar partido y municipio
        dc['_partido'] = dc.apply(
            lambda r: normalizar_partido(
                r[col_par]  if col_par  else '',
                r[col_cand] if col_cand else ''
            ), axis=1
        )
        dc['_mun'] = dc[col_mun].apply(norm_mun)
        dc[col_vot] = pd.to_numeric(dc[col_vot], errors='coerce').fillna(0)

        # Eliminar junk
        dc = dc[dc['_partido'].notna()]

        # Agregar por municipio + partido (elimina duplicados de casing)
        agg = (dc.groupby(['_mun', '_partido'])[col_vot]
                 .sum()
                 .reset_index())
        agg.columns = ['MUNNOMBRE', 'PARNOMBRE', 'TOTALVOTOSVALIDOS']

        # Calcular PORCENTAJE por municipio
        total_mun = agg.groupby('MUNNOMBRE')['TOTALVOTOSVALIDOS'].transform('sum')
        agg['PORCENTAJE'] = (
            agg['TOTALVOTOSVALIDOS'] / total_mun * 100
        ).round(2)
        agg['PORCENTAJE'] = agg['PORCENTAJE'].fillna(0)

        agg.to_csv(f_part, index=False, encoding='utf-8')
        reconstruidos += 1

        # Verificación rápida
        n_sin_id = (agg['PARNOMBRE'] == 'Partido sin identificar').sum()
        print(f"✓ {os.path.basename(f_part)} "
              f"| {len(agg)} filas "
              f"| sin_identificar: {n_sin_id}")

    except Exception as e:
        errores.append(f"{os.path.basename(f_cand)}: {e}")
        import traceback; traceback.print_exc()

print(f"\n{'='*55}")
print(f"Reconstruidos: {reconstruidos}")
if errores:
    print(f"Errores ({len(errores)}):")
    for e in errores: print(f"  {e}")

# Verificación de casos críticos
print("\n── Verificación Duitama ──")
casos = [
    ('data/2015/votos_partido_municipio_2015_alcalde.csv',   'DUITAMA'),
    ('data/2018/votos_partido_municipio_2018_senado.csv',    'DUITAMA'),
    ('data/2019/votos_partido_municipio_2019_gobernador.csv','DUITAMA'),
]
for f, mun in casos:
    try:
        df = pd.read_csv(f, encoding='utf-8')
        sub = df[df['MUNNOMBRE']==mun].sort_values(
              'TOTALVOTOSVALIDOS', ascending=False)
        print(f"\n{os.path.basename(f)} — {mun}:")
        print(sub[['PARNOMBRE','TOTALVOTOSVALIDOS','PORCENTAJE']]
              .head(6).to_string(index=False))
    except Exception as e:
        print(f"  ERROR {f}: {e}")
