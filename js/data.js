// ==================== CONFIGURACIÓN DE RUTAS Y ARCHIVOS ====================
const basePath = 'data/';
const geojsonPath = 'geojson/boyaca_municipios_simple.geojson';

const archivosPorAnio = (() => {
    const result = {};
    Object.entries(DATOS_DISPONIBLES).forEach(([anio, corps]) => {
        result[anio] = {};
        corps.forEach(corp => {
            result[anio][corp] = {
                partido:   `votos_partido_municipio_${anio}_${corp}.csv`,
                candidato: `votos_candidato_municipio_${anio}_${corp}.csv`
            };
        });
    });
    return result;
})();

// ==================== COLORES DE PARTIDOS ====================
const palabrasClave = {
    'PARTIDO ALIANZA VERDE': ['VERDE', 'ALIANZA VERDE', 'ALIANZA POR COLOMBIA', 'BOYACÁ GRANDE', 'BOYACA GRANDE', 'GRAN ALIANZA POR BOYACA', 'HECHOS Y NO PALABRAS', 'ALIANZA PARA EL DESARROLLO', 'GENERACION DE OPORTUNIDADES', 'MARIPI, UN COMPROMISO DE CORAZON', 'UNIDOS MIRAFLORES PROGRESA MAS', 'UNIDOS POR NUESTRA TIERRA', 'ALCALDIA DE PAEZ', 'EN PAIPA SOLO FALTA SUMERCE', 'CONSTRUYENDO EL PAYA QUE TODOS QUEREMOS', 'PAZ DE RIO AVANZA', 'UNIDOS POR EL DESARROLLO DE PESCA', 'UNIDOS CONSTRUIMOS DESARROLLO SOCIAL', 'ALCALDIA DE RONDON', 'SEGUIMOS COMPROMETIDOS CON SAMACA', 'SEMBRANDO FUTURO POR SAN PABLO DE BORBUR', 'COALICION POR UN MEJOR MAÑANA', 'TIPACOQUE AVANZA', 'POR EL RENACER DE TOGUI, JUNTOS PODEMOS MAS', 'UNIDOS POR EL DESARROLLO DE BOAVITA', 'JUNTOS POR EL FUTURO DE BOYACA', 'TODOS POR BRICEÑO', 'PARTIDO VERDE Y PARTIDO DE LA U', 'CHIVATA, MANOS A LA OBRA', 'POR EL BIENESTAR, LA SALUD Y EL CAMPO', 'COALICIÓN GOBIERNO EN EQUIPO PARA SEGUIR PROGRESANDO', 'COMPROMISO POR GUATEQUE', 'ES CON HECHOS, NO CON PALABRAS', 'COMPROMISO Y GESTIÓN JENESANO NUESTRA MISIÓN', 'UNIDOS SOMOS MAS', 'UNIDOS SOMOS EL EQUIPO DEL CAMBIO', 'ALIANZA POR MIRAFLORES', 'CONSTRUYENDO CON AMOR', 'JUNTOS SI PODEMOS', 'RAQUIRA DIGNA', 'TODOS MARCHANDO POR UN CAMBIO', 'PA SERVIRLE A SUMERCE', 'LIDERAZGO Y GESTION, GARANTIA DE BUEN GOBIERNO', 'TRABAJEMOS UNIDOS POR SORACA', 'TRABAJAMOS POR SUTATENZA', 'UNIDOS POR UN TIBANA DE OPORTUNIDADES', 'TOCA POR BUEN CAMINO', 'TEJIENDO DESARROLLO', 'CONSTRUYAMOS UNA NUEVA HISTORIA', 'JUNTOS POR UMBITA', 'HAY CAMPO PARA TODOS', 'CONSULTA DE LAS SOLUCIONES: SALUD, SEGURIDAD Y EDUCACIÓN', 'CLAUDIA NAYIBE LOPEZ HERNANDEZ'],
    'PARTIDO LIBERAL COLOMBIANO': ['LIBERAL', 'LIBERAL COLOMBIANO', 'RESULTADOS POR BOYACÁ', 'RESULTADOS PARA BOYACA', 'PARA SERVIRLE A USTED', 'UNIDOS POR EL PROGRESO DE CALDAS', 'FIRAVITOBA NOS UNE', 'GARAGOA SOMOS TODOS', 'JENESANO UN PROPOSITO DE TODOS', 'CONSTRUYENDO PROGRESO PARA MOTAVITA', 'NOBSA UNIDA', 'OICATA CRECE EN BUENAS MANOS', 'UNA NUEVA ESPERANZA PARA UN MUNICIPIO PROSPERO', 'SABOYA SOMOS TODOS', 'PROPUESTAS CLARAS PARA EL CAMBIO', 'EXPERIENCIA Y CAMBIO PARA VOLVER AL PROGRESO', 'UNIDOS DE VERDAD', 'TOTA POR UN FUTURO PROACTIVO', 'ZETAQUIRA SIGUE ADELANTE', 'COALICION LIBERAL', 'COALICION LCC', 'CHITARAQUE AUTORIDAD Y COMPROMISO ¡CON USTED!', 'CUITIVA NUESTRO COMPROMISO', 'COALICIÓN CONSTRUYAMOS OPORTUNIDADES PARA TODOS', 'COALICION ES EL MOMENTO DE UNIRNOS POR MONIQUIRA', 'OICATA MERECE MAS', 'PAIPA NOS MUEVE', 'LA FUERZA DEL FUTURO', 'POR QUE SAMACÁ MERECE MAS', 'JUNTOS LABRANDO FUTURO POR SAN JOSE DE PARE', 'UN GOBIERNO PARA TODOS', 'COALICIÓN EL MOMENTO ES AHORA', 'COALICION CONSTRUYENDO FUTURO', 'TIPACOQUE CONSTRUYE PROGRESO', 'POR UN TOGUI PRODUCTIVO Y SOSTENIBLE', 'TUTA SIGUE ADELANTE', 'COALICION AMOR POR VILLA DE LEYVA'],
    'PARTIDO CONSERVADOR COLOMBIANO': ['CONSERVADOR', 'SOMOS MAS', 'SUMATE POR IZA COMPROMISO DE TODOS', 'DE CORAZON POR CHIVOR', 'CON EL DESARROLLO GANAMOS TODOS', 'SAN PABLO DE BORBUR SIEMPRE CONTIGO', 'PCC - LIBERAL - SIACHOQUE', 'TODA UNA VIDA AL SERVICIO DE SU GENTE Y DE SUSACÓN', 'GESTION Y COMPROMISO SOCIAL, CON ALMA TOPAGUENSE'],
    'CENTRO DEMOCRÁTICO': ['CENTRO DEMOCRÁTICO', 'CENTRO DEMOCRATICO', 'PARTIDO CENTRO DEMOCRATICO', 'JUNTOS ES EL MOMENTO', 'JUNTOS #ESMOMENTO', 'UNIDOS POR GUICAN', 'UNIDOS POR SAN JOSE PARE', 'UNIDOS SOMOS MAS', 'UNIDOS POR SIACHOQUE', 'SOATA JUNTOS POR UN MEJOR FUTURO', 'TRASFORMACION SOCIAL OPORTUNIDAD PARA TODOS', 'TENZA UNIDA PROGRESO DE TODOS', 'NUESTRO PROYECTO ES IZA', 'UNIDOS POR SATIVASUR', 'LA GRAN CONSULTA POR COLOMBIA', 'PALOMA SUSANA VALENCIA LASERNA'],
    'PARTIDO DE LA U': ['DE LA U', 'PARTIDO DE LA U', 'PARTIDO DE LA UNIÓN POR LA GENTE', 'EN EQUIPO HACEMOS MAS', 'SANABRIA ES MAS GESTION', 'UNIDOS POR UN MEJOR FUTURO PARA PAEZ', 'FRENTE POR LA VIDA', 'ROY LEONARDO BARRERAS MONTEALEGRE'],
    'PACTO HISTÓRICO': ['PACTO HISTÓRICO', 'PACTO HISTÓRICO SENADO', 'PACTO HISTÓRICO COLOMBIA PUEDE', 'PACTO HISTORICO', 'BOYACÁ POTENCIA DE VIDA', 'BOYACA POTENCIA DE VIDA', 'MOVIMIENTO POLÍTICO COLOMBIA HUMANA', 'COLOMBIA HUMANA'],
    'PARTIDO CAMBIO RADICAL': ['CAMBIO RADICAL', 'COALICIÓN CAMBIO RADICAL - ALMA', 'GOBIERNO DE RESULTADOS', 'SI ES POSIBLE', 'PARA SERVIRLE SUMERCE', 'CON EL ALMA POR CHITARAQUE', 'AL SERVICIO DE LA GENTE', 'PUERTO BOYACA PRIMERO', 'FIRMEZA LEALTAD Y COMPROMISO', 'EL PROGRESO DE SUTAMARCHAN DEBE CONTINUAR', 'POR AMOR A TIBANA', 'TUTA COMPROMISO DE TODOS', 'POR LA DIGNIDAD DE ARCABUCO', 'SOMOS ESPERANZA', 'YO SOY MARIPENSE', 'NOBSA A OTRO NIVEL', 'QUIPAMA LA FUERZA QUE NOS UNE'],
    'MOVIMIENTO SALVACIÓN NACIONAL': ['SALVACIÓN NACIONAL'],
    'CR-NUEVO LIBERALISMO': ['NUEVO LIBERALISMO', 'CREEMOS', 'PARTIDO POLÍTICO CREEMOS'],
    'ALMA - OXÍGENO': ['ALMA', 'OXÍGENO', 'PARTIDO POLÍTICO OXÍGENO', 'QUEREMOS EL CAMBIO CHIQUINQUIRA', 'RENOVACION SOATENSE'],
    'PARTIDO ECOLOGISTA COLOMBIANO': ['ECOLOGISTA'],
    'PARTIDO DEMÓCRATA COLOMBIANO': ['DEMÓCRATA'],
    'PARTIDO INDÍGENA COLOMBIANO P.I.C': ['INDÍGENA', 'INDIGENA', 'ASOCIACIÓN NACIONAL INDÍGENA', 'ASOCIACIÓN DE CABILDOS INDÍGENAS', 'CABILDO INDÍGENA', 'MOVIMIENTO ALTERNATIVO INDÍGENA'],
    'TRIETNICO GOBERNATIVO TRIGO': ['TRIGO', 'TRIETNICO'],
    'MOVIMIENTO SI': ['MOVIMIENTO SI'],
    'AHORA COLOMBIA': ['AHORA COLOMBIA'],
    'FRENTE AMPLIO UNITARIO': ['FRENTE AMPLIO UNITARIO'],
    'COLOMBIA SEGURA Y PRÓSPERA': ['COLOMBIA SEGURA Y PRÓSPERA'],
    'LA LISTA DE OVIEDO - CON TODA POR COLOMBIA': ['OVIEDO', 'CON TODA POR COLOMBIA', 'JUAN DANIEL OVIEDO ARANGO '],
    'PATRIOTAS': ['PATRIOTAS'],
    'NO MAS': ['NO MAS'],
    'NUEVA FUERZA DEMOCRÁTICA': ['NUEVA FUERZA DEMOCRÁTICA'],
    'BOYACÁ SOMOS TODOS': ['BOYACÁ SOMOS TODOS', 'BOYACA SOMOS TODOS'],
    'MOVIMIENTO ALTERNATIVO INDIGENA Y SOCIAL MAIS': ['MAIS'],
    'PARTIDO COLOMBIA RENACIENTE': ['RENACIENTE'],
    'DIGNIDAD & COMPROMISO': ['DIGNIDAD & COMPROMISO', 'HONESTIDAD, GESTION Y EXPERIENCIA POR TURMEQUE'],
    'ASI': ['ASI', 'PARTIDO ALIANZA SOCIAL INDEPENDIENTE', 'COALICION ALCALDIA DE COPER', 'GUATEQUE RAZONES PARA CONFIAR', 'UINDOS POR UNA VICTORIA PROSPERA Y SOLIDARIA', 'UNIDOS POR PESCA', 'POR EL RENACER DE UN PUEBLO UNIDO', 'UNIDOS POR TINJACA'],
    'POLO': ['POLO', 'POLO DEMOCRATICO ALTERNATIVO']
};

