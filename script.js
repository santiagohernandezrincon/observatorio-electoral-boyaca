// ==================== GLOBALES ====================
let mapSimple;
let currentLayerSimple;
let currentPartidoData = null;
let currentCandidatoData = null;
let currentGeojson = null;
let partidosUnicos = [];
let candidatosUnicos = [];
let currentAnio = '2026';
let currentCorporacion = 'camara';
let modoComparacion = false;
let escalaActual = 'municipio';
let provinciasData = null;

// ==================== PUESTOS DE VOTACIÓN ====================
let capaPuestosVotacion = null;
let puestosData = [];
let puestosResultados = {};
let puestosResultadosCargados = false;

// Para comparación
let mapA, mapB;
let currentLayerA, currentLayerB;
let comparacionDatosA = null;
let comparacionDatosB = null;
let comparacionValorA = '';
let comparacionValorB = '';

let graficoTipo = 'bar';
let filtrarConsejos = false;
let ultimoElementoDetalle = null;

let ganadorPorPartidoPorMunicipio = {};
let mapaCalorPorcentaje = false;
let candidatoEspecificoActual = null;
let candidatoGanadorPorMunicipio = {};

let trajectoryMunicipioChart = null;
let todosLosCandidatosPorAnioCorp = {};

// ==================== COLORES PARA CANDIDATOS ====================
const coloresCandidatos = {};
let candidatoPartidoMap = new Map(); // nombre normalizado -> partido

// Conversión RGB a HSL (auxiliar)
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

// Genera una variación de un color base (en hsl) manteniendo el matiz
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
    // Variación ligera en saturación y luminosidad
    const variation = (index % 20) - 10; // entre -10 y 9
    s = Math.min(85, Math.max(50, s + variation));
    l = Math.min(70, Math.max(45, l + variation));
    return `hsl(${h}, ${s}%, ${l}%)`;
}

// Asigna color a un candidato según su partido, con tonos especiales para verdes fijos
function getColorCandidato(nombreCandidato) {
    const nombreUpper = nombreCandidato.toUpperCase().trim();

    // Verdes especiales (fijos, tonos oscuros)
    const verdesEspeciales = {
        'JAIME RAUL SALAMANCA TORRES': '#1e8449',
        'JULIAN DAVID GARCIA RUBIO': '#196f3d',
        'LUIS CARLOS OCHOA PASACHOA': '#145a32'
    };
    if (verdesEspeciales[nombreUpper]) {
        return verdesEspeciales[nombreUpper];
    }

    if (coloresCandidatos[nombreUpper]) return coloresCandidatos[nombreUpper];

    // Obtener partido del candidato
    let partido = candidatoPartidoMap.get(nombreUpper);
    if (!partido && currentCandidatoData) {
        const row = currentCandidatoData.find(r => r['CANNOMBRE'].toUpperCase().trim() === nombreUpper);
        if (row) {
            partido = row['PARNOMBRE'];
            candidatoPartidoMap.set(nombreUpper, partido);
        }
    }

    // Si no hay partido, color aleatorio (gama cálida)
    if (!partido) {
        let hash = 0;
        for (let i = 0; i < nombreUpper.length; i++) {
            hash = ((hash << 5) - hash) + nombreUpper.charCodeAt(i);
            hash |= 0;
        }
        const hue = Math.abs(hash % 60) + (hash % 2 === 0 ? 0 : 300);
        const saturation = 70 + (hash % 30);
        const lightness = 55 + (hash % 20);
        const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        coloresCandidatos[nombreUpper] = color;
        return color;
    }

    // Color base del partido
    const colorBase = asignarColorPartido(partido);
    // Variación según el nombre
    let hash = 0;
    for (let i = 0; i < nombreUpper.length; i++) {
        hash = ((hash << 5) - hash) + nombreUpper.charCodeAt(i);
        hash |= 0;
    }
    const index = Math.abs(hash % 30);
    const colorFinal = variarColorBase(colorBase, index);
    coloresCandidatos[nombreUpper] = colorFinal;
    return colorFinal;
}

// ==================== CONFIGURACIÓN DE RUTAS Y ARCHIVOS ====================
const basePath = 'data/';
const geojsonPath = 'geojson/boyaca_municipios_simple.geojson';

const archivosPorAnio = {
    2026: {
        camara: { partido: 'votos_partido_municipio_2026_camara.csv', candidato: 'votos_candidato_municipio_2026_camara.csv' },
        senado: { partido: 'votos_partido_municipio_2026_senado.csv', candidato: 'votos_candidato_municipio_2026_senado.csv' },
        consulta: { partido: 'votos_partido_municipio_2026_consultas.csv', candidato: 'votos_candidato_municipio_2026_consultas.csv' }
    },
    2022: {
        camara: { partido: 'votos_partido_municipio_2022_camara.csv', candidato: 'votos_candidato_municipio_2022_camara.csv' },
        senado: { partido: 'votos_partido_municipio_2022_senado.csv', candidato: 'votos_candidato_municipio_2022_senado.csv' }
    },
    2023: {
        gobernador: { partido: 'votos_partido_municipio_2023_gobernador.csv', candidato: 'votos_candidato_municipio_2023_gobernador.csv' },
        asamblea: { partido: 'votos_partido_municipio_2023_asamblea.csv', candidato: 'votos_candidato_municipio_2023_asamblea.csv' },
        alcalde: { partido: 'votos_partido_municipio_2023_alcalde.csv', candidato: 'votos_candidato_municipio_2023_alcalde.csv' },
        concejo: { partido: 'votos_partido_municipio_2023_concejo.csv', candidato: 'votos_candidato_municipio_2023_concejo.csv' },
        jal: { partido: 'votos_partido_municipio_2023_jal.csv', candidato: 'votos_candidato_municipio_2023_jal.csv' }
    },
    2019: {
        gobernador: { partido: 'votos_partido_municipio_2019_gobernador.csv', candidato: 'votos_candidato_municipio_2019_gobernador.csv' },
        asamblea: { partido: 'votos_partido_municipio_2019_asamblea.csv', candidato: 'votos_candidato_municipio_2019_asamblea.csv' },
        alcalde: { partido: 'votos_partido_municipio_2019_alcalde.csv', candidato: 'votos_candidato_municipio_2019_alcalde.csv' },
        concejo: { partido: 'votos_partido_municipio_2019_concejo.csv', candidato: 'votos_candidato_municipio_2019_concejo.csv' },
        jal: { partido: 'votos_partido_municipio_2019_jal.csv', candidato: 'votos_candidato_municipio_2019_jal.csv' }
    }
};

// ==================== PALABRAS CLAVE Y COLORES DE PARTIDOS ====================
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

function normalizarNombre(nombre) {
    if (!nombre) return '';
    let limpio = nombre.toUpperCase().trim();
    limpio = limpio.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
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
        if (municipios.some(m => normalizarNombre(m) === munNormalizado)) {
            return provincia;
        }
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
            if (existente) {
                existente['VOTOS'] += row['VOTOS'];
            } else {
                datosPorProvincia[provincia].push({ ...row });
            }
        });
    }
    for (const [provincia, filas] of Object.entries(datosPorProvincia)) {
        const totalProvincia = filas.reduce((sum, f) => sum + f['VOTOS'], 0);
        filas.forEach(f => {
            f['TOTAL_VOTOS'] = totalProvincia;
            f['PORCENTAJE'] = (f['VOTOS'] / totalProvincia) * 100;
        });
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
            if (existente) {
                existente['VOTOS'] += row['VOTOS'];
            } else {
                datosPorProvincia[provincia].push({ ...row });
            }
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
        const partidosMun = currentPartidoData.filter(row => normalizarNombre(row['MUNNOMBRE']) === munNorm);
        partidosMun.forEach(row => {
            const existente = partidosProv.find(p => p['PARNOMBRE'] === row['PARNOMBRE']);
            if (existente) {
                existente['VOTOS'] += row['VOTOS'];
            } else {
                partidosProv.push({ ...row });
            }
        });
        const candidatosMun = currentCandidatoData.filter(row => normalizarNombre(row['MUNNOMBRE']) === munNorm);
        candidatosMun.forEach(row => {
            const existente = candidatosProv.find(c => c['CANNOMBRE'] === row['CANNOMBRE']);
            if (existente) {
                existente['VOTOS'] += row['VOTOS'];
            } else {
                candidatosProv.push({ ...row });
            }
        });
    });
    const totalPartidos = partidosProv.reduce((s, r) => s + r['VOTOS'], 0);
    partidosProv.forEach(p => {
        p['TOTAL_VOTOS'] = totalPartidos;
        p['PORCENTAJE'] = (p['VOTOS'] / totalPartidos) * 100;
    });
    const totalCandidatos = candidatosProv.reduce((s, r) => s + r['VOTOS'], 0);
    candidatosProv.forEach(c => {
        c['TOTAL_VOTOS'] = totalCandidatos;
        c['PORCENTAJE'] = (c['VOTOS'] / totalCandidatos) * 100;
    });
    return { partidos: partidosProv, candidatos: candidatosProv, totalVotos: totalPartidos };
}

