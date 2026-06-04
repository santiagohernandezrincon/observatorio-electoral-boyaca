// ==================== TOOLTIPS ====================
function getTooltipText(elementoNombre, esProvincia, tipoVista, partidoSeleccionado, candidatoSeleccionado, partidoGanadorSeleccionado, porcentajeActivo, candidatoFiltro) {
    if (esProvincia) {
        const datosProv = obtenerDatosProvincia(elementoNombre);
        if (!datosProv) return `<strong>${elementoNombre}</strong><br>Sin datos`;
        if (tipoVista === 'partido') {
            const ganador = datosProv.partidos.reduce((a,b) => a['VOTOS'] > b['VOTOS'] ? a : b);
            return `<strong>${elementoNombre}</strong><br>Ganador: ${ganador['PARNOMBRE']}<br>Votos: ${ganador['VOTOS'].toLocaleString()}`;
        } else if (tipoVista === 'partido_heat') {
            if (!partidoSeleccionado) return `<strong>${elementoNombre}</strong><br>Seleccione un partido`;
            const partidoRow = datosProv.partidos.find(p => p['PARNOMBRE'] === partidoSeleccionado);
            if (partidoRow) {
                if (porcentajeActivo) {
                    return `<strong>${elementoNombre}</strong><br>${partidoSeleccionado}: ${partidoRow['PORCENTAJE'].toFixed(1)}% (${partidoRow['VOTOS'].toLocaleString()} votos)`;
                } else {
                    return `<strong>${elementoNombre}</strong><br>${partidoSeleccionado}: ${partidoRow['VOTOS'].toLocaleString()} votos`;
                }
            } else {
                return `<strong>${elementoNombre}</strong><br>${partidoSeleccionado}: 0 votos`;
            }
        } else if (tipoVista === 'candidato_heat') {
            if (!candidatoSeleccionado) return `<strong>${elementoNombre}</strong><br>Seleccione un candidato`;
            const candidatoRow = datosProv.candidatos.find(c => c['CANNOMBRE'] === candidatoSeleccionado);
            if (candidatoRow) {
                if (porcentajeActivo) {
                    const totalProv = datosProv.candidatos.reduce((s, c) => s + c['VOTOS'], 0);
                    const pct = totalProv > 0 ? (candidatoRow['VOTOS'] / totalProv * 100).toFixed(1) : 0;
                    return `<strong>${elementoNombre}</strong><br>${candidatoSeleccionado}: ${pct}% (${candidatoRow['VOTOS'].toLocaleString()} votos)`;
                } else {
                    return `<strong>${elementoNombre}</strong><br>${candidatoSeleccionado}: ${candidatoRow['VOTOS'].toLocaleString()} votos`;
                }
            } else {
                return `<strong>${elementoNombre}</strong><br>${candidatoSeleccionado}: 0 votos`;
            }
        } else if (tipoVista === 'candidato_ganador') {
            const ganador = datosProv.candidatos.reduce((a,b) => a['VOTOS'] > b['VOTOS'] ? a : b);
            if (!ganador) return `<strong>${elementoNombre}</strong><br>Sin datos`;
            if (candidatoFiltro && ganador['CANNOMBRE'] !== candidatoFiltro) return `<strong>${elementoNombre}</strong><br>Sin candidato filtrado`;
            return `<strong>${elementoNombre}</strong><br>Candidato ganador: ${ganador['CANNOMBRE']}<br>Votos: ${ganador['VOTOS'].toLocaleString()}`;
        } else if (tipoVista === 'candidato_ganador_por_partido') {
            if (!partidoGanadorSeleccionado) return `<strong>${elementoNombre}</strong><br>Seleccione un partido`;
            const candidatosPartido = datosProv.candidatos.filter(c => c['PARNOMBRE'] === partidoGanadorSeleccionado);
            if (candidatosPartido.length === 0) return `<strong>${elementoNombre}</strong><br>No hay candidatos de ${partidoGanadorSeleccionado}`;
            const ganador = candidatosPartido.reduce((a,b) => a['VOTOS'] > b['VOTOS'] ? a : b);
            return `<strong>${elementoNombre}</strong><br>Candidato ganador de ${partidoGanadorSeleccionado}: ${ganador['CANNOMBRE']}<br>Votos: ${ganador['VOTOS'].toLocaleString()}`;
        }
    } else {
        if (tipoVista === 'partido') {
            const filas = currentPartidoData.filter(row => normalizarNombre(row['MUNNOMBRE']) === elementoNombre);
            if (filas.length === 0) return `<strong>${elementoNombre}</strong><br>Sin datos`;
            const ganador = filas.reduce((a,b) => a['VOTOS'] > b['VOTOS'] ? a : b);
            return `<strong>${elementoNombre}</strong><br>Ganador: ${ganador['PARNOMBRE']}<br>Votos: ${ganador['VOTOS'].toLocaleString()}`;
        } else if (tipoVista === 'partido_heat') {
            if (!partidoSeleccionado) return `<strong>${elementoNombre}</strong><br>Seleccione un partido`;
            const filas = currentPartidoData.filter(row => normalizarNombre(row['MUNNOMBRE']) === elementoNombre);
            const partidoRow = filas.find(f => f['PARNOMBRE'] === partidoSeleccionado);
            if (partidoRow) {
                if (porcentajeActivo) {
                    return `<strong>${elementoNombre}</strong><br>${partidoSeleccionado}: ${partidoRow['PORCENTAJE'].toFixed(1)}% (${partidoRow['VOTOS'].toLocaleString()} votos)`;
                } else {
                    return `<strong>${elementoNombre}</strong><br>${partidoSeleccionado}: ${partidoRow['VOTOS'].toLocaleString()} votos`;
                }
            } else {
                return `<strong>${elementoNombre}</strong><br>${partidoSeleccionado}: 0 votos`;
            }
        } else if (tipoVista === 'candidato_heat') {
            if (!candidatoSeleccionado) return `<strong>${elementoNombre}</strong><br>Seleccione un candidato`;
            const filas = currentCandidatoData.filter(row => normalizarNombre(row['MUNNOMBRE']) === elementoNombre);
            const candidatoRow = filas.find(f => f['CANNOMBRE'] === candidatoSeleccionado);
            if (candidatoRow) {
                if (porcentajeActivo) {
                    const totalMun = filas.reduce((s, f) => s + f['VOTOS'], 0);
                    const pct = totalMun > 0 ? (candidatoRow['VOTOS'] / totalMun * 100).toFixed(1) : 0;
                    return `<strong>${elementoNombre}</strong><br>${candidatoSeleccionado}: ${pct}% (${candidatoRow['VOTOS'].toLocaleString()} votos)`;
                } else {
                    return `<strong>${elementoNombre}</strong><br>${candidatoSeleccionado}: ${candidatoRow['VOTOS'].toLocaleString()} votos`;
                }
            } else {
                return `<strong>${elementoNombre}</strong><br>${candidatoSeleccionado}: 0 votos`;
            }
        } else if (tipoVista === 'candidato_ganador') {
            const ganador = candidatoGanadorPorMunicipio[elementoNombre];
            if (!ganador) return `<strong>${elementoNombre}</strong><br>Sin datos`;
            if (candidatoFiltro && ganador['CANNOMBRE'] !== candidatoFiltro) return `<strong>${elementoNombre}</strong><br>Sin candidato filtrado`;
            return `<strong>${elementoNombre}</strong><br>Candidato ganador: ${ganador['CANNOMBRE']}<br>Votos: ${ganador['VOTOS'].toLocaleString()}`;
        } else if (tipoVista === 'candidato_ganador_por_partido') {
            if (!partidoGanadorSeleccionado) return `<strong>${elementoNombre}</strong><br>Seleccione un partido`;
            const ganador = ganadorPorPartidoPorMunicipio[partidoGanadorSeleccionado]?.[elementoNombre];
            if (!ganador) return `<strong>${elementoNombre}</strong><br>No hay candidatos de ${partidoGanadorSeleccionado}`;
            return `<strong>${elementoNombre}</strong><br>Candidato ganador de ${partidoGanadorSeleccionado}: ${ganador['CANNOMBRE']}<br>Votos: ${ganador['VOTOS'].toLocaleString()}`;
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
            const ganadorProv = datosProv.candidatos.reduce((a,b) => a['VOTOS'] > b['VOTOS'] ? a : b, null);
            if (!ganadorProv) return '#cccccc';
            const partidoRow = currentPartidoData.find(p => p['PARNOMBRE'] === ganadorProv['PARNOMBRE']);
            return partidoRow ? partidoRow.COLOR_BASE : '#95a5a6';
        } else if (tipoVista === 'candidato_ganador_por_partido') {
            if (!partidoGanadorSeleccionado) return '#cccccc';
            const candidatosPartido = datosProv.candidatos.filter(c => c['PARNOMBRE'] === partidoGanadorSeleccionado);
            if (candidatosPartido.length === 0) return '#cccccc';
            const ganador = candidatosPartido.reduce((a,b) => a['VOTOS'] > b['VOTOS'] ? a : b);
            return getColorCandidato(ganador['CANNOMBRE']);
        }
    } else {
        if (tipoVista === 'partido' || tipoVista === 'partido_heat') {
            filas = currentPartidoData.filter(row => normalizarNombre(row['MUNNOMBRE']) === nombreElemento);
        } else if (tipoVista === 'candidato_heat') {
            filas = currentCandidatoData.filter(row => normalizarNombre(row['MUNNOMBRE']) === nombreElemento);
        } else if (tipoVista === 'candidato_ganador') {
            const ganador = candidatoGanadorPorMunicipio[nombreElemento];
            if (!ganador) return '#cccccc';
            const partidoRow = currentPartidoData.find(p => p['PARNOMBRE'] === ganador['PARNOMBRE']);
            return partidoRow ? partidoRow.COLOR_BASE : '#95a5a6';
        } else if (tipoVista === 'candidato_ganador_por_partido') {
            if (!partidoGanadorSeleccionado) return '#cccccc';
            const ganador = ganadorPorPartidoPorMunicipio[partidoGanadorSeleccionado]?.[nombreElemento];
            if (!ganador) return '#cccccc';
            return getColorCandidato(ganador['CANNOMBRE']);
        }
    }

    if (!filas || filas.length === 0) return '#cccccc';

    if (tipoVista === 'partido') {
        let ganador = filas.reduce((a,b) => a['VOTOS'] > b['VOTOS'] ? a : b);
        return ganador.COLOR_BASE || '#95a5a6';
    } else if (tipoVista === 'partido_heat') {
        if (!partidoSeleccionado) return '#cccccc';
        const partidoRow = filas.find(f => f['PARNOMBRE'] === partidoSeleccionado);
        if (!partidoRow) return '#e9e9e9';
        let valor;
        if (porcentajeActivo) {
            valor = partidoRow['PORCENTAJE'] / 100;
        } else {
            let maxVotosPartido = 0;
            if (esProvincia) {
                for (const prov of Object.keys(provinciasData)) {
                    const datosProv = obtenerDatosProvincia(prov);
                    if (datosProv) {
                        const row = datosProv.partidos.find(p => p['PARNOMBRE'] === partidoSeleccionado);
                        if (row && row['VOTOS'] > maxVotosPartido) maxVotosPartido = row['VOTOS'];
                    }
                }
            } else {
                for (const mun of Object.keys(candidatoGanadorPorMunicipio)) {
                    const row = currentPartidoData.find(p => p['PARNOMBRE'] === partidoSeleccionado && normalizarNombre(p['MUNNOMBRE']) === mun);
                    if (row && row['VOTOS'] > maxVotosPartido) maxVotosPartido = row['VOTOS'];
                }
            }
            valor = maxVotosPartido > 0 ? partidoRow['VOTOS'] / maxVotosPartido : 0;
        }
        const colorBase = partidoRow.COLOR_BASE || '#3498db';
        const r = parseInt(colorBase.slice(1,3), 16);
        const g = parseInt(colorBase.slice(3,5), 16);
        const b = parseInt(colorBase.slice(5,7), 16);
        const factor = 1 - valor;
        const newR = Math.floor(r * factor);
        const newG = Math.floor(g * factor);
        const newB = Math.floor(b * factor);
        return `rgb(${newR}, ${newG}, ${newB})`;
    } else if (tipoVista === 'candidato_heat') {
        if (!candidatoSeleccionado) return '#cccccc';
        const candidatoRow = filas.find(f => f['CANNOMBRE'] === candidatoSeleccionado);
        if (!candidatoRow) return '#e9e9e9';
        let valor;
        if (porcentajeActivo) {
            const totalElemento = filas.reduce((sum, f) => sum + f['VOTOS'], 0);
            valor = totalElemento > 0 ? candidatoRow['VOTOS'] / totalElemento : 0;
        } else {
            let maxVotosCandidato = 0;
            if (esProvincia) {
                for (const prov of Object.keys(provinciasData)) {
                    const datosProv = obtenerDatosProvincia(prov);
                    if (datosProv) {
                        const row = datosProv.candidatos.find(c => c['CANNOMBRE'] === candidatoSeleccionado);
                        if (row && row['VOTOS'] > maxVotosCandidato) maxVotosCandidato = row['VOTOS'];
                    }
                }
            } else {
                for (const mun of Object.keys(candidatoGanadorPorMunicipio)) {
                    const row = currentCandidatoData.find(c => c['CANNOMBRE'] === candidatoSeleccionado && normalizarNombre(c['MUNNOMBRE']) === mun);
                    if (row && row['VOTOS'] > maxVotosCandidato) maxVotosCandidato = row['VOTOS'];
                }
            }
            valor = maxVotosCandidato > 0 ? candidatoRow['VOTOS'] / maxVotosCandidato : 0;
        }
        const r = Math.floor(179 + 76 * valor);
        const g = Math.floor(179 - 179 * valor);
        const b = Math.floor(179 - 179 * valor);
        return `rgb(${r}, ${g}, ${b})`;
    }
    return '#cccccc';
}

