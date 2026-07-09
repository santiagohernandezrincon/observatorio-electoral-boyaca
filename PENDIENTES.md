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
  que confirme el movimiento.

  **Cómbita/Tota/Oicatá — RESUELTOS 2026-07-07 (segunda pasada).** El
  primer intento no se aplicó porque ya existía un override distinto
  en `CANDIDATOS_PARTIDO` de una sesión anterior. Confirmado con
  Santiago: usar la investigación nueva. Actualizado en las 3 capas
  (`NOMBRES_PARTIDO`, `CANDIDATOS_PARTIDO`, los 2 CSV de 2011 alcaldía)
  para que Lista y Candidato queden consistentes — Cómbita/Tota →
  "Independiente" (`#9E9E9E`), Oicatá → "Coalición" (`#A4ADBA`).
  Verificado en vivo, sin excepciones.

  **Villa de Leyva sigue sin tocar** — sin fuente que confirme el
  movimiento, decisión explícita. Es hoy el único caso de "Partido sin
  identificar" restante en el dataset.
  Solo `"INDEPENDIENTES"` (2, Concejo Nuevo Colón 2023) sigue siendo
  el caso genuinamente correcto de la nota original.

- **Divergencia Lista/Candidato en Alcaldía 2011 — RESUELTO/EXPLICADO
  2026-07-08 (cierre final).** Barrido completo de Alcaldía 2011 había
  encontrado 11 municipios con partido distinto entre "Lista ganadora"
  y "Ganador (candidato)". Villa de Leyva ya estaba explicado (código
  de aval sin fuente, ver arriba). Los otros 10 se diagnosticaron
  verificando los votos crudos de ambos archivos:

  - **3 eran solo alias, ya resueltos en código, sin necesidad de
    cambio:** Chinavita, Santana y Sutamarchán — sus candidatos ganan
    con "Partido ASI" (texto del archivo de candidato) y el mismo
    número exacto de votos aparece en el archivo de partido como
    "Alianza Social Independiente". `js/colores_partido.js` ya tiene el
    alias `'Partido ASI': 'Alianza Social Independiente'`, confirmado
    en vivo que `normalizePartido()` converge ambos textos al mismo
    nombre — no es una divergencia real, es un artefacto de comparar
    el texto crudo de los dos CSV sin pasar por la normalización de la
    app.

  - **7 son comportamiento electoral real de 2011, no un bug — NO
    requieren fix de código:** Aquitania, Beteitiva, Paz de Río,
    Sáchica, San Eduardo, Santa Rosa de Viterbo y Turmequé. En 2011
    varios municipios de Boyacá permitieron **más de un candidato a la
    alcaldía inscrito por el mismo partido** (no era obligatorio un
    solo aval por partido todavía). "Lista ganadora" suma correctamente
    los votos de *todos* los candidatos de un partido en el municipio;
    "Ganador (candidato)" es el candidato individual más votado, quien
    es quien realmente asumió la alcaldía. Cuando un partido reparte su
    votación entre 2 candidatos, la suma del partido puede superar al
    ganador real aunque ese partido no haya ganado la alcaldía — **los
    dos números son correctos, responden preguntas distintas** ("qué
    partido sumó más votos" vs. "quién ganó realmente"). Ejemplo
    verificado: Aquitania — Carlos Ernesto Torres Aguirre (Alianza
    Verde) gana con 3.941 votos individuales; el Partido Conservador
    Colombiano inscribió 2 candidatos que sumados dan 4.571, más que
    cualquier candidato individual, pero ninguno de los dos ganó la
    alcaldía. Mismo patrón exacto en los otros 6 (siempre un partido
    con 2 candidatos registrados en el mismo municipio cuya suma supera
    al ganador individual de otro partido). Corroborado con una fuente
    independiente: `js/candidatos_partido.js` (generado aparte, desde
    plantillas de candidatos, no desde estos CSV de votos) coincide con
    "Ganador (candidato)" en los 7 casos.

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

## Drift entre pipelines de datos: `procesar_raw.py` vs. `normalizar_partidos.py` — CERRADO 2026-07-08

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

**Cierre 2026-07-08 — consolidación aplicada, sin lograr reproducción
byte-exacta, decisión de política adoptada:**

Se consolidó en `procesar_raw.py` (único de los 3 scripts activamente
mantenido) la lógica de los otros dos, acotada al único formato que
realmente tiene el drift (CEDAE viejo, `procesar_dta()`, 2010-2018):

- `NORMALIZAR_PARTIDO_TEXTO`: fusión de los diccionarios `NORMALIZACION`
  de `normalizar_partidos.py` (191 alias) y `reconstruir_partido.py` (88
  alias, 24 exclusivos no cubiertos por el otro) en una sola tabla
  (211 entradas).
- `CANDIDATOS_MAP`: traído tal cual de `reconstruir_partido.py` (127
  entradas, reasignación por candidato+año), con 2 correcciones
  aplicadas también en `candidatos_partido.js` (ver hallazgo Pachón/
  Pinzón más abajo).
- **Deliberadamente NO se aplicó a los formatos 2019-2023/2026** (ver
  nota ya existente más abajo sobre por qué esos formatos no tienen el
  drift): se intentó primero aplicarlo ahí también y rompió 24 archivos
  que antes reproducían la data commiteada exacta, porque esos formatos
  guardan el PARNOMBRE crudo a propósito y dejan toda la normalización
  a `normalizePartido()` en JS. Revertido.
- **Tampoco se aplicó la regeneración de `js/colores_partido.js`** que
  hacía `normalizar_partidos.py` — sigue siendo mantenido a mano en JS.

**Verificación (reprocesamiento completo desde crudo, sin tocar
`data/` — corrido en un directorio scratch y comparado archivo por
archivo contra producción):**

| Versión | Archivos que difieren de los 70 committeados |
|---|---|
| `procesar_raw.py` original (sin consolidar) | 41 |
| Consolidado (acotado a CEDAE 2010-2018) | **37** — mejora neta, 0 regresiones nuevas, 4 archivos que antes fallaban ahora coinciden, y el tamaño del diff bajó drásticamente en el resto (ej. candidato Concejo 2011: 11.384→864 líneas) |

**No se logró reproducción byte-exacta de 2010-2018**, y se decidió
NO perseguirla más allá de este punto. Causas raíz identificadas para
los 37 archivos que aún difieren:
1. El archivo de candidato committeado nunca pasó por alias de texto
   (solo el de partido, porque `normalizar_partidos.py` históricamente
   solo tocaba `votos_partido_*.csv`) — asimetría real pero inofensiva,
   porque `normalizePartido()` en JS ya unifica ambos en tiempo de
   render (confirmado con el caso ASI de la sección anterior).
2. `reconstruir_partido.py` tenía un fallback "candidato sin año" (si
   no hay entrada exacta para ese año, usa la de cualquier otro año del
   mismo candidato) que sí quedó grabado en varios datos ya
   committeados, pero que se excluyó deliberadamente de la consolidación
   por riesgoso (puede confundir personas distintas con el mismo
   nombre en años distintos).
3. Correcciones manuales puntuales de sesiones antiguas (2010-2018)
   aplicadas directo al CSV en su momento y nunca capturadas de vuelta
   en ningún diccionario de ningún script.

**Decisión de política final:** el CSV es la fuente de verdad aceptada
para 2010-2018. Ningún script (ni el original ni el consolidado) debe
usarse para regenerar esos años desde cero — cualquier fix futuro que
toque un año ya publicado se hace como edición quirúrgica directa al
CSV (como Tópaga, Cómbita/Tota/Oicatá, y Soatá — ver más abajo), nunca
vía pipeline. El código consolidado en `procesar_raw.py` sí queda como
base para reprocesar años **nuevos** que usen el formato CEDAE viejo
(muy improbable ya que no habrá más elecciones con ese formato) o como
referencia de qué reglas de normalización existen.

`reconstruir_partido.py` y `normalizar_partidos.py` **no se eliminan**
— quedan en `scripts/` como referencia histórica de las reglas que
llevaron a la data actual, sin ningún uso activo en el flujo de hoy.

**Hallazgo aparte encontrado durante el diagnóstico, ya resuelto:**
diff entre `CANDIDATOS_MAP` (127 entradas) y `CANDIDATOS_PARTIDO`
(`candidatos_partido.js`, 503 entradas) encontró solo 2 contradicciones
reales de 503 comparadas (las otras 2 diferencias eran solo estilo de
etiqueta, "ASI" vs. "Alianza Social Independiente", mismo partido): Cesar
Augusto Pachón Achury (gobernación 2015) y José Giovany Pinzón Báez
(gobernación 2019) estaban como "Pacto Histórico" en
`candidatos_partido.js` pero como "MAIS" en `CANDIDATOS_MAP`. Verificado
con fuentes externas (La Silla Vacía, Boyacá 7 Días, Boyacá Radio):
ambos corrieron por MAIS en esos años (Pacto Histórico no existía como
marca antes de 2022; ambos se pasaron a esa coalición después, en años
distintos). Corregido en `candidatos_partido.js` → MAIS en ambas
entradas.

**Caso Soatá/Pinzón Báez (alcaldía 2011) — ejemplo resuelto de esta
ronda final.** El CSV de Alcaldía 2011 tenía a José Giovany Pinzón Báez
(Soatá) como MAIS, en contradicción directa con `candidatos_partido.js`
(que ya tenía "Partido de la U" correcto para esa misma clave
`2011_alcalde_JOSE GIOVANY PINZON BAEZ`). Confirmado con dos fuentes
externas independientes (informe MOE 2011, separata oficial de
resultados): era Partido de la U, no MAIS. Corregido con edición
quirúrgica directa a los 2 CSV de 2011 alcaldía (mismo patrón que
Tópaga/Cómbita/Tota/Oicatá) — sin pasar por ningún script. Verificado
en vivo: "Ganador (candidato)" y "Lista ganadora" coinciden en Soatá
2011, y `candidatos_partido.js` ya no está en contradicción con el CSV.

## Consultas 2026: PARNOMBRE crudo es el nombre de la consulta, no el aval real — parcialmente resuelto 2026-07-08

**El problema:** `votos_candidato_municipio_2026_consultas.csv` no tiene
raw en `data/raw/` (se armó a mano en marzo 2026, antes de todo el
trabajo de pipeline de esta sesión). Para las consultas
**multi-candidato** (varios precandidatos bajo un mismo mecanismo de
coalición), el PARNOMBRE crudo es el **nombre de la consulta**, no el
partido real de cada candidato: "LA GRAN CONSULTA POR COLOMBIA" (6
candidatos), "FRENTE POR LA VIDA" (4), "CONSULTA DE LAS SOLUCIONES..."
(2) — 12 candidatos en total. Las consultas de un solo candidato
(Peñalosa→Alianza Verde, Oviedo→Con Toda por Colombia, Dávila→Valientes)
ya mostraban el partido real directamente, sin problema.

**Resuelto (5 de 12), vía `CANDIDATOS_PARTIDO` (`js/candidatos_partido.js`),
mismo mecanismo que alcaldía/gobernador/presidencia:**
- Daniel Quintero Calle → AICO
- David Andrés Luna Sánchez → Movimiento Sí Hay un Camino
- Juan Manuel Galán Pachón → Nuevo Liberalismo
- Juan Carlos Pinzón Bueno → Partido Verde Oxígeno
- Aníbal Gaviria Correa → Unidos: La Fuerza de las Regiones (confirmado
  que es el exgobernador de Antioquia/exalcalde de Medellín, candidato
  por firmas — no homónimo)
- Paloma Susana Valencia Laserna → Centro Democrático

Se agregaron 2 colores nuevos (`Movimiento Sí Hay un Camino` `#8E24AA`,
`Unidos: La Fuerza de las Regiones` `#37474F`) a `COLORES_PARTIDO`.

**Bug real encontrado y corregido al verificar:** "Movimiento Sí Hay un
Camino" colisionaba por substring con un bucket preexistente y no
relacionado de `palabrasClave` (`'MOVIMIENTO SI': ['MOVIMIENTO SI']`,
un partido real y distinto con 1-2 votos en Senado 2026) — `colorPartido()`
lo pintaba gris porque `normalizePartido()` caía al matcher de palabras
clave (paso 4) y truncaba a "Movimiento Si". Corregido agregando una
entrada directa en `NORMALIZAR_PARTIDO` para que resuelva en el paso 1
(match exacto) antes de llegar ahí. Verificado en vivo con CDP tras el
fix: color correcto (`#8E24AA`).

**Resuelto también (3 más, sesión 2026-07-08 posterior) — "Frente por
la Vida" (consulta de Roy Barreras) completa:** Roy Leonardo Barreras
Montealegre, Edison Lucio Torres Moreno y Martha Viviana Bernal Amaya
→ Fuerza de la Paz (confirmado por Santiago; Quintero, el 4º de esta
misma consulta, ya estaba resuelto aparte como AICO). Antes de este
fix, los 3 caían sin querer en el bucket `palabrasClave` de "Partido de
la U" (que ya tenía "FRENTE POR LA VIDA" y "ROY LEONARDO BARRERAS
MONTEALEGRE" como palabras clave de una resolución previa, ahora
superado por el override explícito en `CANDIDATOS_PARTIDO`, que tiene
prioridad).