async function cargarDatos(anio, corporacion) {
    const archivos = archivosPorAnio[anio]?.[corporacion];
    if (!archivos) return;
    try {
        const respPartido = await fetch(basePath + archivos.partido);
        const csvPartido = await respPartido.text();
        let partidos = parseCSV(csvPartido);
        const excluir = ['CANDIDATOS TOTALES', 'VOTOS EN BLANCO', 'VOTOS NO MARCADOS', 'VOTOS NULOS', 'VOTOS EN BLANCO TERRITORIAL', 'VOTOS NO MARCADOS TERRITORIAL', 'VOTOS NULOS TERRITORIAL'];
        let partidosFiltrados = partidos.filter(row => !excluir.includes(row['PARNOMBRE']));
        
        currentPartidoData = partidosFiltrados.map(row => {
            let colorBase;
            if (row['PARTIDO_BASE'] && coloresBase[row['PARTIDO_BASE']]) {
                colorBase = coloresBase[row['PARTIDO_BASE']];
            } else {
                colorBase = asignarColorPartido(row['PARNOMBRE']);
            }
            return { ...row, COLOR_BASE: colorBase };
        });
        console.log(`Partidos cargados: ${currentPartidoData.length} filas`);

        const respCandidato = await fetch(basePath + archivos.candidato);
        const csvCandidato = await respCandidato.text();
        let candidatos = parseCandidatosCSV(csvCandidato);
        currentCandidatoData = candidatos.filter(row => !excluir.includes(row['CANNOMBRE']));
        console.log(`Candidatos cargados: ${currentCandidatoData.length} filas`);

        // Construir mapa candidato -> partido
        candidatoPartidoMap.clear();
        currentCandidatoData.forEach(row => {
            const nombreNorm = row['CANNOMBRE'].toUpperCase().trim();
            if (!candidatoPartidoMap.has(nombreNorm)) {
                candidatoPartidoMap.set(nombreNorm, row['PARNOMBRE']);
            }
        });

        ganadorPorPartidoPorMunicipio = {};
        currentCandidatoData.forEach(row => {
            const partido = row['PARNOMBRE'];
            if (!partido) return;
            const mun = normalizarNombre(row['MUNNOMBRE']);
            if (!ganadorPorPartidoPorMunicipio[partido]) ganadorPorPartidoPorMunicipio[partido] = {};
            const anterior = ganadorPorPartidoPorMunicipio[partido][mun];
            if (!anterior || row['VOTOS'] > anterior['VOTOS']) {
                ganadorPorPartidoPorMunicipio[partido][mun] = row;
            }
        });

        candidatoGanadorPorMunicipio = {};
        const candidatosPorMunicipio = {};
        currentCandidatoData.forEach(row => {
            const mun = normalizarNombre(row['MUNNOMBRE']);
            if (!candidatosPorMunicipio[mun]) candidatosPorMunicipio[mun] = [];
            candidatosPorMunicipio[mun].push(row);
        });
        for (const [mun, rows] of Object.entries(candidatosPorMunicipio)) {
            if (rows.length === 0) continue;
            const ganador = rows.reduce((a,b) => a['VOTOS'] > b['VOTOS'] ? a : b, rows[0]);
            candidatoGanadorPorMunicipio[mun] = ganador;
        }

        partidosUnicos = [...new Set(currentPartidoData.map(row => row['PARNOMBRE']))].sort();
        candidatosUnicos = [...new Set(currentCandidatoData.map(row => row['CANNOMBRE']))].sort();

        document.getElementById('partido-selector').innerHTML = '<option value="">Seleccione un partido</option>' +
            partidosUnicos.map(p => `<option value="${p}">${p}</option>`).join('');
        document.getElementById('candidato-selector').innerHTML = '<option value="">Seleccione un candidato</option>' +
            candidatosUnicos.map(c => `<option value="${c}">${c}</option>`).join('');
        document.getElementById('partido-ganador-selector').innerHTML = '<option value="">Seleccione un partido</option>' +
            Object.keys(ganadorPorPartidoPorMunicipio).sort().map(p => `<option value="${p}">${p}</option>`).join('');
        document.getElementById('candidato-ganador-filtro').innerHTML = '<option value="">Todos</option>' +
            candidatosUnicos.map(c => `<option value="${c}">${c}</option>`).join('');

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

function parseCSV(text) {
    const lines = text.split('\n');
    const headers = lines[0].split(';').map(h => h.trim());
    const result = [];
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(';');
        const row = {};
        headers.forEach((h, idx) => {
            row[h] = values[idx] ? values[idx].trim() : '';
        });
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
        headers.forEach((h, idx) => {
            row[h] = values[idx] ? values[idx].trim() : '';
        });
        row['VOTOS'] = parseInt(row['VOTOS'], 10);
        result.push(row);
    }
    return result;
}

function actualizarResumenDepartamental(data, candidatoEspecifico = null) {
    const resumenDiv = document.getElementById('resumen-contenido');
    if (!resumenDiv) return;
    const votosPorPartido = {};
    let totalGeneral = 0;
    data.forEach(row => {
        const partido = row['PARNOMBRE'];
        const votos = row['VOTOS'];
        totalGeneral += votos;
        if (!votosPorPartido[partido]) votosPorPartido[partido] = 0;
        votosPorPartido[partido] += votos;
    });
    const topPartidos = Object.entries(votosPorPartido).sort((a,b) => b[1] - a[1]).slice(0, 5);
    let html = `<p><strong>Total votos válidos:</strong> ${totalGeneral.toLocaleString()}</p><ul>`;
    topPartidos.forEach(([partido, votos]) => {
        const pct = (votos / totalGeneral * 100).toFixed(1);
        html += `<li>${partido}: ${votos.toLocaleString()} votos (${pct}%)</li>`;
    });
    html += `</ul>`;

    if (candidatoEspecifico && currentCandidatoData) {
        let votosCandidato = 0;
        const votosPorMunicipio = {};
        currentCandidatoData.forEach(row => {
            if (row['CANNOMBRE'] === candidatoEspecifico) {
                votosCandidato += row['VOTOS'];
                const municipio = row['MUNNOMBRE'];
                if (!votosPorMunicipio[municipio]) votosPorMunicipio[municipio] = 0;
                votosPorMunicipio[municipio] += row['VOTOS'];
            }
        });
        const porcentajeCandidato = totalGeneral > 0 ? (votosCandidato / totalGeneral * 100).toFixed(1) : 0;
        html += `<hr><p><strong>🏆 ${candidatoEspecifico}</strong><br>Votos totales: ${votosCandidato.toLocaleString()} (${porcentajeCandidato}% de votos válidos)</p>`;
        const topMunicipios = Object.entries(votosPorMunicipio).sort((a,b) => b[1] - a[1]).slice(0, 5);
        if (topMunicipios.length) {
            html += `<p><strong>Municipios con mayor votación:</strong></p><ul>`;
            topMunicipios.forEach(([mun, votos]) => {
                html += `<li>${mun}: ${votos.toLocaleString()} votos</li>`;
            });
            html += `</ul>`;
        }
    }
    resumenDiv.innerHTML = html;
}

function getTooltipText(elementoNombre, esProvincia, tipoVista, partidoSeleccionado, candidatoSeleccionado, partidoGanadorSeleccionado, porcentajeActivo, candidatoFiltro) {
    if (esProvincia) {
        const datosProv = obtenerDatosProvincia(elementoNombre);
        if (!datosProv) return `<strong>${elementoNombre}</strong><br>Sin datos`;
        if (tipoVista === 'partido') {
            const ganador = datosProv.partidos.reduce((a,b) => a['VOTOS'] > b['VOTOS'] ? a : b);
            return `<strong>${elementoNombre}</strong><br>Ganador: ${ganador['PARNOMBRE']}<br>Votos: ${ganador['VOTOS'].toLocaleString()}`;
        } else if (tipoVista === 'partido_heat') {
            if (!partidoSeleccionado) return `<strong>${elementoNombre}</strong><br>Seleccione un partido`;
            const partidoRow = datosProv.partidos.find(p => p['PARNOMBRE'] === partidoSeleccionado);
            if (partidoRow) {
                if (porcentajeActivo) {
                    return `<strong>${elementoNombre}</strong><br>${partidoSeleccionado}: ${partidoRow['PORCENTAJE'].toFixed(1)}% (${partidoRow['VOTOS'].toLocaleString()} votos)`;
                } else {
                    return `<strong>${elementoNombre}</strong><br>${partidoSeleccionado}: ${partidoRow['VOTOS'].toLocaleString()} votos`;
                }
            } else {
                return `<strong>${elementoNombre}</strong><br>${partidoSeleccionado}: 0 votos`;
            }
        } else if (tipoVista === 'candidato_heat') {
            if (!candidatoSeleccionado) return `<strong>${elementoNombre}</strong><br>Seleccione un candidato`;
            const candidatoRow = datosProv.candidatos.find(c => c['CANNOMBRE'] === candidatoSeleccionado);
            if (candidatoRow) {
                if (porcentajeActivo) {
                    const totalProv = datosProv.candidatos.reduce((s, c) => s + c['VOTOS'], 0);
                    const pct = totalProv > 0 ? (candidatoRow['VOTOS'] / totalProv * 100).toFixed(1) : 0;
                    return `<strong>${elementoNombre}</strong><br>${candidatoSeleccionado}: ${pct}% (${candidatoRow['VOTOS'].toLocaleString()} votos)`;
                } else {
                    return `<strong>${elementoNombre}</strong><br>${candidatoSeleccionado}: ${candidatoRow['VOTOS'].toLocaleString()} votos`;
                }
            } else {
                return `<strong>${elementoNombre}</strong><br>${candidatoSeleccionado}: 0 votos`;
            }
        } else if (tipoVista === 'candidato_ganador') {
            const ganador = datosProv.candidatos.reduce((a,b) => a['VOTOS'] > b['VOTOS'] ? a : b);
            if (!ganador) return `<strong>${elementoNombre}</strong><br>Sin datos`;
            if (candidatoFiltro && ganador['CANNOMBRE'] !== candidatoFiltro) return `<strong>${elementoNombre}</strong><br>Sin candidato filtrado`;
            return `<strong>${elementoNombre}</strong><br>Candidato ganador: ${ganador['CANNOMBRE']}<br>Votos: ${ganador['VOTOS'].toLocaleString()}`;
        } else if (tipoVista === 'candidato_ganador_por_partido') {
            if (!partidoGanadorSeleccionado) return `<strong>${elementoNombre}</strong><br>Seleccione un partido`;
            const candidatosPartido = datosProv.candidatos.filter(c => c['PARNOMBRE'] === partidoGanadorSeleccionado);
            if (candidatosPartido.length === 0) return `<strong>${elementoNombre}</strong><br>No hay candidatos de ${partidoGanadorSeleccionado}`;
            const ganador = candidatosPartido.reduce((a,b) => a['VOTOS'] > b['VOTOS'] ? a : b);
            return `<strong>${elementoNombre}</strong><br>Candidato ganador de ${partidoGanadorSeleccionado}: ${ganador['CANNOMBRE']}<br>Votos: ${ganador['VOTOS'].toLocaleString()}`;
        }
    } else {
        if (tipoVista === 'partido') {
            const filas = currentPartidoData.filter(row => normalizarNombre(row['MUNNOMBRE']) === elementoNombre);
            if (filas.length === 0) return `<strong>${elementoNombre}</strong><br>Sin datos`;
            const ganador = filas.reduce((a,b) => a['VOTOS'] > b['VOTOS'] ? a : b);
            return `<strong>${elementoNombre}</strong><br>Ganador: ${ganador['PARNOMBRE']}<br>Votos: ${ganador['VOTOS'].toLocaleString()}`;
        } else if (tipoVista === 'partido_heat') {
            if (!partidoSeleccionado) return `<strong>${elementoNombre}</strong><br>Seleccione un partido`;
            const filas = currentPartidoData.filter(row => normalizarNombre(row['MUNNOMBRE']) === elementoNombre);
            const partidoRow = filas.find(f => f['PARNOMBRE'] === partidoSeleccionado);
            if (partidoRow) {
                if (porcentajeActivo) {
                    return `<strong>${elementoNombre}</strong><br>${partidoSeleccionado}: ${partidoRow['PORCENTAJE'].toFixed(1)}% (${partidoRow['VOTOS'].toLocaleString()} votos)`;
                } else {
                    return `<strong>${elementoNombre}</strong><br>${partidoSeleccionado}: ${partidoRow['VOTOS'].toLocaleString()} votos`;
                }
            } else {
                return `<strong>${elementoNombre}</strong><br>${partidoSeleccionado}: 0 votos`;
            }
        } else if (tipoVista === 'candidato_heat') {
            if (!candidatoSeleccionado) return `<strong>${elementoNombre}</strong><br>Seleccione un candidato`;
            const filas = currentCandidatoData.filter(row => normalizarNombre(row['MUNNOMBRE']) === elementoNombre);
            const candidatoRow = filas.find(f => f['CANNOMBRE'] === candidatoSeleccionado);
            if (candidatoRow) {
                if (porcentajeActivo) {
                    const totalMun = filas.reduce((s, f) => s + f['VOTOS'], 0);
                    const pct = totalMun > 0 ? (candidatoRow['VOTOS'] / totalMun * 100).toFixed(1) : 0;
                    return `<strong>${elementoNombre}</strong><br>${candidatoSeleccionado}: ${pct}% (${candidatoRow['VOTOS'].toLocaleString()} votos)`;
                } else {
                    return `<strong>${elementoNombre}</strong><br>${candidatoSeleccionado}: ${candidatoRow['VOTOS'].toLocaleString()} votos`;
                }
            } else {
                return `<strong>${elementoNombre}</strong><br>${candidatoSeleccionado}: 0 votos`;
            }
        } else if (tipoVista === 'candidato_ganador') {
            const ganador = candidatoGanadorPorMunicipio[elementoNombre];
            if (!ganador) return `<strong>${elementoNombre}</strong><br>Sin datos`;
            if (candidatoFiltro && ganador['CANNOMBRE'] !== candidatoFiltro) return `<strong>${elementoNombre}</strong><br>Sin candidato filtrado`;
            return `<strong>${elementoNombre}</strong><br>Candidato ganador: ${ganador['CANNOMBRE']}<br>Votos: ${ganador['VOTOS'].toLocaleString()}`;
        } else if (tipoVista === 'candidato_ganador_por_partido') {
            if (!partidoGanadorSeleccionado) return `<strong>${elementoNombre}</strong><br>Seleccione un partido`;
            const ganador = ganadorPorPartidoPorMunicipio[partidoGanadorSeleccionado]?.[elementoNombre];
            if (!ganador) return `<strong>${elementoNombre}</strong><br>No hay candidatos de ${partidoGanadorSeleccionado}`;
            return `<strong>${elementoNombre}</strong><br>Candidato ganador de ${partidoGanadorSeleccionado}: ${ganador['CANNOMBRE']}<br>Votos: ${ganador['VOTOS'].toLocaleString()}`;
        }
    }
    return `<strong>${elementoNombre}</strong><br>Sin datos`;
}

function getColorParaElemento(nombreElemento, esProvincia, tipoVista, partidoSeleccionado, candidatoSeleccionado, partidoGanadorSeleccionado, porcentajeActivo) {
    let filas;
    if (esProvincia) {
        const datosProv = obtenerDatosProvincia(nombreElemento);
        if (!datosProv) return '#cccccc';
        if (tipoVista === 'partido' || tipoVista === 'partido_heat') {
            filas = datosProv.partidos;
        } else if (tipoVista === 'candidato_heat') {
            filas = datosProv.candidatos;
        } else if (tipoVista === 'candidato_ganador') {
            const ganadorProv = datosProv.candidatos.reduce((a,b) => a['VOTOS'] > b['VOTOS'] ? a : b, null);
            if (!ganadorProv) return '#cccccc';
            const partidoRow = currentPartidoData.find(p => p['PARNOMBRE'] === ganadorProv['PARNOMBRE']);
            return partidoRow ? partidoRow.COLOR_BASE : '#95a5a6';
        } else if (tipoVista === 'candidato_ganador_por_partido') {
            if (!partidoGanadorSeleccionado) return '#cccccc';
            const candidatosPartido = datosProv.candidatos.filter(c => c['PARNOMBRE'] === partidoGanadorSeleccionado);
            if (candidatosPartido.length === 0) return '#cccccc';
            const ganador = candidatosPartido.reduce((a,b) => a['VOTOS'] > b['VOTOS'] ? a : b);
            return getColorCandidato(ganador['CANNOMBRE']);
        }
    } else {
        if (tipoVista === 'partido' || tipoVista === 'partido_heat') {
            filas = currentPartidoData.filter(row => normalizarNombre(row['MUNNOMBRE']) === nombreElemento);
        } else if (tipoVista === 'candidato_heat') {
            filas = currentCandidatoData.filter(row => normalizarNombre(row['MUNNOMBRE']) === nombreElemento);
        } else if (tipoVista === 'candidato_ganador') {
            const ganador = candidatoGanadorPorMunicipio[nombreElemento];
            if (!ganador) return '#cccccc';
            const partidoRow = currentPartidoData.find(p => p['PARNOMBRE'] === ganador['PARNOMBRE']);
            return partidoRow ? partidoRow.COLOR_BASE : '#95a5a6';
        } else if (tipoVista === 'candidato_ganador_por_partido') {
            if (!partidoGanadorSeleccionado) return '#cccccc';
            const ganador = ganadorPorPartidoPorMunicipio[partidoGanadorSeleccionado]?.[nombreElemento];
            if (!ganador) return '#cccccc';
            return getColorCandidato(ganador['CANNOMBRE']);
        }
    }

    if (!filas || filas.length === 0) return '#cccccc';

    if (tipoVista === 'partido') {
        let ganador = filas.reduce((a,b) => a['VOTOS'] > b['VOTOS'] ? a : b);
        return ganador.COLOR_BASE || '#95a5a6';
    } else if (tipoVista === 'partido_heat') {
        if (!partidoSeleccionado) return '#cccccc';
        const partidoRow = filas.find(f => f['PARNOMBRE'] === partidoSeleccionado);
        if (!partidoRow) return '#e9e9e9';
        let valor;
        if (porcentajeActivo) {
            valor = partidoRow['PORCENTAJE'] / 100;
        } else {
            let maxVotosPartido = 0;
            if (esProvincia) {
                for (const prov of Object.keys(provinciasData)) {
                    const datosProv = obtenerDatosProvincia(prov);
                    if (datosProv) {
                        const row = datosProv.partidos.find(p => p['PARNOMBRE'] === partidoSeleccionado);
                        if (row && row['VOTOS'] > maxVotosPartido) maxVotosPartido = row['VOTOS'];
                    }
                }
            } else {
                for (const mun of Object.keys(candidatoGanadorPorMunicipio)) {
                    const row = currentPartidoData.find(p => p['PARNOMBRE'] === partidoSeleccionado && normalizarNombre(p['MUNNOMBRE']) === mun);
                    if (row && row['VOTOS'] > maxVotosPartido) maxVotosPartido = row['VOTOS'];
                }
            }
            valor = maxVotosPartido > 0 ? partidoRow['VOTOS'] / maxVotosPartido : 0;
        }
        const colorBase = partidoRow.COLOR_BASE || '#3498db';
        const r = parseInt(colorBase.slice(1,3), 16);
        const g = parseInt(colorBase.slice(3,5), 16);
        const b = parseInt(colorBase.slice(5,7), 16);
        const factor = 1 - valor;
        const newR = Math.floor(r * factor);
        const newG = Math.floor(g * factor);
        const newB = Math.floor(b * factor);
        return `rgb(${newR}, ${newG}, ${newB})`;
    } else if (tipoVista === 'candidato_heat') {
        if (!candidatoSeleccionado) return '#cccccc';
        const candidatoRow = filas.find(f => f['CANNOMBRE'] === candidatoSeleccionado);
        if (!candidatoRow) return '#e9e9e9';
        let valor;
        if (porcentajeActivo) {
            const totalElemento = filas.reduce((sum, f) => sum + f['VOTOS'], 0);
            valor = totalElemento > 0 ? candidatoRow['VOTOS'] / totalElemento : 0;
        } else {
            let maxVotosCandidato = 0;
            if (esProvincia) {
                for (const prov of Object.keys(provinciasData)) {
                    const datosProv = obtenerDatosProvincia(prov);
                    if (datosProv) {
                        const row = datosProv.candidatos.find(c => c['CANNOMBRE'] === candidatoSeleccionado);
                        if (row && row['VOTOS'] > maxVotosCandidato) maxVotosCandidato = row['VOTOS'];
                    }
                }
            } else {
                for (const mun of Object.keys(candidatoGanadorPorMunicipio)) {
                    const row = currentCandidatoData.find(c => c['CANNOMBRE'] === candidatoSeleccionado && normalizarNombre(c['MUNNOMBRE']) === mun);
                    if (row && row['VOTOS'] > maxVotosCandidato) maxVotosCandidato = row['VOTOS'];
                }
            }
            valor = maxVotosCandidato > 0 ? candidatoRow['VOTOS'] / maxVotosCandidato : 0;
        }
        const r = Math.floor(179 + 76 * valor);
        const g = Math.floor(179 - 179 * valor);
        const b = Math.floor(179 - 179 * valor);
        return `rgb(${r}, ${g}, ${b})`;
    }
    return '#cccccc';
}

function actualizarMapaSimple() {
    if (!currentGeojson || !currentPartidoData) return;
    if (currentLayerSimple) mapSimple.removeLayer(currentLayerSimple);

    const tipoVista = document.getElementById('tipo-vista').value;
    const partidoSeleccionado = document.getElementById('partido-selector').value;
    const candidatoSeleccionado = document.getElementById('candidato-selector').value;
    const partidoGanadorSeleccionado = document.getElementById('partido-ganador-selector').value;
    const porcentajeActivo = mapaCalorPorcentaje && (tipoVista === 'partido_heat' || tipoVista === 'candidato_heat');
    const candidatoFiltro = document.getElementById('candidato-ganador-filtro').value;

    const escala = document.getElementById('escala-selector') ? document.getElementById('escala-selector').value : 'municipio';
    escalaActual = escala;

    document.getElementById('partido-selector-container').style.display = (tipoVista === 'partido_heat') ? 'inline-flex' : 'none';
    document.getElementById('candidato-selector-container').style.display = (tipoVista === 'candidato_heat') ? 'inline-flex' : 'none';
    document.getElementById('partido-ganador-container').style.display = (tipoVista === 'candidato_ganador_por_partido') ? 'inline-flex' : 'none';
    document.getElementById('candidato-ganador-filtro-container').style.display = (tipoVista === 'candidato_ganador') ? 'inline-flex' : 'none';
    document.getElementById('heatmap-porcentaje-container').style.display = (tipoVista === 'partido_heat' || tipoVista === 'candidato_heat') ? 'inline-flex' : 'none';
    document.getElementById('comparar-controls').style.display = 'none';
    document.getElementById('map-container-simple').style.display = 'flex';
    document.getElementById('map-container-comparison').style.display = 'none';

    currentLayerSimple = L.geoJSON(currentGeojson, {
        style: (feature) => {
            const nombreRaw = feature.properties.MPIO_CNMBR;
            if (!nombreRaw) return { fillColor: '#cccccc', weight: 1, color: 'white', fillOpacity: 0.9 };
            const nombre = normalizarNombre(nombreRaw);
            let color;
            if (escalaActual === 'provincia') {
                const provincia = obtenerProvinciaDeMunicipio(nombre);
                if (!provincia) return { fillColor: '#cccccc', weight: 1, color: 'white', fillOpacity: 0.9 };
                color = getColorParaElemento(provincia, true, tipoVista, partidoSeleccionado, candidatoSeleccionado, partidoGanadorSeleccionado, porcentajeActivo);
            } else {
                color = getColorParaElemento(nombre, false, tipoVista, partidoSeleccionado, candidatoSeleccionado, partidoGanadorSeleccionado, porcentajeActivo);
            }
            return { fillColor: color, weight: 1, opacity: 1, color: 'white', fillOpacity: 0.9 };
        },
        onEachFeature: (feature, layer) => {
            const nombreRaw = feature.properties.MPIO_CNMBR;
            if (!nombreRaw) return;
            const nombre = normalizarNombre(nombreRaw);
            let tooltipText;
            if (escalaActual === 'provincia') {
                const provincia = obtenerProvinciaDeMunicipio(nombre);
                if (provincia) {
                    tooltipText = getTooltipText(provincia, true, tipoVista, partidoSeleccionado, candidatoSeleccionado, partidoGanadorSeleccionado, porcentajeActivo, candidatoFiltro);
                } else {
                    tooltipText = `<strong>${nombreRaw}</strong><br>No pertenece a provincia conocida`;
                }
            } else {
                tooltipText = getTooltipText(nombre, false, tipoVista, partidoSeleccionado, candidatoSeleccionado, partidoGanadorSeleccionado, porcentajeActivo, candidatoFiltro);
            }
            layer.bindTooltip(tooltipText, { sticky: true });

            layer.on('click', () => {
                if (escalaActual === 'provincia') {
                    const provincia = obtenerProvinciaDeMunicipio(nombre);
                    if (provincia) {
                        const datosProv = obtenerDatosProvincia(provincia);
                        if (datosProv) {
                            mostrarDetalleProvincia(provincia, datosProv);
                        } else {
                            mostrarDetalleMunicipio(nombreRaw, currentPartidoData.filter(row => normalizarNombre(row['MUNNOMBRE']) === nombre), currentCandidatoData.filter(row => normalizarNombre(row['MUNNOMBRE']) === nombre), tipoVista);
                        }
                    } else {
                        mostrarDetalleMunicipio(nombreRaw, currentPartidoData.filter(row => normalizarNombre(row['MUNNOMBRE']) === nombre), currentCandidatoData.filter(row => normalizarNombre(row['MUNNOMBRE']) === nombre), tipoVista);
                    }
                } else {
                    mostrarDetalleMunicipio(nombreRaw, currentPartidoData.filter(row => normalizarNombre(row['MUNNOMBRE']) === nombre), currentCandidatoData.filter(row => normalizarNombre(row['MUNNOMBRE']) === nombre), tipoVista);
                }
            });
        }
    }).addTo(mapSimple);
    mapSimple.fitBounds(currentLayerSimple.getBounds());

    const chkPuestos = document.getElementById('toggle-puestos');
    if (chkPuestos && chkPuestos.checked && capaPuestosVotacion) {
        capaPuestosVotacion.addTo(mapSimple);
    }

    actualizarResumenDepartamental(currentPartidoData, candidatoEspecificoActual);
}

function mostrarDetalleProvincia(provincia, datosProv) {
    const div = document.getElementById('detalle-municipio');
    if (!datosProv || (!datosProv.partidos.length && !datosProv.candidatos.length)) {
        div.innerHTML = '<p>No hay datos para esta provincia.</p>';
        ultimoElementoDetalle = null;
        return;
    }

    ultimoElementoDetalle = { nombre: provincia, tipo: 'provincia', datosPartidos: datosProv.partidos, datosCandidatos: datosProv.candidatos };

    let html = `<h4>${provincia}</h4>
                <p><strong>Total votos válidos:</strong> ${datosProv.totalVotos.toLocaleString()}</p>
                <div id="partidos-lista">`;
    const partidosOrdenados = [...datosProv.partidos].sort((a,b) => b['VOTOS'] - a['VOTOS']);
    partidosOrdenados.forEach(p => {
        const pct = (p['VOTOS'] / datosProv.totalVotos * 100).toFixed(1);
        html += `<div class="partido-item" data-partido="${p['PARNOMBRE']}">${p['PARNOMBRE']} (${p['VOTOS'].toLocaleString()} votos, ${pct}%)</div>
                 <div class="candidatos-list" data-partido="${p['PARNOMBRE']}" style="display:none;"></div>`;
    });
    html += `</div>`;
    div.innerHTML = html;

    const candidatosPorPartido = {};
    datosProv.candidatos.forEach(c => {
        if (!candidatosPorPartido[c['PARNOMBRE']]) candidatosPorPartido[c['PARNOMBRE']] = [];
        candidatosPorPartido[c['PARNOMBRE']].push({ nombre: c['CANNOMBRE'], votos: c['VOTOS'] });
    });
    for (let p in candidatosPorPartido) candidatosPorPartido[p].sort((a,b) => b.votos - a.votos);

    document.querySelectorAll('.partido-item').forEach(el => {
        const partido = el.getAttribute('data-partido');
        el.addEventListener('click', () => {
            const targetList = document.querySelector(`.candidatos-list[data-partido="${partido}"]`);
            if (targetList.style.display === 'none') {
                if (targetList.innerHTML === '') {
                    const candidatos = candidatosPorPartido[partido] || [];
                    if (candidatos.length) {
                        targetList.innerHTML = candidatos.map(c => `<div class="candidato-item"><a href="#" onclick="cambiarAMapaCalorCandidato('${c.nombre.replace(/'/g, "\\'")}'); return false;">${c.nombre}</a> (${c.votos.toLocaleString()} votos)</div>`).join('');
                    } else {
                        targetList.innerHTML = '<div class="candidato-item">No hay candidatos individuales</div>';
                    }
                }
                targetList.style.display = 'block';
            } else {
                targetList.style.display = 'none';
            }
        });
    });

    let datosGrafico = partidosOrdenados.map(p => ({ nombre: p['PARNOMBRE'], votos: p['VOTOS'], partido: p['PARNOMBRE'] }));
    if (filtrarConsejos) datosGrafico = datosGrafico.filter(d => !d.nombre.toUpperCase().includes('CONSEJO COMUNITARIO'));
    dibujarGrafico(datosGrafico, provincia, false);
}

function mostrarDetalleMunicipio(municipioNombre, partidosMunicipio, candidatosMunicipio, tipoVista) {
    const div = document.getElementById('detalle-municipio');
    if (!partidosMunicipio.length && !candidatosMunicipio.length) {
        div.innerHTML = '<p>No hay datos para este municipio.</p>';
        ultimoElementoDetalle = null;
        return;
    }

    ultimoElementoDetalle = { nombre: municipioNombre, tipo: 'municipio', datosPartidos: partidosMunicipio, datosCandidatos: candidatosMunicipio };

    if (tipoVista === 'candidato_heat' || tipoVista === 'candidato_ganador' || tipoVista === 'candidato_ganador_por_partido') {
        let html = `<h4>${municipioNombre}</h4>
                    <p><strong>Total votos válidos:</strong> ${candidatosMunicipio.reduce((s,f)=>s+f['VOTOS'],0).toLocaleString()}</p>
                    <table style="width:100%"><thead><th>Candidato</th><th>Votos</th></thead><tbody>`;
        const ordenado = [...candidatosMunicipio].sort((a,b)=>b['VOTOS']-a['VOTOS']);
        ordenado.forEach(f => {
            const nombreEscapado = f['CANNOMBRE'].replace(/'/g, "\\'");
            html += `<tr><td><a href="#" onclick="cambiarAMapaCalorCandidato('${nombreEscapado}'); return false;">${f['CANNOMBRE']}</a></td><td style="text-align:right">${f['VOTOS'].toLocaleString()}</td></tr>`;
        });
        html += `</tbody></table>`;
        div.innerHTML = html;
        let datosGrafico = ordenado.map(f => ({ nombre: f['CANNOMBRE'], votos: f['VOTOS'], partido: f['PARNOMBRE'] }));
        if (filtrarConsejos) datosGrafico = datosGrafico.filter(d => !d.nombre.toUpperCase().includes('CONSEJO COMUNITARIO'));
        dibujarGrafico(datosGrafico, municipioNombre, true);
        return;
    }

    const partidosMap = new Map();
    partidosMunicipio.forEach(f => {
        if (!partidosMap.has(f['PARNOMBRE'])) partidosMap.set(f['PARNOMBRE'], f['VOTOS']);
    });
    const partidosOrdenados = Array.from(partidosMap.entries()).sort((a,b)=>b[1]-a[1]);

    let html = `<h4>${municipioNombre}</h4>
                <p><strong>Total votos válidos:</strong> ${partidosMunicipio[0]['TOTAL_VOTOS'].toLocaleString()}</p>
                <div id="partidos-lista">`;
    partidosOrdenados.forEach(([partido, votos]) => {
        const pct = (votos / partidosMunicipio[0]['TOTAL_VOTOS'] * 100).toFixed(1);
        html += `<div class="partido-item" data-partido="${partido}">${partido} (${votos.toLocaleString()} votos, ${pct}%)</div>
                 <div class="candidatos-list" data-partido="${partido}" style="display:none;"></div>`;
    });
    html += `</div>`;
    div.innerHTML = html;

    const candidatosPorPartido = {};
    candidatosMunicipio.forEach(row => {
        if (!candidatosPorPartido[row['PARNOMBRE']]) candidatosPorPartido[row['PARNOMBRE']] = [];
        candidatosPorPartido[row['PARNOMBRE']].push({ nombre: row['CANNOMBRE'], votos: row['VOTOS'] });
    });
    for (let p in candidatosPorPartido) candidatosPorPartido[p].sort((a,b)=>b.votos - a.votos);

    document.querySelectorAll('.partido-item').forEach(el => {
        const partido = el.getAttribute('data-partido');
        el.addEventListener('click', () => {
            const targetList = document.querySelector(`.candidatos-list[data-partido="${partido}"]`);
            if (targetList.style.display === 'none') {
                if (targetList.innerHTML === '') {
                    const candidatos = candidatosPorPartido[partido] || [];
                    if (candidatos.length) {
                        targetList.innerHTML = candidatos.map(c => `<div class="candidato-item"><a href="#" onclick="cambiarAMapaCalorCandidato('${c.nombre.replace(/'/g, "\\'")}'); return false;">${c.nombre}</a> (${c.votos.toLocaleString()} votos)</div>`).join('');
                    } else {
                        targetList.innerHTML = '<div class="candidato-item">No hay candidatos individuales</div>';
                    }
                }
                targetList.style.display = 'block';
            } else {
                targetList.style.display = 'none';
            }
        });
    });

    let datosGrafico = partidosOrdenados.map(([p,v]) => ({ nombre: p, votos: v, partido: p }));
    if (filtrarConsejos) datosGrafico = datosGrafico.filter(d => !d.nombre.toUpperCase().includes('CONSEJO COMUNITARIO'));
    dibujarGrafico(datosGrafico, municipioNombre, false);
}

function renderPuestoDetalle(municipio, puesto, partidosData, candidatosData, totalVotos) {
    const div = document.getElementById('detalle-municipio');
    if (!partidosData || partidosData.length === 0) {
        div.innerHTML = `<p>No hay datos para el puesto "${puesto}" en ${municipio}.</p>`;
        ultimoElementoDetalle = null;
        return;
    }

    ultimoElementoDetalle = {
        nombre: `${puesto} (${municipio})`,
        tipo: 'puesto',
        rawResultados: ultimoElementoDetalle?.rawResultados || null
    };

    let html = `<h4>${puesto} - ${municipio}</h4>
                <p><strong>Total votos válidos:</strong> ${totalVotos.toLocaleString()}</p>
                <div id="partidos-lista">`;
    partidosData.forEach(p => {
        const pct = (p.votos / totalVotos * 100).toFixed(1);
        html += `<div class="partido-item" data-partido="${p.codigo}">${p.nombre} (${p.votos.toLocaleString()} votos, ${pct}%)</div>
                 <div class="candidatos-list" data-partido="${p.codigo}" style="display:none;"></div>`;
    });
    html += `</div>`;
    div.innerHTML = html;

    const candidatosPorPartido = {};
    candidatosData.forEach(c => {
        if (!candidatosPorPartido[c.codigoPartido]) candidatosPorPartido[c.codigoPartido] = [];
        candidatosPorPartido[c.codigoPartido].push({ nombre: c.nombre, votos: c.votos });
    });
    for (let code in candidatosPorPartido) {
        candidatosPorPartido[code].sort((a,b) => b.votos - a.votos);
    }

    document.querySelectorAll('.partido-item').forEach(el => {
        const partidoCode = el.getAttribute('data-partido');
        el.addEventListener('click', () => {
            const targetList = document.querySelector(`.candidatos-list[data-partido="${partidoCode}"]`);
            if (targetList.style.display === 'none') {
                if (targetList.innerHTML === '') {
                    const candidatos = candidatosPorPartido[partidoCode] || [];
                    if (candidatos.length) {
                        targetList.innerHTML = candidatos.map(c => `<div class="candidato-item"><a href="#" onclick="cambiarAMapaCalorCandidato('${c.nombre.replace(/'/g, "\\'")}'); return false;">${c.nombre}</a> (${c.votos.toLocaleString()} votos)</div>`).join('');
                    } else {
                        targetList.innerHTML = '<div class="candidato-item">No hay candidatos individuales</div>';
                    }
                }
                targetList.style.display = 'block';
            } else {
                targetList.style.display = 'none';
            }
        });
    });

    let datosGrafico = partidosData.map(p => ({ nombre: p.nombre, votos: p.votos, partido: p.nombre }));
    if (filtrarConsejos) datosGrafico = datosGrafico.filter(d => !d.nombre.toUpperCase().includes('CONSEJO COMUNITARIO'));
    dibujarGrafico(datosGrafico, `Puesto: ${puesto}`, false);
}

function mostrarDetallePuesto(municipio, puesto, resultados) {
    ultimoElementoDetalle = {
        nombre: `${puesto} (${municipio})`,
        tipo: 'puesto',
        rawResultados: resultados
    };

    const corpActual = currentCorporacion;
    const corpMapping = {
        'camara': 'CÁMARA',
        'senado': 'SENADO',
        'consulta': 'CONSULTA'
    };
    const corpFiltro = corpMapping[corpActual] || '';

    let filtered = resultados.filter(r => r.CORNOMBRE === corpFiltro);
    if (filtrarConsejos) {
        filtered = filtered.filter(r => !r.CANNOMBRE.toUpperCase().includes('CONSEJO COMUNITARIO'));
    }

    if (filtered.length === 0) {
        renderPuestoDetalle(municipio, puesto, [], [], 0);
        return;
    }

    const grupoMap = new Map();
    filtered.forEach(r => {
        const key = `${r.PARNOMBRE}|${r.CORNOMBRE}`;
        if (!grupoMap.has(key)) {
            grupoMap.set(key, {
                nombre: `${r.PARNOMBRE} (${r.CORNOMBRE})`,
                codigo: key,
                votos: 0,
                candidatos: []
            });
        }
        const entry = grupoMap.get(key);
        entry.votos += r.VOTOS;
        let candidatoExistente = entry.candidatos.find(c => c.nombre === r.CANNOMBRE);
        if (candidatoExistente) {
            candidatoExistente.votos += r.VOTOS;
        } else {
            entry.candidatos.push({ nombre: r.CANNOMBRE, votos: r.VOTOS, codigoPartido: key });
        }
    });

    const gruposOrdenados = Array.from(grupoMap.values()).sort((a,b) => b.votos - a.votos);
    const totalVotos = gruposOrdenados.reduce((sum, g) => sum + g.votos, 0);
    const candidatosFlat = [];
    gruposOrdenados.forEach(g => {
        g.candidatos.forEach(c => {
            candidatosFlat.push({
                nombre: c.nombre,
                votos: c.votos,
                codigoPartido: g.codigo,
                partido: g.nombre
            });
        });
    });

    renderPuestoDetalle(municipio, puesto, gruposOrdenados, candidatosFlat, totalVotos);
}

function dibujarGrafico(datos, titulo, esCandidato) {
    if (!datos || datos.length === 0) return;
    const ctx = document.getElementById('chart-municipio').getContext('2d');
    if (window.municipioChart) window.municipioChart.destroy();

    let datosMostrar = [...datos];
    if (graficoTipo === 'bar' && datosMostrar.length > 13) datosMostrar = datosMostrar.slice(0, 13);

    const labels = datosMostrar.map(d => d.nombre);
    const valores = datosMostrar.map(d => d.votos);
    
    let colores;
    if (esCandidato) {
        colores = datosMostrar.map(d => getColorCandidato(d.nombre));
    } else {
        colores = datosMostrar.map(d => {
            const partidoRow = currentPartidoData.find(p => p['PARNOMBRE'] === d.partido);
            return partidoRow ? partidoRow.COLOR_BASE : '#3498db';
        });
    }

    if (graficoTipo === 'bar') {
        window.municipioChart = new Chart(ctx, {
            type: 'bar',
            data: { labels, datasets: [{ label: 'Votos', data: valores, backgroundColor: colores, borderWidth: 1 }] },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { display: false }, title: { display: true, text: `Votación en ${titulo}${esCandidato ? ' (Candidatos)' : ' (Partidos)'}` } },
                scales: { y: { beginAtZero: true, title: { display: true, text: 'Votos' } }, x: { ticks: { autoSkip: true, maxRotation: 45 } } }
            }
        });
    } else {
        window.municipioChart = new Chart(ctx, {
            type: 'pie',
            data: { labels, datasets: [{ data: valores, backgroundColor: colores, borderWidth: 1 }] },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { position: 'right', labels: { font: { size: 10 } } }, title: { display: true, text: `Votación en ${titulo}${esCandidato ? ' (Candidatos)' : ' (Partidos)'}` } }
            }
        });
    }
}