// ==================== MAPA SIMPLE ====================
function actualizarMapaSimple() {
    if (!currentGeojson || !currentPartidoData) return;
    if (currentLayerSimple) mapSimple.removeLayer(currentLayerSimple);

    const tipoVista = document.getElementById('tipo-vista').value;
    const partidoSeleccionado = document.getElementById('partido-selector').value;
    const candidatoSeleccionado = document.getElementById('candidato-selector').value;
    const partidoGanadorSeleccionado = document.getElementById('partido-ganador-selector').value;
    const porcentajeActivo = mapaCalorPorcentaje && (tipoVista === 'partido_heat' || tipoVista === 'candidato_heat');
    const candidatoFiltro = document.getElementById('candidato-ganador-filtro').value;

    const escala = document.getElementById('escala-selector') ? document.getElementById('escala-selector').value : 'municipio';
    escalaActual = escala;

    document.getElementById('partido-selector-container').style.display = (tipoVista === 'partido_heat') ? 'inline-flex' : 'none';
    document.getElementById('candidato-selector-container').style.display = (tipoVista === 'candidato_heat') ? 'inline-flex' : 'none';
    document.getElementById('partido-ganador-container').style.display = (tipoVista === 'candidato_ganador_por_partido') ? 'inline-flex' : 'none';
    document.getElementById('candidato-ganador-filtro-container').style.display = (tipoVista === 'candidato_ganador') ? 'inline-flex' : 'none';
    document.getElementById('heatmap-porcentaje-container').style.display = (tipoVista === 'partido_heat' || tipoVista === 'candidato_heat') ? 'inline-flex' : 'none';
    document.getElementById('comparar-controls').style.display = 'none';
    document.getElementById('map-container-simple').style.display = 'flex';
    document.getElementById('map-container-comparison').style.display = 'none';

    currentLayerSimple = L.geoJSON(currentGeojson, {
        style: (feature) => {
            const nombreRaw = feature.properties.MPIO_CNMBR;
            if (!nombreRaw) return { fillColor: '#cccccc', weight: 1, color: 'white', fillOpacity: 0.9 };
            const nombre = normalizarNombre(nombreRaw);
            let color;
            if (escalaActual === 'provincia') {
                const provincia = obtenerProvinciaDeMunicipio(nombre);
                if (!provincia) return { fillColor: '#cccccc', weight: 1, color: 'white', fillOpacity: 0.9 };
                color = getColorParaElemento(provincia, true, tipoVista, partidoSeleccionado, candidatoSeleccionado, partidoGanadorSeleccionado, porcentajeActivo);
            } else {
                color = getColorParaElemento(nombre, false, tipoVista, partidoSeleccionado, candidatoSeleccionado, partidoGanadorSeleccionado, porcentajeActivo);
            }
            return { fillColor: color, weight: 1, opacity: 1, color: 'white', fillOpacity: 0.9 };
        },
        onEachFeature: (feature, layer) => {
            const nombreRaw = feature.properties.MPIO_CNMBR;
            if (!nombreRaw) return;
            const nombre = normalizarNombre(nombreRaw);
            let tooltipText;
            if (escalaActual === 'provincia') {
                const provincia = obtenerProvinciaDeMunicipio(nombre);
                if (provincia) {
                    tooltipText = getTooltipText(provincia, true, tipoVista, partidoSeleccionado, candidatoSeleccionado, partidoGanadorSeleccionado, porcentajeActivo, candidatoFiltro);
                } else {
                    tooltipText = `<strong>${nombreRaw}</strong><br>No pertenece a provincia conocida`;
                }
            } else {
                tooltipText = getTooltipText(nombre, false, tipoVista, partidoSeleccionado, candidatoSeleccionado, partidoGanadorSeleccionado, porcentajeActivo, candidatoFiltro);
            }
            layer.bindTooltip(tooltipText, { sticky: true });

            layer.on('click', () => {
                if (escalaActual === 'provincia') {
                    const provincia = obtenerProvinciaDeMunicipio(nombre);
                    if (provincia) {
                        const datosProv = obtenerDatosProvincia(provincia);
                        if (datosProv) {
                            mostrarDetalleProvincia(provincia, datosProv);
                        } else {
                            mostrarDetalleMunicipio(nombreRaw, currentPartidoData.filter(row => normalizarNombre(row['MUNNOMBRE']) === nombre), currentCandidatoData.filter(row => normalizarNombre(row['MUNNOMBRE']) === nombre), tipoVista);
                        }
                    } else {
                        mostrarDetalleMunicipio(nombreRaw, currentPartidoData.filter(row => normalizarNombre(row['MUNNOMBRE']) === nombre), currentCandidatoData.filter(row => normalizarNombre(row['MUNNOMBRE']) === nombre), tipoVista);
                    }
                } else {
                    mostrarDetalleMunicipio(nombreRaw, currentPartidoData.filter(row => normalizarNombre(row['MUNNOMBRE']) === nombre), currentCandidatoData.filter(row => normalizarNombre(row['MUNNOMBRE']) === nombre), tipoVista);
                }
            });
        }
    }).addTo(mapSimple);
    mapSimple.fitBounds(currentLayerSimple.getBounds());

    const chkPuestos = document.getElementById('toggle-puestos');
    if (chkPuestos && chkPuestos.checked && capaPuestosVotacion) {
        capaPuestosVotacion.addTo(mapSimple);
    }

    actualizarResumenDepartamental(currentPartidoData, candidatoEspecificoActual);
}

