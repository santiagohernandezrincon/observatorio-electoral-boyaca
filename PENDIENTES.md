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

**Quedaron 15 al cierre de esa sesión. Actualización 2026-07-07:**

- **Topagá (alcaldía 2011, `"20110064"`) — RESUELTO.** No era dato
  corrupto ni columnas cruzadas (verificado contra el crudo: código de
  partido y código de lista están cada uno en su propia columna
  correctamente). Era un código de aval/coalición local de 2011 sin
  mapear, mismo patrón que otros ya resueltos (`'20100007':
  'Movimiento Ciudadano'`). Identidad confirmada vía fuente pública
  (El Tiempo, separata elecciones 2011): José Oswaldo Castro Tejedor
  ganó con la "Coalición Para La Alcaldía de Tópaga". Aplicado como
  edición directa a los 2 CSV de 2011 alcaldía (no vía pipeline —
  ver sección de drift del pipeline más abajo) + entrada en
  `NOMBRES_PARTIDO`/`COLORES_PARTIDO`.

- **"Partido sin identificar" — la nota de "7 correctos, no son bugs"
  estaba mal para 4 de los 5 casos.** Auditoría 2026-07-07: Cómbita
  (`20110062`), Oicatá (`20110050`), Tota (`20110074`) y Villa de Leyva
  (`20110178`) — los 4 alcaldes ganadores de 2011 — tienen el MISMO
  tipo de código de aval local sin mapear que Tópaga, simplemente
  enmascarado bajo la etiqueta genérica "Partido sin identificar" en
  el archivo de Lista (el de Candidato sí conserva el código crudo).
  Investigado vía búsqueda web: Cómbita y Tota confirmados como
  candidaturas independientes por "Firmas"; Oicatá confirmado como
  "Coalición" sin nombre propio encontrado; Villa de Leyva sin fuente
  que confirme el movimiento. **No se aplicó fix con estos hallazgos**
  porque los 4 YA tienen resolución en `CANDIDATOS_PARTIDO` de una
  sesión anterior (Cómbita/Tota/Villa de Leyva → "Movimiento
  Ciudadano", Oicatá → "Partido Conservador Colombiano") que no
  coincide con la investigación nueva — se prioriza el trabajo previo
  de Santiago. Debería resolverse solo cuando el pipeline de Python se
  arregle (ver abajo) y el archivo de Lista de 2011 se pueda
  regenerar con texto crudo consistente con el de Candidato; el parche
  de `CANDIDATOS_PARTIDO`→Lista (ver sección de ese gap) no los
  alcanza hoy porque el texto crudo entre ambos archivos ya no coincide
  para estos 4 casos específicos.
  Solo `"INDEPENDIENTES"` (2, Concejo Nuevo Colón 2023) sigue siendo
  el caso genuinamente correcto de la nota original.

- **5 eslóganes/movimientos hiperlocales — RESUELTOS 2026-07-07** con
  criterio de Santiago, vía `palabrasClave` (`js/data.js`):
  - `DE CORAZÓN POR VENTAQUEMADA` → **MAIS**
  - `GAMEZA UN PUEBLO QUE NOS UNE` → **Alianza Verde**
  - `SABEMOS HACERLO BIEN POR SAN JOSE DE PARE` → **Partido Liberal
    Colombiano**
  - `RENOVACIÓN CIUDADANA` → movimiento propio (bucket nuevo, color
    `#6F4E37`)
  - `PODEMOS` → movimiento propio (bucket nuevo, color `#9575CD`) —
    el caso gemelo en Alcaldía 2023 de Santa Rosa de Viterbo (candidato
    que no ganó) se resolvió solo, confirmando que era el mismo
    movimiento.

  **Fix adicional encontrado al verificar:** `CANDIDATOS_PARTIDO` ya
  tenía `'2023_alcalde_GERARDO RINCON CAMACHO': 'Partido Conservador
  Colombiano'` de una sesión anterior, que ganaba sobre el nuevo mapeo
  de Gámeza (vía el parche del gap Lista/Candidato, ver sección
  siguiente) y producía un resultado incorrecto. Confirmado con
  Santiago: Gerardo Rincón es Alianza Verde en 2023 — corregido. El
  homónimo `'2015_alcalde_GERARDO RINCON CAMACHO'` es una persona
  distinta (Busbanzá, no Gámeza; coincide con el dato crudo) — se dejó
  intacto.

  Verificado en vivo: los 3 casos de alcaldía coinciden entre "Ganador
  (candidato)" y "Lista ganadora"; Guayatá/Santa Rosa (Concejo) pintan
  correctamente en modo Candidato (no ganan en Lista, como se
  documentó); los 2 colores nuevos se confirmaron visualmente
  distintos entre sí y contra el resto de la paleta.

  **Con esto se cierra el backlog completo de datos** (Topagá, gap
  Lista/Candidato, y estos 5 eslóganes) — excluyendo el drift de
  pipeline (sin resolver, ver sección siguiente) y presidencial 2026
  (fuera de alcance hasta que se publique/procese).

## Gap arquitectónico: `CANDIDATOS_PARTIDO` no se propaga al modo "Lista ganadora" — RESUELTO 2026-07-07

**El problema (histórico):** `CANDIDATOS_PARTIDO` (correcciones
manuales de Santiago, clave scoped `año_cargo_nombre`) solo se
consultaba desde `resolverPartido()` cuando se le pasaba el nombre del
candidato. El modo "Ganador (candidato)" lo hacía y respetaba el
override; "Lista ganadora" coloreaba usando el agregado por partido
(`votos_partido_municipio_*.csv`), que llamaba a `resolverPartido(...,
null, ...)` porque ese archivo no tiene contexto de candidato, así que
el override nunca se ejecutaba ahí.

**Casos conocidos (ya corregidos):** Alcaldía 2023 (5 de 123
municipios) y Gobernación 2023 (3 de 123). Caso de referencia: Ezequiel
Jiménez Cely (Paz de Río, alcaldía 2023) — `CANDIDATOS_PARTIDO['2023_
alcalde_EZEQUIEL JIMENEZ CELY'] = 'En Marcha'`, pero "Lista ganadora"
mostraba "Pacto Histórico" (resolución automática del texto crudo
`"AGRUPACIÓN POLÍTICA EN MARCHA"`).

**Fix aplicado (parche quirúrgico, NO reconstrucción):** en
`cargarDatos()` (js/data.js), tras cargar `currentPartidoData` y
`currentCandidatoData`, para cada candidato con override se busca en
su mismo municipio la fila de `currentPartidoData` con el mismo texto
crudo original (`_partidoRaw`, agregado a ambos datasets para este
fix) y se renombra al partido correcto. Solo aplica a cargos
uninominales (alcalde/gobernador/presidencia), donde un partido = un
candidato por municipio, así que el match por texto crudo es
inequívoco. No toca `TOTAL_VOTOS`/`PORCENTAJE` (vienen del CSV
pre-agregado sin recalcular). Se descartó la reconstrucción completa
desde `currentCandidatoData` que se había propuesto originalmente:
ese archivo filtra las filas de "plancha" (`CANNOMBRE === PARNOMBRE`),
así que reconstruir desde ahí habría subcontado votos en cualquier
elección con voto de lista.

**Verificado en vivo (2026-07-07):** Ezequiel Jiménez Cely muestra "En
Marcha" en ambos modos. Barrido completo de los 123 municipios de
Alcaldía y Gobernación 2023: **cero divergencias** entre modos (antes:
5 + 3). `TOTAL_VOTOS`/`PORCENTAJE` verificados sin cambios.

**Límite conocido:** los 4 casos de "Partido sin identificar" en
alcaldía 2011 (Cómbita/Tota/Oicatá/Villa de Leyva — ver sección
anterior) YA tienen override en `CANDIDATOS_PARTIDO` pero este parche
no los resuelve: su archivo de Lista tiene el texto ya colapsado a la
etiqueta genérica por un pase histórico de `normalizar_partidos.py`,
mientras el de Candidato conserva el código crudo — no hay texto en
común para matchear. Ver sección de drift del pipeline, abajo.

**Vista Comparar:** no se ve afectada — ya evitaba este gap
estructuralmente (usa `candidatoGanadorPorMunicipio` para Alcaldía/
Gobernación/Presidencia en vez del agregado de partido), y
`CANDIDATOS_PARTIDO` no tiene entradas para Cámara/Senado/Asamblea/
Concejo, así que no había corrección que perder ahí. Confirmado sin
excepciones tras el fix.

## Drift entre pipelines de datos: `procesar_raw.py` vs. `normalizar_partidos.py` — pendiente, no resuelto (encontrado 2026-07-07)

**El problema:** hay dos scripts Python que tocan los mismos archivos
de salida, parcialmente solapados y no sincronizados:

- `scripts/procesar_raw.py`: pipeline "principal", procesa TODOS los
  crudos (`data/raw/*.dta.csv` + formatos nuevos) y genera tanto
  `votos_candidato_municipio_*.csv` como `votos_partido_municipio_*.csv`.
  Usa su propio diccionario `NOMBRES_PARTIDO` (más simple) para
  códigos numéricos sin resolver.
- `scripts/normalizar_partidos.py`: un **segundo paso**, que corre
  **solo sobre `data/votos_partido_*.csv`** (nunca toca los de
  candidato), con un diccionario `NORMALIZACION`/`CANDIDATOS_MAP` más
  completo. Al final, **regenera `js/colores_partido.js` desde cero**,
  sobrescribiéndolo con solo el diccionario de colores — **destruiría**
  `NORMALIZAR_PARTIDO`, `normalizePartido()`, `colorPartido()` y toda
  la lógica de `palabrasClave` que existen hoy en ese archivo si se
  corriera tal cual.

**Evidencia concreta:** corrí `procesar_raw.py` completo (2026-07-07)
para agregar 4 códigos de 2011 a `NOMBRES_PARTIDO`. Resultado: **41
archivos cambiaron**, no solo los de 2011 — y varios cambios son
**misatribución real de partido** para el mismo candidato/mismos votos
(ej. `ALMEIDA;Carlos Alberto Acevedo Velasquez` pasó de "Centro
Democrático" a "Partido Liberal Colombiano"; `MONGUA;Reyes Bernardo
Perez Alvarez` de "Cambio Radical" a "Partido de la U"). Esto prueba
que **los datos commiteados hoy no fueron generados por la versión
actual de `procesar_raw.py`** — el commit `49aff40` ("Fix final...")
cambió `procesar_raw.py` en solo 2 líneas pero los datos cambiaron en
miles, lo que indica que la regeneración real de ese momento vino de
`normalizar_partidos.py` (o de ediciones manuales directas a los CSV)
que nunca se replicaron de vuelta en `procesar_raw.py`.

**Impacto práctico:** hoy no es seguro correr ninguno de los dos
scripts de punta a punta para regenerar datos — `procesar_raw.py` solo
produce resultados desactualizados/con misatribución, y
`normalizar_partidos.py` rompería `js/colores_partido.js`. Cualquier
fix de datos que requiera tocar el CSV debe hacerse como edición
directa y quirúrgica al archivo afectado (como se hizo con Tópaga),
no vía pipeline, hasta que esto se resuelva.

**Para retomarlo:** decidir cuál de los dos scripts es la fuente de
verdad (o fusionar ambos en uno solo), y hacer que
`js/colores_partido.js` deje de regenerarse automáticamente (o que su
generador incluya todo lo que hoy existe a mano: `NORMALIZAR_PARTIDO`,
`normalizePartido()`, `colorPartido()`, soporte de `palabrasClave`).
Sin esto, cualquier necesidad futura de reprocesar datos desde crudo
(ej. si aparece un error en un año ya publicado) es de alto riesgo.

**Nota (procesamiento presidencial 2026, sesión julio 2026):** el
formato "columnas abreviadas" (`procesar_sql_abrev()`/
`_procesar_generico_mesa()`, usado por Cámara/Senado/Presidencia 2026)
**no tiene el drift descrito arriba** — el nombre de partido ya viene
como texto en el crudo, sin diccionario de códigos numéricos de por
medio, así que reprocesar esos archivos específicamente sí reproduce
lo commiteado. El problema es exclusivo del formato "viejo" CEDAE
(`procesar_dta()`, años 2010-2018) y su `partido_map` frágil. Aun así,
`_procesar_generico_mesa()` tiene el separador hardcodeado a `,`
(rompe con archivos `;`, como los de presidencia 2026) y `CARGO_MAP`
no reconoce `presidencia_1v`/`presidencia_2v` como `cargo_raw` (solo
`presidencia_primera_vuelta`/`presidencia_segunda_vuelta`) — por eso
se procesó con un script aparte (`scripts/procesar_presidencia_2026.py`)
en vez de con `procesar_raw.py` directamente.

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
- **Presidencial 2026** (primera y segunda vuelta) — **procesada y
  publicada** (sesión julio 2026). Candidatos verificados: 2ª vuelta
  Iván Cepeda Castro vs. Abelardo De La Espriella; 1ª vuelta incluye
  además a Sergio Fajardo, Claudia López, Paloma Valencia, Miguel
  Uribe, entre otros. El par 2022→2026 ya está disponible en Vista
  Comparar (verificado en vivo, sin errores) para ambas vueltas. Se
  mapearon a color 8 coaliciones nuevas sin equivalente previo,
  incluida la ganadora ("Defensores de la Patria", Abelardo De La
  Espriella) — ver detalle de procesamiento arriba, en la nota del
  drift de pipelines.
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
- **Archivos legacy de la raíz** (`data.js`, `script.js`, `charts.js`,
  `ui.js`, `map.js`) — eliminados (sesión julio 2026), confirmado que
  no los cargaba `index.html`.