function buscarMunicipio() {
    const nombre = document.getElementById('buscador-municipio').value.trim();
    if (!nombre) return;
    const nombreNormalizado = normalizarNombre(nombre);
    if (!currentGeojson) return;
    let featureEncontrado = null;
    for (let f of currentGeojson.features) {
        const nombreGeo = normalizarNombre(f.properties.MPIO_CNMBR);
        if (nombreGeo === nombreNormalizado) { featureEncontrado = f; break; }
    }
    if (featureEncontrado) {
        const latlng = L.latLng(featureEncontrado.geometry.coordinates[0][0][1], featureEncontrado.geometry.coordinates[0][0][0]);
        mapSimple.setView(latlng, 12);
        if (currentLayerSimple) {
            currentLayerSimple.eachLayer(layer => {
                if (layer.feature && normalizarNombre(layer.feature.properties.MPIO_CNMBR) === nombreNormalizado) {
                    layer.openPopup();
                    layer.setStyle({ weight: 3, color: '#ff0000', fillOpacity: 0.5 });
                    setTimeout(() => { if (currentLayerSimple) currentLayerSimple.resetStyle(layer); }, 2000);
                }
            });
        }
    } else {
        alert('Municipio no encontrado. Verifica el nombre.');
    }
}

function cambiarAMapaCalorCandidato(nombreCandidato) {
    const tipoVistaSelect = document.getElementById('tipo-vista');
    tipoVistaSelect.value = 'candidato_heat';
    const candidatoSelect = document.getElementById('candidato-selector');
    candidatoSelect.value = nombreCandidato;
    candidatoEspecificoActual = nombreCandidato;
    modoComparacion = false;
    actualizarMapaSimple();
}

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
            const municipio = parts[0].trim();
            const puesto = parts[1].trim();
            const lat = parseFloat(parts[2]);
            const lon = parseFloat(parts[3]);
            if (isNaN(lat) || isNaN(lon)) continue;
            puestosData.push({ municipio, puesto, lat, lon });
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

        const idxMun = headers.indexOf('MUNNOMBRE');
        const idxPuesto = headers.indexOf('PUESTO');
        const idxCorp = headers.indexOf('CORNOMBRE');
        const idxCandidato = headers.indexOf('CANNOMBRE');
        const idxPartido = headers.indexOf('PARNOMBRE');
        const idxVotos = headers.indexOf('VOTOS');

        if (idxMun === -1 || idxPuesto === -1 || idxCorp === -1 || idxCandidato === -1 || idxPartido === -1 || idxVotos === -1) {
            console.error('No se encontraron las columnas esperadas en datos_puestos_5_ciudades.csv');
            alert('El archivo datos_puestos_5_ciudades.csv debe tener las columnas: MUNNOMBRE, PUESTO, CORNOMBRE, CANNOMBRE, PARNOMBRE, VOTOS');
            return;
        }

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            const values = lines[i].split(';');
            if (values.length <= Math.max(idxMun, idxPuesto, idxCorp, idxCandidato, idxPartido, idxVotos)) continue;

            const municipio = values[idxMun].trim().toUpperCase();
            const puesto = values[idxPuesto].trim().toUpperCase();
            const corporacion = values[idxCorp].trim();
            const candidato = values[idxCandidato].trim();
            const partido = values[idxPartido].trim();
            const votos = parseInt(values[idxVotos], 10);

            const key = `${municipio}|${puesto}`;
            if (!puestosResultados[key]) puestosResultados[key] = [];
            puestosResultados[key].push({
                CANNOMBRE: candidato,
                PARNOMBRE: partido,
                CORNOMBRE: corporacion,
                VOTOS: votos
            });
        }

        puestosResultadosCargados = true;
        console.log(`✅ Resultados de puestos cargados. Total puestos con datos: ${Object.keys(puestosResultados).length}`);
        const sampleKeys = Object.keys(puestosResultados).slice(0, 5);
        console.log('Ejemplo de claves generadas:', sampleKeys);
    } catch (error) {
        console.error('Error cargando resultados de puestos:', error);
        alert('No se pudo cargar el archivo datos_puestos_5_ciudades.csv. Verifica que exista en la carpeta data/');
    }
}

