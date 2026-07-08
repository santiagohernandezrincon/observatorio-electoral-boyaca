"""
procesar_raw.py
Transforma los CSV crudos de CEDAE en el esquema del dashboard
(separador ;, encoding utf-8, carpeta data/).

Salidas por archivo fuente:
  votos_candidato_municipio_{anio}_{cargo}.csv  → MUNNOMBRE;CANNOMBRE;PARNOMBRE;VOTOS
  votos_partido_municipio_{anio}_{cargo}.csv    → MUNNOMBRE;PARNOMBRE;VOTOS;TOTAL_VOTOS;PORCENTAJE

Historial de consolidación (2026-07-08): hasta esta fecha existían 3 scripts
de pipeline (procesar_raw.py → reconstruir_partido.py → normalizar_partidos.py),
cada uno con su propia tabla de normalización, parcialmente solapadas y
desincronizadas entre sí. Los otros dos llevaban sin tocarse desde 2026-06-06
(commit 49aff40) mientras este seguía evolucionando solo -- correr
procesar_raw.py sin los otros dos producía datos desactualizados con
misatribución real de partido (ver PENDIENTES.md). Se consolidó todo aquí:
`NORMALIZAR_PARTIDO_TEXTO` (alias de texto, de normalizar_partidos.py +
entradas propias de reconstruir_partido.py) y `CANDIDATOS_MAP` (reasignación
por candidato individual año-consciente, de reconstruir_partido.py) ahora se
aplican en un solo lugar, a ambos archivos de salida (candidato y partido) por
igual -- antes normalizar_partidos.py solo tocaba el archivo de partido,
dejando el de candidato sin normalizar (asimetría real encontrada en el
plebiscito 2016: candidato con "SI"/"NO" crudo, partido con "Sí"/"No").
La regeneración de `js/colores_partido.js` (que hacía normalizar_partidos.py)
NO se trajo: ese archivo se mantiene a mano en JS junto con
`normalizePartido()`/`palabrasClave`, que ningún generador Python conoce.
reconstruir_partido.py y normalizar_partidos.py se eliminaron tras verificar
que reprocesar 2010-2018 con esta versión reproduce exactamente los CSV ya
committeados (ver diff de verificación en PENDIENTES.md).
"""

import re
import sys
import unicodedata
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
    '19970004': 'Partido Conservador Colombiano',  # Mendieta Poveda 2011
    '20000036': 'Movimiento MIRA',                # MIRA código 2000
    '20100007': 'Movimiento Ciudadano',            # Aval local Boyacá 2011
    '20110064': 'Coalición Para La Alcaldía de Tópaga', # Aval local Boyacá 2011 (José Oswaldo Castro Tejedor)
    '20110062': 'Independiente',                    # Aval local Boyacá 2011, candidatura por Firmas (Cómbita, Giovanni Díaz Ramos)
    '20110074': 'Independiente',                    # Aval local Boyacá 2011, candidatura por Firmas (Tota, Yury Neill Díaz Aranguren)
    '20110050': 'Coalición',                        # Aval local Boyacá 2011, coalición sin nombre propio confirmado (Oicatá, Ever Niño Cuervo)
    '20170002': 'Cambio Radical',
    # Códigos 2015 gobernación Boyacá
    '20150606': 'Alianza Verde',
    '20150607': 'Cambio Radical',
    '20150608': 'Partido Conservador Colombiano',
}

