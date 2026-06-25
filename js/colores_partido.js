// Generado automáticamente por normalizar_partidos.py
const COLORES_PARTIDO = {
  'Partido Liberal Colombiano': '#C0392B',
  'Partido Conservador Colombiano': '#154360',
  'Partido de la U': '#D35400',
  'Cambio Radical': '#2471A3',
  'Alianza Verde': '#1D8348',
  'Partido Verde Oxígeno': '#58D68D',
  'Centro Democrático': '#E67E22',
  'Polo Democrático Alternativo': '#922B21',
  'Pacto Histórico': '#641E16',
  'Opción Ciudadana': '#F39C12',
  'Movimiento MIRA': '#148F77',
  'Alianza Social Independiente': '#7D3C98',
  'Comunes': '#6D4C41',
  'Colombia Justa Libres': '#1A5276',
  'Unión Patriótica': '#A93226',
  'Fuerza Ciudadana': '#1ABC9C',
  'Nuevo Liberalismo': '#EC407A',
  'Liga de Gobernantes': '#839192',
  'Coalición Colombia': '#5DADE2',
  'Centro Esperanza': '#A9CCE3',
  'Equipo por Colombia': '#7F8C8D',
  'Gran Consulta por Colombia': '#F0B27A',
  'Sí': '#27AE60',
  'No': '#E74C3C',
  'Colombia Piensa en Grande': '#85929E',
  'Mov. Salvación Nacional': '#6C3483',
  'Votos nulos': '#EAECEE',
  'Votos en blanco': '#D5D8DC',
  'Votos no marcados': '#F2F3F4',
  'Partido Verde': '#27AE60',
  'MAIS': '#27AE60',
  'AICO': '#1E8449',
  'MIO': '#B7950B',
  'Creemos': '#6C3483',
  'Partido sin identificar': '#B2BEB5',
  'Movimiento Ciudadano': '#B0B8C1',
  'Sin partido': '#BDC3C7',
  'Otro': '#D5D8DC',
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

  // CANDIDATOS MENORES 2022
  'COLOMBIA PIENSA EN GRANDE': 'Colombia Piensa en Grande',
  'PARTIDO MOVIMIENTO DE SALVACION NACIONAL': 'Mov. Salvación Nacional',

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

  // ── Movimiento MIRA ──
  'PARTIDO POLITICO  MIRA': 'Movimiento MIRA',
  'PARTIDO POLITICO MIRA': 'Movimiento MIRA',
  'Partido Politico Mira': 'Movimiento MIRA',
  'MOVIMIENTO INDEPENDIENTE DE RENOVACION ABSOLUTA  MIRA': 'Movimiento MIRA',
  'Movimiento Independiente De Renovacion Absoluta  Mira': 'Movimiento MIRA',

  // ── Mov. Salvación Nacional ──
  'MOVIMIENTO SALVACIÓN NACIONAL': 'Mov. Salvación Nacional',
  'MOVIMIENTO DE SALVACIÓN NACIONAL': 'Mov. Salvación Nacional',
  'MOVIMIENTO SALVACION NACIONAL': 'Mov. Salvación Nacional',
  'PARTIDO CONSERVADOR - MOVIMIENTO SALVACIÓN NACIONAL': 'Mov. Salvación Nacional',
  'PARTIDO CONSERVADOR - MOVIMIENTO SALVACION NACIONAL': 'Mov. Salvación Nacional',

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

  // 1. Lookup directo exacto
  if (NORMALIZAR_PARTIDO[s]) return NORMALIZAR_PARTIDO[s];

  // 2. Case-insensitive + colapso de espacios
  const u = s.toUpperCase().replace(/\s+/g, ' ');
  for (const k of Object.keys(NORMALIZAR_PARTIDO)) {
    if (k.toUpperCase().replace(/\s+/g, ' ') === u) {
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

  // 4. Fallback: devolver el string limpio
  return s;
}

function colorPartido(nombre) {
  if (!nombre) return '#9CA3AF';
  const canonical = normalizePartido(nombre);
  return COLORES_PARTIDO[canonical] || '#9CA3AF';
}
