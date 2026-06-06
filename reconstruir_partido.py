import pandas as pd, glob, os, re, unicodedata, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

NORMALIZAR = {
    'PARTIDO LIBERAL COLOMBIANO': 'Partido Liberal Colombiano',
    'PARTIDO LIBERAL': 'Partido Liberal Colombiano',
    'PARTIDO CONSERVADOR COLOMBIANO': 'Partido Conservador Colombiano',
    'PARTIDO CONSERVADOR': 'Partido Conservador Colombiano',
    'PARTIDO DE LA U': 'Partido de la U',
    'PARTIDO SOCIAL DE UNIDAD NACIONAL': 'Partido de la U',
    'PARTIDO SOCIAL DE UNIDAD NACIONAL  PARTIDO DE LA U': 'Partido de la U',
    'CAMBIO RADICAL': 'Cambio Radical',
    'PARTIDO CAMBIO RADICAL': 'Cambio Radical',
    'PARTIDO CAMBIO RADICAL COLOMBIANO': 'Cambio Radical',
    'ALIANZA VERDE': 'Alianza Verde',
    'PARTIDO ALIANZA VERDE': 'Alianza Verde',
    'PARTIDO VERDE': 'Alianza Verde',
    'ALIANZA POR COLOMBIA': 'Alianza Verde',
    'PARTIDO VERDE OXIGENO': 'Partido Verde Oxigeno',
    'PARTIDO VERDE OXIGENO': 'Partido Verde Oxigeno',
    'CENTRO DEMOCRATICO': 'Centro Democratico',
    'PARTIDO CENTRO DEMOCRATICO': 'Centro Democratico',
    'CENTRO DEMOCRATICO MANO FIRME CORAZON GRANDE': 'Centro Democratico',
    'POLO DEMOCRATICO ALTERNATIVO': 'Polo Democratico Alternativo',
    'PARTIDO POLO DEMOCRATICO ALTERNATIVO': 'Polo Democratico Alternativo',
    'PACTO HISTORICO': 'Pacto Historico',
    'COLOMBIA HUMANA': 'Pacto Historico',
    'COALICION PACTO HISTORICO': 'Pacto Historico',
    'PACTO HISTORICO BOYACA': 'Pacto Historico',
    'MOVIMIENTO MIRA': 'Movimiento MIRA',
    'PARTIDO POLITICO MIRA': 'Movimiento MIRA',
    'MOVIMIENTO INDEPENDIENTE DE RENOVACION ABSOLUTA MIRA': 'Movimiento MIRA',
    'OPCION CIUDADANA': 'Opcion Ciudadana',
    'PARTIDO OPCION CIUDADANA': 'Opcion Ciudadana',
    'ALIANZA SOCIAL INDEPENDIENTE': 'Alianza Social Independiente',
    'PARTIDO ALIANZA SOCIAL INDEPENDIENTE': 'Alianza Social Independiente',
    'PARTIDO ASI': 'Alianza Social Independiente',
    'ASI': 'Alianza Social Independiente',
    'COMUNES': 'Comunes',
    'PARTIDO COMUNES': 'Comunes',
    'PARTIDO FUERZA ALTERNATIVA REVOLUCIONARIA DEL COMUN': 'Comunes',
    'COLOMBIA JUSTA LIBRES': 'Colombia Justa Libres',
    'GSC COLOMBIA JUSTA LIBRES': 'Colombia Justa Libres',
    'LIGA DE GOBERNANTES': 'Liga de Gobernantes',
    'LIGA DE GOBERNANTES ANTICORRUPCION': 'Liga de Gobernantes',
    'CENTRO ESPERANZA': 'Centro Esperanza',
    'COALICION CENTRO ESPERANZA': 'Centro Esperanza',
    'COALICION ALIANZA VERDE Y CENTRO ESPERANZA': 'Centro Esperanza',
    'COMPROMISO CIUDADANO': 'Centro Esperanza',
    'COALICION COLOMBIA': 'Centro Esperanza',
    'EQUIPO POR COLOMBIA': 'Equipo por Colombia',
    'COALICION EQUIPO POR COLOMBIA': 'Equipo por Colombia',
    'GRAN CONSULTA POR COLOMBIA': 'Gran Consulta por Colombia',
    'LA GRAN CONSULTA POR COLOMBIA': 'Gran Consulta por Colombia',
    'MAIS': 'MAIS',
    'MOVIMIENTO ALTERNATIVO INDIGENA Y SOCIAL  MAIS': 'MAIS',
    'MOVIMIENTO ALTERNATIVO INDIGENA Y SOCIAL MAIS': 'MAIS',
    'CREEMOS': 'Creemos',
    'PARTIDO POLITICO CREEMOS': 'Creemos',
    'MIO': 'MIO',
    'MOVIMIENTO DE INCLUSION Y OPORTUNIDADES': 'MIO',
    'NUEVO LIBERALISMO': 'Nuevo Liberalismo',
    'PARTIDO NUEVO LIBERALISMO': 'Nuevo Liberalismo',
    'CR-NUEVO LIBERALISMO': 'Nuevo Liberalismo',
    'UNION PATRIOTICA': 'Union Patriotica',
    'PARTIDO UNION PATRIOTICA  UP': 'Union Patriotica',
    'FUERZA CIUDADANA': 'Fuerza Ciudadana',
    'MOVIMIENTO POLITICO FUERZA CIUDADANA': 'Fuerza Ciudadana',
    'DIGNIDAD Y COMPROMISO': 'Dignidad y Compromiso',
    'PARTIDO DIGNIDAD Y COMPROMISO': 'Dignidad y Compromiso',
    'SALVACION NACIONAL': 'Salvacion Nacional',
    'CON TODA POR COLOMBIA': 'Con Toda por Colombia',
    'VALIENTES': 'Valientes',
    'COLOMBIA RENACIENTE': 'Colombia Renaciente',
    'TODOS SOMOS COLOMBIA': 'Todos Somos Colombia',
    'PARTIDO SOMOS': 'Partido Somos',
    'SOMOS REGION COLOMBIA': 'Partido Somos',
    'SI': 'Si',
    'NO': 'No',
    'VOTOS NULOS': '__SKIP__',
    'VOTOS EN BLANCO': '__SKIP__',
    'CANDIDATOS TOTALES': '__SKIP__',
    'AICO': 'AICO',
    'MOVIMIENTO AUTORIDADES INDIGENAS DE COLOMBIA': 'AICO',
    'PARTIDO PIN': 'Partido PIN',
    'PARTIDO DE INTEGRACION NACIONAL': 'Partido PIN',
    'COLOMBIA PIENSA EN GRANDE': 'Colombia Piensa en Grande',
}