const coloresBase = {
    'SI': '#2ecc71', 'si': '#2ecc71', 'Sí': '#2ecc71', 'SÍ': '#2ecc71',
    'NO': '#e74c3c', 'no': '#e74c3c', 'No': '#e74c3c',
    'Opción Ciudadana': '#E67E22',
    'Liga de Gobernantes Anticorrupción': '#8E44AD',
    'Colombia Humana': '#C0392B',
    'Pacto Histórico': '#922B21',
    'FARC': '#7D3C98',
    'Polo Democrático Alternativo': '#E74C3C',
    'Polo Democrático': '#E74C3C',
    'Partido Verde': '#27AE60',
    'Alianza Verde': '#1E8449',
    'Partido PIN': '#F39C12',
    'Movimiento MIRA': '#16A085',
    'Colombia Justa Libres': '#1A5276',
    'Partido ASI': '#2980B9',
    'Cambio Radical': '#F4D03F',
    'Centro Democrático': '#922B21',
    'Partido de la U': '#E74C3C',
    'Coalición de Gobierno': '#2471A3',
    'Sin partido': '#95A5A6',
    'PARTIDO ALIANZA VERDE': '#2ecc71',
    'PARTIDO LIBERAL COLOMBIANO': '#e74c3c',
    'PARTIDO CONSERVADOR COLOMBIANO': '#2c3e50',
    'CENTRO DEMOCRÁTICO': '#5dade2',
    'PARTIDO DE LA U': '#f39c12',
    'PACTO HISTÓRICO': '#9b59b6',
    'PARTIDO CAMBIO RADICAL': '#e84393',
    'MOVIMIENTO SALVACIÓN NACIONAL': '#bdc3c7',
    'CR-NUEVO LIBERALISMO': '#f1c40f',
    'ALMA - OXÍGENO': '#1abc9c',
    'PARTIDO ECOLOGISTA COLOMBIANO': '#27ae60',
    'PARTIDO DEMÓCRATA COLOMBIANO': '#7f8c8d',
    'PARTIDO POLÍTICO DIGNIDAD & COMPROMISO': '#c39bd3',
    'PARTIDO INDÍGENA COLOMBIANO P.I.C': '#8e44ad',
    'PARTIDO INDÉGENA ZENÚ (PIZ)': '#8e44ad',
    'MOVIMIENTO ALTERNATIVO INDÍGENA Y SOCIAL "MAIS"': '#8e44ad',
    'TRIETNICO GOBERNATIVO TRIGO': '#d35400',
    'ASI': '#f7dc6f',
    'POLO': '#f39c12'
};