function crearCapaPuestosVotacion() {
    if (capaPuestosVotacion) return capaPuestosVotacion;
    capaPuestosVotacion = L.layerGroup();

    console.log('Puestos cargados desde coordenadas:', puestosData.length);
    puestosData.forEach(p => {
        const municipioNorm = p.municipio.toUpperCase().trim();
        const puestoNorm = p.puesto.toUpperCase().trim();
        const key = `${municipioNorm}|${puestoNorm}`;
        const resultados = puestosResultados[key] || [];

        if (!resultados.length && puestosData.indexOf(p) < 5) {
            console.log(`No se encontraron resultados para: ${key}`);
        }

        const marker = L.circleMarker([p.lat, p.lon], {
            radius: 5,
            color: '#2c3e50',
            fillColor: '#34495e',
            fillOpacity: 0.85,
            weight: 1
        });
        const totalVotos = resultados.reduce((s, r) => s + r.VOTOS, 0);
        marker.bindPopup(`<strong>${p.puesto}</strong><br>Municipio: ${p.municipio}<br>Total votos: ${totalVotos.toLocaleString()}`);
        marker.on('click', () => {
            if (resultados.length) {
                mostrarDetallePuesto(p.municipio, p.puesto, resultados);
            } else {
                mostrarDetallePuesto(p.municipio, p.puesto, []);
            }
        });
        marker.addTo(capaPuestosVotacion);
    });
    return capaPuestosVotacion;
}