# Canonical names with accents (mapped from accent-stripped keys)
CANONICAL = {
    'Partido Liberal Colombiano': 'Partido Liberal Colombiano',
    'Partido Conservador Colombiano': 'Partido Conservador Colombiano',
    'Partido de la U': 'Partido de la U',
    'Cambio Radical': 'Cambio Radical',
    'Alianza Verde': 'Alianza Verde',
    'Partido Verde Oxigeno': 'Partido Verde Oxígeno',
    'Centro Democratico': 'Centro Democrático',
    'Polo Democratico Alternativo': 'Polo Democrático Alternativo',
    'Pacto Historico': 'Pacto Histórico',
    'Movimiento MIRA': 'Movimiento MIRA',
    'Opcion Ciudadana': 'Opción Ciudadana',
    'Alianza Social Independiente': 'Alianza Social Independiente',
    'Comunes': 'Comunes',
    'Colombia Justa Libres': 'Colombia Justa Libres',
    'Liga de Gobernantes': 'Liga de Gobernantes',
    'Centro Esperanza': 'Centro Esperanza',
    'Equipo por Colombia': 'Equipo por Colombia',
    'Gran Consulta por Colombia': 'Gran Consulta por Colombia',
    'MAIS': 'MAIS',
    'Creemos': 'Creemos',
    'MIO': 'MIO',
    'Nuevo Liberalismo': 'Nuevo Liberalismo',
    'Union Patriotica': 'Unión Patriótica',
    'Fuerza Ciudadana': 'Fuerza Ciudadana',
    'Dignidad y Compromiso': 'Dignidad y Compromiso',
    'Salvacion Nacional': 'Salvación Nacional',
    'Con Toda por Colombia': 'Con Toda por Colombia',
    'Valientes': 'Valientes',
    'Colombia Renaciente': 'Colombia Renaciente',
    'Todos Somos Colombia': 'Todos Somos Colombia',
    'Partido Somos': 'Partido Somos',
    'Si': 'Sí',
    'No': 'No',
    'AICO': 'AICO',
    'Partido PIN': 'Partido PIN',
    'Colombia Piensa en Grande': 'Colombia Piensa en Grande',
}

