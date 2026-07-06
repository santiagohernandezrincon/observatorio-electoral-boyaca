# Pendientes — Observatorio Electoral de Boyacá

Notas de continuidad entre sesiones. Cada entrada indica qué falta,
por qué no se hizo en el momento en que se encontró, y qué se necesita
para retomarla.

## Colores sin resolver: auditoría julio 2026 (Sesión 4, Tarea 1)

El pendiente viejo de "~5 municipios sin colorear en alcaldías" estaba
desactualizado (era de antes de la crisis de integridad de datos y el
reemplazo de 24 CSV). Auditoría real contra los 39 combos año/cargo
(modo Lista y Candidato) el 2026-07: **65 casos gris**, no 5.

**Arreglado esta sesión (65 → 15), 3 commits:**
1. `normalizePartido()` no ignoraba tildes en el match directo (solo en
   el fallback de `palabrasClave`) — un nombre YA canónico con una
   tilde de más/menos (ej. "Polo Democrático Alternativo") caía al
   fallback y volvía sin color. Se notaba doble porque `colorPartido()`
   vuelve a llamar `normalizePartido()` sobre un nombre ya resuelto.
   -36 casos.
2. Alias faltante `'PARTIDO COLOMBIA RENACIENTE'` → `'Colombia
   Renaciente'`, y typo en override manual (`'Dignidad y Comp.'` →
   `'Dignidad y Compromiso'`, Giovanni Vela Bernal, Turmequé 2023).
   -5 casos.
3. `parseCSV()`/`parseCandidatosCSV()` no manejaban comillas CSV
   escapadas — un PARNOMBRE como `"MOVIMIENTO ALTERNATIVO INDÍGENA Y
   SOCIAL ""MAIS"""` nunca hacía match con el alias limpio que ya
   existía, y le quitaba votos reales a MAIS en 9 municipios de
   Concejo 2023 (no solo dejaba gris — **misatribución real de
   votos**). Nuevo `parseLineaCSV()` respeta comillas. -9 casos.

**Quedan 15, sin tocar (decisión explícita: dejarlos pendientes esta
sesión, ver conversación 2026-07-06):**

- **7 correctos tal cual, no son bugs:** `"Partido sin identificar"`
  (5, Alcaldía 2011 — así viene en el CSV crudo, no hay partido real
  que resolver) e `"INDEPENDIENTES"` (2, Concejo Nuevo Colón 2023 —
  candidatos genuinamente sin partido).
- **1 dato crudo corrupto:** Topagá, alcaldía 2011, candidato Jose
  Oswaldo Castro Tejedor tiene literalmente `"20110064"` en la columna
  de partido (parece un código de lista filtrado al campo equivocado
  en el CSV original). Necesita cotejarse contra la Registraduría si
  se quiere corregir. Bajo impacto (1 municipio, 1 año, 1282 votos).
- **5 eslóganes/movimientos hiperlocales sin mapear (7 casos) —
  necesitan que Santiago diga a qué partido corresponde cada uno, o
  investigación contra fuentes públicas (Registraduría/prensa local):**
  - `DE CORAZÓN POR VENTAQUEMADA` — alcaldía 2023, **ganó** (4673 votos)
  - `SABEMOS HACERLO BIEN POR SAN JOSE DE PARE` — alcaldía 2019, **ganó**
  - `GAMEZA UN PUEBLO QUE NOS UNE` — alcaldía 2023
  - `RENOVACIÓN CIUDADANA` — Concejo Guayatá 2023 (candidato William
    Alfonso Cardozo)
  - `PODEMOS` — Concejo Santa Rosa de Viterbo 2023 (candidato Diego
    Esteban Guio Rodríguez)

**Para retomarlo:** una vez Santiago confirme el partido de cada uno
(o se investigue), son ediciones directas a `palabrasClave`/
`NORMALIZAR_PARTIDO` en `js/colores_partido.js` — mismo patrón que los
"esloganes hiperlocales" de sesiones anteriores. El caso de Topagá
2011 es aparte (dato crudo, no normalización) y de menor prioridad.

## Gap arquitectónico: `CANDIDATOS_PARTIDO` no se propaga al modo "Lista ganadora"

**Encontrado:** sesión de conexión del modo Lista/Partido (después del
cierre del backlog de integridad de datos, ~1.700 → 0 casos).

**El problema:** `CANDIDATOS_PARTIDO` (correcciones manuales de
Santiago, clave scoped `año_cargo_nombre`) solo se consulta desde
`resolverPartido()`, que requiere el nombre del candidato como
argumento. El modo "Ganador (candidato)" pasa ese nombre y sí lo
respeta. El modo "Lista ganadora" colorea usando el agregado por
partido (`votos_partido_municipio_*.csv`, cargado en
`currentPartidoData`), que se construye llamando a
`resolverPartido(row['PARNOMBRE'], null, anio, corporacion)` — con
`nombreCandidato = null` a propósito, porque ese archivo no tiene
contexto de candidato. Como la rama que consulta `CANDIDATOS_PARTIDO`
requiere `nombreCandidato` truthy, nunca se ejecuta ahí, y el partido
se resuelve solo vía `normalizePartido()` (alias automáticos +
`palabrasClave`), sin tu corrección manual.