// ==================== BÚSQUEDA DE MUNICIPIO ====================
function buscarMunicipio() {
    const nombre = document.getElementById('buscador-municipio').value.trim();
    if (!nombre) return;
    const nombreNormalizado = normalizarNombre(nombre);
    if (!currentGeojson) return;
    let featureEncontrado = null;
    for (let f of currentGeojson.features) {
        const nombreGeo = normalizarNombre(f.properties.MPIO_CNMBR);
        if (nombreGeo === nombreNormalizado) { featureEncontrado = f; break; }
    }
    if (featureEncontrado) {
        const latlng = L.latLng(featureEncontrado.geometry.coordinates[0][0][1], featureEncontrado.geometry.coordinates[0][0][0]);
        mapSimple.setView(latlng, 12);
        if (currentLayerSimple) {
            currentLayerSimple.eachLayer(layer => {
                if (layer.feature && normalizarNombre(layer.feature.properties.MPIO_CNMBR) === nombreNormalizado) {
                    layer.openPopup();
                    layer.setStyle({ weight: 3, color: '#ff0000', fillOpacity: 0.5 });
                    setTimeout(() => { if (currentLayerSimple) currentLayerSimple.resetStyle(layer); }, 2000);
                }
            });
        }
    } else {
        alert('Municipio no encontrado. Verifica el nombre.');
    }
}

