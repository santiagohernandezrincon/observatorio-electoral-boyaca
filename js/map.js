// ==================== TOOLTIPS ====================
function getTooltipText(elementoNombre, esProvincia, tipoVista, partidoSeleccionado, candidatoSeleccionado, partidoGanadorSeleccionado, porcentajeActivo, candidatoFiltro) {
    if (esProvincia) {
        const datosProv = obtenerDatosProvincia(elementoNombre);
        if (!datosProv) return `<strong>${elementoNombre}</strong><br>Sin datos`;
        if (tipoVista === 'partido') {
            const g = datosProv.partidos.reduce((a, b) => a['VOTOS'] > b['VOTOS'] ? a : b);
            return `<strong>${elementoNombre}</strong><br>Ganador: ${g['PARNOMBRE']}<br>Votos: ${g['VOTOS'].toLocaleString()}`;
        } else if (tipoVista === 'partido_heat') {
            if (!partidoSeleccionado) return `<strong>${elementoNombre}</strong><br>Seleccione un partido`;
            const row = datosProv.partidos.find(p => p['PARNOMBRE'] === partidoSeleccionado);
            if (!row) return `<strong>${elementoNombre}</strong><br>${partidoSeleccionado}: 0 votos`;
            return porcentajeActivo
                ? `<strong>${elementoNombre}</strong><br>${partidoSeleccionado}: ${row['PORCENTAJE'].toFixed(1)}% (${row['VOTOS'].toLocaleString()} votos)`
                : `<strong>${elementoNombre}</strong><br>${partidoSeleccionado}: ${row['VOTOS'].toLocaleString()} votos`;
        } else if (tipoVista === 'partido_desviacion') {
            if (!partidoSeleccionado) return `<strong>${elementoNombre}</strong><br>Seleccione un partido`;
            const row = datosProv.partidos.find(p => p['PARNOMBRE'] === partidoSeleccionado);
            const localPct = row ? row['PORCENTAJE'] : 0;
            const promedioDep = calcularPromedioDepartamental(partidoSeleccionado);
            const desviacion = localPct - promedioDep;
            return `<strong>${elementoNombre}</strong><br>${partidoSeleccionado}: ${localPct.toFixed(1)}% local<br>Promedio departamental: ${promedioDep.toFixed(1)}%<br>Desviación: ${desviacion >= 0 ? '+' : ''}${desviacion.toFixed(1)} pts`;
        } else if (tipoVista === 'candidato_heat') {
            if (!candidatoSeleccionado) return `<strong>${elementoNombre}</strong><br>Seleccione un candidato`;
            const row = datosProv.candidatos.find(c => c['CANNOMBRE'] === candidatoSeleccionado);
            if (!row) return `<strong>${elementoNombre}</strong><br>${candidatoSeleccionado}: 0 votos`;
            if (porcentajeActivo) {
                const total = datosProv.candidatos.reduce((s, c) => s + c['VOTOS'], 0);
                const pct = total > 0 ? (row['VOTOS'] / total * 100).toFixed(1) : 0;
                return `<strong>${elementoNombre}</strong><br>${candidatoSeleccionado}: ${pct}% (${row['VOTOS'].toLocaleString()} votos)`;
            }
            return `<strong>${elementoNombre}</strong><br>${candidatoSeleccionado}: ${row['VOTOS'].toLocaleString()} votos`;
        } else if (tipoVista === 'candidato_ganador') {
            if (!datosProv.candidatos.length) return `<strong>${elementoNombre}</strong><br>Sin datos`;
            const g = datosProv.candidatos.reduce((a, b) => a['VOTOS'] > b['VOTOS'] ? a : b);
            if (candidatoFiltro && g['CANNOMBRE'] !== candidatoFiltro) return `<strong>${elementoNombre}</strong><br>Sin candidato filtrado`;
            return `<strong>${elementoNombre}</strong><br>Candidato ganador: ${g['CANNOMBRE']}<br>Votos: ${g['VOTOS'].toLocaleString()}`;
        } else if (tipoVista === 'candidato_ganador_por_partido') {
            if (!partidoGanadorSeleccionado) return `<strong>${elementoNombre}</strong><br>Seleccione un partido`;
            const lista = datosProv.candidatos.filter(c => c['PARNOMBRE'] === partidoGanadorSeleccionado);
            if (!lista.length) return `<strong>${elementoNombre}</strong><br>No hay candidatos de ${partidoGanadorSeleccionado}`;
            const g = lista.reduce((a, b) => a['VOTOS'] > b['VOTOS'] ? a : b);
            return `<strong>${elementoNombre}</strong><br>Candidato ganador de ${partidoGanadorSeleccionado}: ${g['CANNOMBRE']}<br>Votos: ${g['VOTOS'].toLocaleString()}`;
        }
    } else {
        if (tipoVista === 'partido') {
            const filas = currentPartidoData.filter(row => normalizarNombre(row['MUNNOMBRE']) === elementoNombre);
            if (!filas.length) return `<strong>${elementoNombre}</strong><br>Sin datos`;
            const g = filas.reduce((a, b) => a['VOTOS'] > b['VOTOS'] ? a : b);
            return `<strong>${elementoNombre}</strong><br>Ganador: ${g['PARNOMBRE']}<br>Votos: ${g['VOTOS'].toLocaleString()}`;
        } else if (tipoVista === 'partido_heat') {
            if (!partidoSeleccionado) return `<strong>${elementoNombre}</strong><br>Seleccione un partido`;
            const filas = currentPartidoData.filter(row => normalizarNombre(row['MUNNOMBRE']) === elementoNombre);
            const row = filas.find(f => f['PARNOMBRE'] === partidoSeleccionado);
            if (!row) return `<strong>${elementoNombre}</strong><br>${partidoSeleccionado}: 0 votos`;
            return porcentajeActivo
                ? `<strong>${elementoNombre}</strong><br>${partidoSeleccionado}: ${row['PORCENTAJE'].toFixed(1)}% (${row['VOTOS'].toLocaleString()} votos)`
                : `<strong>${elementoNombre}</strong><br>${partidoSeleccionado}: ${row['VOTOS'].toLocaleString()} votos`;
        } else if (tipoVista === 'partido_desviacion') {
            if (!partidoSeleccionado) return `<strong>${elementoNombre}</strong><br>Seleccione un partido`;
            const filas = currentPartidoData.filter(row => normalizarNombre(row['MUNNOMBRE']) === elementoNombre);
            const row = filas.find(f => f['PARNOMBRE'] === partidoSeleccionado);
            const localPct = row ? row['PORCENTAJE'] : 0;
            const promedioDep = calcularPromedioDepartamental(partidoSeleccionado);
            const desviacion = localPct - promedioDep;
            return `<strong>${elementoNombre}</strong><br>${partidoSeleccionado}: ${localPct.toFixed(1)}% local<br>Promedio departamental: ${promedioDep.toFixed(1)}%<br>Desviación: ${desviacion >= 0 ? '+' : ''}${desviacion.toFixed(1)} pts`;
        } else if (tipoVista === 'candidato_heat') {
            if (!candidatoSeleccionado) return `<strong>${elementoNombre}</strong><br>Seleccione un candidato`;
            const filas = currentCandidatoData.filter(row => normalizarNombre(row['MUNNOMBRE']) === elementoNombre);
            const row = filas.find(f => f['CANNOMBRE'] === candidatoSeleccionado);
            if (!row) return `<strong>${elementoNombre}</strong><br>${candidatoSeleccionado}: 0 votos`;
            if (porcentajeActivo) {
                const total = filas.reduce((s, f) => s + f['VOTOS'], 0);
                const pct = total > 0 ? (row['VOTOS'] / total * 100).toFixed(1) : 0;
                return `<strong>${elementoNombre}</strong><br>${candidatoSeleccionado}: ${pct}% (${row['VOTOS'].toLocaleString()} votos)`;
            }
            return `<strong>${elementoNombre}</strong><br>${candidatoSeleccionado}: ${row['VOTOS'].toLocaleString()} votos`;
        } else if (tipoVista === 'candidato_ganador') {
            const g = candidatoGanadorPorMunicipio[elementoNombre];
            if (!g) return `<strong>${elementoNombre}</strong><br>Sin datos`;
            if (candidatoFiltro && g['CANNOMBRE'] !== candidatoFiltro) return `<strong>${elementoNombre}</strong><br>Sin candidato filtrado`;
            return `<strong>${elementoNombre}</strong><br>Candidato ganador: ${g['CANNOMBRE']}<br>Votos: ${g['VOTOS'].toLocaleString()}`;
        } else if (tipoVista === 'candidato_ganador_por_partido') {
            if (!partidoGanadorSeleccionado) return `<strong>${elementoNombre}</strong><br>Seleccione un partido`;
            const g = ganadorPorPartidoPorMunicipio[partidoGanadorSeleccionado]?.[elementoNombre];
            if (!g) return `<strong>${elementoNombre}</strong><br>No hay candidatos de ${partidoGanadorSeleccionado}`;
            return `<strong>${elementoNombre}</strong><br>Candidato ganador de ${partidoGanadorSeleccionado}: ${g['CANNOMBRE']}<br>Votos: ${g['VOTOS'].toLocaleString()}`;
        }
    }
    // Tooltips para modos calor y margen
    if (tipoVista === 'calor') {
        const filas = esProvincia
            ? (obtenerDatosProvincia(elementoNombre)?.partidos || [])
            : currentPartidoData.filter(r => normalizarNombre(r['MUNNOMBRE']) === elementoNombre);
        if (!filas.length) return `<strong>${elementoNombre}</strong><br>Sin datos`;
        const g = filas.reduce((a, b) => a['VOTOS'] > b['VOTOS'] ? a : b);
        return porcentajeActivo
            ? `<strong>${elementoNombre}</strong><br>Ganador: <b>${g['PARNOMBRE']}</b><br>Dominio: ${(g['PORCENTAJE'] || 0).toFixed(1)}% del voto`
            : `<strong>${elementoNombre}</strong><br>Ganador: <b>${g['PARNOMBRE']}</b><br>Votos: ${g['VOTOS'].toLocaleString('es-CO')}`;
    }
    if (tipoVista === 'margen') {
        const filas = esProvincia
            ? (obtenerDatosProvincia(elementoNombre)?.partidos || [])
            : currentPartidoData.filter(r => normalizarNombre(r['MUNNOMBRE']) === elementoNombre);
        if (filas.length < 2) return `<strong>${elementoNombre}</strong><br>Sin datos suficientes`;
        const ord = [...filas].sort((a, b) => b['VOTOS'] - a['VOTOS']);
        const total = ord[0]['TOTAL_VOTOS'] || ord.reduce((s, r) => s + r['VOTOS'], 0);
        const margenPct = total ? ((ord[0]['VOTOS'] - ord[1]['VOTOS']) / total * 100).toFixed(1) : 0;
        return `<strong>${elementoNombre}</strong><br>1°: ${ord[0]['PARNOMBRE']} (${ord[0]['VOTOS'].toLocaleString()})<br>2°: ${ord[1]['PARNOMBRE']} (${ord[1]['VOTOS'].toLocaleString()})<br>Margen: ${margenPct}%`;
    }

    return `<strong>${elementoNombre}</strong><br>Sin datos`;
}