# ── Tabla de alias de texto (fusión de normalizar_partidos.py + reconstruir_partido.py) ──
# Canoniza variantes de ortografía/tildes/mayúsculas del PARNOMBRE ya resuelto como
# texto (por partido_map, formatos "a nivel de mesa", o el propio NOMBRES_PARTIDO).
NORMALIZAR_PARTIDO_TEXTO = {
    'PARTIDO LIBERAL COLOMBIANO': 'Partido Liberal Colombiano',
    'PARTIDO LIBERAL': 'Partido Liberal Colombiano',
    'Partido Liberal': 'Partido Liberal Colombiano',
    'LIBERAL': 'Partido Liberal Colombiano',
    'PARTIDO CONSERVADOR COLOMBIANO': 'Partido Conservador Colombiano',
    'PARTIDO CONSERVADOR': 'Partido Conservador Colombiano',
    'Partido Conservador': 'Partido Conservador Colombiano',
    'CONSERVADOR': 'Partido Conservador Colombiano',
    'PARTIDO SOCIAL DE UNIDAD NACIONAL': 'Partido de la U',
    'Partido Social de Unidad Nacional': 'Partido de la U',
    'PARTIDO DE LA U': 'Partido de la U',
    'Partido de La U': 'Partido de la U',
    'DE LA U': 'Partido de la U',
    'CAMBIO RADICAL': 'Cambio Radical',
    'Cambio radical': 'Cambio Radical',
    'PARTIDO CAMBIO RADICAL': 'Cambio Radical',
    'PARTIDO VERDE': 'Alianza Verde',
    'Partido Verde': 'Alianza Verde',
    'ALIANZA VERDE': 'Alianza Verde',
    'Alianza verde': 'Alianza Verde',
    'PARTIDO ALIANZA VERDE': 'Alianza Verde',
    'Partido Alianza Verde': 'Alianza Verde',
    'COALICION COLOMBIA': 'Alianza Verde',
    'Coalición Colombia': 'Alianza Verde',
    'COMPROMISO CIUDADANO': 'Alianza Verde',
    'Compromiso Ciudadano': 'Alianza Verde',
    'MOVIMIENTO COMPROMISO CIUDADANO': 'Alianza Verde',
    'PARTIDO VERDE OXIGENO': 'Partido Verde Oxígeno',
    'Partido Verde Oxígeno': 'Partido Verde Oxígeno',
    'VERDE OXIGENO': 'Partido Verde Oxígeno',
    'OXIGENO': 'Partido Verde Oxígeno',
    'CENTRO DEMOCRATICO': 'Centro Democrático',
    'Centro Democratico': 'Centro Democrático',
    'PARTIDO CENTRO DEMOCRATICO': 'Centro Democrático',
    'COLOMBIA HUMANA': 'Pacto Histórico',
    'Colombia Humana': 'Pacto Histórico',
    'COLOMBIA HUMANA - UP': 'Pacto Histórico',
    'MOVIMIENTO COLOMBIA HUMANA': 'Pacto Histórico',
    'PACTO HISTORICO': 'Pacto Histórico',
    'Pacto Historico': 'Pacto Histórico',
    'PACTO HISTÓRICO COLOMBIA PUEDE': 'Pacto Histórico',
    'EN MARCHA': 'Pacto Histórico',
    'POLO DEMOCRATICO ALTERNATIVO': 'Polo Democrático Alternativo',
    'POLO DEMOCRATICO': 'Polo Democrático Alternativo',
    'Polo Democrático': 'Polo Democrático Alternativo',
    'Polo Democratico Alternativo': 'Polo Democrático Alternativo',
    'PDA': 'Polo Democrático Alternativo',
    'OPCION CIUDADANA': 'Opción Ciudadana',
    'Opcion Ciudadana': 'Opción Ciudadana',
    'PARTIDO DE INTEGRACION NACIONAL': 'Opción Ciudadana',
    'PARTIDO INTEGRACION NACIONAL': 'Opción Ciudadana',
    'PIN': 'Opción Ciudadana',
    'CONVERGENCIA CIUDADANA': 'Opción Ciudadana',
    'Convergencia Ciudadana': 'Opción Ciudadana',
    'MOVIMIENTO MIRA': 'Movimiento MIRA',
    'MIRA': 'Movimiento MIRA',
    'MOVIMIENTO DE INTEGRACION Y RENOVACION': 'Movimiento MIRA',
    'ALIANZA SOCIAL INDEPENDIENTE': 'Alianza Social Independiente',
    'ALIANZA SOCIAL INDIGENA': 'Alianza Social Independiente',
    'ASI': 'Alianza Social Independiente',
    'FARC': 'Comunes',
    'PARTIDO COMUNES': 'Comunes',
    'FUERZA ALTERNATIVA REVOLUCIONARIA DEL COMUN': 'Comunes',
    'COLOMBIA JUSTA LIBRES': 'Colombia Justa Libres',
    'JUSTA LIBRES': 'Colombia Justa Libres',
    'UNION PATRIOTICA': 'Unión Patriótica',
    'UP': 'Unión Patriótica',
    'EQUIPO POR COLOMBIA': 'Equipo por Colombia',
    'CENTRO ESPERANZA': 'Centro Esperanza',
    'GRAN CONSULTA POR COLOMBIA': 'Gran Consulta por Colombia',
    'Gran Consulta por Colombia': 'Gran Consulta por Colombia',
    'LIGA DE GOBERNANTES ANTICORRUPCION': 'Liga de Gobernantes',
    'LIGA DE GOBERNANTES ANTICORRUPCIÓN': 'Liga de Gobernantes',
    'COALICION PACTO HISTÓRICO': 'Pacto Histórico',
    'COALICION PACTO HISTORICO': 'Pacto Histórico',
    'COALICION EQUIPO POR COLOMBIA': 'Equipo por Colombia',
    'COALICION CENTRO ESPERANZA': 'Centro Esperanza',
    'COLOMBIA PIENSA EN GRANDE': 'Colombia Piensa en Grande',
    'PARTIDO MOVIMIENTO DE SALVACION NACIONAL': 'Mov. Salvación Nacional',
    'VOTOS NULOS': 'Votos nulos',
    'VOTOS EN BLANCO': 'Votos en blanco',
    'VOTOS NO MARCADOS': 'Votos no marcados',
    'FUERZA CIUDADANA': 'Fuerza Ciudadana',
    'NUEVO LIBERALISMO': 'Nuevo Liberalismo',
    'SI': 'Sí',
    'Sí': 'Sí',
    'si': 'Sí',
    'NO': 'No',
    'No': 'No',
    'no': 'No',
    'ALIANZA SOCIAL INDIGENA  ASI': 'Alianza Social Independiente',
    'PARTIDO ALIANZA SOCIAL INDEPENDIENTE': 'Alianza Social Independiente',
    'PARTIDO ALIANZA SOCIAL INDEPENDIENTE  ASI': 'Alianza Social Independiente',
    'PARTIDO ALIANZA SOCIAL INDEPENDIENTE ASI': 'Alianza Social Independiente',
    'PARTIDO ALIANZA SOCIAL INDEPENDIENTE "ASI"': 'Alianza Social Independiente',
    'Partido Alianza Social Independiente': 'Alianza Social Independiente',
    'Partido Alianza Social Independiente  Asi': 'Alianza Social Independiente',
    'Partido ASI': 'Alianza Social Independiente',
    'PARTIDO CAMBIO RADICAL COLOMBIANO': 'Cambio Radical',
    'Partido Cambio Radical Colombiano': 'Cambio Radical',
    'CENTRO DEMOCRATICO MANO FIRME CORAZON GRANDE': 'Centro Democrático',
    'Centro Democratico Mano Firme Corazon Grande': 'Centro Democrático',
    'PARTIDO CENTRO DEMOCRATICO MANO FIRME CORAZON GRANDE': 'Centro Democrático',
    'Partido Centro Democratico Mano Firme Corazon Grande': 'Centro Democrático',
    'PARTIDO CENTRO DEMOCRÁTICO': 'Centro Democrático',
    'PARTIDO COLOMBIA JUSTA LIBRES': 'Colombia Justa Libres',
    'GSC COLOMBIA JUSTA LIBRES': 'Colombia Justa Libres',
    'Gsc Colombia Justa Libres': 'Colombia Justa Libres',
    'Partido Fuerza Alternativa Revolucionaria Del Comu': 'Comunes',
    'LA GRAN CONSULTA POR COLOMBIA': 'Gran Consulta por Colombia',
    'LA LISTA DE OVIEDO - CON TODA POR COLOMBIA': 'Gran Consulta por Colombia',
    'PARTIDO POLITICO  MIRA': 'Movimiento MIRA',
    'PARTIDO POLITICO MIRA': 'Movimiento MIRA',
    'Partido Politico Mira': 'Movimiento MIRA',
    'MOVIMIENTO INDEPENDIENTE DE RENOVACION ABSOLUTA  MIRA': 'Movimiento MIRA',
    'Movimiento Independiente De Renovacion Absoluta  Mira': 'Movimiento MIRA',
    'MOVIMIENTO SALVACIÓN NACIONAL': 'Mov. Salvación Nacional',
    'MOVIMIENTO DE SALVACIÓN NACIONAL': 'Mov. Salvación Nacional',
    'MOVIMIENTO SALVACION NACIONAL': 'Mov. Salvación Nacional',
    'PARTIDO NUEVO LIBERALISMO': 'Nuevo Liberalismo',
    'Partido Nuevo Liberalismo': 'Nuevo Liberalismo',
    'CR-NUEVO LIBERALISMO': 'Nuevo Liberalismo',
    'PARTIDO OPCION CIUDADANA': 'Opción Ciudadana',
    'Partido Opcion Ciudadana': 'Opción Ciudadana',
    'PARTIDO DE INTEGRACION NACIONAL  PIN': 'Opción Ciudadana',
    'PARTIDO DE INTEGRACION NACIONAL PIN': 'Opción Ciudadana',
    'Partido De Integracion Nacional  Pin': 'Opción Ciudadana',
    'Partido PIN': 'Opción Ciudadana',
    'PACTO HISTÓRICO': 'Pacto Histórico',
    'PACTO HISTÓRICO BOYACÁ': 'Pacto Histórico',
    'PACTO HISTÓRICO SENADO': 'Pacto Histórico',
    'PACTO HISTORICO COLOMBIA PUEDE': 'Pacto Histórico',
    'COLOMBIA HUMANA - UNION PATRIOTICA': 'Pacto Histórico',
    'MOVIMIENTO POLÍTICO COLOMBIA HUMANA': 'Pacto Histórico',
    'AGRUPACIÓN POLÍTICA EN MARCHA': 'Pacto Histórico',
    'PARTIDO SOCIAL DE LA U': 'Partido de la U',
    'Partido Social De La U': 'Partido de la U',
    'PARTIDO SOCIAL DE UNIDAD NACIONAL  PARTIDO DE LA U': 'Partido de la U',
    'Partido Social De Unidad Nacional  Partido De La U': 'Partido de la U',
    'PARTIDO DE LA UNIÓN POR LA GENTE "PARTIDO DE LA U"': 'Partido de la U',
    'PARTIDO DE LA UNIÓN POR LA GENTE - PARTIDO DE LA U': 'Partido de la U',
    'PARTIDO SOCIAL UNIDAD NACIONAL - PARTIDO ALIANZA  SOCIAL INDEPENDIENTE - ASI': 'Partido de la U',
    'PARTIDO POLO DEMOCRATICO ALTERNATIVO': 'Polo Democrático Alternativo',
    'Partido Polo Democratico Alternativo': 'Polo Democrático Alternativo',
    'PARTIDO POLO DEMOCRÁTICO ALTERNATIVO': 'Polo Democrático Alternativo',
    'PARTIDO UNION PATRIOTICA': 'Unión Patriótica',
    'PARTIDO UNION PATRIOTICA  UP': 'Unión Patriótica',
    'PARTIDO UNIÓN PATRIÓTICA  UP': 'Unión Patriótica',
    'PARTIDO UNIÓN PATRIÓTICA "UP"': 'Unión Patriótica',
    'Partido Union Patriotica': 'Unión Patriótica',
    'Partido Union Patriotica  Up': 'Unión Patriótica',
    'MOVIMIENTO POLITICO FUERZA CIUDADANA': 'Fuerza Ciudadana',
    'COALICIÓN FUERZA CIUDADANA': 'Fuerza Ciudadana',
    'COALICIÓN PACTO HISTÓRICO': 'Pacto Histórico',
    'COALICION U - EN MARCHA - MIRA': 'Partido de la U',
    'COALICION U - EN MARCHA': 'Partido de la U',
    'U - EN MARCHA - MIRA': 'Partido de la U',
    'RESULTADOS PARA BOYACA': 'Partido Liberal Colombiano',
    'RESULTADOS PARA BOYACÁ': 'Partido Liberal Colombiano',
    'MOVIMIENTO ALTERNATIVO INDIGENA Y SOCIAL  MAIS': 'MAIS',
    'MOVIMIENTO ALTERNATIVO INDIGENA Y SOCIAL MAIS': 'MAIS',
    'MOVIMIENTO ALTERNATIVO INDÍGENA Y SOCIAL  MAIS': 'MAIS',
    'MOVIMIENTO ALTERNATIVO INDÍGENA Y SOCIAL "MAIS"': 'MAIS',
    'MOVIMIENTO ALTERNATIVO INDÍGENA SOCIAL "MAIS"': 'MAIS',
    'Movimiento Alternativo Indigena Y Social  Mais': 'MAIS',
    'Movimiento Alternativo Indigena Y Social Mais': 'MAIS',
    'MAIS - POLO': 'MAIS',
    'MOVIMIENTO AUTORIDADES INDIGENAS DE COLOMBIA': 'AICO',
    'MOVIMIENTO AUTORIDADES INDIGENAS DE COLOMBIA AICO': 'AICO',
    'MOVIMIENTO AUTORIDADES INDIGENAS DE COLOMBIA  AICO': 'AICO',
    'MOVIMIENTO AUTORIDADES INDÍGENAS DE COLOMBIA "AICO"': 'AICO',
    'MOVIMIENTO DE AUTORIDADES INDIGENAS DE COLOMBIA  AICO': 'AICO',
    'Movimiento Autoridades Indigenas De Colombia': 'AICO',
    'Movimiento Autoridades Indigenas De Colombia  Aico': 'AICO',
    'Movimiento De Autoridades Indigenas De Colombia  Aico': 'AICO',
    'MOVIMIENTO DE INCLUSION Y OPORTUNIDADES': 'MIO',
    'MOVIMIENTO DE INCLUSION Y OPORTUNIDADES  MIO': 'MIO',
    'Movimiento De Inclusion Y Oportunidades': 'MIO',
    'Movimiento De Inclusion Y Oportunidades  Mio': 'MIO',
    'CREEMOS': 'Creemos',
    'PARTIDO POLÍTICO CREEMOS': 'Creemos',
    'PROMOTORES VOTO EN BLANCO': 'Votos en blanco',
    'Promotores Voto En Blanco': 'Votos en blanco',
    'Candidata Retirada': 'Sin partido',
    'Candidatura No Aceptada': 'Sin partido',
    'Revocado (A)': 'Sin partido',
    'Inscripcion Revocada Cne Res No 1932018': 'Sin partido',
    'Inscripcion Revocada Cne Res No 2232018': 'Sin partido',
    'Sin nombre': 'Sin partido',
    'CANDIDATOS TOTALES': 'Sin partido',
    'Candidatos Totales': 'Sin partido',
    'PACTO HISTORICO BOYACA': 'Pacto Histórico',
    'AGRUPACION POLITICA EN MARCHA': 'Pacto Histórico',
    'MOVIMIENTO ALTERNATIVO INDIGENA Y SOCIAL': 'MAIS',
    'AICO': 'AICO',
    'COLOMBIA RENACIENTE': 'Colombia Renaciente',
    'G.S.C. SOGAMOSO ACTIVA': 'Movimiento Ciudadano',
    'GSC SOGAMOSO ACTIVA': 'Movimiento Ciudadano',
    'G.S.C. COALICION IDEAS NUEVAS': 'Movimiento Ciudadano',
    'G.S.C SOMOS BUENAVISTA': 'Movimiento Ciudadano',
    'G.S.C. UNIDOS DEJAREMOS HUELLA': 'Movimiento Ciudadano',
    'G.S.C. UN BUEN GOBIERNO ES MI COMPROMISO CON EL PUEBLO': 'Movimiento Ciudadano',
    'G.S.C. GESTION Y BUEN GOBIERNO': 'Movimiento Ciudadano',
    'G.S.C MARCANDO LA DIFERENCIA': 'Movimiento Ciudadano',
    'GSC. UNIDOS DE GACHANTIVA': 'Movimiento Ciudadano',
    'G.S.C. SI HAY CAMPO PARA TODOS': 'Movimiento Ciudadano',
    'G.S.C. COALICION POR EL PROGRESO Y DESARROLLO': 'Movimiento Ciudadano',
    'G.S.C. AHORA DI TODOS POR EL CAMBIO': 'Movimiento Ciudadano',
    'G.S.C. NUEVAS IDEAS PARA UN MEJOR FUTURO': 'Movimiento Ciudadano',
    'G.S.C RENOVACION Y CAMBIO PARA CONSTRUIR FUTURO': 'Movimiento Ciudadano',
}