// ==================== CAPA PUESTOS DE VOTACIÓN (Leaflet) ====================
function crearCapaPuestosVotacion() {
    if (capaPuestosVotacion) return capaPuestosVotacion;
    capaPuestosVotacion = L.layerGroup();

    console.log('Puestos cargados desde coordenadas:', puestosData.length);
    puestosData.forEach(p => {
        const municipioNorm = p.municipio.toUpperCase().trim();
        const puestoNorm = p.puesto.toUpperCase().trim();
        const key = `${municipioNorm}|${puestoNorm}`;
        const resultados = puestosResultados[key] || [];

        if (!resultados.length && puestosData.indexOf(p) < 5) {
            console.log(`No se encontraron resultados para: ${key}`);
        }

        const marker = L.circleMarker([p.lat, p.lon], {
            radius: 5,
            color: '#2c3e50',
            fillColor: '#34495e',
            fillOpacity: 0.85,
            weight: 1
        });
        const totalVotos = resultados.reduce((s, r) => s + r.VOTOS, 0);
        marker.bindPopup(`<strong>${p.puesto}</strong><br>Municipio: ${p.municipio}<br>Total votos: ${totalVotos.toLocaleString()}`);
        marker.on('click', () => {
            if (resultados.length) {
                mostrarDetallePuesto(p.municipio, p.puesto, resultados);
            } else {
                mostrarDetallePuesto(p.municipio, p.puesto, []);
            }
        });
        marker.addTo(capaPuestosVotacion);
    });
    return capaPuestosVotacion;
}