// ==================== PALETA MARGEN (rojo→ámbar→azul, colorblind-safe) ====================
function colorPorMargen(margen) {
    const t = Math.min(margen / 0.35, 1);
    let rv, gv, bv;
    if (t < 0.5) {                 // rojo → ámbar
        const p = t * 2;
        rv = 220; gv = Math.round(50 + 141 * p); bv = Math.round(50 - 50 * p);
    } else {                       // ámbar → azul
        const p = (t - 0.5) * 2;
        rv = Math.round(220 - 184 * p); gv = Math.round(191 - 103 * p); bv = Math.round(0 + 210 * p);
    }
    return `rgb(${rv},${gv},${bv})`;
}

// ==================== PALETA DESVIACIÓN (rojo↔blanco↔azul, diverging) ====================
function colorPorDesviacion(desviacion) {
    const t = Math.max(-1, Math.min(1, desviacion / 25)); // clamp a ±25 puntos porcentuales
    if (t < 0) {
        const p = -t;
        const r = Math.round(255 - (255 - 198) * p);
        const g = Math.round(255 - (255 - 40) * p);
        const b = Math.round(255 - (255 - 40) * p);
        return `rgb(${r},${g},${b})`;
    }
    const p = t;
    const r = Math.round(255 - (255 - 25) * p);
    const g = Math.round(255 - (255 - 72) * p);
    const b = Math.round(255 - (255 - 140) * p);
    return `rgb(${r},${g},${b})`;
}