# ── CANDIDATOS_MAP: (año, nombre_candidato_normalizado) → partido ──────────────
# Reasignación por candidato individual, más confiable que cualquier alias de
# texto porque no depende de cómo vino escrito el partido en el crudo (útil
# para candidatos que corrieron con avales/nombres de lista ambiguos).
# Traído de reconstruir_partido.py. Nota 2026-07-08: 2 entradas de gobernación
# (Pachón Achury 2015, Pinzón Báez 2019) se corrigieron de 'Pacto Histórico' a
# 'MAIS' en la fuente JS equivalente (candidatos_partido.js) tras verificar con
# fuentes externas -- aquí ya estaban correctas como 'MAIS'.
CANDIDATOS_MAP = {
    ('2010', 'JUAN MANUEL SANTOS CALDERON'): 'Partido de la U',
    ('2010', 'AURELIJUS RUTENIS ANTANAS MOCKUS SIVICKAS'): 'Alianza Verde',
    ('2010', 'GERMAN VARGAS LLERAS'): 'Cambio Radical',
    ('2010', 'GUSTAVO FRANCISCO PETRO URREGO'): 'Polo Democrático Alternativo',
    ('2010', 'MARTA NOEMI DEL ESPIRITU SANTO SANIN POSADA DE RUBIO'): 'Partido Conservador Colombiano',
    ('2010', 'RAFAEL PARDO RUEDA'): 'Partido Liberal Colombiano',
    ('2014', 'JUAN MANUEL SANTOS CALDERON'): 'Partido de la U',
    ('2014', 'OSCAR IVAN ZULUAGA ESCOBAR'): 'Centro Democrático',
    ('2014', 'MARTHA LUCIA RAMIREZ DE RINCON'): 'Partido Conservador Colombiano',
    ('2014', 'CLARA EUGENIA LOPEZ OBREGON'): 'Polo Democrático Alternativo',
    ('2014', 'ENRIQUE PENALOSA LONDONO'): 'Alianza Verde',
    ('2018', 'IVAN DUQUE MARQUEZ'): 'Centro Democrático',
    ('2018', 'GUSTAVO FRANCISCO PETRO URREGO'): 'Pacto Histórico',
    ('2018', 'SERGIO FAJARDO VALDERRAMA'): 'Centro Esperanza',
    ('2018', 'HUMBERTO DE LA CALLE LOMBANA'): 'Partido Liberal Colombiano',
    ('2018', 'GERMAN VARGAS LLERAS'): 'Cambio Radical',
    ('2018', 'JORGE ANTONIO TRUJILLO SARMIENTO'): 'Todos Somos Colombia',
    ('2018', 'VIVIANE ALEIDA MORALES HOYOS'): 'Partido Somos',
    ('2022', 'GUSTAVO FRANCISCO PETRO URREGO'): 'Pacto Histórico',
    ('2022', 'RODOLFO HERNANDEZ SUAREZ'): 'Liga de Gobernantes',
    ('2022', 'FEDERICO GUTIERREZ ZULUAGA'): 'Equipo por Colombia',
    ('2026', 'ENRIQUE GOMEZ MARTINEZ'): 'Salvación Nacional',
    ('2026', 'ABELARDO DE LA ESPRIELLA OSORIO'): 'Salvación Nacional',
    ('2026', 'JUAN DANIEL OVIEDO ARANGO'): 'Con Toda por Colombia',
    ('2026', 'VICKY DAVILA HOYOS'): 'Valientes',
    ('2026', 'VICTORIA EUGENIA DAVILA HOYOS'): 'Valientes',
    ('2026', 'OLMEDO VARGAS HERNANDEZ'): 'Colombia Renaciente',
    ('2026', 'JAIRO CRISTO CORREA'): 'Partido de la U',
    ('2026', 'PALOMA ANDREA VALENCIA LASERNA'): 'Centro Democrático',
    ('2011', 'JUAN CARLOS GRANADOS BECERRA'): 'Partido de la U',
    ('2015', 'CARLOS ANDRES AMAYA RODRIGUEZ'): 'Alianza Verde',
    ('2015', 'OSMAN HIPOLITO ROA SARMIENTO'): 'Cambio Radical',
    ('2015', 'CESAR AUGUSTO PACHON ACHURY'): 'MAIS',
    ('2015', 'GONZALO GUARIN VIVAS'): 'Centro Democrático',
    ('2015', 'JUAN DE JESUS CORDOBA SUAREZ'): 'Partido Conservador Colombiano',
    ('2019', 'RAMIRO BARRAGAN ADAME'): 'Alianza Verde',
    ('2019', 'JONATAN ANDRES SANCHEZ CUBIDES'): 'Centro Democrático',
    ('2019', 'JOSE GIOVANY PINZON BAEZ'): 'MAIS',
    ('2019', 'OLMEDO VARGAS HERNANDEZ'): 'Colombia Renaciente',
    ('2023', 'RODRIGO ARTURO ROJAS'): 'Partido Liberal Colombiano',
    ('2023', 'GIOVANNY PINZON'): 'Pacto Histórico',
    ('2011', 'CONSTANZA ISABEL RAMIREZ ACEVEDO'): 'Partido de la U',
    ('2015', 'ALFONSO MIGUEL SILVA PESCA'): 'Partido Conservador Colombiano',
    ('2019', 'CONSTANZA ISABEL RAMIREZ ACEVEDO'): 'Cambio Radical',
    ('2015', 'PABLO EMILIO CEPEDA NOVOA'): 'Cambio Radical',
    ('2015', 'GILBERTO RONDON GONZALEZ'): 'Partido Liberal Colombiano',
    ('2015', 'LUIS EDUARDO RODRIGUEZ PEREZ'): 'Partido de la U',
    ('2011', 'VIRGILIO FARFAN ROJAS'): 'Movimiento Ciudadano',
    ('2015', 'OSCAR FERNANDO BOTERO ALZATE'): 'Partido Conservador Colombiano',
    ('2015', 'YAMIT NOE HURTADO NEIRA'): 'Alianza Verde',
    ('2015', 'WILSON CASTIBLANCO GIL'): 'Partido de la U',
    ('2015', 'ENRIQUE JAVIER CAMARGO VALENCIA'): 'Alianza Social Independiente',
    ('2015', 'WILMAR ANCISAR TRIANA GONZALEZ'): 'Cambio Radical',
    ('2015', 'WILMAR ANCIZAR TRIANA GONZALEZ'): 'Cambio Radical',
    ('2015', 'LEONARDO JONHY PATINO QUIJANO'): 'Cambio Radical',
    ('2015', 'LUIS HERNANDO CALIXTO PAIPA'): 'Cambio Radical',
    ('2015', 'CARLOS JULIO MELO ALDANA'): 'Partido de la U',
    ('2015', 'MARIO ERNESTO OCHOA PLAZAS'): 'Cambio Radical',
    ('2015', 'NELSON BOHORQUEZ OTALORA'): 'Partido Conservador Colombiano',
    ('2015', 'LUIS ALEJANDRO MILLAN DIAZ'): 'Cambio Radical',
    ('2015', 'ELIN JOSE BOHORQUEZ ARIZA'): 'Cambio Radical',
    ('2015', 'LISSETH CAROLINA TORRES MANCHEGO'): 'Partido de la U',
    ('2015', 'ZAMIR SOTELO MONROY'): 'Alianza Verde',
    ('2015', 'HUGO ALEXANDER REYES PARRA'): 'Partido Liberal Colombiano',
    ('2015', 'ISAIAS NEIRA RIOS'): 'Partido Liberal Colombiano',
    ('2015', 'JOSE DEL CARMEN DELGADO ZARATE'): 'Cambio Radical',
    ('2015', 'JOSE DEL DELGADO ZARATE'): 'Cambio Radical',
    ('2015', 'WILMER YAIR CASTELLANOS HERNANDEZ'): 'Cambio Radical',
    ('2015', 'JUSTO PASTOR RODRIGUEZ HERRERA'): 'Alianza Social Independiente',
    ('2015', 'HERIBERTO SUAREZ MUNOZ'): 'Partido de la U',
    ('2015', 'JORGE ALBERTO HURTADO LEON'): 'Cambio Radical',
    ('2015', 'JUAN JOSE SUAREZ OTALORA'): 'Partido de la U',
    ('2015', 'JOSUE JAVIER CASTELLANOS MORALES'): 'Alianza Verde',
    ('2015', 'MILTON OSWALDO FERNANDEZ ALFONSO'): 'Partido de la U',
    ('2015', 'FREDY ALEXANDER HOLGUIN RUIZ'): 'Cambio Radical',
    ('2015', 'SEGUNDO JACINTO PEREZ ARCHILA'): 'Movimiento Ciudadano',
    ('2015', 'NIDIA CAROLINA PUENTES AGUILAR'): 'Partido Conservador Colombiano',
    ('2015', 'JULIO CESAR NEIRA CASTRO'): 'Partido Liberal Colombiano',
    ('2015', 'ALBEIRO ACOSTA RENDON'): 'Partido de la U',
    ('2015', 'REYES BERNARDO PEREZ ALVAREZ'): 'Cambio Radical',
    ('2015', 'LUIS CARLOS CHIA HERNANDEZ'): 'Partido de la U',
    ('2015', 'JHON ALEXANDER LOPEZ MENDOZA'): 'Partido Conservador Colombiano',
    ('2015', 'HENRY ARGUELLO RINCON'): 'Centro Democrático',
    ('2015', 'VICTOR HUGO SILVA MOTTA'): 'Partido Liberal Colombiano',
    ('2015', 'WILLINTON EDUARDO PULIDO IBANEZ'): 'Partido Liberal Colombiano',
    ('2015', 'VLADIMIR RISCANEVO POBLADOR'): 'Movimiento Ciudadano',
    ('2015', 'FABIO FIGUEROA JIMENEZ'): 'Cambio Radical',
    ('2015', 'JAVIER ORLANDO SUESCUN CARDENAS'): 'Centro Democrático',
    ('2015', 'JAIRO GRIJALBA LANCHEROS'): 'Centro Democrático',
    ('2015', 'ERIVERTO CRUZ RIANO'): 'Partido Liberal Colombiano',
    ('2015', 'ANGELA PATRICIA AVILA HAMON'): 'Movimiento Ciudadano',
    ('2015', 'JORGE EDICSON SAAVEDRA VELASCO'): 'Movimiento Ciudadano',
    ('2015', 'NELSON HUMBERTO MELGAREJO ANGARITA'): 'Partido de la U',
    ('2015', 'EDUARDO VEGA GUERRERO'): 'Alianza Verde',
    ('2015', 'FRANCISCO DIAZ BONILLA'): 'Alianza Verde',
    ('2015', 'YAMITH RODRIGO RODRIGUEZ LOPEZ'): 'Partido Conservador Colombiano',
    ('2015', 'MAURICIO NEISA ALVARADO'): 'Cambio Radical',
    ('2015', 'JOSE FERNANDO MORALES ACUNA'): 'Partido Conservador Colombiano',
    ('2015', 'EDWIN JAVIER MANRIQUE GUERRERO'): 'Cambio Radical',
    ('2015', 'FELICIANO HERNANDEZ MORENO'): 'Partido de la U',
    ('2015', 'JUAN EVANGELISTA FARFAN CORZO'): 'Opción Ciudadana',
    ('2015', 'JAIME ENRIQUE GALVIS HERNANDEZ'): 'Centro Democrático',
    ('2015', 'CARLOS ALBERTO ACEVEDO VELASQUEZ'): 'Centro Democrático',
    ('2015', 'RUBEN SANCHEZ NINO'): 'Alianza Verde',
    ('2015', 'WILLIAM CAMILO BARRETO GONZALEZ'): 'Centro Democrático',
    ('2015', 'NAUL ALBEIRO VEGA VEGA'): 'Partido Conservador Colombiano',
    ('2015', 'MARCO AURELIO NINO CHAPARRO'): 'Cambio Radical',
    ('2015', 'ALVARO HENRY BARRERA DIAZ'): 'Movimiento Ciudadano',
    ('2015', 'HECTOR MIGUEL MOJICA MOJICA'): 'Alianza Social Independiente',
    ('2015', 'FRANKY ARIEL FONSECA SALAMANCA'): 'Cambio Radical',
    ('2015', 'JAVIER ARMANDO ROJAS CUERVO'): 'Partido Conservador Colombiano',
    ('2015', 'JAIRO CESAR FUQUENE RAMOS'): 'Movimiento Ciudadano',
    ('2015', 'JOSE DEL CARMEN BARRERA PASTRANA'): 'Partido Liberal Colombiano',
    ('2015', 'JOSE DEL BARRERA PASTRAN'): 'Partido Liberal Colombiano',
    ('2015', 'LUIS CARLOS CRISTANCHO GUERRERO'): 'Alianza Verde',
    ('2015', 'LUIS ENRIQUE GIL VARGAS'): 'Partido de la U',
    ('2015', 'JAVIER ADRIANO SANABRIA SUAREZ'): 'Cambio Radical',
    ('2015', 'EDBERTO JOSE JAIME COCUNUBO'): 'Partido de la U',
    ('2015', 'ELKIN ALEJANDRO RINCON SALAMANCA'): 'Movimiento Ciudadano',
    ('2015', 'WILMAR JULIAN RINCON MARINO'): 'Movimiento Ciudadano',
    ('2015', 'EDGAR ANTONIO MORENO CHAPARRO'): 'Movimiento Ciudadano',
    ('2015', 'CARLOS AUGUSTO SALINAS MEDINA'): 'Movimiento Ciudadano',
    ('2015', 'DANIEL LOPEZ VALLEJO'): 'Movimiento Ciudadano',
    ('2015', 'JAVIER CRISTOBAL RODRIGUEZ TORRES'): 'Partido Conservador Colombiano',
    ('2015', 'YUBER ALEXANDER FAGUA CONTRERAS'): 'Alianza Verde',
    ('2015', 'JULIO ALBERTO MOLANO BOLIVAR'): 'Opción Ciudadana',
    ('2015', 'RICARDO SALAMANCA ALVAREZ'): 'Movimiento Ciudadano',
}