function llenarSelectorMunicipios() {
    const selector = document.getElementById('municipio-selector-trayectoria');
    if (!currentGeojson) return;
    const municipios = currentGeojson.features.map(f => f.properties.MPIO_CNMBR).sort();
    selector.innerHTML = '<option value="">Seleccione un municipio</option>' +
        municipios.map(m => `<option value="${m}">${m}</option>`).join('');
}

// ==================== MAPAS DE COMPARACIÓN ====================
function dibujarMapaComparacion(datos, titulo, map) {
    const maxVotos = Math.max(...Object.values(datos), 1);
    const capa = L.geoJSON(currentGeojson, {
        style: (feature) => {
            const nombreRaw = feature.properties.MPIO_CNMBR;
            if (!nombreRaw) return { fillColor: '#cccccc', weight: 1, color: 'white', fillOpacity: 0.7 };
            const nombre = normalizarNombre(nombreRaw);
            const votos = datos[nombre] || 0;
            const intensidad = votos / maxVotos;
            const r = 255;
            const g = Math.floor(200 * (1 - intensidad));
            const b = Math.floor(200 * (1 - intensidad));
            const color = `rgb(${r}, ${g}, ${b})`;
            return { fillColor: color, weight: 1, opacity: 1, color: 'white', fillOpacity: 0.8 };
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
                document.getElementById('detalle-compare').innerHTML = `<h4>${nombreRaw}</h4>
                    <p><strong>${comparacionValorA}</strong>: ${vA.toLocaleString()} votos</p>
                    <p><strong>${comparacionValorB}</strong>: ${vB.toLocaleString()} votos</p>`;
            });
        }
    }).addTo(map);
    map.fitBounds(capa.getBounds());
    return capa;
}