// ==================== COLORES DEL MAPA ====================
function getColorParaElemento(nombreElemento, esProvincia, tipoVista, partidoSeleccionado, candidatoSeleccionado, partidoGanadorSeleccionado, porcentajeActivo) {
    let filas;
    if (esProvincia) {
        const datosProv = obtenerDatosProvincia(nombreElemento);
        if (!datosProv) return '#cccccc';
        if (tipoVista === 'partido' || tipoVista === 'partido_heat' || tipoVista === 'partido_desviacion') {
            filas = datosProv.partidos;
        } else if (tipoVista === 'candidato_heat') {
            filas = datosProv.candidatos;
        } else if (tipoVista === 'candidato_ganador') {
            if (!datosProv.candidatos.length) return '#cccccc';
            const g = datosProv.candidatos.reduce((a, b) => a['VOTOS'] > b['VOTOS'] ? a : b, datosProv.candidatos[0]);
            if (!g) return '#cccccc';
            const row = currentPartidoData.find(p => p['PARNOMBRE'] === g['PARNOMBRE']);
            return row ? row.COLOR_BASE : '#95a5a6';
        } else if (tipoVista === 'candidato_ganador_por_partido') {
            if (!partidoGanadorSeleccionado) return '#cccccc';
            const lista = datosProv.candidatos.filter(c => c['PARNOMBRE'] === partidoGanadorSeleccionado);
            if (!lista.length) return '#cccccc';
            return getColorCandidato(lista.reduce((a, b) => a['VOTOS'] > b['VOTOS'] ? a : b)['CANNOMBRE']);
        }
    } else {
        if (tipoVista === 'partido' || tipoVista === 'partido_heat' || tipoVista === 'partido_desviacion') {
            filas = currentPartidoData.filter(row => normalizarNombre(row['MUNNOMBRE']) === nombreElemento);
        } else if (tipoVista === 'candidato_heat') {
            filas = currentCandidatoData.filter(row => normalizarNombre(row['MUNNOMBRE']) === nombreElemento);
        } else if (tipoVista === 'candidato_ganador') {
            const g = candidatoGanadorPorMunicipio[nombreElemento];
            if (!g) return '#cccccc';
            const row = currentPartidoData.find(p => p['PARNOMBRE'] === g['PARNOMBRE']);
            return row ? row.COLOR_BASE : '#95a5a6';
        } else if (tipoVista === 'candidato_ganador_por_partido') {
            if (!partidoGanadorSeleccionado) return '#cccccc';
            const g = ganadorPorPartidoPorMunicipio[partidoGanadorSeleccionado]?.[nombreElemento];
            if (!g) return '#cccccc';
            return getColorCandidato(g['CANNOMBRE']);
        }
    }

    // calor y margen no usan 'filas' — saltan este early return
    if (tipoVista !== 'calor' && tipoVista !== 'margen') {
        if (!filas || !filas.length) return '#cccccc';
    }

    if (tipoVista === 'partido') {
        return filas.reduce((a, b) => a['VOTOS'] > b['VOTOS'] ? a : b).COLOR_BASE || '#95a5a6';
    } else if (tipoVista === 'partido_heat') {
        if (!partidoSeleccionado) return '#cccccc';
        const row = filas.find(f => f['PARNOMBRE'] === partidoSeleccionado);
        if (!row) return '#e9e9e9';
        let valor;
        if (porcentajeActivo) {
            valor = row['PORCENTAJE'] / 100;
        } else {
            let maxVotos = 0;
            if (esProvincia) {
                for (const prov of Object.keys(provinciasData)) {
                    const dp = obtenerDatosProvincia(prov);
                    if (dp) { const r = dp.partidos.find(p => p['PARNOMBRE'] === partidoSeleccionado); if (r && r['VOTOS'] > maxVotos) maxVotos = r['VOTOS']; }
                }
            } else {
                for (const mun of Object.keys(candidatoGanadorPorMunicipio)) {
                    const r = currentPartidoData.find(p => p['PARNOMBRE'] === partidoSeleccionado && normalizarNombre(p['MUNNOMBRE']) === mun);
                    if (r && r['VOTOS'] > maxVotos) maxVotos = r['VOTOS'];
                }
            }
            valor = maxVotos > 0 ? row['VOTOS'] / maxVotos : 0;
        }
        const cb = row.COLOR_BASE || '#3498db';
        const factor = 1 - valor;
        return `rgb(${Math.floor(parseInt(cb.slice(1,3),16)*factor)}, ${Math.floor(parseInt(cb.slice(3,5),16)*factor)}, ${Math.floor(parseInt(cb.slice(5,7),16)*factor)})`;
    } else if (tipoVista === 'partido_desviacion') {
        if (!partidoSeleccionado) return '#cccccc';
        const row = filas.find(f => f['PARNOMBRE'] === partidoSeleccionado);
        const localPct = row ? row['PORCENTAJE'] : 0;
        const promedioDep = calcularPromedioDepartamental(partidoSeleccionado);
        return colorPorDesviacion(localPct - promedioDep);
    } else if (tipoVista === 'candidato_heat') {
        if (!candidatoSeleccionado) return '#cccccc';
        const row = filas.find(f => f['CANNOMBRE'] === candidatoSeleccionado);
        if (!row) return '#e9e9e9';
        let valor;
        if (porcentajeActivo) {
            const total = filas.reduce((s, f) => s + f['VOTOS'], 0);
            valor = total > 0 ? row['VOTOS'] / total : 0;
        } else {
            let maxVotos = 0;
            if (esProvincia) {
                for (const prov of Object.keys(provinciasData)) {
                    const dp = obtenerDatosProvincia(prov);
                    if (dp) { const r = dp.candidatos.find(c => c['CANNOMBRE'] === candidatoSeleccionado); if (r && r['VOTOS'] > maxVotos) maxVotos = r['VOTOS']; }
                }
            } else {
                for (const mun of Object.keys(candidatoGanadorPorMunicipio)) {
                    const r = currentCandidatoData.find(c => c['CANNOMBRE'] === candidatoSeleccionado && normalizarNombre(c['MUNNOMBRE']) === mun);
                    if (r && r['VOTOS'] > maxVotos) maxVotos = r['VOTOS'];
                }
            }
            valor = maxVotos > 0 ? row['VOTOS'] / maxVotos : 0;
        }
        return `rgb(${Math.floor(179+76*valor)}, ${Math.floor(179-179*valor)}, ${Math.floor(179-179*valor)})`;
    }
    // ── MODO CALOR: dominancia del ganador (% votos o votos absolutos) ─
    if (tipoVista === 'calor') {
        const filasMun = esProvincia
            ? (obtenerDatosProvincia(nombreElemento)?.partidos || [])
            : currentPartidoData.filter(r => normalizarNombre(r['MUNNOMBRE']) === nombreElemento);
        if (!filasMun.length) return '#cccccc';
        const ganador = filasMun.reduce((a, b) => a['VOTOS'] > b['VOTOS'] ? a : b);
        let valor;
        if (porcentajeActivo) {
            valor = Math.min((ganador['PORCENTAJE'] || 0) / 100, 1);
        } else {
            let maxVotos = 0;
            if (esProvincia) {
                for (const prov of Object.keys(provinciasData)) {
                    const dp = obtenerDatosProvincia(prov);
                    if (dp?.partidos.length) {
                        const g = dp.partidos.reduce((a, b) => a['VOTOS'] > b['VOTOS'] ? a : b);
                        if (g['VOTOS'] > maxVotos) maxVotos = g['VOTOS'];
                    }
                }
            } else {
                for (const mun of Object.keys(candidatoGanadorPorMunicipio)) {
                    const filas = currentPartidoData.filter(r => normalizarNombre(r['MUNNOMBRE']) === mun);
                    if (!filas.length) continue;
                    const g = filas.reduce((a, b) => a['VOTOS'] > b['VOTOS'] ? a : b);
                    if (g['VOTOS'] > maxVotos) maxVotos = g['VOTOS'];
                }
            }
            valor = maxVotos > 0 ? ganador['VOTOS'] / maxVotos : 0;
        }
        // Gradiente: gris claro (poco) → azul navy oscuro (dominio/volumen total)
        const r = Math.round(220 - 175 * valor);
        const g = Math.round(220 - 170 * valor);
        const b = Math.round(230 - 80 * valor);
        return `rgb(${r},${g},${b})`;
    }

    // ── MODO MARGEN: diferencia entre 1° y 2° lugar ─────────────────
    if (tipoVista === 'margen') {
        const filasMun = esProvincia
            ? (obtenerDatosProvincia(nombreElemento)?.partidos || [])
            : currentPartidoData.filter(r => normalizarNombre(r['MUNNOMBRE']) === nombreElemento);
        if (filasMun.length < 2) return filasMun.length === 1 ? '#1A237E' : '#cccccc';
        const ordenados = [...filasMun].sort((a, b) => b['VOTOS'] - a['VOTOS']);
        const total = ordenados[0]['TOTAL_VOTOS'] || ordenados.reduce((s, r) => s + r['VOTOS'], 0);
        if (!total) return '#cccccc';
        const margen = (ordenados[0]['VOTOS'] - ordenados[1]['VOTOS']) / total;
        return colorPorMargen(margen);
    }

    return '#cccccc';
}