function asignarColorPartido(nombrePartido) {
    if (!nombrePartido) return '#95a5a6';
    let nombreLimpio = nombrePartido.toUpperCase().trim().replace(/["']/g, '').replace(/\s+/g, ' ');
    if (coloresBase[nombrePartido]) return coloresBase[nombrePartido];
    if (coloresBase[nombreLimpio])  return coloresBase[nombreLimpio];
    for (let [partidoBase, palabras] of Object.entries(palabrasClave)) {
        for (let palabra of palabras) {
            if (nombreLimpio.includes(palabra.toUpperCase())) {
                return coloresBase[partidoBase];
            }
        }
    }
    return '#95a5a6';
}
const coloresPartidos = new Proxy({}, { get: (target, prop) => asignarColorPartido(prop) });

// ==================== COLORES PARA CANDIDATOS ====================
function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function variarColorBase(colorBase, index) {
    let hsl = colorBase;
    if (colorBase.startsWith('#')) {
        const r = parseInt(colorBase.slice(1,3), 16);
        const g = parseInt(colorBase.slice(3,5), 16);
        const b = parseInt(colorBase.slice(5,7), 16);
        const [h, s, l] = rgbToHsl(r, g, b);
        hsl = `hsl(${h}, ${s}%, ${l}%)`;
    }
    const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!match) return colorBase;
    let h = parseInt(match[1]);
    let s = parseInt(match[2]);
    let l = parseInt(match[3]);
    const variation = (index % 20) - 10;
    s = Math.min(85, Math.max(50, s + variation));
    l = Math.min(70, Math.max(45, l + variation));
    return `hsl(${h}, ${s}%, ${l}%)`;
}

function getColorCandidato(nombreCandidato) {
    const nombreUpper = nombreCandidato.toUpperCase().trim();
    const verdesEspeciales = {
        'JAIME RAUL SALAMANCA TORRES': '#1e8449',
        'JULIAN DAVID GARCIA RUBIO': '#196f3d',
        'LUIS CARLOS OCHOA PASACHOA': '#145a32'
    };
    if (verdesEspeciales[nombreUpper]) return verdesEspeciales[nombreUpper];
    if (coloresCandidatos[nombreUpper]) return coloresCandidatos[nombreUpper];
    let partido = candidatoPartidoMap.get(nombreUpper);
    if (!partido && currentCandidatoData) {
        const row = currentCandidatoData.find(r => r['CANNOMBRE'].toUpperCase().trim() === nombreUpper);
        if (row) { partido = row['PARNOMBRE']; candidatoPartidoMap.set(nombreUpper, partido); }
    }
    if (!partido) {
        let hash = 0;
        for (let i = 0; i < nombreUpper.length; i++) { hash = ((hash << 5) - hash) + nombreUpper.charCodeAt(i); hash |= 0; }
        const color = `hsl(${Math.abs(hash % 60) + (hash % 2 === 0 ? 0 : 300)}, ${70 + (hash % 30)}%, ${55 + (hash % 20)}%)`;
        coloresCandidatos[nombreUpper] = color;
        return color;
    }
    const colorBase = colorPartido(partido);
    let hash = 0;
    for (let i = 0; i < nombreUpper.length; i++) { hash = ((hash << 5) - hash) + nombreUpper.charCodeAt(i); hash |= 0; }
    const colorFinal = variarColorBase(colorBase, Math.abs(hash % 30));
    coloresCandidatos[nombreUpper] = colorFinal;
    return colorFinal;
}

// ==================== NORMALIZACIÓN ====================
function normalizarNombre(nombre) {
    if (!nombre) return '';
    let limpio = nombre.toUpperCase().trim();
    limpio = limpio.normalize('NFD').replace(/[̀-ͯ]/g, '');
    limpio = limpio.replace(/\([^)]*\)/g, '');
    limpio = limpio.replace(/\s+/g, ' ').trim();
    const mapeo = {
        'GUICAN': 'GUICAN DE LA SIERRA',
        'VILLA DE LEYVA': 'VILLA DE LEYVA',
        'VILLA DE LEIVA': 'VILLA DE LEYVA',
        'AQUITANIA PUEBLOVIEJO': 'AQUITANIA',
        'AQUITANIA': 'AQUITANIA',
        'PAZ DE RIO': 'PAZ DE RIO',
        'PAZ DE RÍO': 'PAZ DE RIO',
        'BRICEÑO': 'BRICEÑO',
        'BRICENO': 'BRICEÑO',
        'GACHANTIVA': 'GACHANTIVA'
    };
    return mapeo[limpio] || limpio;
}

