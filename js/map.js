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
            const g = datosProv.candidatos.reduce((a, b) => a['VOTOS'] > b['VOTOS'] ? a : b);
            if (!g) return `<strong>${elementoNombre}</strong><br>Sin datos`;
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
    return `<strong>${elementoNombre}</strong><br>Sin datos`;
}

// ==================== COLORES DEL MAPA ====================
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
            const g = datosProv.candidatos.reduce((a, b) => a['VOTOS'] > b['VOTOS'] ? a : b, null);
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
        if (tipoVista === 'partido' || tipoVista === 'partido_heat') {
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

    if (!filas || !filas.length) return '#cccccc';

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
    return '#cccccc';
}

// ==================== MAPA SIMPLE (Leaflet) ====================
function actualizarMapaSimple() {
    if (!currentGeojson || !currentPartidoData) return;
    if (currentLayerSimple) mapSimple.removeLayer(currentLayerSimple);

    const tipoVista               = document.getElementById('tipo-vista').value;
    const partidoSeleccionado     = document.getElementById('partido-selector').value;
    const candidatoSeleccionado   = document.getElementById('candidato-selector').value;
    const partidoGanadorSel       = document.getElementById('partido-ganador-selector').value;
    const porcentajeActivo        = mapaCalorPorcentaje && (tipoVista === 'partido_heat' || tipoVista === 'candidato_heat');
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

    currentLayerSimple = L.geoJSON(currentGeojson, {
        style: feature => {
            const nombreRaw = feature.properties.MPIO_CNMBR;
            if (!nombreRaw) return { fillColor: '#cccccc', weight: 1, color: 'white', fillOpacity: 0.9 };
            const nombre = normalizarNombre(nombreRaw);
            let color;
            if (escalaActual === 'provincia') {
                const prov = obtenerProvinciaDeMunicipio(nombre);
                if (!prov) return { fillColor: '#cccccc', weight: 1, color: 'white', fillOpacity: 0.9 };
                color = getColorParaElemento(prov, true, tipoVista, partidoSeleccionado, candidatoSeleccionado, partidoGanadorSel, porcentajeActivo);
            } else {
                color = getColorParaElemento(nombre, false, tipoVista, partidoSeleccionado, candidatoSeleccionado, partidoGanadorSel, porcentajeActivo);
            }
            return { fillColor: color, weight: 1, opacity: 1, color: 'white', fillOpacity: 0.9 };
        },
        onEachFeature: (feature, layer) => {
            const nombreRaw = feature.properties.MPIO_CNMBR;
            if (!nombreRaw) return;
            const nombre = normalizarNombre(nombreRaw);
            let tooltipText;
            if (escalaActual === 'provincia') {
                const prov = obtenerProvinciaDeMunicipio(nombre);
                tooltipText = prov
                    ? getTooltipText(prov, true, tipoVista, partidoSeleccionado, candidatoSeleccionado, partidoGanadorSel, porcentajeActivo, candidatoFiltro)
                    : `<strong>${nombreRaw}</strong><br>No pertenece a provincia conocida`;
            } else {
                tooltipText = getTooltipText(nombre, false, tipoVista, partidoSeleccionado, candidatoSeleccionado, partidoGanadorSel, porcentajeActivo, candidatoFiltro);
            }
            layer.bindTooltip(tooltipText, { sticky: true });
            layer.on('click', () => {
                const partidosMun    = currentPartidoData.filter(row => normalizarNombre(row['MUNNOMBRE']) === nombre);
                const candidatosMun  = currentCandidatoData.filter(row => normalizarNombre(row['MUNNOMBRE']) === nombre);
                if (escalaActual === 'provincia') {
                    const prov = obtenerProvinciaDeMunicipio(nombre);
                    if (prov) {
                        const dp = obtenerDatosProvincia(prov);
                        if (dp) { mostrarDetalleProvincia(prov, dp); return; }
                    }
                }
                mostrarDetalleMunicipio(nombreRaw, partidosMun, candidatosMun, tipoVista);
            });
        }
    }).addTo(mapSimple);
    mapSimple.fitBounds(currentLayerSimple.getBounds());

    const chkPuestos = document.getElementById('toggle-puestos');
    if (chkPuestos?.checked && capaPuestosVotacion) capaPuestosVotacion.addTo(mapSimple);

    actualizarResumenDepartamental(currentPartidoData, candidatoEspecificoActual);
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