// ==================== MAPA SIMPLE (Leaflet) ====================
function actualizarMapaSimple() {
    if (!currentGeojson || !currentPartidoData) return;
    if (currentLayerSimple) mapSimple.removeLayer(currentLayerSimple);
    if (currentLayerProvincias) mapSimple.removeLayer(currentLayerProvincias);

    const tipoVista               = document.getElementById('tipo-vista').value;
    const partidoSeleccionado     = document.getElementById('partido-selector').value;
    const candidatoSeleccionado   = document.getElementById('candidato-selector').value;
    const partidoGanadorSel       = document.getElementById('partido-ganador-selector').value;
    const porcentajeActivo        = mapaCalorPorcentaje && (tipoVista === 'partido_heat' || tipoVista === 'candidato_heat' || tipoVista === 'calor');
    const candidatoFiltro         = document.getElementById('candidato-ganador-filtro').value;
    const escala                  = document.getElementById('escala-selector')?.value || 'municipio';
    escalaActual = escala;

    document.getElementById('partido-selector-container').style.display           = tipoVista === 'partido_heat'               ? 'inline-flex' : 'none';
    document.getElementById('candidato-selector-container').style.display         = tipoVista === 'candidato_heat'             ? 'inline-flex' : 'none';
    document.getElementById('partido-ganador-container').style.display            = tipoVista === 'candidato_ganador_por_partido' ? 'inline-flex' : 'none';
    document.getElementById('candidato-ganador-filtro-container').style.display   = tipoVista === 'candidato_ganador'          ? 'inline-flex' : 'none';
    document.getElementById('heatmap-porcentaje-container').style.display         = (tipoVista === 'partido_heat' || tipoVista === 'candidato_heat') ? 'inline-flex' : 'none';
    document.getElementById('comparar-controls').style.display                    = 'none';
    document.getElementById('map-container-simple').style.display                 = 'flex';
    document.getElementById('map-container-comparison').style.display             = 'none';

    // Capa de municipios: se construye siempre (el buscador y "saltar a
    // provincia" dependen de currentLayerSimple.eachLayer), pero solo se
    // agrega al mapa cuando la escala activa es 'municipio'.
    currentLayerSimple = L.geoJSON(currentGeojson, {
        style: feature => {
            const nombreRaw = feature.properties.MPIO_CNMBR;
            if (!nombreRaw) return { fillColor: '#cccccc', weight: 1, color: 'white', fillOpacity: 0.9 };
            const nombre = normalizarNombre(nombreRaw);
            const color = getColorParaElemento(nombre, false, tipoVista, partidoSeleccionado, candidatoSeleccionado, partidoGanadorSel, porcentajeActivo);
            return { fillColor: color, weight: 1, opacity: 1, color: 'white', fillOpacity: 0.9 };
        },
        onEachFeature: (feature, layer) => {
            const nombreRaw = feature.properties.MPIO_CNMBR;
            if (!nombreRaw) return;
            const nombre = normalizarNombre(nombreRaw);
            const tooltipText = getTooltipText(nombre, false, tipoVista, partidoSeleccionado, candidatoSeleccionado, partidoGanadorSel, porcentajeActivo, candidatoFiltro);
            layer.bindTooltip(tooltipText, { sticky: true });
            layer.on('click', () => {
                const partidosMun    = currentPartidoData.filter(row => normalizarNombre(row['MUNNOMBRE']) === nombre);
                const candidatosMun  = currentCandidatoData.filter(row => normalizarNombre(row['MUNNOMBRE']) === nombre);
                mostrarDetalleMunicipio(nombreRaw, partidosMun, candidatosMun, tipoVista);
            });
        }
    });

    // Capa de provincias: poligonos ya fusionados en geojson/boyaca_provincias.geojson
    // (ver scripts/generar_geojson_provincias.py). Un feature = una provincia real.
    if (escalaActual === 'provincia' && currentGeojsonProvincias) {
        currentLayerProvincias = L.geoJSON(currentGeojsonProvincias, {
            style: feature => {
                const prov = feature.properties.PROVINCIA;
                const color = getColorParaElemento(prov, true, tipoVista, partidoSeleccionado, candidatoSeleccionado, partidoGanadorSel, porcentajeActivo);
                return { fillColor: color, weight: 1.5, opacity: 1, color: 'white', fillOpacity: 0.9 };
            },
            onEachFeature: (feature, layer) => {
                const prov = feature.properties.PROVINCIA;
                const tooltipText = getTooltipText(prov, true, tipoVista, partidoSeleccionado, candidatoSeleccionado, partidoGanadorSel, porcentajeActivo, candidatoFiltro);
                layer.bindTooltip(tooltipText, { sticky: true });
                layer.on('click', () => {
                    const dp = obtenerDatosProvincia(prov);
                    if (dp) mostrarDetalleProvincia(prov, dp);
                });
            }
        }).addTo(mapSimple);
        mapSimple.fitBounds(currentLayerProvincias.getBounds());
    } else {
        currentLayerSimple.addTo(mapSimple);
        mapSimple.fitBounds(currentLayerSimple.getBounds());
    }

    const chkPuestos = document.getElementById('toggle-puestos');
    if (chkPuestos?.checked && capaPuestosVotacion) capaPuestosVotacion.addTo(mapSimple);

    actualizarResumenDepartamental(currentPartidoData, candidatoEspecificoActual);
}