function llenarSelectorMunicipios() {
    const selector = document.getElementById('municipio-selector-trayectoria');
    if (!currentGeojson) return;
    const municipios = currentGeojson.features.map(f => f.properties.MPIO_CNMBR).sort();
    selector.innerHTML = '<option value="">Seleccione un municipio</option>' +
        municipios.map(m => `<option value="${m}">${m}</option>`).join('');
}

async function cargarCandidatosParaSelector(anio, corporacion, selector) {
    const archivos = archivosPorAnio[anio]?.[corporacion];
    if (!archivos) return;
    try {
        const response = await fetch(basePath + archivos.candidato);
        const text = await response.text();
        const data = parseCandidatosCSV(text);
        const excluir = ['CANDIDATOS TOTALES', 'VOTOS EN BLANCO', 'VOTOS NO MARCADOS', 'VOTOS NULOS', 'VOTOS EN BLANCO TERRITORIAL', 'VOTOS NO MARCADOS TERRITORIAL', 'VOTOS NULOS TERRITORIAL'];
        const candidatosFiltrados = data.filter(row => !excluir.includes(row['CANNOMBRE']));
        const candidatosUnicos = [...new Set(candidatosFiltrados.map(row => row['CANNOMBRE']))].sort();
        selector.innerHTML = '<option value="">Seleccione candidato</option>' +
            candidatosUnicos.map(c => `<option value="${c}">${c}</option>`).join('');
        const key = `${anio}_${corporacion}`;
        todosLosCandidatosPorAnioCorp[key] = candidatosFiltrados;
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
            const response = await fetch(basePath + archivos.candidato);
            const text = await response.text();
            datos = parseCandidatosCSV(text);
            const excluir = ['CANDIDATOS TOTALES', 'VOTOS EN BLANCO', 'VOTOS NO MARCADOS', 'VOTOS NULOS', 'VOTOS EN BLANCO TERRITORIAL', 'VOTOS NO MARCADOS TERRITORIAL', 'VOTOS NULOS TERRITORIAL'];
            datos = datos.filter(row => !excluir.includes(row['CANNOMBRE']));
            todosLosCandidatosPorAnioCorp[key] = datos;
        } catch (error) {
            console.error(`Error cargando datos para ${anio} - ${corporacion}:`, error);
            return 0;
        }
    }
    const municipioNorm = normalizarNombre(municipio);
    const votos = datos.filter(row => 
        row['CANNOMBRE'] === candidato && 
        normalizarNombre(row['MUNNOMBRE']) === municipioNorm
    ).reduce((sum, row) => sum + row['VOTOS'], 0);
    return votos;
}