def norm_nombre_candidato(nombre):
    """Mayúsculas, sin tildes, espacios colapsados -- para matchear contra CANDIDATOS_MAP."""
    s = str(nombre or '').upper().strip()
    s = unicodedata.normalize('NFKD', s)
    s = ''.join(c for c in s if not unicodedata.combining(c))
    return re.sub(r'\s+', ' ', s).strip()

def resolver_parnombre_final(parnombre, cannombre, anio):
    """Aplica, en este orden, los dos mecanismos traídos de reconstruir_partido.py
    y normalizar_partidos.py: 1) alias de texto (NORMALIZAR_PARTIDO_TEXTO) y
    2) reasignación por candidato+año (CANDIDATOS_MAP, más confiable, gana si
    ambos aplican). Se corre sobre candidato y partido por igual para no volver
    a introducir la asimetría que tenían los scripts viejos."""
    base = str(parnombre).strip() if parnombre is not None else parnombre
    if base in NORMALIZAR_PARTIDO_TEXTO:
        base = NORMALIZAR_PARTIDO_TEXTO[base]
    if cannombre and anio:
        clave = (str(anio), norm_nombre_candidato(cannombre))
        if clave in CANDIDATOS_MAP:
            base = CANDIDATOS_MAP[clave]
    return base

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

    # Alias de texto + reasignación por candidato (ver NORMALIZAR_PARTIDO_TEXTO/
    # CANDIDATOS_MAP más arriba) -- se aplica antes de agrupar para que
    # candidato y partido queden consistentes entre sí.
    df_valido['PARNOMBRE'] = df_valido.apply(
        lambda r: resolver_parnombre_final(r['PARNOMBRE'], r.get('CANNOMBRE'), anio), axis=1
    )

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