// ==================== MAPA VISTA ACTOR ====================
function actualizarMapaActor(votosPorMunicipio, colorBase) {
    if (!currentGeojson) return;
    if (!mapActor) {
        mapActor = L.map('map-actor').setView([5.75, -73.0], 8);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { crossOrigin: true }).addTo(mapActor);
        agregarControlExportar(mapActor, '#obs-vista-actor .actor-main', 'actor');
    }
    if (currentLayerActor) mapActor.removeLayer(currentLayerActor);

    const maxVotos = Math.max(...Object.values(votosPorMunicipio), 1);
    const r = parseInt(colorBase.slice(1, 3), 16);
    const g = parseInt(colorBase.slice(3, 5), 16);
    const b = parseInt(colorBase.slice(5, 7), 16);

    currentLayerActor = L.geoJSON(currentGeojson, {
        style: feature => {
            const nombreRaw = feature.properties.MPIO_CNMBR;
            if (!nombreRaw) return { fillColor: '#cccccc', weight: 1, color: 'white', fillOpacity: 0.9 };
            const votos = votosPorMunicipio[normalizarNombre(nombreRaw)] || 0;
            if (!votos) return { fillColor: '#e9e9e9', weight: 1, opacity: 1, color: 'white', fillOpacity: 0.9 };
            const factor = 1 - (votos / maxVotos);
            const fillColor = `rgb(${Math.floor(r * factor)}, ${Math.floor(g * factor)}, ${Math.floor(b * factor)})`;
            return { fillColor, weight: 1, opacity: 1, color: 'white', fillOpacity: 0.9 };
        },
        onEachFeature: (feature, layer) => {
            const nombreRaw = feature.properties.MPIO_CNMBR;
            if (!nombreRaw) return;
            const votos = votosPorMunicipio[normalizarNombre(nombreRaw)] || 0;
            layer.bindTooltip(`<strong>${nombreRaw}</strong><br>${votos.toLocaleString('es-CO')} votos`, { sticky: true });
        }
    }).addTo(mapActor);

    mapActor.fitBounds(currentLayerActor.getBounds());
    setTimeout(() => mapActor.invalidateSize(), 100);
}