CANDIDATOS_MAP = {
    'JUAN MANUEL SANTOS CALDERON': 'Partido de la U',
    'AURELIJUS RUTENIS ANTANAS MOCKUS SIVICKAS': 'Alianza Verde',
    'ANTANAS MOCKUS SIVICKAS': 'Alianza Verde',
    'GERMAN VARGAS LLERAS': 'Cambio Radical',
    'GUSTAVO FRANCISCO PETRO URREGO': 'Pacto Histórico',
    'MARTA NOEMI DEL ESPIRITU SANTO SANIN POSADA DE RUBIO': 'Partido Conservador Colombiano',
    'NOEMI SANIN POSADA': 'Partido Conservador Colombiano',
    'RAFAEL PARDO RUEDA': 'Partido Liberal Colombiano',
    'OSCAR IVAN ZULUAGA ESCOBAR': 'Centro Democrático',
    'MARTHA LUCIA RAMIREZ DE RINCON': 'Partido Conservador Colombiano',
    'MARTHA LUCIA RAMIREZ BLANCO': 'Partido Conservador Colombiano',
    'CLARA EUGENIA LOPEZ OBREGON': 'Polo Democrático Alternativo',
    'ENRIQUE PENALOSA LONDONO': 'Alianza Verde',
    'ENRIQUE PENALOSA CAMARGO': 'Alianza Verde',
    'IVAN DUQUE MARQUEZ': 'Centro Democrático',
    'SERGIO FAJARDO VALDERRAMA': 'Centro Esperanza',
    'HUMBERTO DE LA CALLE LOMBANA': 'Partido Liberal Colombiano',
    'JORGE ANTONIO TRUJILLO SARMIENTO': 'Todos Somos Colombia',
    'VIVIANE ALEIDA MORALES HOYOS': 'Partido Somos',
    'VIVIANE MORALES HOYOS': 'Partido Somos',
    'RODOLFO HERNANDEZ SUAREZ': 'Liga de Gobernantes',
    'RODOLFO HERNANDEZ': 'Liga de Gobernantes',
    'FEDERICO GUTIERREZ ZULUAGA': 'Equipo por Colombia',
    'FEDERICO GUTIERREZ': 'Equipo por Colombia',
    'ENRIQUE GOMEZ MARTINEZ': 'Salvación Nacional',
    'ABELARDO DE LA ESPRIELLA OSORIO': 'Salvación Nacional',
    'ABELARDO DE LA ESPRIELLA': 'Salvación Nacional',
    'JUAN DANIEL OVIEDO ARANGO': 'Con Toda por Colombia',
    'JUAN DANIEL OVIEDO': 'Con Toda por Colombia',
    'VICKY DAVILA HOYOS': 'Valientes',
    'VICTORIA EUGENIA DAVILA HOYOS': 'Valientes',
    'OLMEDO VARGAS HERNANDEZ': 'Colombia Renaciente',
    'OLMEDO VARGAS': 'Colombia Renaciente',
    'JAIRO CRISTO CORREA': 'Partido de la U',
    'JAIRO CRISTO': 'Partido de la U',
    'PALOMA ANDREA VALENCIA LASERNA': 'Partido de la U',
    'PALOMA VALENCIA LASERNA': 'Partido de la U',
    'JUAN CARLOS GRANADOS BECERRA': 'Partido de la U',
    'JUAN CARLOS GRANADOS GRANADOS': 'Partido de la U',
    'CARLOS ANDRES AMAYA RODRIGUEZ': 'Alianza Verde',
    'OSMAN HIPOLITO ROA SARMIENTO': 'Cambio Radical',
    'CESAR AUGUSTO PACHON ACHURY': 'MAIS',
    'GONZALO GUARIN VIVAS': 'Centro Democrático',
    'JUAN DE JESUS CORDOBA SUAREZ': 'Partido Conservador Colombiano',
    'RODRIGO ARTURO ROJAS LARA': 'Partido Liberal Colombiano',
    'RODRIGO ARTURO ROJAS': 'Partido Liberal Colombiano',
    'GIOVANNY PINZON BAEZ': 'Pacto Histórico',
    'GIOVANNY PINZON': 'Pacto Histórico',
}

def strip_accents(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s)
                   if unicodedata.category(c) != 'Mn')

JUNK_CANDIDATOS = {
    'VOTOS EN BLANCO INDIGENAS', 'VOTOS EN BLANCO AFRODESCENDIENTES',
    'VOTOS EN BLANCO', 'VOTOS NULOS', 'TARJETAS NO  MARCADAS',
    'TARJETAS NO MARCADAS', 'CANDIDATOS TOTALES',
}