function obtenerProvinciaDeMunicipio(municipio) {
    if (!provinciasData) return null;
    const munNormalizado = normalizarNombre(municipio);
    for (const [provincia, municipios] of Object.entries(provinciasData)) {
        if (municipios.some(m => normalizarNombre(m) === munNormalizado)) return provincia;
    }
    return null;
}

function agregarDatosPorProvinciaPartidos(datosPorMunicipio) {
    const datosPorProvincia = {};
    for (const [municipio, filas] of Object.entries(datosPorMunicipio)) {
        const provincia = obtenerProvinciaDeMunicipio(municipio);
        if (!provincia) continue;
        if (!datosPorProvincia[provincia]) datosPorProvincia[provincia] = [];
        filas.forEach(row => {
            const existente = datosPorProvincia[provincia].find(r => r['PARNOMBRE'] === row['PARNOMBRE']);
            if (existente) { existente['VOTOS'] += row['VOTOS']; } else { datosPorProvincia[provincia].push({ ...row }); }
        });
    }
    for (const [, filas] of Object.entries(datosPorProvincia)) {
        const total = filas.reduce((sum, f) => sum + f['VOTOS'], 0);
        filas.forEach(f => { f['TOTAL_VOTOS'] = total; f['PORCENTAJE'] = (f['VOTOS'] / total) * 100; });
    }
    return datosPorProvincia;
}