**Resuelto también (2 más, sesión 2026-07-08 posterior) — "Consulta de
las Soluciones" (Claudia López + Leonardo Huerta) completa:**
- Claudia Nayibe López Hernández → Con Claudia Imparables (el mismo
  movimiento que ya usaba en Presidencia 1ª vuelta 2026 — antes de este
  fix, en Consultas caía en una regla directa de `NORMALIZAR_PARTIDO`
  que mapea el texto crudo de esta consulta a "Fuerza Ciudadana", sin
  override propio que la interceptara antes).
- Leonardo Humberto Huerta Gutiérrez → Una Nueva Historia (confirmado
  con múltiples fuentes externas: es "Leonardo Huerta", precandidato
  presidencial por firmas con el comité "Colombia: Una Nueva Historia",
  quedó 2º en esta consulta y fue fórmula vicepresidencial de López —
  no homónimo, mismo patrón de verificación que el caso Gaviria).

Se agregó 1 color nuevo (`Una Nueva Historia` `#F57C00`) a
`COLORES_PARTIDO`, con la misma entrada directa preventiva en
`NORMALIZAR_PARTIDO` que ya se usó para "Movimiento Sí Hay un Camino"
(evita depender de si colisiona con algún keyword de `palabrasClave`).

**Resuelto (último de 12), sesión 2026-07-08 posterior:** Héctor Elías
Pineda Salazar → Fuerza de la Paz, confirmado por Santiago (mismo aval
que Roy Barreras, Torres Moreno y Bernal Amaya — "Frente por la Vida"
completa). **Con esto se cierran los 12 candidatos de consultas
multi-candidato de 2026 sin excepción.**