# ── Detección de formato ────────────────────────────────────────────────────
def detectar_formato(ruta):
    """'nuevo' = formato histórico por mesa (portal historicos-resultados,
    columnas 'Código Departamento'/'Nombre Partido'/...); 'sql_abrev' =
    mismo tipo de dato pero con columnas abreviadas (DEPNOMBRE/MUNNOMBRE/
    PARNOMBRE/CANNOMBRE/VOTOS, visto en 2026); 'viejo' = formato original
    CEDAE (columnas coddpto/codigo_partido/primer_apellido/...)."""
    with open(ruta, encoding='utf-8', errors='ignore') as f:
        header = f.readline()
    if 'Código Departamento' in header:
        return 'nuevo'
    if 'DEPNOMBRE' in header and 'PARNOMBRE' in header:
        return 'sql_abrev'
    return 'viejo'


# ── Procesador compartido de formatos "a nivel de mesa" ────────────────────────
# (partido y candidato ya vienen resueltos como texto en el archivo, no hay
# codigo que buscar en NOMBRES_PARTIDO; solo cambia el nombre de columna).
def _procesar_generico_mesa(ruta, anio, cargo_raw, cols, etiqueta):
    cargo = CARGO_MAP[cargo_raw]
    sep(); print(f"  {ruta.name}  →  {anio} / {cargo}  ({etiqueta})")

    df = leer_csv(ruta, separador=',')
    df.columns = [c.strip() for c in df.columns]
    print(f"    filas totales : {len(df)}")
    print(f"    columnas      : {list(df.columns)}")

    # Filtrar Boyacá por NOMBRE, no por código: estos formatos usan
    # numeración interna de la Registraduría, no el código DANE (15) que
    # usa el resto del pipeline. Filtrar por código daría 0 filas o el
    # departamento equivocado, en silencio.
    df['DEP_CLEAN'] = df[cols['depnombre']].astype(str).str.strip().str.upper()
    df = df[df['DEP_CLEAN'] == 'BOYACA'].copy()
    print(f"    filas Boyacá  : {len(df)}")
    if df.empty:
        print("    ⚠  Sin datos para Boyacá — archivo omitido.")
        return

    df['VOTOS']     = pd.to_numeric(df[cols['votos']], errors='coerce').fillna(0).astype(int)
    df['MUNNOMBRE'] = df[cols['munnombre']].astype(str).str.strip().str.upper()
    # Reusa formatear_nombre() para Title Case + manejo de 'RETIRADO', igual
    # que el resto del pipeline -- aqui no hay apellidos separados que unir.
    df['CANNOMBRE'] = df[cols['cannombre']].apply(
        lambda n: formatear_nombre({'nombres': n, 'primer_apellido': '', 'segundo_apellido': ''})
    )
    # El nombre de partido ya viene resuelto como texto; la limpieza final
    # la hace normalizePartido() en JS, igual que con los demas anios.
    df['PARNOMBRE'] = df[cols['parnombre']].astype(str).str.strip()

    df_valido = df[
        ~df['CANNOMBRE'].str.upper().isin(EXCLUIR) &
        ~df['PARNOMBRE'].str.upper().isin(EXCLUIR)
    ].copy()

    # NO se aplica resolver_parnombre_final() aquí: en estos formatos (texto ya
    # resuelto, sin código numérico) el PARNOMBRE crudo se deja tal cual a
    # propósito -- la limpieza final la hace normalizePartido() en JS (ver
    # comentario en PARNOMBRE arriba). Aplicar la normalización de texto en
    # Python aquí desincroniza el CSV committeado, que hoy guarda el texto
    # crudo sin canonizar para estos años (verificado 2026-07-08).
    guardar_candidato(df_valido, anio, cargo)
    guardar_partido(df_valido, anio, cargo)


