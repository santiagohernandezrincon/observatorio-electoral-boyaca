// Generado automáticamente por normalizar_partidos.py
const COLORES_PARTIDO = {
  // ── PARTIDOS PRINCIPALES ────────────────────────────────
  'Partido Liberal Colombiano':     '#D80027',
  'Partido Conservador Colombiano': '#0033A0',
  'Partido de la U':                '#E8820C',
  'Cambio Radical':                 '#D81B60',
  'Alianza Verde':                  '#2E7D32',
  'Partido Verde Oxígeno':          '#1B5E20',
  'Partido Verde':                  '#2E7D32',
  'Centro Democrático':             '#42A5F5',
  'Polo Democrático Alternativo':   '#FDD835',
  'Pacto Histórico':                '#7B1FA2',
  'Opción Ciudadana':               '#FB8C00',
  'Movimiento MIRA':                '#1E88E5',
  'Alianza Social Independiente':   '#66BB6A',
  'Comunes':                        '#B71C1C',
  'Colombia Justa Libres':          '#283593',
  'Liga de Gobernantes':            '#FF8F00',
  'Centro Esperanza':               '#8BC34A',
  'Coalición Colombia':             '#8BC34A',
  'Equipo por Colombia':            '#546E7A',
  'Gran Consulta por Colombia':     '#64B5F6',
  'MAIS':                           '#8D4E2A',
  'AICO':                           '#795548',
  'Creemos':                        '#5C6BC0',
  'MIO':                            '#FFA000',
  'Nuevo Liberalismo':              '#E57373',
  'Unión Patriótica':               '#880E4F',
  'Fuerza Ciudadana':               '#00897B',
  'Colombia Piensa en Grande':      '#FF7043',
  'Partido PIN':                    '#78909C',
  // ── PARTIDOS 2026 ───────────────────────────────────────
  'Salvación Nacional':             '#1A237E',
  'Con Toda por Colombia':          '#00838F',
  'Valientes':                      '#0277BD',
  'Colombia Renaciente':            '#26A69A',
  'Todos Somos Colombia':           '#A1887F',
  'Partido Somos':                  '#BCAAA4',
  'Dignidad y Compromiso':          '#FBC02D',
  // ── AGREGADOS SESIÓN JULIO 2026 (cierre backlog eslóganes) ──
  'Nueva Fuerza Democrática':       '#F57F17',
  'En Marcha':                      '#C2185B',
  'Fuerza de la Paz':               '#00ACC1',
  // ── PLEBISCITO ──────────────────────────────────────────
  'Sí':                             '#43A047',
  'No':                             '#E53935',
  // ── MOVIMIENTOS Y FALLBACKS ─────────────────────────────
  'Movimiento Ciudadano':           '#B0B8C1',
  'Partido sin identificar':        '#9CA3AF',
  'Sin partido':                    '#9CA3AF',
  'Votos nulos':                    '#EAECEE',
  'Votos en blanco':                '#D5D8DC',
  'Votos no marcados':              '#F2F3F4',
  'Otro':                           '#D5D8DC',
};