function agregarDatosPorProvinciaCandidatos(datosPorMunicipio) {
    const datosPorProvincia = {};
    for (const [municipio, filas] of Object.entries(datosPorMunicipio)) {
        const provincia = obtenerProvinciaDeMunicipio(municipio);
        if (!provincia) continue;
        if (!datosPorProvincia[provincia]) datosPorProvincia[provincia] = [];
        filas.forEach(row => {
            const existente = datosPorProvincia[provincia].find(r => r['CANNOMBRE'] === row['CANNOMBRE']);
            if (existente) { existente['VOTOS'] += row['VOTOS']; } else { datosPorProvincia[provincia].push({ ...row }); }
        });
    }
    return datosPorProvincia;
}

function obtenerDatosProvincia(provincia) {
    if (!currentPartidoData || !currentCandidatoData) return null;
    const municipiosProv = provinciasData[provincia];
    if (!municipiosProv) return null;
    const partidosProv = [];
    const candidatosProv = [];
    municipiosProv.forEach(mun => {
        const munNorm = normalizarNombre(mun);
        currentPartidoData.filter(row => normalizarNombre(row['MUNNOMBRE']) === munNorm).forEach(row => {
            const existente = partidosProv.find(p => p['PARNOMBRE'] === row['PARNOMBRE']);
            if (existente) { existente['VOTOS'] += row['VOTOS']; } else { partidosProv.push({ ...row }); }
        });
        currentCandidatoData.filter(row => normalizarNombre(row['MUNNOMBRE']) === munNorm).forEach(row => {
            const existente = candidatosProv.find(c => c['CANNOMBRE'] === row['CANNOMBRE']);
            if (existente) { existente['VOTOS'] += row['VOTOS']; } else { candidatosProv.push({ ...row }); }
        });
    });
    const totalPartidos = partidosProv.reduce((s, r) => s + r['VOTOS'], 0);
    partidosProv.forEach(p => { p['TOTAL_VOTOS'] = totalPartidos; p['PORCENTAJE'] = (p['VOTOS'] / totalPartidos) * 100; });
    const totalCandidatos = candidatosProv.reduce((s, r) => s + r['VOTOS'], 0);
    candidatosProv.forEach(c => { c['TOTAL_VOTOS'] = totalCandidatos; c['PORCENTAJE'] = (c['VOTOS'] / totalCandidatos) * 100; });
    return { partidos: partidosProv, candidatos: candidatosProv, totalVotos: totalPartidos };
}

// ==================== PARSERS CSV ====================
function parseCSV(text) {
    const lines = text.split('\n');
    const headers = lines[0].split(';').map(h => h.trim());
    const result = [];
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(';');
        const row = {};
        headers.forEach((h, idx) => { row[h] = values[idx] ? values[idx].trim() : ''; });
        row['VOTOS'] = parseInt(row['VOTOS'], 10);
        row['TOTAL_VOTOS'] = parseInt(row['TOTAL_VOTOS'], 10);
        row['PORCENTAJE'] = parseFloat(row['PORCENTAJE']);
        result.push(row);
    }
    return result;
}

