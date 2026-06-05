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
    2026: ['camara', 'senado', 'consultas']
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
  'Partido PIN':                   'PIN',
  'Sí':                            'Sí',
  'No':                            'No',
  'Partido sin identificar':       'Sin identificar',
};

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

// Colores candidatos (poblado en data.js)
const coloresCandidatos = {};
let candidatoPartidoMap = new Map(); // nombre normalizado -> partido