// Tabla de normalización: alias → nombre canónico
// Espejo JS de NORMALIZACION en scripts/normalizar_partidos.py
const NORMALIZAR_PARTIDO = {
  // PARTIDO LIBERAL
  'PARTIDO LIBERAL COLOMBIANO': 'Partido Liberal Colombiano',
  'PARTIDO LIBERAL': 'Partido Liberal Colombiano',
  'Partido Liberal': 'Partido Liberal Colombiano',
  'LIBERAL': 'Partido Liberal Colombiano',

  // PARTIDO CONSERVADOR
  'PARTIDO CONSERVADOR COLOMBIANO': 'Partido Conservador Colombiano',
  'PARTIDO CONSERVADOR': 'Partido Conservador Colombiano',
  'Partido Conservador': 'Partido Conservador Colombiano',
  'CONSERVADOR': 'Partido Conservador Colombiano',

  // PARTIDO DE LA U
  'PARTIDO SOCIAL DE UNIDAD NACIONAL': 'Partido de la U',
  'Partido Social de Unidad Nacional': 'Partido de la U',
  'PARTIDO DE LA U': 'Partido de la U',
  'Partido de La U': 'Partido de la U',
  'DE LA U': 'Partido de la U',

  // CAMBIO RADICAL
  'CAMBIO RADICAL': 'Cambio Radical',
  'Cambio radical': 'Cambio Radical',
  'PARTIDO CAMBIO RADICAL': 'Cambio Radical',

  // ALIANZA VERDE
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

  // PARTIDO VERDE OXÍGENO
  'PARTIDO VERDE OXIGENO': 'Partido Verde Oxígeno',
  'Partido Verde Oxígeno': 'Partido Verde Oxígeno',
  'VERDE OXIGENO': 'Partido Verde Oxígeno',
  'OXIGENO': 'Partido Verde Oxígeno',

  // CENTRO DEMOCRÁTICO
  'CENTRO DEMOCRATICO': 'Centro Democrático',
  'Centro Democratico': 'Centro Democrático',
  'PARTIDO CENTRO DEMOCRATICO': 'Centro Democrático',

  // PACTO HISTÓRICO
  'COLOMBIA HUMANA': 'Pacto Histórico',
  'Colombia Humana': 'Pacto Histórico',
  'COLOMBIA HUMANA - UP': 'Pacto Histórico',
  'MOVIMIENTO COLOMBIA HUMANA': 'Pacto Histórico',
  'PACTO HISTORICO': 'Pacto Histórico',
  'Pacto Historico': 'Pacto Histórico',
  'PACTO HISTÓRICO COLOMBIA PUEDE': 'Pacto Histórico',
  'EN MARCHA': 'Pacto Histórico',

  // POLO DEMOCRÁTICO
  'POLO DEMOCRATICO ALTERNATIVO': 'Polo Democrático Alternativo',
  'POLO DEMOCRATICO': 'Polo Democrático Alternativo',
  'Polo Democrático': 'Polo Democrático Alternativo',
  'Polo Democratico Alternativo': 'Polo Democrático Alternativo',
  'PDA': 'Polo Democrático Alternativo',

  // OPCIÓN CIUDADANA / PIN
  'OPCION CIUDADANA': 'Opción Ciudadana',
  'Opcion Ciudadana': 'Opción Ciudadana',
  'PARTIDO DE INTEGRACION NACIONAL': 'Opción Ciudadana',
  'PARTIDO INTEGRACION NACIONAL': 'Opción Ciudadana',
  'PIN': 'Opción Ciudadana',
  'CONVERGENCIA CIUDADANA': 'Opción Ciudadana',
  'Convergencia Ciudadana': 'Opción Ciudadana',

  // MIRA
  'MOVIMIENTO MIRA': 'Movimiento MIRA',
  'MIRA': 'Movimiento MIRA',
  'MOVIMIENTO DE INTEGRACION Y RENOVACION': 'Movimiento MIRA',

  // ASI
  'ALIANZA SOCIAL INDEPENDIENTE': 'Alianza Social Independiente',
  'ALIANZA SOCIAL INDIGENA': 'Alianza Social Independiente',
  'ASI': 'Alianza Social Independiente',

  // COMUNES
  'FARC': 'Comunes',
  'PARTIDO COMUNES': 'Comunes',
  'FUERZA ALTERNATIVA REVOLUCIONARIA DEL COMUN': 'Comunes',

  // COLOMBIA JUSTA LIBRES
  'COLOMBIA JUSTA LIBRES': 'Colombia Justa Libres',
  'JUSTA LIBRES': 'Colombia Justa Libres',

  // UNIÓN PATRIÓTICA
  'UNION PATRIOTICA': 'Unión Patriótica',
  'UP': 'Unión Patriótica',

  // COALICIONES PRESIDENCIALES
  'EQUIPO POR COLOMBIA': 'Equipo por Colombia',
  'CENTRO ESPERANZA': 'Centro Esperanza',
  'GRAN CONSULTA POR COLOMBIA': 'Gran Consulta por Colombia',
  'Gran Consulta por Colombia': 'Gran Consulta por Colombia',

  // LIGA DE GOBERNANTES
  'LIGA DE GOBERNANTES ANTICORRUPCION': 'Liga de Gobernantes',
  'LIGA DE GOBERNANTES ANTICORRUPCIÓN': 'Liga de Gobernantes',

  // COALICIONES 2022
  'COALICION PACTO HISTÓRICO': 'Pacto Histórico',
  'COALICION PACTO HISTORICO': 'Pacto Histórico',
  'COALICION EQUIPO POR COLOMBIA': 'Equipo por Colombia',
  'COALICION CENTRO ESPERANZA': 'Centro Esperanza',
  // 2022 Senado: coalición Alianza Verde + Centro Esperanza → dominante = Verde en Boyacá
  'COALICIÓN ALIANZA VERDE Y CENTRO ESPERANZA': 'Alianza Verde',
  'COALICION ALIANZA VERDE Y CENTRO ESPERANZA': 'Alianza Verde',

  // ── COALICIONES 2026 ────────────────────────────────────────────────
  // Senado 2026: lista electoral de Alianza Verde
  'ALIANZA POR COLOMBIA': 'Alianza Verde',
  // Senado 2026: variante de Pacto Histórico
  'PACTO HISTÓRICO SENADO': 'Pacto Histórico',
  'PACTO HISTORICO SENADO': 'Pacto Histórico',
  // Senado 2026: Polo Democrático + movimientos de izquierda (Robledo et al.)
  'AHORA COLOMBIA': 'Movimiento MIRA',  // Coalición MIRA + Nuevo Liberalismo + Dignidad (2026 Senado)
  // Senado 2026: lista de Cambio Radical con Alma
  'COALICIÓN CAMBIO RADICAL - ALMA': 'Cambio Radical',
  'COALICION CAMBIO RADICAL - ALMA': 'Cambio Radical',
  // Cámara 2026: Partido Verde Oxígeno + Alma
  'ALMA - OXÍGENO': 'Partido Verde Oxígeno',
  'ALMA - OXIGENO': 'Partido Verde Oxígeno',
  // Cámara 2026: Cambio Radical + Nuevo Liberalismo
  'CR-NUEVO LIBERALISMO': 'Cambio Radical',
  // Consultas 2026: coalición de izquierda (Petro-afines)
  'FRENTE POR LA VIDA': 'Pacto Histórico',
  // Consultas 2026: consulta interna independiente (soluciones Liga/Fuerza Ciudadana)
  'CONSULTA DE LAS SOLUCIONES: SALUD, SEGURIDAD Y EDUCACIÓN': 'Fuerza Ciudadana',

  // ── PARTIDO DE LA U — variantes coalición (2023/2026) ───────────────
  'PARTIDO DE LA U-PARTIDO MIRA': 'Partido de la U',
  'PARTIDO DE LA U Y PARTIDO MIRA': 'Partido de la U',
  'PARTIDO DE LA U Y EL PARTIDO POLITICO MIRA': 'Partido de la U',
  'PARTIDO DE LA U-PARTIDO EN MARCHA': 'Partido de la U',
  'PARTIDO DE LA U-PARTIDO EN MARCHA-PARTIDO POLÍTICO MIRA': 'Partido de la U',
  'PARTIDO DE LA U-PARTIDO CAMBIO RADICAL': 'Partido de la U',
  'PARTIDO DE LA U - CAMBIO RADICAL': 'Partido de la U',
  'PARTIDO DE LA U Y PARTIDO CONSERVADOR': 'Partido de la U',
  'PARTIDO DE LA U-CAMBIO RADICAL-ALIANZA VERDE': 'Partido de la U',
  'PARTIDO SOCIAL DE UNIDAD NACIONAL Y PARTIDO CAMBIO RADICAL': 'Partido de la U',
  'PARTIDO DE LA UNION POR LA GENTE- PARTIDO CAMBIO RADICAL': 'Partido de la U',
  'ACUERDO DE COALICÓN ENTRE EL PARTIDO DE LA U Y PARTIDO MIRA': 'Partido de la U',
  'COALICION PARTIDO DE LA U -PARTIDO POLITICO MIRA': 'Partido de la U',
  'COALICION PARTIDO DE LA U- PARTIDO POLITICO MIRA': 'Partido de la U',
  'COALICION PARTIDO DE LA U -CAMBIO RADICAL': 'Partido de la U',
  'CHIQUINQUIRA LA U MIRA': 'Partido de la U',
  'PARTIDO DE LA U - PARTIDO MIRA': 'Partido de la U',

  // ── CONSERVADOR — variantes coalición ───────────────────────────────
  'PARTIDO CONSERVADOR COLOMBIANO Y EL PARTIDO ASI': 'Partido Conservador Colombiano',
  'PARTIDO CONSERVADOR - ASI': 'Partido Conservador Colombiano',
  'PARTIDO CONSERVADOR - PARTIDO LIBERAL': 'Partido Conservador Colombiano',
  'PARTIDO CONSERVADOR COLOMBIANO - PARTIDO LIBERAL COLOMBIANO': 'Partido Conservador Colombiano',
  'PCC - LIBERAL - SIACHOQUE': 'Partido Conservador Colombiano',
  'PCC-ASI-CUCAITA': 'Partido Conservador Colombiano',
  'COALICION LIBERAL-CONSERVADORA': 'Partido Conservador Colombiano',

  // ── ALIANZA VERDE — variantes coalición local 2023 ──────────────────
  'ALIANZAVERDE-PARTIDO SOCIAL DE UNIDAD NACIONAL': 'Alianza Verde',
  'PARTIDO VERDE Y PARTIDO DE LA U': 'Alianza Verde',
  'PARTIDO VERDE OXÍGENO': 'Partido Verde Oxígeno',
  'PARTIDO POLÍTICO OXÍGENO': 'Partido Verde Oxígeno',
  'BOYACÁ POTENCIA DE VIDA': 'Alianza Verde',  // Alcaldías 2023, coalición verde
  'ARCABUCO VERDE UNIDO POR LA GENTE': 'Alianza Verde',

  // ── CENTRO DEMOCRÁTICO — variantes ──────────────────────────────────
  'PARTIDO CENTRO DEMOCRATICO-PARTIDO POLITICO MIRA': 'Centro Democrático',
  'PARTIDO CENTRO DEMOCRATICO- PARTIDO POLITICO MIRA': 'Centro Democrático',
  'COALICION ALIANZA LIBERAL DE CENTRO DEMOCRATICO': 'Centro Democrático',

  // ── PACTO HISTÓRICO — variantes ─────────────────────────────────────
  'MOVIMIENTO POLÍTICO COLOMBIA HUMANA': 'Pacto Histórico',
  'BOYACÁ SOMOS TODOS': 'Pacto Histórico',  // 2023 candidato gobernación afín
  // 'COLOMBIA SEGURA Y PRÓSPERA' — movimiento independiente pequeño (10.7k votos), sin partido claro — queda sin color

  // ── SALVACIÓN NACIONAL / MIO — variantes ────────────────────────────
  'MOVIMIENTO SALVACIÓN NACIONAL': 'Salvación Nacional',
  'MOVIMIENTO DE SALVACIÓN NACIONAL': 'Salvación Nacional',
  'Mov. Salvación Nacional': 'Salvación Nacional',

  // ── LIBERAL — variantes coalición ───────────────────────────────────
  'COALICION LIBERAL': 'Partido Liberal Colombiano',
  'PARTIDO LA FUERZA DE LA PAZ-PARTIDO LIBERAL COLOMBIANO': 'Partido Liberal Colombiano',

  // ── FUERZA DE LA PAZ (partido propio, no confundir con la lista
  // conjunta con el Liberal de arriba) ────────────────────────────────
  'PARTIDO POLÍTICO LA FUERZA DE LA PAZ': 'Fuerza de la Paz',

  // ── NUEVA FUERZA DEMOCRÁTICA (partido real, no eslogan -- aparece en
  // 248 combinaciones año/cargo/municipio en 2023, alias directo aqui
  // en vez de palabrasClave porque el bucket ya existia sin resolver:
  // el fallback de normalizePartido() mayuscula el nombre del bucket
  // antes de buscarlo, así que sin este alias nunca hubiera encontrado
  // la version Title Case que usa COLORES_PARTIDO) ─────────────────────
  'NUEVA FUERZA DEMOCRÁTICA': 'Nueva Fuerza Democrática',

  // ── EN MARCHA (Puerto Boyacá, movimiento local propio -- alias directo
  // en vez de palabrasClave a propósito: ya existe 'EN MARCHA' -> Pacto
  // Histórico arriba para una coalición nacional distinta; un bucket de
  // palabrasClave llamado "En Marcha" habría colisionado con esa entrada
  // porque el fallback compara en mayúsculas) ──────────────────────────
  'PUERTO BOYACÁ ES DE TODOS': 'En Marcha',

  // CANDIDATOS MENORES 2022
  'COLOMBIA PIENSA EN GRANDE': 'Colombia Piensa en Grande',
  'PARTIDO MOVIMIENTO DE SALVACION NACIONAL': 'Salvación Nacional',


  // ── Coaliciones hiperlocales alcaldías (auto-generadas) ──
  'COALICION ALCALDIA DE COPER': 'Partido de la U',
  'COALICION AMOR POR VILLA DE LEYVA': 'Partido Liberal Colombiano',
  'COALICION CONSTRUYENDO FUTURO': 'Partido Liberal Colombiano',
  'COALICION ES EL MOMENTO DE UNIRNOS POR MONIQUIRA': 'Partido Liberal Colombiano',
  'COALICION LIBERAL': 'Partido Liberal Colombiano',
  'COALICION POR UN MEJOR MA├æANA': 'Alianza Verde',
  'COALICI├ôN CONSTRUYAMOS OPORTUNIDADES PARA TODOS': 'Partido Liberal Colombiano',
  'COALICI├ôN GOBIERNO EN EQUIPO PARA SEGUIR PROGRESANDO': 'Alianza Verde',
  'CONSTRUYAMOS UNA NUEVA HISTORIA': 'Alianza Verde',
  'CONSTRUYENDO CON AMOR': 'Alianza Verde',
  'CONSTRUYENDO EL PAYA QUE TODOS QUEREMOS': 'Alianza Verde',
  'CONSTRUYENDO PROGRESO PARA MOTAVITA': 'Partido Liberal Colombiano',
  'EL PROGRESO DE SUTAMARCHAN DEBE CONTINUAR': 'Cambio Radical',
  'EN EQUIPO HACEMOS MAS': 'Partido de la U',
  'EXPERIENCIA Y CAMBIO PARA VOLVER AL PROGRESO': 'Partido Liberal Colombiano',
  'JUNTOS #ESMOMENTO': 'Centro Democrático',
  'JUNTOS LABRANDO FUTURO POR SAN JOSE DE PARE': 'Partido Liberal Colombiano',
  'JUNTOS POR EL FUTURO DE BOYACA': 'Alianza Verde',
  'JUNTOS POR UMBITA': 'Alianza Verde',
  'JUNTOS SI PODEMOS': 'Alianza Verde',
  'PARTIDO DE LA UNI├ôN POR LA GENTE - PARTIDO DE LA U': 'Partido de la U',
  'POR EL BIENESTAR, LA SALUD Y EL CAMPO': 'Alianza Verde',
  'POR EL RENACER DE TOGUI, JUNTOS PODEMOS MAS': 'Partido Liberal Colombiano',
  'POR EL RENACER DE UN PUEBLO UNIDO': 'ASI',
  'POR LA DIGNIDAD DE ARCABUCO': 'En Marcha',
  'POR UN TOGUI PRODUCTIVO Y SOSTENIBLE': 'Partido Liberal Colombiano',
  'PUERTO BOYACA PRIMERO': 'Cambio Radical',
  'SAN PABLO DE BORBUR SIEMPRE CONTIGO': 'Partido Conservador Colombiano',
  'SOATA JUNTOS POR UN MEJOR FUTURO': 'Centro Democrático',
  'TENZA UNIDA PROGRESO DE TODOS': 'Centro Democrático',
  'TIPACOQUE CONSTRUYE PROGRESO': 'Partido Liberal Colombiano',
  'TODOS MARCHANDO POR UN CAMBIO': 'Alianza Verde',
  'TODOS POR BRICE├æO': 'Alianza Verde',
  'TODOS POR CUBARA': 'MAIS',
  'TRABAJEMOS EN EQUIPO POR MOTAVITA': 'En Marcha',
  'TRABAJEMOS UNIDOS POR SORACA': 'Alianza Verde',
  'UINDOS POR UNA VICTORIA PROSPERA Y SOLIDARIA': 'Cambio Radical',
  'UNIDOS CONSTRUIMOS DESARROLLO SOCIAL': 'Alianza Verde',
  'UNIDOS DE VERDAD': 'Partido Liberal Colombiano',
  'UNIDOS POR EL DESARROLLO DE BOAVITA': 'Alianza Verde',
  'UNIDOS POR EL DESARROLLO DE PESCA': 'Alianza Verde',
  'UNIDOS POR EL PROGRESO DE CALDAS': 'Partido Liberal Colombiano',
  'UNIDOS POR GUICAN': 'Centro Democrático',
  'UNIDOS POR NUESTRA TIERRA': 'Alianza Verde',
  'UNIDOS POR PESCA': 'ASI',
  'UNIDOS POR SATIVASUR': 'Centro Democrático',
  'UNIDOS POR TINJACA': 'ASI',
  'UNIDOS POR UN MEJOR FUTURO PARA PAEZ': 'Partido de la U',
  'UNIDOS POR UN TIBANA DE OPORTUNIDADES': 'Alianza Verde',
  'UNIDOS SOMOS EL EQUIPO DEL CAMBIO': 'Alianza Verde',
  'UNIDOS SOMOS MAS': 'Centro Democrático',
  // Confirmado por Santiago: coalicion Colombia Renaciente + Nuevo Liberalismo +
  // Salvación Nacional en Garagoa 2023 (alcaldia) -- primer partido = aval principal.
  // Alias directo aqui (no en palabrasClave) para que no quede atrapado por el
  // match de substring de 'SOMOS MAS' (Cambio Radical, ver palabrasClave).
  'JUNTOS SOMOS MAS FUERTES': 'Colombia Renaciente',
  // El bucket de palabrasClave 'PARTIDO COLOMBIA RENACIENTE' nunca tuvo alias
  // hacia el nombre canonico -- caia sin color en Concejo 2019/2023 (auditoria
  // sesión julio 2026, Tarea 1).
  'PARTIDO COLOMBIA RENACIENTE': 'Colombia Renaciente',

  // VOTOS ESPECIALES
  'VOTOS NULOS': 'Votos nulos',
  'VOTOS EN BLANCO': 'Votos en blanco',
  'VOTOS NO MARCADOS': 'Votos no marcados',

  // FUERZA CIUDADANA
  'FUERZA CIUDADANA': 'Fuerza Ciudadana',

  // NUEVO LIBERALISMO
  'NUEVO LIBERALISMO': 'Nuevo Liberalismo',

  // PLEBISCITO 2016
  'SI': 'Sí', 'Sí': 'Sí', 'si': 'Sí',
  'NO': 'No', 'No': 'No', 'no': 'No',

  // ── Alianza Social Independiente (variantes largas) ──
  'ALIANZA SOCIAL INDIGENA  ASI': 'Alianza Social Independiente',
  'PARTIDO ALIANZA SOCIAL INDEPENDIENTE': 'Alianza Social Independiente',
  'PARTIDO ALIANZA SOCIAL INDEPENDIENTE  ASI': 'Alianza Social Independiente',
  'PARTIDO ALIANZA SOCIAL INDEPENDIENTE ASI': 'Alianza Social Independiente',
  'PARTIDO ALIANZA SOCIAL INDEPENDIENTE "ASI"': 'Alianza Social Independiente',
  'Partido Alianza Social Independiente': 'Alianza Social Independiente',
  'Partido Alianza Social Independiente  Asi': 'Alianza Social Independiente',
  'Partido ASI': 'Alianza Social Independiente',

  // ── Cambio Radical ──
  'PARTIDO CAMBIO RADICAL COLOMBIANO': 'Cambio Radical',
  'Partido Cambio Radical Colombiano': 'Cambio Radical',

  // ── Centro Democrático ──
  'CENTRO DEMOCRATICO MANO FIRME CORAZON GRANDE': 'Centro Democrático',
  'Centro Democratico Mano Firme Corazon Grande': 'Centro Democrático',
  'PARTIDO CENTRO DEMOCRATICO MANO FIRME CORAZON GRANDE': 'Centro Democrático',
  'Partido Centro Democratico Mano Firme Corazon Grande': 'Centro Democrático',
  'PARTIDO CENTRO DEMOCRÁTICO': 'Centro Democrático',

  // ── Colombia Justa Libres ──
  'PARTIDO COLOMBIA JUSTA LIBRES': 'Colombia Justa Libres',
  'GSC COLOMBIA JUSTA LIBRES': 'Colombia Justa Libres',
  'Gsc Colombia Justa Libres': 'Colombia Justa Libres',
  'Partido Fuerza Alternativa Revolucionaria Del Comu': 'Comunes',

  // ── Gran Consulta por Colombia ──
  'LA GRAN CONSULTA POR COLOMBIA': 'Gran Consulta por Colombia',
  'LA LISTA DE OVIEDO - CON TODA POR COLOMBIA': 'Gran Consulta por Colombia',
  // Consultas 2026: sub-partidos dentro de La Gran Consulta por Colombia → unificar color
  'Con Toda por Colombia': 'Gran Consulta por Colombia',   // Oviedo participó en Gran Consulta
  'Valientes': 'Gran Consulta por Colombia',               // Dávila participó en Gran Consulta
  'VALIENTES': 'Gran Consulta por Colombia',

  // ── Movimiento MIRA ──
  'PARTIDO POLITICO  MIRA': 'Movimiento MIRA',
  'PARTIDO POLITICO MIRA': 'Movimiento MIRA',
  'Partido Politico Mira': 'Movimiento MIRA',
  'MOVIMIENTO INDEPENDIENTE DE RENOVACION ABSOLUTA  MIRA': 'Movimiento MIRA',
  'Movimiento Independiente De Renovacion Absoluta  Mira': 'Movimiento MIRA',

  // ── Dignidad y Compromiso — variantes ──
  'PARTIDO POLÍTICO DIGNIDAD & COMPROMISO': 'Dignidad y Compromiso',
  'PARTIDO POLITICO DIGNIDAD & COMPROMISO': 'Dignidad y Compromiso',
  'PARTIDO POLÍTICO DIGNIDAD Y COMPROMISO': 'Dignidad y Compromiso',
  'DIGNIDAD & COMPROMISO': 'Dignidad y Compromiso',

  // ── Mov. Salvación Nacional — consolidado (apuntan a 'Salvación Nacional' en COLORES_PARTIDO) ──
  'MOVIMIENTO SALVACION NACIONAL': 'Salvación Nacional',
  'PARTIDO MOVIMIENTO DE SALVACION NACIONAL': 'Salvación Nacional',
  'PARTIDO CONSERVADOR - MOVIMIENTO SALVACIÓN NACIONAL': 'Partido Conservador Colombiano',
  'PARTIDO CONSERVADOR - MOVIMIENTO SALVACION NACIONAL': 'Partido Conservador Colombiano',
  'PARTIDO CONSERVADOR - SALVACION NACIONAL':            'Partido Conservador Colombiano',

  // ── Nuevo Liberalismo ──
  'PARTIDO NUEVO LIBERALISMO': 'Nuevo Liberalismo',
  'Partido Nuevo Liberalismo': 'Nuevo Liberalismo',
  'CR-NUEVO LIBERALISMO': 'Nuevo Liberalismo',

  // ── Opción Ciudadana / PIN ──
  'PARTIDO OPCION CIUDADANA': 'Opción Ciudadana',
  'Partido Opcion Ciudadana': 'Opción Ciudadana',
  'PARTIDO DE INTEGRACION NACIONAL  PIN': 'Opción Ciudadana',
  'PARTIDO DE INTEGRACION NACIONAL PIN': 'Opción Ciudadana',
  'Partido De Integracion Nacional  Pin': 'Opción Ciudadana',
  'Partido PIN': 'Opción Ciudadana',

  // ── Pacto Histórico ──
  'PACTO HISTÓRICO': 'Pacto Histórico',
  'PACTO HISTÓRICO BOYACÁ': 'Pacto Histórico',
  'PACTO HISTÓRICO SENADO': 'Pacto Histórico',
  'PACTO HISTORICO COLOMBIA PUEDE': 'Pacto Histórico',
  'COLOMBIA HUMANA - UNION PATRIOTICA': 'Pacto Histórico',
  'MOVIMIENTO POLÍTICO COLOMBIA HUMANA': 'Pacto Histórico',
  'AGRUPACIÓN POLÍTICA EN MARCHA': 'Pacto Histórico',
  'COALICIÓN PACTO HISTÓRICO': 'Pacto Histórico',

  // ── Partido de la U ──
  'PARTIDO SOCIAL DE LA U': 'Partido de la U',
  'Partido Social De La U': 'Partido de la U',
  'PARTIDO SOCIAL DE UNIDAD NACIONAL  PARTIDO DE LA U': 'Partido de la U',
  'Partido Social De Unidad Nacional  Partido De La U': 'Partido de la U',
  'PARTIDO DE LA UNIÓN POR LA GENTE "PARTIDO DE LA U"': 'Partido de la U',
  'PARTIDO DE LA UNIÓN POR LA GENTE - PARTIDO DE LA U': 'Partido de la U',
  'PARTIDO SOCIAL UNIDAD NACIONAL - PARTIDO ALIANZA  SOCIAL INDEPENDIENTE - ASI': 'Partido de la U',

  // ── Polo Democrático ──
  'PARTIDO POLO DEMOCRATICO ALTERNATIVO': 'Polo Democrático Alternativo',
  'Partido Polo Democratico Alternativo': 'Polo Democrático Alternativo',
  'PARTIDO POLO DEMOCRÁTICO ALTERNATIVO': 'Polo Democrático Alternativo',

  // ── Unión Patriótica ──
  'PARTIDO UNION PATRIOTICA': 'Unión Patriótica',
  'PARTIDO UNION PATRIOTICA  UP': 'Unión Patriótica',
  'PARTIDO UNIÓN PATRIÓTICA  UP': 'Unión Patriótica',
  'PARTIDO UNIÓN PATRIÓTICA "UP"': 'Unión Patriótica',
  'Partido Union Patriotica': 'Unión Patriótica',
  'Partido Union Patriotica  Up': 'Unión Patriótica',

  // ── Fuerza Ciudadana ──
  'MOVIMIENTO POLITICO FUERZA CIUDADANA': 'Fuerza Ciudadana',
  'COALICIÓN FUERZA CIUDADANA': 'Fuerza Ciudadana',

  // ── Coaliciones 2023 Asamblea Boyacá ──
  'COALICION U - EN MARCHA - MIRA': 'Partido de la U',
  'COALICION U - EN MARCHA': 'Partido de la U',
  'U - EN MARCHA - MIRA': 'Partido de la U',
  'RESULTADOS PARA BOYACA': 'Partido Liberal Colombiano',
  'RESULTADOS PARA BOYACÁ': 'Partido Liberal Colombiano',

  // ── MAIS ──
  'MOVIMIENTO ALTERNATIVO INDIGENA Y SOCIAL  MAIS': 'MAIS',
  'MOVIMIENTO ALTERNATIVO INDIGENA Y SOCIAL MAIS': 'MAIS',
  'MOVIMIENTO ALTERNATIVO INDÍGENA Y SOCIAL  MAIS': 'MAIS',
  'MOVIMIENTO ALTERNATIVO INDÍGENA Y SOCIAL "MAIS"': 'MAIS',
  'MOVIMIENTO ALTERNATIVO INDÍGENA SOCIAL "MAIS"': 'MAIS',
  'Movimiento Alternativo Indigena Y Social  Mais': 'MAIS',
  'Movimiento Alternativo Indigena Y Social Mais': 'MAIS',
  'MAIS - POLO': 'MAIS',

  // ── AICO ──
  'MOVIMIENTO AUTORIDADES INDIGENAS DE COLOMBIA': 'AICO',
  'MOVIMIENTO AUTORIDADES INDIGENAS DE COLOMBIA AICO': 'AICO',
  'MOVIMIENTO AUTORIDADES INDIGENAS DE COLOMBIA  AICO': 'AICO',
  'MOVIMIENTO AUTORIDADES INDÍGENAS DE COLOMBIA "AICO"': 'AICO',
  'MOVIMIENTO DE AUTORIDADES INDIGENAS DE COLOMBIA  AICO': 'AICO',
  'Movimiento Autoridades Indigenas De Colombia': 'AICO',
  'Movimiento Autoridades Indigenas De Colombia  Aico': 'AICO',
  'Movimiento De Autoridades Indigenas De Colombia  Aico': 'AICO',

  // ── MIO ──
  'MOVIMIENTO DE INCLUSION Y OPORTUNIDADES': 'MIO',
  'MOVIMIENTO DE INCLUSION Y OPORTUNIDADES  MIO': 'MIO',
  'Movimiento De Inclusion Y Oportunidades': 'MIO',
  'Movimiento De Inclusion Y Oportunidades  Mio': 'MIO',

  // ── Creemos ──
  'CREEMOS': 'Creemos',
  'PARTIDO POLÍTICO CREEMOS': 'Creemos',

  // ── Votos especiales ──
  'PROMOTORES VOTO EN BLANCO': 'Votos en blanco',
  'Promotores Voto En Blanco': 'Votos en blanco',

  // ── Administrativos ──
  'Candidata Retirada': 'Sin partido',
  'Candidatura No Aceptada': 'Sin partido',
  'Revocado (A)': 'Sin partido',
  'Sin nombre': 'Sin partido',
  'CANDIDATOS TOTALES': 'Sin partido',
  'Candidatos Totales': 'Sin partido',
};