function parseCandidatosCSV(text) {
    const lines = text.split('\n');
    const headers = lines[0].split(';').map(h => h.trim());
    const result = [];
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(';');
        const row = {};
        headers.forEach((h, idx) => { row[h] = values[idx] ? values[idx].trim() : ''; });
        row['VOTOS'] = parseInt(row['VOTOS'], 10);
        result.push(row);
    }
    return result;
}

// ==================== RESOLUCIÓN DE PARTIDO ====================
function resolverPartido(partidoRaw, nombreCandidato) {
    if (nombreCandidato && typeof CANDIDATOS_PARTIDO !== 'undefined') {
        const norm = s => String(s).toUpperCase()
            .normalize('NFD').replace(/[̀-ͯ]/g, '')
            .replace(/\s+/g, ' ').trim();
        const cu = norm(nombreCandidato);
        for (const k of Object.keys(CANDIDATOS_PARTIDO)) {
            if (norm(k) === cu) return CANDIDATOS_PARTIDO[k];
        }
    }
    return normalizePartido(String(partidoRaw || ''));
}

// ==================== CARGA PRINCIPAL ====================
async function cargarDatos(anio, corporacion) {
    const archivos = archivosPorAnio[anio]?.[corporacion];
    if (!archivos) return;
    try {
        const respPartido = await fetch(basePath + archivos.partido);
        const csvPartido = await respPartido.text();
        const excluir = ['CANDIDATOS TOTALES', 'VOTOS EN BLANCO', 'VOTOS NO MARCADOS', 'VOTOS NULOS',
                         'VOTOS EN BLANCO TERRITORIAL', 'VOTOS NO MARCADOS TERRITORIAL', 'VOTOS NULOS TERRITORIAL'];
        const partidosFiltrados = parseCSV(csvPartido).filter(row => !excluir.includes(row['PARNOMBRE']));
        currentPartidoData = partidosFiltrados.map(row => {
            const parNorm = resolverPartido(row['PARNOMBRE'], null);
            const colorBase = (row['PARTIDO_BASE'] && coloresBase[row['PARTIDO_BASE']])
                ? coloresBase[row['PARTIDO_BASE']]
                : colorPartido(parNorm);
            return { ...row, PARNOMBRE: parNorm, _partidoNorm: parNorm, COLOR_BASE: colorBase };
        });
        console.log(`Partidos cargados: ${currentPartidoData.length} filas`);

        const respCandidato = await fetch(basePath + archivos.candidato);
        const csvCandidato = await respCandidato.text();
        currentCandidatoData = parseCandidatosCSV(csvCandidato)
            .filter(row => !excluir.includes(row['CANNOMBRE']))
            .map(row => {
                const partidoNorm = resolverPartido(row['PARNOMBRE'], row['CANNOMBRE']);
                return { ...row, PARNOMBRE: partidoNorm, _partidoNorm: partidoNorm };
            });
        console.log(`Candidatos cargados: ${currentCandidatoData.length} filas`);

        candidatoPartidoMap.clear();
        currentCandidatoData.forEach(row => {
            const n = row['CANNOMBRE'].toUpperCase().trim();
            if (!candidatoPartidoMap.has(n)) candidatoPartidoMap.set(n, row['_partidoNorm']);
        });

        ganadorPorPartidoPorMunicipio = {};
        currentCandidatoData.forEach(row => {
            const partido = row['_partidoNorm'];
            if (!partido) return;
            const mun = normalizarNombre(row['MUNNOMBRE']);
            if (!ganadorPorPartidoPorMunicipio[partido]) ganadorPorPartidoPorMunicipio[partido] = {};
            const anterior = ganadorPorPartidoPorMunicipio[partido][mun];
            if (!anterior || row['VOTOS'] > anterior['VOTOS']) ganadorPorPartidoPorMunicipio[partido][mun] = row;
        });

        candidatoGanadorPorMunicipio = {};
        const candidatosPorMun = {};
        currentCandidatoData.forEach(row => {
            const mun = normalizarNombre(row['MUNNOMBRE']);
            if (!candidatosPorMun[mun]) candidatosPorMun[mun] = [];
            candidatosPorMun[mun].push(row);
        });
        for (const [mun, rows] of Object.entries(candidatosPorMun)) {
            if (rows.length === 0) continue;
            candidatoGanadorPorMunicipio[mun] = rows.reduce((a, b) => a['VOTOS'] > b['VOTOS'] ? a : b, rows[0]);
        }

        partidosUnicos = [...new Set(currentPartidoData.map(row => row['PARNOMBRE']))].sort();
        candidatosUnicos = [...new Set(currentCandidatoData.map(row => row['CANNOMBRE']))].sort();

        document.getElementById('partido-selector').innerHTML =
            '<option value="">Seleccione un partido</option>' + partidosUnicos.map(p => `<option value="${p}">${p}</option>`).join('');
        document.getElementById('candidato-selector').innerHTML =
            '<option value="">Seleccione un candidato</option>' + candidatosUnicos.map(c => `<option value="${c}">${c}</option>`).join('');
        document.getElementById('partido-ganador-selector').innerHTML =
            '<option value="">Seleccione un partido</option>' + Object.keys(ganadorPorPartidoPorMunicipio).sort().map(p => `<option value="${p}">${p}</option>`).join('');
        document.getElementById('candidato-ganador-filtro').innerHTML =
            '<option value="">Todos</option>' + candidatosUnicos.map(c => `<option value="${c}">${c}</option>`).join('');

        const compararTipoA = document.getElementById('comparar-tipo-a');
        const compararTipoB = document.getElementById('comparar-tipo-b');
        const compararValorA = document.getElementById('comparar-valor-a');
        const compararValorB = document.getElementById('comparar-valor-b');
        compararTipoA.innerHTML = '<option value="partido">Partido</option><option value="candidato">Candidato</option>';
        compararTipoB.innerHTML = '<option value="partido">Partido</option><option value="candidato">Candidato</option>';
        function actualizarOpcionesComp(selector, tipo) {
            const lista = tipo === 'partido' ? partidosUnicos : candidatosUnicos;
            selector.innerHTML = '<option value="">Seleccione...</option>' + lista.map(v => `<option value="${v}">${v}</option>`).join('');
        }
        actualizarOpcionesComp(compararValorA, 'partido');
        actualizarOpcionesComp(compararValorB, 'partido');
        compararTipoA.onchange = () => actualizarOpcionesComp(compararValorA, compararTipoA.value);
        compararTipoB.onchange = () => actualizarOpcionesComp(compararValorB, compararTipoB.value);

        actualizarResumenDepartamental(currentPartidoData, candidatoEspecificoActual);
        if (modoComparacion) actualizarComparacion();
        else actualizarMapaSimple();

    } catch (error) {
        console.error('Error cargando datos:', error);
        alert(`No se pudo cargar datos para ${anio} - ${corporacion}. Verifica los archivos.`);
    }
}

