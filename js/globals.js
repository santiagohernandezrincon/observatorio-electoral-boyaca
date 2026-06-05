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