def normalizar(par_raw, cand_raw=''):
    # Descartar filas de votos especiales / totalizadoras
    if cand_raw:
        cu = strip_accents(str(cand_raw).upper().strip())
        cu = re.sub(r'\s+', ' ', cu)
        if cu in JUNK_CANDIDATOS:
            return None
        for k, v in CANDIDATOS_MAP.items():
            if strip_accents(k.upper()) == cu:
                return v

    # Partido vacio -> descartar
    if not par_raw or str(par_raw).strip() == '':
        return None

    pu = strip_accents(str(par_raw).upper().strip())
    pu = re.sub(r'\s+', ' ', pu)

    if pu in NORMALIZAR:
        resultado = NORMALIZAR[pu]
        return None if resultado == '__SKIP__' else CANONICAL.get(resultado, resultado)

    # Coalicion: primer partido reconocido
    if '-' in pu or ';' in pu or ' Y ' in pu:
        partes = re.split(r'\s*[-;]\s+|\s+-\s*|\s+Y\s+', pu)
        prefijos = r'^(COALICION|PARTIDO|PARTIDOS|MOVIMIENTO|GSC)\s+'
        for parte in partes:
            p = re.sub(prefijos, '', parte.strip())
            if p in NORMALIZAR and NORMALIZAR[p] != '__SKIP__':
                r = NORMALIZAR[p]
                return CANONICAL.get(r, r)

    # Codigo numerico sin mapeo -> preservar como desconocido
    if re.match(r'^\d+$', pu):
        return 'Partido sin identificar'

    # Nombre desconocido -> conservar tal cual
    return par_raw.strip()

# ── Procesar archivos ────────────────────────────────────────────
candidato_files = sorted(glob.glob('data/**/votos_candidato_*.csv', recursive=True))
print(f"Archivos candidato encontrados: {len(candidato_files)}")
for f in candidato_files:
    print(f"  {os.path.basename(f)}")

print()
reconstruidos = 0
errores = []

for f_cand in candidato_files:
    f_part = f_cand.replace('votos_candidato_', 'votos_partido_')
    if not os.path.exists(f_part):
        print(f"SKIP (no existe partido): {os.path.basename(f_cand)}")
        continue

    try:
        dc = pd.read_csv(f_cand, sep=';', encoding='utf-8', low_memory=False)

        col_par  = next((c for c in dc.columns if c.upper() == 'PARNOMBRE'), None)
        if not col_par:
            col_par = next((c for c in dc.columns if 'PARTIDO' in c.upper()), None)

        col_cand = next((c for c in dc.columns if c.upper() == 'CANNOMBRE'), None)

        col_mun  = next((c for c in dc.columns if c.upper() == 'MUNNOMBRE'), None)
        if not col_mun:
            col_mun = next((c for c in dc.columns if 'MUN' in c.upper() and 'NOMBRE' in c.upper()), None)

        col_vot  = next((c for c in dc.columns if 'TOTALVOT' in c.upper()), None)
        if not col_vot:
            col_vot = next((c for c in dc.columns if 'VOT' in c.upper()), None)

        if not col_par:
            errores.append(f"Sin col partido: {os.path.basename(f_cand)} cols={list(dc.columns[:8])}")
            continue
        if not col_mun:
            errores.append(f"Sin col municipio: {os.path.basename(f_cand)} cols={list(dc.columns[:8])}")
            continue
        if not col_vot:
            errores.append(f"Sin col votos: {os.path.basename(f_cand)} cols={list(dc.columns[:8])}")
            continue

        antes = len(dc)
        dc = dc.copy()
        dc['_partido'] = dc.apply(
            lambda r: normalizar(
                r[col_par] if pd.notna(r[col_par]) else '',
                r[col_cand] if col_cand and pd.notna(r[col_cand]) else ''
            ), axis=1
        )

        sin_resolver = dc[dc['_partido'].isna()]
        if len(sin_resolver) > 0:
            vals = sin_resolver[col_par].value_counts().head(5)
            print(f"  ! {os.path.basename(f_cand)}: {len(sin_resolver)} filas sin partido -> {dict(vals)}")

        dc = dc[dc['_partido'].notna()]

        df_new = (dc.groupby([col_mun, '_partido'], as_index=False)[col_vot]
                   .sum()
                   .rename(columns={'_partido': col_par}))

        df_new.to_csv(f_part, sep=';', index=False, encoding='utf-8')
        reconstruidos += 1
        print(f"  OK {os.path.basename(f_part)} ({antes} cand -> {len(df_new)} partido-mun filas)")

    except Exception as e:
        import traceback
        errores.append(f"{os.path.basename(f_cand)}: {e}\n{traceback.format_exc()[-400:]}")

print(f"\n{'='*60}")
print(f"Reconstruidos: {reconstruidos}")
if errores:
    print(f"\nErrores ({len(errores)}):")
    for e in errores:
        print(f"  {e}")
else:
    print("Sin errores.")