**Límite conocido — "Lista ganadora" (agregado de partido) NO se
corrigió:** el patrón usado para alcaldía/gobernador/presidencia (que
renombra la fila del agregado buscando texto crudo + municipio en
común) asume **un partido = un candidato por municipio** (cargo
uninominal). Consultas rompe esa asunción: varios candidatos
comparten la MISMA fila agregada de la consulta en un municipio (ej.
los 6 de "La Gran Consulta por Colombia" suman a una sola fila). Aplicar
el mismo patch ahí renombraría toda la fila combinada al aval de
cualquiera de los 6, atribuyendo mal el resto de los votos — por eso
NO se extendió `CARGOS_UNINOMINALES` a `consultas`. "Ganador
(candidato)" y Vista Actor ya muestran el aval real (no dependen de esa
propagación); "Lista ganadora"/mapa por partido para consultas sigue
mostrando el nombre de la consulta agregado. Corregirlo requeriría
recalcular el agregado de partido desde el candidato (redistribuir
votos por aval real en vez de renombrar una fila), que es un problema
distinto y más grande — no se hizo en esta sesión.

## Duitama, Alcaldía 2019 — Coalición Somos Duitama Ciudad Creativa → Alianza Verde — RESUELTO 2026-07-08

**Caso oportunista** (primer caso de este enfoque: se investiga cuando
Santiago trae un caso puntual, no auditoría exhaustiva de coaliciones).