**Casos conocidos de divergencia real (no error de datos):**
- Alcaldía 2023: 5 de 123 municipios difieren entre los dos modos.
- Gobernación 2023: 3 de 123 municipios difieren.
- Caso de referencia: **Ezequiel Jiménez Cely (Paz de Río, alcaldía
  2023)**. `CANDIDATOS_PARTIDO['2023_alcalde_EZEQUIEL JIMENEZ CELY']
  = 'En Marcha'` (tu corrección manual). El texto crudo de su
  candidatura es `"AGRUPACIÓN POLÍTICA EN MARCHA"`, que
  `normalizePartido()` resuelve de forma automática a `'Pacto
  Histórico'` — sin pasar por tu override, porque el agregado de lista
  no tiene forma de saber a qué candidato pertenece esa fila.

**Por qué no se corrigió en el momento:** arreglar esto requiere que
el agregado por partido sea consciente del candidato — por ejemplo,
resolver cada fila del CSV de candidatos primero (con
`resolverPartido()` completo, incluyendo `CANDIDATOS_PARTIDO`) y
*después* sumar por partido resuelto, en vez de resolver directamente
sobre el archivo ya agregado por partido. Es un cambio de arquitectura
en `cargarDatos()` (js/data.js), no un fix puntual — se dejó pendiente
a propósito para no mezclarlo con la conexión del pill.

**Para retomarlo:** decidir si conviene reconstruir
`currentPartidoData` a partir de `currentCandidatoData` ya resuelto
(agrupando por `_partidoNorm` en vez de leer `votos_partido_*.csv`
directamente), lo cual haría que el modo Lista herede automáticamente
cualquier corrección de `CANDIDATOS_PARTIDO`. Verificar que esto no
rompa el cálculo de `TOTAL_VOTOS`/`PORCENTAJE` que hoy vive en el CSV
pre-agregado.

**Nota (Vista Comparar, sesión julio 2026):** este gap sigue sin
resolverse en la Vista Mapa principal, pero Vista Comparar lo evita
estructuralmente en vez de heredarlo — usa `candidatoGanadorPorMunicipio`
(vía `cargarCandidatosPorAnioCorp()` en `js/data.js`) para Alcaldía/
Gobernación/Presidencia en lugar del agregado de partido, precisamente
porque `CANDIDATOS_PARTIDO` solo tiene overrides para esos cargos.
Verificado en vivo con el caso de referencia (Ezequiel Jiménez Cely,
Paz de Río): Comparar resuelve "En Marcha" correctamente. Cámara/
Senado/Asamblea/Concejo sí usan el agregado de partido en Comparar,
pero ahí `CANDIDATOS_PARTIDO` no tiene ninguna entrada, así que no hay
corrección que perder.

## Otros pendientes conocidos (de sesiones anteriores, sin resolver)

- **JAL y consultas** — corregido (sesión julio 2026): los CSV de
  2019/2023 (JAL) y 2026 (consultas) **ya existen y están procesados**
  con datos reales (`data/votos_partido_municipio_2019_jal.csv`, etc.);
  la nota anterior de "sin procesar" estaba desactualizada. Se dejan
  fuera de Vista Comparar por bajo volumen, no por falta de
  procesamiento: JAL solo cubre 1-2 municipios de Boyacá (17 y 13 filas
  totales en 2019 y 2023 respectivamente, nada representativo a escala
  departamental) y consultas es un tipo de contienda distinto (interna
  de coalición, sin ciclo previo/posterior comparable).
- **Presidencial 2026** (primera y segunda vuelta) — Santiago va a
  bajar los CSV manualmente de la Registraduría cuando estén
  disponibles. Cuando esto pase, el par 2022→2026 de Presidencia
  aparecerá automáticamente en Vista Comparar sin tocar código (los
  pares se generan dinámicamente desde `DATOS_DISPONIBLES`).
- **Vista Comparar / Sesión 3 — completa** (sesión julio 2026).
  Selector de cargo + año A/B (26 pares válidos, generados
  dinámicamente), regla fija Candidato/Lista por cargo (ver nota en la
  sección del gap de `CANDIDATOS_PARTIDO` arriba), mapa "cambió/no
  cambió" con modo ENP opcional (Laakso-Taagepera, rampa navy
  secuencial), tabla ordenable de cambios y márgenes, KPIs (% cambio,
  ENP A/B) con nota contextual para alta rotación en Alcaldía/
  Gobernación. Verificado en vivo con 3 pares (Cámara 2022→2026,
  Alcaldía 2019→2023, Asamblea 2019→2023), sin errores de consola, sin
  romper la Vista Mapa principal.
- **`asignarColorPartido()` / lógica huérfana en los archivos legacy
  de la raíz** (`data.js`, `script.js`, `charts.js`, `ui.js`, `map.js`)
  — no se cargan desde `index.html`, decisión pendiente de si
  eliminarlos del repo.
