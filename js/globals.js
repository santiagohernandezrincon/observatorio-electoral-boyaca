// ==================== CONFIGURACIÓN DE DATOS DISPONIBLES ====================
const DATOS_DISPONIBLES = {
    2010: ['camara', 'senado', 'presidencia_1v', 'presidencia_2v'],
    2011: ['alcalde', 'asamblea', 'concejo', 'gobernador'],
    2014: ['camara', 'senado', 'presidencia_1v', 'presidencia_2v'],
    2015: ['alcalde', 'asamblea', 'concejo', 'gobernador'],
    2016: ['plebiscito'],
    2018: ['camara', 'senado', 'presidencia_1v', 'presidencia_2v'],
    2019: ['alcalde', 'asamblea', 'concejo', 'gobernador', 'jal'],
    2022: ['camara', 'senado', 'presidencia_1v', 'presidencia_2v'],
    2023: ['alcalde', 'asamblea', 'concejo', 'gobernador', 'jal'],
    2026: ['camara', 'senado', 'consultas', 'presidencia_1v', 'presidencia_2v']
};

const ABREV_PARTIDO = {
  'Partido Liberal Colombiano':    'P. Liberal',
  'Partido Conservador Colombiano':'P. Conservador',
  'Partido de la U':               'P. de la U',
  'Cambio Radical':                'C. Radical',
  'Alianza Verde':                 'A. Verde',
  'Partido Verde Oxígeno':         'Verde Oxígeno',
  'Centro Democrático':            'C. Democrático',
  'Polo Democrático Alternativo':  'Polo Democrático',
  'Pacto Histórico':               'Pacto Histórico',
  'Opción Ciudadana':              'Op. Ciudadana',
  'Movimiento MIRA':               'MIRA',
  'Alianza Social Independiente':  'ASI',
  'Comunes':                       'Comunes',
  'Colombia Justa Libres':         'Col. Justa Libres',
  'Liga de Gobernantes':           'Liga Gobernantes',
  'Centro Esperanza':              'C. Esperanza',
  'Equipo por Colombia':           'Equipo Colombia',
  'Gran Consulta por Colombia':    'Gran Consulta',
  'AICO':                          'AICO',
  'MAIS':                          'MAIS',
  'Creemos':                       'Creemos',
  'MIO':                           'MIO',
  'Nuevo Liberalismo':             'Nuevo Liberal.',
  'Unión Patriótica':              'UP',
  'Fuerza Ciudadana':              'F. Ciudadana',
  'Colombia Piensa en Grande':     'Col. P. Grande',
  'Dignidad y Compromiso':         'Dignidad y C.',
  'Partido PIN':                   'PIN',
  'Sí':                            'Sí',
  'No':                            'No',
  'Salvación Nacional':            'Salvación Nac.',
  'Con Toda por Colombia':         'Con Toda',
  'Valientes':                     'Valientes',
  'Colombia Renaciente':           'Col. Renaciente',
  'Todos Somos Colombia':          'Todos Somos',
  'Partido Somos':                 'P. Somos',
  'Partido sin identificar':       'Sin identificar',
  'Movimiento Ciudadano':          'Mov. Ciudadano',
};

// 0.5% del total de votos: umbral de relevancia para ocultar listas
// hiperlocales sin peso real (consejos comunitarios, circunscripciones
// especiales, etc.) -- usado por la leyenda del mapa y por el selector
// de partido de Trayectoria.
const UMBRAL_LEYENDA = 0.005;

const CIRCUNSCRIPCIONES_EXCLUIR = [
  'CIRCUNSCRIPCION ESPECIAL AFRODESCENDIENTE',
  'CIRCUNSCRIPCION ESPECIAL INDIGENA',
  'CIRCUNSCRIPCION ESPECIAL COLOMBIANOS EN EL EXTERIOR',
  'ESPECIAL AFRO',
  'ESPECIAL INDIGENA',
  'CIRCUNSCRIPCION AFRO',
  'CIRCUNSCRIPCION INDIGENA',
];

function abreviarPartido(nombre) {
  if (!nombre) return 'Sin partido';
  const canonical = (typeof normalizePartido === 'function') ? normalizePartido(nombre) : nombre;
  return ABREV_PARTIDO[canonical] || canonical;
}

function abreviarCandidato(nombre) {
  if (!nombre) return '—';
  const partes = nombre.trim().split(' ');
  if (partes.length <= 2) return nombre;
  return partes[0] + ' ' + partes[1] + (partes[2] ? ', ' + partes[2][0] + '.' : '');
}

const LABELS_CORPORACION = {
    alcalde:        'Alcaldía',
    asamblea:       'Asamblea Departamental',
    concejo:        'Concejo Municipal',
    gobernador:     'Gobernación',
    jal:            'JAL',
    camara:         'Cámara de Representantes',
    senado:         'Senado',
    presidencia_1v: 'Presidencia 1ª Vuelta',
    presidencia_2v: 'Presidencia 2ª Vuelta',
    plebiscito:     'Plebiscito 2016',
    consultas:      'Consultas'
};

// ==================== CARGA DIFERIDA DE LIBRERÍAS PESADAS ====================
// Chart.js (~200KB) y html2canvas (~195KB) solo hacen falta si el usuario
// abre una gráfica o exporta un mapa -- no en la carga inicial (Vista Mapa
// no las usa). Se cargan bajo demanda, una sola vez, la primera vez que se
// necesitan.
const _obsScriptsCargados = {};
function cargarScriptSiNecesario(url, yaCargado) {
    if (yaCargado()) return Promise.resolve();
    if (_obsScriptsCargados[url]) return _obsScriptsCargados[url];
    _obsScriptsCargados[url] = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = () => { delete _obsScriptsCargados[url]; reject(new Error(`No se pudo cargar ${url}`)); };
        document.head.appendChild(script);
    });
    return _obsScriptsCargados[url];
}

// ==================== GLOBALES ====================
let mapSimple;
let currentLayerSimple;
let currentPartidoData = null;
let currentCandidatoData = null;
let currentGeojson = null;
let currentGeojsonProvincias = null;
let currentLayerProvincias;
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

// Para Vista Actor
let mapActor;
let currentLayerActor;

// Para Vista Competitividad
let mapCompetitividad;
let currentLayerCompetitividad;

// Para Vista Comparar
let mapComparar;
let currentLayerComparar;
let comparaModoMapaActual = 'cambios'; // 'cambios' | 'enpA' | 'enpB'
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
let candidatoGanadorFiltro = null; // candidato específico resaltado dentro de "Candidato por Partido"

// Modo "Cabeza a cabeza": ganador entre un conjunto acotado de
// candidatos o listas elegidos por el usuario, ignorando al resto.
let cabezaAModoLista = false; // false = candidatos individuales, true = listas/partidos
let cabezaAElegidos = [];     // nombres elegidos (hasta 4), en orden de selección
const PALETA_CABEZA_A_CABEZA = ['#D62839', '#1D7874', '#F2A541', '#4C3BCF'];

let trajectoryMunicipioChart = null;
let actorTimelineChart = null;
let todosLosCandidatosPorAnioCorp = {};
let todosLosPartidosPorAnioCorp   = {};
let comparaCandidatosPorAnioCorp  = {}; // caché del loader de Vista Comparar (js/data.js)
let comparacionActual = null; // último resultado calculado en Vista Comparar (para el mapa/tabla de Etapa 3)

// Colores candidatos (poblado en data.js)
const coloresCandidatos = {};
let candidatoPartidoMap = new Map(); // nombre normalizado -> partido