German Tiberio Ojeda Pedraza, alcaldía de Duitama 2019, corrió bajo
"Coalición Somos Duitama Ciudad Creativa" (tercer lugar, 18.15%).
Confirmado por Santiago: la coalición era Alianza Verde + Polo, con
Alianza Verde como partido principal (regla de siempre: primer partido
listado). Investigación previa (fuentes externas) ya había encontrado
evidencia consistente: El Diario de Boyacá (mayo 2019, antes de la
inscripción) reportaba que Ojeda —diputado en ejercicio por Alianza
Verde— sería el candidato del partido.

**Aplicado:** a diferencia de Tópaga (formato CEDAE viejo, código
numérico sin resolver, requería edición directa del CSV), este caso es
del formato "histórico por mesa" (2019-2023), donde el PARNOMBRE crudo
ya es texto real y se deja así a propósito en el CSV — la
canonización se hace en JS. Se agregó `'SOMOS DUITAMA CIUDAD CREATIVA':
'Alianza Verde'` a `NORMALIZAR_PARTIDO` (`js/colores_partido.js`), no
una edición de CSV. Verificado en vivo: "Ganador (candidato)", "Lista
ganadora" y Vista Actor muestran Alianza Verde para Duitama 2019.

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

## Vista Actor: nombres de partido colados en el índice de candidatos — resuelto 2026-07-08