// ==================== CARGA PUESTOS DE VOTACIÓN ====================
async function cargarPuestosVotacion() {
    if (puestosData.length > 0) return;
    try {
        const response = await fetch('data/puestos_votacion_5_ciudades.csv');
        const text = await response.text();
        const lines = text.trim().split('\n');
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const parts = line.split(';');
            if (parts.length < 4) continue;
            const lat = parseFloat(parts[2]);
            const lon = parseFloat(parts[3]);
            if (isNaN(lat) || isNaN(lon)) continue;
            puestosData.push({ municipio: parts[0].trim(), puesto: parts[1].trim(), lat, lon });
        }
        console.log(`✅ Puestos de votación cargados: ${puestosData.length}`);
    } catch (error) {
        console.error('Error cargando puestos de votación:', error);
    }
}

async function cargarResultadosPuestos() {
    if (puestosResultadosCargados) return;
    try {
        const response = await fetch('data/datos_puestos_5_ciudades.csv');
        const text = await response.text();
        const lines = text.split('\n');
        const headers = lines[0].split(';').map(h => h.trim().toUpperCase());
        const idxMun      = headers.indexOf('MUNNOMBRE');
        const idxPuesto   = headers.indexOf('PUESTO');
        const idxCorp     = headers.indexOf('CORNOMBRE');
        const idxCandidato= headers.indexOf('CANNOMBRE');
        const idxPartido  = headers.indexOf('PARNOMBRE');
        const idxVotos    = headers.indexOf('VOTOS');
        if ([idxMun, idxPuesto, idxCorp, idxCandidato, idxPartido, idxVotos].includes(-1)) {
            console.error('Columnas faltantes en datos_puestos_5_ciudades.csv');
            alert('El archivo datos_puestos_5_ciudades.csv debe tener: MUNNOMBRE, PUESTO, CORNOMBRE, CANNOMBRE, PARNOMBRE, VOTOS');
            return;
        }
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            const v = lines[i].split(';');
            if (v.length <= Math.max(idxMun, idxPuesto, idxCorp, idxCandidato, idxPartido, idxVotos)) continue;
            const key = `${v[idxMun].trim().toUpperCase()}|${v[idxPuesto].trim().toUpperCase()}`;
            if (!puestosResultados[key]) puestosResultados[key] = [];
            puestosResultados[key].push({
                CANNOMBRE: v[idxCandidato].trim(),
                PARNOMBRE: v[idxPartido].trim(),
                CORNOMBRE: v[idxCorp].trim(),
                VOTOS: parseInt(v[idxVotos], 10)
            });
        }
        puestosResultadosCargados = true;
        console.log(`✅ Resultados de puestos cargados: ${Object.keys(puestosResultados).length} puestos`);
    } catch (error) {
        console.error('Error cargando resultados de puestos:', error);
        alert('No se pudo cargar datos_puestos_5_ciudades.csv');
    }
}

