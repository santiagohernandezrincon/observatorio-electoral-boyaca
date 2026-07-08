// Alias de IDENTIDAD para Vista Actor -- no confundir con CANDIDATOS_PARTIDO
// (candidatos_partido.js), que resuelve partido, no persona.
//
// Une variantes de nombre (forma corta/mediática vs. nombre legal completo)
// de la MISMA persona, confirmadas una por una por Santiago tras revisar
// revision_nombres_duplicados.csv (171 pares candidatos, generados por
// similaridad de string) -- ninguna fusión aquí es automática.
//
// Clave: forma corta normalizada (mayúsculas, sin tildes, espacios
// colapsados -- exactamente el formato que produce normalizarNombre()).
// Valor: nombre completo/canónico tal como aparece en el CSV o fuente
// pública, en Title Case para mostrar.
//
// Uso: js/data.js (construirIndiceActor) y js/ui.js (seleccionarCandidatoActor)
// vía claveIdentidad(nombre).
const ALIAS_IDENTIDAD = {
  'ALCIBIADES TORRES ORTIZ': 'Alcibiades De Jesus Torres Ortiz',
  'ALEXANDRA NINO': 'Nury Alexandra Nino Buitrago',
  'ANDRES CORREDOR PARRA': 'Camilo Andres Corredor Parra',
  'ANDRES MESA SANCHEZ': 'Jonathan Andres Mesa Sanchez',
  'ARLEY CARDENAS': 'Yohan Arley Cardenas Sanabria',
  'ATI QUIGUA': 'Ati Seygundiba Quigua Izquierdo',
  'CARLOS SANCHEZ REYES': 'Carlos Alfredo Sanchez Reyes',
  'EDUARDO SALAMANCA': 'Mauricio Eduardo Salamanca Aponte',
  'ELIECER SANCHEZ': 'Jorge Eliecer Sanchez Bautista',
  'ESPIRITU BARRERA': 'Espiritu Espiritu Barrera',
  'EUCLIDES VALEST SILVA': 'Euclides Valest Valest Silva',
  'FERNANDO GARCIA CACERES': 'Luis Fernando Garcia Caceres',
  'FLOR ANGELA GONZALEZ': 'Flor Angela Gonzalez Munevar',
  'FRANCISCO EDUARDO CORDOBA': 'Francisco Eduardo Cordoba Cordoba',
  'GUSTAVO PETRO': 'Gustavo Francisco Petro Urrego',
  'JOHN MILTON RODRIGUEZ': 'John Milton Rodriguez Gonzalez',
  'LUIS HERNANDEZ AVILA': 'Luis Alfredo Hernandez Avila',
  'LUIS MARTINEZ PIRABAN': 'Luis Alfredo Martinez Piraban',
  'LUIS PEREZ CURTIDOR': 'Luis Alfredo Perez Curtidor',
  'MARIA NILCE LOPEZ': 'Maria Nilce Nilce Lopez',
  'MAURICIO PEDRAZA CHAPARRO': 'Mauricio Alexander Pedraza Chaparro',
  'MOISES ZORRO CAMARGO': 'Moises Alfredo Zorro Camargo',
  'OMAR CUADRADO CUBIDES': 'Omar Alfredo Cuadrado Cubides',
  'PALOMA VALENCIA LASERNA': 'Paloma Susana Valencia Laserna',
  'SANDRA MILENA GUERRERO': 'Sandra Milena Guerrero Ramos',
  'SANTANA MALAGON GAMBA': 'Santana Malagon De Gamba',
  'SERGIO FAJARDO': 'Sergio Fajardo Valderrama',
  'SILVESTRE MORENO': 'Jose Silvestre Moreno Ortega',
  'WILMER ALFONSO PEREZ': 'Wilmer Alfonso Perez Gamba',
  'WILSON REINEL REGALADO': 'Wilson Reinel Reinel Regalado',
  'YADIRA GONZALEZ': 'Zulma Yadira Gonzalez Bernal',
  'YANETH SISA CASTRO': 'Nancy Yaneth Sisa Castro',
  'YESID MAHECHA MAHECHA': 'Cristian Yesid Mahecha Castañeda',
  'YOHANA CASTANEDA': 'Elsy Yohana Castañeda Buitrago',

  // Caso original que originó esta ronda de revisión -- no estaba en el CSV
  // de 171 pares (quedó en el bucket "ambiguo" de la heurística porque hay
  // más de un candidato con tokens CLAUDIA+LOPEZ en el dataset, así que no
  // calificó como match único -- ver PENDIENTES.md). Agregado directo por
  // pedido explícito de Santiago.
  'CLAUDIA LOPEZ': 'Claudia Nayibe Lopez Hernandez',
};

// Resuelve la clave de identidad de un CANNOMBRE crudo: si es un alias
// conocido (forma corta), devuelve la clave normalizada de su forma
// canónica/larga; si no, devuelve su propia clave normalizada.
function claveIdentidad(nombre) {
  const base = normalizarNombre(nombre);
  const alias = ALIAS_IDENTIDAD[base];
  return alias ? normalizarNombre(alias) : base;
}