async function actualizarComparacion() {
    console.log("actualizarComparacion iniciada");
    const tipoA = document.getElementById('comparar-tipo-a').value;
    const valorA = document.getElementById('comparar-valor-a').value;
    const tipoB = document.getElementById('comparar-tipo-b').value;
    const valorB = document.getElementById('comparar-valor-b').value;

    if (!valorA || !valorB) {
        document.getElementById('detalle-compare').innerHTML = '<p>Seleccione dos elementos para comparar.</p>';
        return;
    }

    comparacionValorA = valorA;
    comparacionValorB = valorB;
    comparacionDatosA = obtenerDatosComparacion(tipoA, valorA);
    comparacionDatosB = obtenerDatosComparacion(tipoB, valorB);

    document.getElementById('map-container-simple').style.display = 'none';
    document.getElementById('map-container-comparison').style.display = 'flex';
    document.getElementById('comparar-controls').style.display = 'inline-flex';

    if (currentLayerA) mapA.removeLayer(currentLayerA);
    if (currentLayerB) mapB.removeLayer(currentLayerB);

    currentLayerA = dibujarMapaComparacion(comparacionDatosA, valorA, mapA);
    currentLayerB = dibujarMapaComparacion(comparacionDatosB, valorB, mapB);

    setTimeout(() => {
        mapA.invalidateSize();
        mapB.invalidateSize();
    }, 100);

    document.getElementById('label-a').innerText = valorA;
    document.getElementById('label-b').innerText = valorB;
    console.log("Comparación finalizada");
}