**El problema:** filas de "plancha" (voto de lista sin candidato
específico, donde `CANNOMBRE` termina siendo una copia o casi-copia de
`PARNOMBRE`) se colaban en `actorTodasLasFilas`/`actorNombresPorClave`
como si fueran candidatos buscables en Vista Actor. El filtro que ya
existía (`CANNOMBRE === PARNOMBRE`, comparación exacta) solo atrapaba
coincidencias byte-a-byte — se descubrió al revisar
`revision_nombres_duplicados.csv`: 6 de los 40 pares que Santiago
confirmó como "el mismo candidato" eran en realidad partidos/
movimientos, no personas.

**Resuelto:** cambiada la comparación a normalizada
(`normalizarNombre(CANNOMBRE) !== normalizarNombre(PARNOMBRE)`,
`construirIndiceActor()` en `js/data.js`) — atrapa coincidencias que
solo difieren en mayúsculas/tildes/espacios. Verificado en vivo:
"Movimiento Mira", "Polo Democrático Alternativo", "Partido Político
Dignidad" y "Movimiento Salvación Nacional" ya no aparecen como
candidatos buscables. De paso resolvió sin querer un caso adicional no
buscado (`"PARTIDO CENTRO DEMOCRATICO- PARTIDO POLITICO MIRA"`, una
coalición completa colada como candidato).

**Los 2 casos residuales, resueltos también (sesión 2026-07-08
posterior):** como se anticipó arriba, se resolvieron con una lista de
exclusión explícita (mismo patrón que el `excluir` ya existente para
"VOTOS EN BLANCO" etc.), no con una heurística de similaridad de texto
(que habría reintroducido el mismo riesgo de falsos positivos visto al
generar `revision_nombres_duplicados.csv`). Un barrido exhaustivo de
todo el dataset (todas las variantes de CANNOMBRE que contienen "Centro
Democratico"/"Alianza Social Indigena", con y sin tilde, cruzadas
contra su PARNOMBRE real) encontró 7 variantes que necesitaban
exclusión explícita, 2 más de las 2 originalmente documentadas aquí
(había variantes con tilde que no se habían detectado):
`PARTIDO CENTRO DEMOCRATICO`, `Partido Centro Democratico`,
`PARTIDO CENTRO DEMOCRÁTICO`, `Partido Centro Democrático`,
`Centro Democratico Mano Firme Corazon Grande`,
`Partido Centro Democratico Mano Firme Corazon Grande`,
`Alianza Social Indigena`. Verificado en vivo: ninguna es buscable en
Vista Actor/Series. **Sin casos residuales pendientes.**