// ==================== MAPA VISTA COMPETITIVIDAD ====================
function actualizarMapaCompetitividad(promedioPorMunicipio) {
    if (!currentGeojson) return;
    if (!mapCompetitividad) {
        mapCompetitividad = L.map('map-competitividad').setView([5.75, -73.0], 8);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { crossOrigin: true }).addTo(mapCompetitividad);
        agregarControlExportar(mapCompetitividad, '#obs-vista-competitividad .actor-main', 'competitividad');
    }
    if (currentLayerCompetitividad) mapCompetitividad.removeLayer(currentLayerCompetitividad);

    currentLayerCompetitividad = L.geoJSON(currentGeojson, {
        style: feature => {
            const nombreRaw = feature.properties.MPIO_CNMBR;
            if (!nombreRaw) return { fillColor: '#cccccc', weight: 1, color: 'white', fillOpacity: 0.9 };
            const margen = promedioPorMunicipio[normalizarNombre(nombreRaw)];
            if (margen === undefined) return { fillColor: '#e9e9e9', weight: 1, opacity: 1, color: 'white', fillOpacity: 0.9 };
            return { fillColor: colorPorMargen(margen), weight: 1, opacity: 1, color: 'white', fillOpacity: 0.9 };
        },
        onEachFeature: (feature, layer) => {
            const nombreRaw = feature.properties.MPIO_CNMBR;
            if (!nombreRaw) return;
            const margen = promedioPorMunicipio[normalizarNombre(nombreRaw)];
            const texto = margen === undefined ? 'Sin datos suficientes' : `Margen promedio: ${(margen * 100).toFixed(1)}%`;
            layer.bindTooltip(`<strong>${nombreRaw}</strong><br>${texto}`, { sticky: true });
        }
    }).addTo(mapCompetitividad);

    mapCompetitividad.fitBounds(currentLayerCompetitividad.getBounds());
    setTimeout(() => mapCompetitividad.invalidateSize(), 100);
}