# ── Procesador formato histórico por mesa (2019-2023) ───────────────────────────
def procesar_historico_mesa(ruta, anio, cargo_raw):
    _procesar_generico_mesa(ruta, anio, cargo_raw, {
        'depnombre': 'Nombre Departamento',
        'munnombre': 'Nombre Municipio',
        'parnombre': 'Nombre Partido',
        'cannombre': 'Nombre Candidato',
        'votos':     'Total Votos',
    }, 'formato histórico por mesa')


# ── Procesador formato columnas abreviadas (2026) ───────────────────────────────
def procesar_sql_abrev(ruta, anio, cargo_raw):
    _procesar_generico_mesa(ruta, anio, cargo_raw, {
        'depnombre': 'DEPNOMBRE',
        'munnombre': 'MUNNOMBRE',
        'parnombre': 'PARNOMBRE',
        'cannombre': 'CANNOMBRE',
        'votos':     'VOTOS',
    }, 'formato columnas abreviadas 2026')


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

    # Mismo criterio que _procesar_generico_mesa(): texto ya resuelto, se deja
    # crudo, JS normaliza en render.
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
            formato = detectar_formato(ruta)
            if formato == 'nuevo':
                procesar_historico_mesa(ruta, anio, cargo_raw)
            elif formato == 'sql_abrev':
                procesar_sql_abrev(ruta, anio, cargo_raw)
            else:
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