// ==================== DATOS PARA TRAYECTORIA ====================
async function cargarCandidatosParaSelector(anio, corporacion, selector) {
    const archivos = archivosPorAnio[anio]?.[corporacion];
    if (!archivos) return;
    try {
        const response = await fetch(basePath + archivos.candidato);
        const text = await response.text();
        const excluir = ['CANDIDATOS TOTALES', 'VOTOS EN BLANCO', 'VOTOS NO MARCADOS', 'VOTOS NULOS',
                         'VOTOS EN BLANCO TERRITORIAL', 'VOTOS NO MARCADOS TERRITORIAL', 'VOTOS NULOS TERRITORIAL'];
        const filtrados = parseCandidatosCSV(text).filter(row => !excluir.includes(row['CANNOMBRE']));
        const unicos = [...new Set(filtrados.map(row => row['CANNOMBRE']))].sort();
        selector.innerHTML = '<option value="">Seleccione candidato</option>' + unicos.map(c => `<option value="${c}">${c}</option>`).join('');
        todosLosCandidatosPorAnioCorp[`${anio}_${corporacion}`] = filtrados;
    } catch (error) {
        console.error('Error cargando candidatos:', error);
        selector.innerHTML = '<option value="">Error al cargar</option>';
    }
}

async function obtenerVotosCandidatoMunicipio(anio, corporacion, candidato, municipio) {
    const key = `${anio}_${corporacion}`;
    let datos = todosLosCandidatosPorAnioCorp[key];
    if (!datos) {
        const archivos = archivosPorAnio[anio]?.[corporacion];
        if (!archivos) return 0;
        try {
            const excluir = ['CANDIDATOS TOTALES', 'VOTOS EN BLANCO', 'VOTOS NO MARCADOS', 'VOTOS NULOS',
                             'VOTOS EN BLANCO TERRITORIAL', 'VOTOS NO MARCADOS TERRITORIAL', 'VOTOS NULOS TERRITORIAL'];
            datos = parseCandidatosCSV(await (await fetch(basePath + archivos.candidato)).text())
                .filter(row => !excluir.includes(row['CANNOMBRE']));
            todosLosCandidatosPorAnioCorp[key] = datos;
        } catch (e) { console.error(e); return 0; }
    }
    const munNorm = normalizarNombre(municipio);
    return datos.filter(row => row['CANNOMBRE'] === candidato && normalizarNombre(row['MUNNOMBRE']) === munNorm)
                .reduce((sum, row) => sum + row['VOTOS'], 0);
}

async function obtenerVotosCandidatoDepartamento(anio, corporacion, candidato) {
    const key = `${anio}_${corporacion}`;
    let datos = todosLosCandidatosPorAnioCorp[key];
    if (!datos) {
        const archivos = archivosPorAnio[anio]?.[corporacion];
        if (!archivos) return 0;
        try {
            const excluir = ['CANDIDATOS TOTALES', 'VOTOS EN BLANCO', 'VOTOS NO MARCADOS', 'VOTOS NULOS',
                             'VOTOS EN BLANCO TERRITORIAL', 'VOTOS NO MARCADOS TERRITORIAL', 'VOTOS NULOS TERRITORIAL'];
            datos = parseCandidatosCSV(await (await fetch(basePath + archivos.candidato)).text())
                .filter(row => !excluir.includes(row['CANNOMBRE']));
            todosLosCandidatosPorAnioCorp[key] = datos;
        } catch (e) { console.error(e); return 0; }
    }
    return datos.filter(row => row['CANNOMBRE'] === candidato).reduce((sum, row) => sum + row['VOTOS'], 0);
}

// ==================== DATOS COMPARACIÓN ====================
function obtenerDatosComparacion(tipo, valor) {
    const datos = {};
    const source = tipo === 'partido' ? currentPartidoData : currentCandidatoData;
    const campo  = tipo === 'partido' ? 'PARNOMBRE' : 'CANNOMBRE';
    source.forEach(row => {
        if (row[campo] === valor) {
            const mun = normalizarNombre(row['MUNNOMBRE']);
            datos[mun] = (datos[mun] || 0) + row['VOTOS'];
        }
    });
    return datos;
}