function normalizePartido(nombre) {
  if (!nombre) return 'Partido sin identificar';
  const s = String(nombre).trim();
  const stripTildes = str => str.normalize('NFD').replace(/[̀-ͯ]/g, '');

  // 1. Lookup directo exacto
  if (NORMALIZAR_PARTIDO[s]) return NORMALIZAR_PARTIDO[s];

  // 2. Case-insensitive + colapso de espacios
  const u = s.toUpperCase().replace(/\s+/g, ' ');
  for (const k of Object.keys(NORMALIZAR_PARTIDO)) {
    if (k.toUpperCase().replace(/\s+/g, ' ') === u) {
      return NORMALIZAR_PARTIDO[k];
    }
  }

  // 2b. Igual que el paso 2, pero sin tildes. Necesario porque un nombre YA
  // canónico (p. ej. "Polo Democrático Alternativo") puede diferir de la
  // clave de NORMALIZAR_PARTIDO solo en una tilde ("POLO DEMOCRATICO
  // ALTERNATIVO", sin tilde) -- sin este paso, ese nombre ya-correcto caía
  // al fallback de palabrasClave (paso 4, que sí es sin tildes) y volvía con
  // el nombre "base" del bucket (p. ej. "POLO"), sin color asignado. Esto se
  // notaba doble: cargarDatos() ya resuelve bien la primera vez, pero
  // colorPartido() vuelve a llamar normalizePartido() sobre el resultado ya
  // resuelto, y esa segunda pasada era la que fallaba. Ver PENDIENTES.md.
  const uSinTildes = stripTildes(u);
  for (const k of Object.keys(NORMALIZAR_PARTIDO)) {
    if (stripTildes(k.toUpperCase().replace(/\s+/g, ' ')) === uSinTildes) {
      return NORMALIZAR_PARTIDO[k];
    }
  }

  // 3. Coaliciones con separador → primer segmento reconocido
  if (s.includes(' - ') || s.includes(' – ') || s.includes(';')) {
    const partes = s.split(/\s*[-–;]\s+|\s+[-–]\s*/);
    const pfx = /^(COALICI[ÓO]N|PARTIDO|PARTIDOS|MOVIMIENTO|GSC)\s+/i;
    for (const parte of partes) {
      const limpio = parte.replace(/[()]/g, '').trim();
      if (NORMALIZAR_PARTIDO[limpio]) return NORMALIZAR_PARTIDO[limpio];
      const lu = limpio.toUpperCase().replace(/\s+/g, ' ');
      for (const k of Object.keys(NORMALIZAR_PARTIDO)) {
        if (k.toUpperCase().replace(/\s+/g, ' ') === lu) {
          return NORMALIZAR_PARTIDO[k];
        }
      }
      const sinPfx = limpio.replace(pfx, '').trim();
      if (sinPfx !== limpio && NORMALIZAR_PARTIDO[sinPfx]) {
        return NORMALIZAR_PARTIDO[sinPfx];
      }
    }
  }

  // 4. Eslóganes de campaña / coaliciones hiperlocales conocidas: busca si
  // el texto crudo contiene alguna palabra clave de `palabrasClave`
  // (heredado de asignarColorPartido() en data.js/script.js, portado aquí
  // solo como resolución de NOMBRE, no de color). Si hay match, intenta
  // canonizar el "partido base" contra NORMALIZAR_PARTIDO -- sin volver a
  // llamar normalizePartido(), para no arriesgar recursión infinita si
  // partidoBase coincide con una de sus propias palabras clave (pasa con
  // 'PARTIDO ECOLOGISTA COLOMBIANO', cuya palabra clave es 'ECOLOGISTA').
  if (typeof palabrasClave !== 'undefined') {
    for (const [partidoBase, palabras] of Object.entries(palabrasClave)) {
      for (const palabra of palabras) {
        if (stripTildes(u).includes(stripTildes(palabra.toUpperCase()))) {
          if (NORMALIZAR_PARTIDO[partidoBase]) return NORMALIZAR_PARTIDO[partidoBase];
          const ub = stripTildes(partidoBase.toUpperCase().replace(/\s+/g, ' '));
          for (const k of Object.keys(NORMALIZAR_PARTIDO)) {
            if (stripTildes(k.toUpperCase().replace(/\s+/g, ' ')) === ub) {
              return NORMALIZAR_PARTIDO[k];
            }
          }
          return partidoBase;
        }
      }
    }
  }

  // 5. Fallback: devolver el string limpio
  return s;
}

function colorPartido(nombre) {
  if (!nombre) return '#9CA3AF';
  const canonical = normalizePartido(nombre);
  return COLORES_PARTIDO[canonical] || '#9CA3AF';
}