async function obtenerVotosCandidatoDepartamento(anio, corporacion, candidato) {
    const key = `${anio}_${corporacion}`;
    let datos = todosLosCandidatosPorAnioCorp[key];
    if (!datos) {
        const archivos = archivosPorAnio[anio]?.[corporacion];
        if (!archivos) return 0;
        try {
            const response = await fetch(basePath + archivos.candidato);
            const text = await response.text();
            datos = parseCandidatosCSV(text);
            const excluir = ['CANDIDATOS TOTALES', 'VOTOS EN BLANCO', 'VOTOS NO MARCADOS', 'VOTOS NULOS', 'VOTOS EN BLANCO TERRITORIAL', 'VOTOS NO MARCADOS TERRITORIAL', 'VOTOS NULOS TERRITORIAL'];
            datos = datos.filter(row => !excluir.includes(row['CANNOMBRE']));
            todosLosCandidatosPorAnioCorp[key] = datos;
        } catch (error) {
            console.error(`Error cargando datos para ${anio} - ${corporacion}:`, error);
            return 0;
        }
    }
    const votos = datos.filter(row => row['CANNOMBRE'] === candidato)
        .reduce((sum, row) => sum + row['VOTOS'], 0);
    return votos;
}

function crearFilaComparacion(index) {
    const div = document.createElement('div');
    div.className = 'comparacion-item';
    div.setAttribute('data-index', index);
    div.innerHTML = `
        <select class="comparacion-anio" style="width:80px">
            <option value="2019">2019</option>
            <option value="2022">2022</option>
            <option value="2023">2023</option>
            <option value="2026">2026</option>
        </select>
        <select class="comparacion-corporacion" style="width:100px">
            <option value="camara">Cámara</option>
            <option value="senado">Senado</option>
            <option value="asamblea">Asamblea</option>
            <option value="gobernador">Gobernador</option>
            <option value="alcalde">Alcalde</option>
            <option value="concejo">Concejo</option>
        </select>
        <select class="comparacion-candidato" style="width:200px">
            <option value="">Seleccione candidato</option>
        </select>
        <button class="btn-eliminar-comparacion">🗑️</button>
    `;
    const anioSelect = div.querySelector('.comparacion-anio');
    const corpSelect = div.querySelector('.comparacion-corporacion');
    const candidatoSelect = div.querySelector('.comparacion-candidato');
    
    const cargar = () => {
        const anio = anioSelect.value;
        const corp = corpSelect.value;
        if (anio && corp) {
            cargarCandidatosParaSelector(anio, corp, candidatoSelect);
        } else {
            candidatoSelect.innerHTML = '<option value="">Seleccione año y corporación</option>';
        }
    };
    anioSelect.addEventListener('change', cargar);
    corpSelect.addEventListener('change', cargar);
    
    div.querySelector('.btn-eliminar-comparacion').addEventListener('click', () => {
        div.remove();
        document.querySelectorAll('.comparacion-item').forEach((item, i) => {
            item.setAttribute('data-index', i);
        });
    });
    
    return div;
}

