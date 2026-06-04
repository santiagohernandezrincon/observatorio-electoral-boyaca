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