// ==================== MAPA VISTA COMPARAR ====================
// Rampa secuencial de un solo tono (navy de marca, claro→oscuro) para ENP —
// deliberadamente desaturada para no leerse como el color de ningún partido real.
function colorPorEnp(valor, min, max) {
    if (valor == null || max === min) return '#e9e9e9';
    const t = Math.max(0, Math.min(1, (valor - min) / (max - min)));
    const r0 = 0xE7, g0 = 0xEC, b0 = 0xF2; // pálido azul-gris
    const r1 = 0x0B, g1 = 0x19, b1 = 0x29; // --navy
    const r = Math.round(r0 + (r1 - r0) * t);
    const g = Math.round(g0 + (g1 - g0) * t);
    const b = Math.round(b0 + (b1 - b0) * t);
    return `rgb(${r},${g},${b})`;
}

function actualizarMapaComparar(modo) {
    if (!currentGeojson || !comparacionActual) return;
    if (!mapComparar) {
        mapComparar = L.map('map-comparar').setView([5.75, -73.0], 8);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { crossOrigin: true }).addTo(mapComparar);
        agregarControlExportar(mapComparar, '#obs-vista-comparar .actor-main', 'comparar');
    }
    if (currentLayerComparar) mapComparar.removeLayer(currentLayerComparar);

    const { cambios, margenB, enpA, enpB, anioA, anioB } = comparacionActual;
    const esEnp = modo === 'enpA' || modo === 'enpB';
    let enpValores, enpMin, enpMax;
    if (esEnp) {
        enpValores = modo === 'enpA' ? enpA : enpB;
        const vals = Object.values(enpValores).filter(v => v != null);
        enpMin = vals.length ? Math.min(...vals) : 0;
        enpMax = vals.length ? Math.max(...vals) : 1;
    }

    currentLayerComparar = L.geoJSON(currentGeojson, {
        style: feature => {
            const nombreRaw = feature.properties.MPIO_CNMBR;
            if (!nombreRaw) return { fillColor: '#cccccc', weight: 1, color: 'white', fillOpacity: 0.9 };
            const mun = normalizarNombre(nombreRaw);
            if (esEnp) {
                return { fillColor: colorPorEnp(enpValores[mun], enpMin, enpMax), weight: 1, opacity: 1, color: 'white', fillOpacity: 0.9 };
            }
            const c = cambios[mun];
            if (!c || !c.ganadorA || !c.ganadorB) return { fillColor: '#e9e9e9', weight: 1, opacity: 1, color: 'white', fillOpacity: 0.9 };
            const fillColor = c.cambio ? colorPartido(c.ganadorB.partido) : '#b0b0b0';
            return { fillColor, weight: 1, opacity: 1, color: 'white', fillOpacity: 0.9 };
        },
        onEachFeature: (feature, layer) => {
            const nombreRaw = feature.properties.MPIO_CNMBR;
            if (!nombreRaw) return;
            const mun = normalizarNombre(nombreRaw);
            if (esEnp) {
                const valor = enpValores[mun];
                const anio = modo === 'enpA' ? anioA : anioB;
                const texto = valor != null ? `ENP ${anio}: ${valor.toFixed(2)}` : `Sin datos suficientes (${anio})`;
                layer.bindTooltip(`<strong>${nombreRaw}</strong><br>${texto}`, { sticky: true });
                return;
            }
            const c = cambios[mun];
            if (!c || !c.ganadorA || !c.ganadorB) {
                layer.bindTooltip(`<strong>${nombreRaw}</strong><br>Sin datos en ambas elecciones`, { sticky: true });
                return;
            }
            const margen = margenB[mun];
            const margenTxt = margen != null ? `${margen.toFixed(1)}%` : 'N/D';
            layer.bindTooltip(
                `<strong>${nombreRaw}</strong><br>` +
                `${anioA}: ${c.ganadorA.partido} (${c.ganadorA.votos.toLocaleString('es-CO')} votos)<br>` +
                `${anioB}: ${c.ganadorB.partido} (${c.ganadorB.votos.toLocaleString('es-CO')} votos)<br>` +
                `Margen ${anioB}: ${margenTxt}${c.cambio ? ' — <b>cambió</b>' : ''}`,
                { sticky: true }
            );
        }
    }).addTo(mapComparar);

    mapComparar.fitBounds(currentLayerComparar.getBounds());
    setTimeout(() => mapComparar.invalidateSize(), 100);
}