async function actualizarGraficoComparativoMunicipio() {
    const municipio = document.getElementById('municipio-selector-trayectoria').value;
    if (!municipio) {
        alert('Seleccione un municipio');
        return;
    }

    const items = document.querySelectorAll('.comparacion-item');
    const comparaciones = [];
    items.forEach(item => {
        const anio = item.querySelector('.comparacion-anio').value;
        const corporacion = item.querySelector('.comparacion-corporacion').value;
        const candidato = item.querySelector('.comparacion-candidato').value;
        if (anio && corporacion && candidato) {
            comparaciones.push({ anio, corporacion, candidato });
        }
    });
    if (comparaciones.length === 0) {
        alert('Agregue al menos una comparación');
        return;
    }

    const labels = [];
    const datosMunicipio = [];
    const datosDepartamento = [];

    for (const comp of comparaciones) {
        const votosMun = await obtenerVotosCandidatoMunicipio(comp.anio, comp.corporacion, comp.candidato, municipio);
        const votosDep = await obtenerVotosCandidatoDepartamento(comp.anio, comp.corporacion, comp.candidato);
        labels.push(`${comp.candidato} (${comp.anio} - ${comp.corporacion})`);
        datosMunicipio.push(votosMun);
        datosDepartamento.push(votosDep);
    }

    const ctx = document.getElementById('trajectory-municipio-chart').getContext('2d');
    if (trajectoryMunicipioChart) trajectoryMunicipioChart.destroy();

    trajectoryMunicipioChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: `Votos en ${municipio}`,
                data: datosMunicipio,
                backgroundColor: '#3498db',
                borderColor: '#2980b9',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Número de votos' }
                },
                x: {
                    ticks: { autoSkip: false, maxRotation: 45 }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.raw.toLocaleString()} votos`
                    }
                },
                title: {
                    display: true,
                    text: `Evolución de candidatos en ${municipio}`
                }
            }
        }
    });

    let textoDepartamento = '<div style="margin-top: 15px; font-size: 12px; border-top: 1px solid #ccc; padding-top: 10px;"><strong>Votación departamental:</strong><br>';
    for (let i = 0; i < labels.length; i++) {
        textoDepartamento += `${labels[i]}: ${datosDepartamento[i].toLocaleString()} votos<br>`;
    }
    textoDepartamento += '</div>';

    let container = document.getElementById('departamento-texto');
    if (!container) {
        container = document.createElement('div');
        container.id = 'departamento-texto';
        document.querySelector('.trajectory-municipio-container').appendChild(container);
    }
    container.innerHTML = textoDepartamento;
}

function obtenerDatosComparacion(tipo, valor) {
    const datos = {};
    if (tipo === 'partido') {
        currentPartidoData.forEach(row => {
            if (row['PARNOMBRE'] === valor) {
                const mun = normalizarNombre(row['MUNNOMBRE']);
                datos[mun] = (datos[mun] || 0) + row['VOTOS'];
            }
        });
    } else {
        currentCandidatoData.forEach(row => {
            if (row['CANNOMBRE'] === valor) {
                const mun = normalizarNombre(row['MUNNOMBRE']);
                datos[mun] = (datos[mun] || 0) + row['VOTOS'];
            }
        });
    }
    return datos;
}

function dibujarMapaComparacion(datos, titulo, map) {
    const maxVotos = Math.max(...Object.values(datos), 1);
    const capa = L.geoJSON(currentGeojson, {
        style: (feature) => {
            const nombreRaw = feature.properties.MPIO_CNMBR;
            if (!nombreRaw) return { fillColor: '#cccccc', weight: 1, color: 'white', fillOpacity: 0.7 };
            const nombre = normalizarNombre(nombreRaw);
            const votos = datos[nombre] || 0;
            const intensidad = votos / maxVotos;
            const r = 255;
            const g = Math.floor(200 * (1 - intensidad));
            const b = Math.floor(200 * (1 - intensidad));
            const color = `rgb(${r}, ${g}, ${b})`;
            return { fillColor: color, weight: 1, opacity: 1, color: 'white', fillOpacity: 0.8 };
        },
        onEachFeature: (feature, layer) => {
            const nombreRaw = feature.properties.MPIO_CNMBR;
            if (!nombreRaw) return;
            const nombre = normalizarNombre(nombreRaw);
            const votos = datos[nombre] || 0;
            layer.bindTooltip(`<strong>${nombreRaw}</strong><br>${titulo}: ${votos.toLocaleString()} votos`, { sticky: true });
            layer.on('click', () => {
                const vA = comparacionDatosA ? comparacionDatosA[nombre] || 0 : 0;
                const vB = comparacionDatosB ? comparacionDatosB[nombre] || 0 : 0;
                document.getElementById('detalle-compare').innerHTML = `<h4>${nombreRaw}</h4>
                    <p><strong>${comparacionValorA}</strong>: ${vA.toLocaleString()} votos</p>
                    <p><strong>${comparacionValorB}</strong>: ${vB.toLocaleString()} votos</p>`;
            });
        }
    }).addTo(map);
    map.fitBounds(capa.getBounds());
    return capa;
}

async function actualizarComparacion() {
    console.log("actualizarComparacion iniciada");
    const tipoA = document.getElementById('comparar-tipo-a').value;
    const valorA = document.getElementById('comparar-valor-a').value;
    const tipoB = document.getElementById('comparar-tipo-b').value;
    const valorB = document.getElementById('comparar-valor-b').value;

    if (!valorA || !valorB) {
        document.getElementById('detalle-compare').innerHTML = '<p>Seleccione dos elementos para comparar.</p>';
        return;
    }

    comparacionValorA = valorA;
    comparacionValorB = valorB;
    comparacionDatosA = obtenerDatosComparacion(tipoA, valorA);
    comparacionDatosB = obtenerDatosComparacion(tipoB, valorB);

    document.getElementById('map-container-simple').style.display = 'none';
    document.getElementById('map-container-comparison').style.display = 'flex';
    document.getElementById('comparar-controls').style.display = 'inline-flex';

    if (currentLayerA) mapA.removeLayer(currentLayerA);
    if (currentLayerB) mapB.removeLayer(currentLayerB);

    currentLayerA = dibujarMapaComparacion(comparacionDatosA, valorA, mapA);
    currentLayerB = dibujarMapaComparacion(comparacionDatosB, valorB, mapB);

    setTimeout(() => {
        mapA.invalidateSize();
        mapB.invalidateSize();
    }, 100);

    document.getElementById('label-a').innerText = valorA;
    document.getElementById('label-b').innerText = valorB;
    console.log("Comparación finalizada");
}

// ==================== EVENTOS Y ARRANQUE ====================
document.addEventListener('DOMContentLoaded', async () => {
    mapSimple = L.map('map').setView([5.75, -73.0], 8);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(mapSimple);

    mapA = L.map('map-a').setView([5.75, -73.0], 8);
    mapB = L.map('map-b').setView([5.75, -73.0], 8);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapA);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapB);

    try {
        const response = await fetch(geojsonPath);
        currentGeojson = await response.json();
        console.log(`GeoJSON cargado con ${currentGeojson.features.length} municipios`);
        llenarSelectorMunicipios();
    } catch (error) {
        console.error('Error cargando GeoJSON:', error);
        alert('No se pudo cargar el mapa base.');
        return;
    }

    try {
        const respProv = await fetch('data/provincias_boyaca.json');
        provinciasData = await respProv.json();
        console.log('Provincias cargadas:', Object.keys(provinciasData));
    } catch (error) {
        console.error('Error cargando provincias:', error);
    }

    function actualizarSelectorCorporacion(anio) {
        const selector = document.getElementById('corporacion-selector');
        const corporaciones = Object.keys(archivosPorAnio[anio] || {});
        selector.innerHTML = '';
        corporaciones.forEach(corp => {
            const option = document.createElement('option');
            option.value = corp;
            option.textContent = corp.charAt(0).toUpperCase() + corp.slice(1);
            selector.appendChild(option);
        });
    }

    actualizarSelectorCorporacion('2026');
    await cargarDatos('2026', 'camara');

    setTimeout(() => {
        mapSimple.invalidateSize();
        if (mapA) mapA.invalidateSize();
        if (mapB) mapB.invalidateSize();
    }, 200);

    // ==================== EVENTOS ====================
    document.getElementById('toggle-resumen').addEventListener('click', () => {
        const panel = document.getElementById('resumen-panel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });
    document.getElementById('btn-buscar').addEventListener('click', buscarMunicipio);
    document.getElementById('buscador-municipio').addEventListener('keypress', (e) => { if (e.key === 'Enter') buscarMunicipio(); });
    document.getElementById('btn-barras').addEventListener('click', () => {
        graficoTipo = 'bar';
        document.getElementById('btn-barras').classList.add('active');
        document.getElementById('btn-circular').classList.remove('active');
        if (ultimoElementoDetalle) {
            if (ultimoElementoDetalle.tipo === 'provincia') {
                mostrarDetalleProvincia(ultimoElementoDetalle.nombre, { partidos: ultimoElementoDetalle.datosPartidos, candidatos: ultimoElementoDetalle.datosCandidatos, totalVotos: ultimoElementoDetalle.datosPartidos.reduce((s,p)=>s+p['VOTOS'],0) });
            } else if (ultimoElementoDetalle.tipo === 'municipio') {
                mostrarDetalleMunicipio(ultimoElementoDetalle.nombre, ultimoElementoDetalle.datosPartidos, ultimoElementoDetalle.datosCandidatos, document.getElementById('tipo-vista').value);
            } else if (ultimoElementoDetalle.tipo === 'puesto') {
                const nombrePartes = ultimoElementoDetalle.nombre.split(' (');
                const puesto = nombrePartes[0];
                const municipio = nombrePartes[1] ? nombrePartes[1].slice(0, -1) : '';
                mostrarDetallePuesto(municipio, puesto, ultimoElementoDetalle.rawResultados);
            }
        }
    });
    document.getElementById('btn-circular').addEventListener('click', () => {
        graficoTipo = 'pie';
        document.getElementById('btn-circular').classList.add('active');
        document.getElementById('btn-barras').classList.remove('active');
        if (ultimoElementoDetalle) {
            if (ultimoElementoDetalle.tipo === 'provincia') {
                mostrarDetalleProvincia(ultimoElementoDetalle.nombre, { partidos: ultimoElementoDetalle.datosPartidos, candidatos: ultimoElementoDetalle.datosCandidatos, totalVotos: ultimoElementoDetalle.datosPartidos.reduce((s,p)=>s+p['VOTOS'],0) });
            } else if (ultimoElementoDetalle.tipo === 'municipio') {
                mostrarDetalleMunicipio(ultimoElementoDetalle.nombre, ultimoElementoDetalle.datosPartidos, ultimoElementoDetalle.datosCandidatos, document.getElementById('tipo-vista').value);
            } else if (ultimoElementoDetalle.tipo === 'puesto') {
                const nombrePartes = ultimoElementoDetalle.nombre.split(' (');
                const puesto = nombrePartes[0];
                const municipio = nombrePartes[1] ? nombrePartes[1].slice(0, -1) : '';
                mostrarDetallePuesto(municipio, puesto, ultimoElementoDetalle.rawResultados);
            }
        }
    });
    document.getElementById('btn-filtrar-consejos').addEventListener('click', () => {
        filtrarConsejos = !filtrarConsejos;
        const btn = document.getElementById('btn-filtrar-consejos');
        btn.style.backgroundColor = filtrarConsejos ? '#e74c3c' : '#ecf0f1';
        if (ultimoElementoDetalle) {
            if (ultimoElementoDetalle.tipo === 'provincia') {
                mostrarDetalleProvincia(ultimoElementoDetalle.nombre, { partidos: ultimoElementoDetalle.datosPartidos, candidatos: ultimoElementoDetalle.datosCandidatos, totalVotos: ultimoElementoDetalle.datosPartidos.reduce((s,p)=>s+p['VOTOS'],0) });
            } else if (ultimoElementoDetalle.tipo === 'municipio') {
                mostrarDetalleMunicipio(ultimoElementoDetalle.nombre, ultimoElementoDetalle.datosPartidos, ultimoElementoDetalle.datosCandidatos, document.getElementById('tipo-vista').value);
            } else if (ultimoElementoDetalle.tipo === 'puesto') {
                const nombrePartes = ultimoElementoDetalle.nombre.split(' (');
                const puesto = nombrePartes[0];
                const municipio = nombrePartes[1] ? nombrePartes[1].slice(0, -1) : '';
                mostrarDetallePuesto(municipio, puesto, ultimoElementoDetalle.rawResultados);
            }
        }
    });
    document.getElementById('heatmap-porcentaje-checkbox').addEventListener('change', (e) => {
        mapaCalorPorcentaje = e.target.checked;
        if (!modoComparacion && (document.getElementById('tipo-vista').value === 'partido_heat' || document.getElementById('tipo-vista').value === 'candidato_heat')) actualizarMapaSimple();
    });
    document.getElementById('comparar-tipo-a').addEventListener('change', () => {
        const tipo = document.getElementById('comparar-tipo-a').value;
        const selector = document.getElementById('comparar-valor-a');
        const lista = tipo === 'partido' ? partidosUnicos : candidatosUnicos;
        selector.innerHTML = '<option value="">Seleccione...</option>' + lista.map(v => `<option value="${v}">${v}</option>`).join('');
    });
    document.getElementById('comparar-tipo-b').addEventListener('change', () => {
        const tipo = document.getElementById('comparar-tipo-b').value;
        const selector = document.getElementById('comparar-valor-b');
        const lista = tipo === 'partido' ? partidosUnicos : candidatosUnicos;
        selector.innerHTML = '<option value="">Seleccione...</option>' + lista.map(v => `<option value="${v}">${v}</option>`).join('');
    });
    document.getElementById('comparar-update').addEventListener('click', () => {
        modoComparacion = true;
        actualizarComparacion();
    });
    document.getElementById('actualizar').addEventListener('click', () => {
        if (modoComparacion) {
            actualizarComparacion();
        } else {
            actualizarMapaSimple();
        }
    });
    document.getElementById('anio-selector').addEventListener('change', (e) => {
        currentAnio = e.target.value;
        actualizarSelectorCorporacion(currentAnio);
        const primeraCorp = Object.keys(archivosPorAnio[currentAnio])[0];
        if (primeraCorp) { currentCorporacion = primeraCorp; cargarDatos(currentAnio, currentCorporacion); }
    });
    document.getElementById('corporacion-selector').addEventListener('change', (e) => {
        currentCorporacion = e.target.value;
        cargarDatos(currentAnio, currentCorporacion);
    });
    document.getElementById('tipo-vista').addEventListener('change', (e) => {
        const valor = e.target.value;
        modoComparacion = (valor === 'comparar');
        if (modoComparacion) {
            const compararControls = document.getElementById('comparar-controls');
            if (compararControls) compararControls.style.display = 'inline-flex';
            const partidoSelector = document.getElementById('partido-selector-container');
            if (partidoSelector) partidoSelector.style.display = 'none';
            const candidatoSelector = document.getElementById('candidato-selector-container');
            if (candidatoSelector) candidatoSelector.style.display = 'none';
            const partidoGanador = document.getElementById('partido-ganador-container');
            if (partidoGanador) partidoGanador.style.display = 'none';
            const candidatoFiltro = document.getElementById('candidato-ganador-filtro-container');
            if (candidatoFiltro) candidatoFiltro.style.display = 'none';
            const heatmapPorcentaje = document.getElementById('heatmap-porcentaje-container');
            if (heatmapPorcentaje) heatmapPorcentaje.style.display = 'none';
            const mapSimpleContainer = document.getElementById('map-container-simple');
            if (mapSimpleContainer) mapSimpleContainer.style.display = 'none';
            const mapComparisonContainer = document.getElementById('map-container-comparison');
            if (mapComparisonContainer) mapComparisonContainer.style.display = 'flex';
            if (currentPartidoData && currentGeojson) {
                console.log("Ejecutando comparación automática");
                actualizarComparacion();
            } else {
                console.log("Datos o GeoJSON no listos aún");
            }
        } else {
            const compararControls = document.getElementById('comparar-controls');
            if (compararControls) compararControls.style.display = 'none';
            const mapComparisonContainer = document.getElementById('map-container-comparison');
            if (mapComparisonContainer) mapComparisonContainer.style.display = 'none';
            const mapSimpleContainer = document.getElementById('map-container-simple');
            if (mapSimpleContainer) mapSimpleContainer.style.display = 'flex';
            actualizarMapaSimple();
        }
    });
    document.getElementById('partido-selector').addEventListener('change', () => {
        if (!modoComparacion && document.getElementById('tipo-vista').value === 'partido_heat') actualizarMapaSimple();
    });
    document.getElementById('candidato-selector').addEventListener('change', () => {
        candidatoEspecificoActual = document.getElementById('candidato-selector').value;
        if (!modoComparacion && document.getElementById('tipo-vista').value === 'candidato_heat') actualizarMapaSimple();
    });
    document.getElementById('partido-ganador-selector').addEventListener('change', () => {
        if (!modoComparacion && document.getElementById('tipo-vista').value === 'candidato_ganador_por_partido') actualizarMapaSimple();
    });
    document.getElementById('candidato-ganador-filtro').addEventListener('change', () => {
        if (!modoComparacion && document.getElementById('tipo-vista').value === 'candidato_ganador') actualizarMapaSimple();
    });
    document.getElementById('toggle-puestos').addEventListener('change', async (e) => {
        if (e.target.checked) {
            await cargarPuestosVotacion();
            await cargarResultadosPuestos();
            const capa = crearCapaPuestosVotacion();
            capa.addTo(mapSimple);
        } else {
            if (capaPuestosVotacion) mapSimple.removeLayer(capaPuestosVotacion);
        }
    });
    document.getElementById('btn-agregar-comparacion').addEventListener('click', () => {
        const container = document.getElementById('comparaciones-list');
        const nuevaFila = crearFilaComparacion(container.children.length);
        container.appendChild(nuevaFila);
    });
    document.getElementById('btn-actualizar-trayectoria-municipio').addEventListener('click', () => {
        actualizarGraficoComparativoMunicipio();
    });
    const container = document.getElementById('comparaciones-list');
    if (container) {
        container.innerHTML = '';
        container.appendChild(crearFilaComparacion(0));
    }
    const escalaSelector = document.getElementById('escala-selector');
    if (escalaSelector) {
        escalaSelector.addEventListener('change', () => {
            if (!modoComparacion) {
                actualizarMapaSimple();
            }
        });
    }
});