// ==================== BÚSQUEDA ====================
function buscarMunicipio() {
    const nombre = document.getElementById('buscador-municipio').value.trim();
    if (!nombre || !currentGeojson) return;
    const nombreNorm = normalizarNombre(nombre);
    const feature = currentGeojson.features.find(f => normalizarNombre(f.properties.MPIO_CNMBR) === nombreNorm);
    if (feature) {
        const latlng = L.latLng(feature.geometry.coordinates[0][0][1], feature.geometry.coordinates[0][0][0]);
        mapSimple.setView(latlng, 12);
        currentLayerSimple?.eachLayer(layer => {
            if (layer.feature && normalizarNombre(layer.feature.properties.MPIO_CNMBR) === nombreNorm) {
                layer.openPopup();
                layer.setStyle({ weight: 3, color: '#ff0000', fillOpacity: 0.5 });
                setTimeout(() => { if (currentLayerSimple) currentLayerSimple.resetStyle(layer); }, 2000);
            }
        });
    } else {
        alert('Municipio no encontrado. Verifica el nombre.');
    }
}

// ==================== CAPA PUESTOS (Leaflet) ====================
function crearCapaPuestosVotacion() {
    if (capaPuestosVotacion) return capaPuestosVotacion;
    capaPuestosVotacion = L.layerGroup();
    console.log('Puestos cargados desde coordenadas:', puestosData.length);
    puestosData.forEach(p => {
        const key = `${p.municipio.toUpperCase().trim()}|${p.puesto.toUpperCase().trim()}`;
        const resultados = puestosResultados[key] || [];
        if (!resultados.length && puestosData.indexOf(p) < 5) console.log(`Sin resultados para: ${key}`);
        const marker = L.circleMarker([p.lat, p.lon], { radius: 5, color: '#2c3e50', fillColor: '#34495e', fillOpacity: 0.85, weight: 1 });
        const totalVotos = resultados.reduce((s, r) => s + r.VOTOS, 0);
        marker.bindPopup(`<strong>${p.puesto}</strong><br>Municipio: ${p.municipio}<br>Total votos: ${totalVotos.toLocaleString()}`);
        marker.on('click', () => mostrarDetallePuesto(p.municipio, p.puesto, resultados));
        marker.addTo(capaPuestosVotacion);
    });
    return capaPuestosVotacion;
}

function llenarSelectorMunicipios() {
    const selector = document.getElementById('municipio-selector-trayectoria');
    if (!currentGeojson) return;
    selector.innerHTML = '<option value="">Seleccione un municipio</option>' +
        currentGeojson.features.map(f => f.properties.MPIO_CNMBR).sort()
            .map(m => `<option value="${m}">${m}</option>`).join('');
}

// ==================== MAPAS COMPARACIÓN ====================
function dibujarMapaComparacion(datos, titulo, map) {
    const maxVotos = Math.max(...Object.values(datos), 1);
    const capa = L.geoJSON(currentGeojson, {
        style: feature => {
            const nombreRaw = feature.properties.MPIO_CNMBR;
            if (!nombreRaw) return { fillColor: '#cccccc', weight: 1, color: 'white', fillOpacity: 0.7 };
            const votos = datos[normalizarNombre(nombreRaw)] || 0;
            const i = votos / maxVotos;
            return { fillColor: `rgb(255, ${Math.floor(200*(1-i))}, ${Math.floor(200*(1-i))})`, weight: 1, opacity: 1, color: 'white', fillOpacity: 0.8 };
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
                document.getElementById('detalle-compare').innerHTML =
                    `<h4>${nombreRaw}</h4><p><strong>${comparacionValorA}</strong>: ${vA.toLocaleString()} votos</p><p><strong>${comparacionValorB}</strong>: ${vB.toLocaleString()} votos</p>`;
            });
        }
    }).addTo(map);
    map.fitBounds(capa.getBounds());
    return capa;
}

async function actualizarComparacion() {
    const tipoA  = document.getElementById('comparar-tipo-a').value;
    const valorA = document.getElementById('comparar-valor-a').value;
    const tipoB  = document.getElementById('comparar-tipo-b').value;
    const valorB = document.getElementById('comparar-valor-b').value;
    if (!valorA || !valorB) {
        document.getElementById('detalle-compare').innerHTML = '<p>Seleccione dos elementos para comparar.</p>';
        return;
    }
    comparacionValorA = valorA;
    comparacionValorB = valorB;
    comparacionDatosA = obtenerDatosComparacion(tipoA, valorA);
    comparacionDatosB = obtenerDatosComparacion(tipoB, valorB);

    document.getElementById('map-container-simple').style.display     = 'none';
    document.getElementById('map-container-comparison').style.display = 'flex';
    document.getElementById('comparar-controls').style.display        = 'inline-flex';

    if (currentLayerA) mapA.removeLayer(currentLayerA);
    if (currentLayerB) mapB.removeLayer(currentLayerB);
    currentLayerA = dibujarMapaComparacion(comparacionDatosA, valorA, mapA);
    currentLayerB = dibujarMapaComparacion(comparacionDatosB, valorB, mapB);

    setTimeout(() => { mapA.invalidateSize(); mapB.invalidateSize(); }, 100);
    document.getElementById('label-a').innerText = valorA;
    document.getElementById('label-b').innerText = valorB;
    console.log("Comparación finalizada");
}
