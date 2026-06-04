// ==================== RESUMEN DEPARTAMENTAL ====================
function actualizarResumenDepartamental(data, candidatoEspecifico = null) {
    const resumenDiv = document.getElementById('resumen-contenido');
    if (!resumenDiv) return;
    const votosPorPartido = {};
    let totalGeneral = 0;
    data.forEach(row => {
        const partido = row['PARNOMBRE'];
        const votos = row['VOTOS'];
        totalGeneral += votos;
        if (!votosPorPartido[partido]) votosPorPartido[partido] = 0;
        votosPorPartido[partido] += votos;
    });
    const topPartidos = Object.entries(votosPorPartido).sort((a,b) => b[1] - a[1]).slice(0, 5);
    let html = `<p><strong>Total votos válidos:</strong> ${totalGeneral.toLocaleString()}</p><ul>`;
    topPartidos.forEach(([partido, votos]) => {
        const pct = (votos / totalGeneral * 100).toFixed(1);
        html += `<li>${partido}: ${votos.toLocaleString()} votos (${pct}%)</li>`;
    });
    html += `</ul>`;

    if (candidatoEspecifico && currentCandidatoData) {
        let votosCandidato = 0;
        const votosPorMunicipio = {};
        currentCandidatoData.forEach(row => {
            if (row['CANNOMBRE'] === candidatoEspecifico) {
                votosCandidato += row['VOTOS'];
                const municipio = row['MUNNOMBRE'];
                if (!votosPorMunicipio[municipio]) votosPorMunicipio[municipio] = 0;
                votosPorMunicipio[municipio] += row['VOTOS'];
            }
        });
        const porcentajeCandidato = totalGeneral > 0 ? (votosCandidato / totalGeneral * 100).toFixed(1) : 0;
        html += `<hr><p><strong>🏆 ${candidatoEspecifico}</strong><br>Votos totales: ${votosCandidato.toLocaleString()} (${porcentajeCandidato}% de votos válidos)</p>`;
        const topMunicipios = Object.entries(votosPorMunicipio).sort((a,b) => b[1] - a[1]).slice(0, 5);
        if (topMunicipios.length) {
            html += `<p><strong>Municipios con mayor votación:</strong></p><ul>`;
            topMunicipios.forEach(([mun, votos]) => {
                html += `<li>${mun}: ${votos.toLocaleString()} votos</li>`;
            });
            html += `</ul>`;
        }
    }
    resumenDiv.innerHTML = html;
}

// ==================== PANELES DE DETALLE ====================
function mostrarDetalleProvincia(provincia, datosProv) {
    const div = document.getElementById('detalle-municipio');
    if (!datosProv || (!datosProv.partidos.length && !datosProv.candidatos.length)) {
        div.innerHTML = '<p>No hay datos para esta provincia.</p>';
        ultimoElementoDetalle = null;
        return;
    }

    ultimoElementoDetalle = { nombre: provincia, tipo: 'provincia', datosPartidos: datosProv.partidos, datosCandidatos: datosProv.candidatos };

    let html = `<h4>${provincia}</h4>
                <p><strong>Total votos válidos:</strong> ${datosProv.totalVotos.toLocaleString()}</p>
                <div id="partidos-lista">`;
    const partidosOrdenados = [...datosProv.partidos].sort((a,b) => b['VOTOS'] - a['VOTOS']);
    partidosOrdenados.forEach(p => {
        const pct = (p['VOTOS'] / datosProv.totalVotos * 100).toFixed(1);
        html += `<div class="partido-item" data-partido="${p['PARNOMBRE']}">${p['PARNOMBRE']} (${p['VOTOS'].toLocaleString()} votos, ${pct}%)</div>
                 <div class="candidatos-list" data-partido="${p['PARNOMBRE']}" style="display:none;"></div>`;
    });
    html += `</div>`;
    div.innerHTML = html;

    const candidatosPorPartido = {};
    datosProv.candidatos.forEach(c => {
        if (!candidatosPorPartido[c['PARNOMBRE']]) candidatosPorPartido[c['PARNOMBRE']] = [];
        candidatosPorPartido[c['PARNOMBRE']].push({ nombre: c['CANNOMBRE'], votos: c['VOTOS'] });
    });
    for (let p in candidatosPorPartido) candidatosPorPartido[p].sort((a,b) => b.votos - a.votos);

    document.querySelectorAll('.partido-item').forEach(el => {
        const partido = el.getAttribute('data-partido');
        el.addEventListener('click', () => {
            const targetList = document.querySelector(`.candidatos-list[data-partido="${partido}"]`);
            if (targetList.style.display === 'none') {
                if (targetList.innerHTML === '') {
                    const candidatos = candidatosPorPartido[partido] || [];
                    if (candidatos.length) {
                        targetList.innerHTML = candidatos.map(c => `<div class="candidato-item"><a href="#" onclick="cambiarAMapaCalorCandidato('${c.nombre.replace(/'/g, "\\'")}'); return false;">${c.nombre}</a> (${c.votos.toLocaleString()} votos)</div>`).join('');
                    } else {
                        targetList.innerHTML = '<div class="candidato-item">No hay candidatos individuales</div>';
                    }
                }
                targetList.style.display = 'block';
            } else {
                targetList.style.display = 'none';
            }
        });
    });

    let datosGrafico = partidosOrdenados.map(p => ({ nombre: p['PARNOMBRE'], votos: p['VOTOS'], partido: p['PARNOMBRE'] }));
    if (filtrarConsejos) datosGrafico = datosGrafico.filter(d => !d.nombre.toUpperCase().includes('CONSEJO COMUNITARIO'));
    dibujarGrafico(datosGrafico, provincia, false);
}

function mostrarDetalleMunicipio(municipioNombre, partidosMunicipio, candidatosMunicipio, tipoVista) {
    const div = document.getElementById('detalle-municipio');
    if (!partidosMunicipio.length && !candidatosMunicipio.length) {
        div.innerHTML = '<p>No hay datos para este municipio.</p>';
        ultimoElementoDetalle = null;
        return;
    }

    ultimoElementoDetalle = { nombre: municipioNombre, tipo: 'municipio', datosPartidos: partidosMunicipio, datosCandidatos: candidatosMunicipio };

    if (tipoVista === 'candidato_heat' || tipoVista === 'candidato_ganador' || tipoVista === 'candidato_ganador_por_partido') {
        let html = `<h4>${municipioNombre}</h4>
                    <p><strong>Total votos válidos:</strong> ${candidatosMunicipio.reduce((s,f)=>s+f['VOTOS'],0).toLocaleString()}</p>
                    <table style="width:100%"><thead><th>Candidato</th><th>Votos</th></thead><tbody>`;
        const ordenado = [...candidatosMunicipio].sort((a,b)=>b['VOTOS']-a['VOTOS']);
        ordenado.forEach(f => {
            const nombreEscapado = f['CANNOMBRE'].replace(/'/g, "\\'");
            html += `<tr><td><a href="#" onclick="cambiarAMapaCalorCandidato('${nombreEscapado}'); return false;">${f['CANNOMBRE']}</a></td><td style="text-align:right">${f['VOTOS'].toLocaleString()}</td></tr>`;
        });
        html += `</tbody></table>`;
        div.innerHTML = html;
        let datosGrafico = ordenado.map(f => ({ nombre: f['CANNOMBRE'], votos: f['VOTOS'], partido: f['PARNOMBRE'] }));
        if (filtrarConsejos) datosGrafico = datosGrafico.filter(d => !d.nombre.toUpperCase().includes('CONSEJO COMUNITARIO'));
        dibujarGrafico(datosGrafico, municipioNombre, true);
        return;
    }

    const partidosMap = new Map();
    partidosMunicipio.forEach(f => {
        if (!partidosMap.has(f['PARNOMBRE'])) partidosMap.set(f['PARNOMBRE'], f['VOTOS']);
    });
    const partidosOrdenados = Array.from(partidosMap.entries()).sort((a,b)=>b[1]-a[1]);

    let html = `<h4>${municipioNombre}</h4>
                <p><strong>Total votos válidos:</strong> ${partidosMunicipio[0]['TOTAL_VOTOS'].toLocaleString()}</p>
                <div id="partidos-lista">`;
    partidosOrdenados.forEach(([partido, votos]) => {
        const pct = (votos / partidosMunicipio[0]['TOTAL_VOTOS'] * 100).toFixed(1);
        html += `<div class="partido-item" data-partido="${partido}">${partido} (${votos.toLocaleString()} votos, ${pct}%)</div>
                 <div class="candidatos-list" data-partido="${partido}" style="display:none;"></div>`;
    });
    html += `</div>`;
    div.innerHTML = html;

    const candidatosPorPartido = {};
    candidatosMunicipio.forEach(row => {
        if (!candidatosPorPartido[row['PARNOMBRE']]) candidatosPorPartido[row['PARNOMBRE']] = [];
        candidatosPorPartido[row['PARNOMBRE']].push({ nombre: row['CANNOMBRE'], votos: row['VOTOS'] });
    });
    for (let p in candidatosPorPartido) candidatosPorPartido[p].sort((a,b)=>b.votos - a.votos);

    document.querySelectorAll('.partido-item').forEach(el => {
        const partido = el.getAttribute('data-partido');
        el.addEventListener('click', () => {
            const targetList = document.querySelector(`.candidatos-list[data-partido="${partido}"]`);
            if (targetList.style.display === 'none') {
                if (targetList.innerHTML === '') {
                    const candidatos = candidatosPorPartido[partido] || [];
                    if (candidatos.length) {
                        targetList.innerHTML = candidatos.map(c => `<div class="candidato-item"><a href="#" onclick="cambiarAMapaCalorCandidato('${c.nombre.replace(/'/g, "\\'")}'); return false;">${c.nombre}</a> (${c.votos.toLocaleString()} votos)</div>`).join('');
                    } else {
                        targetList.innerHTML = '<div class="candidato-item">No hay candidatos individuales</div>';
                    }
                }
                targetList.style.display = 'block';
            } else {
                targetList.style.display = 'none';
            }
        });
    });

    let datosGrafico = partidosOrdenados.map(([p,v]) => ({ nombre: p, votos: v, partido: p }));
    if (filtrarConsejos) datosGrafico = datosGrafico.filter(d => !d.nombre.toUpperCase().includes('CONSEJO COMUNITARIO'));
    dibujarGrafico(datosGrafico, municipioNombre, false);
}

function renderPuestoDetalle(municipio, puesto, partidosData, candidatosData, totalVotos) {
    const div = document.getElementById('detalle-municipio');
    if (!partidosData || partidosData.length === 0) {
        div.innerHTML = `<p>No hay datos para el puesto "${puesto}" en ${municipio}.</p>`;
        ultimoElementoDetalle = null;
        return;
    }

    ultimoElementoDetalle = {
        nombre: `${puesto} (${municipio})`,
        tipo: 'puesto',
        rawResultados: ultimoElementoDetalle?.rawResultados || null
    };

    let html = `<h4>${puesto} - ${municipio}</h4>
                <p><strong>Total votos válidos:</strong> ${totalVotos.toLocaleString()}</p>
                <div id="partidos-lista">`;
    partidosData.forEach(p => {
        const pct = (p.votos / totalVotos * 100).toFixed(1);
        html += `<div class="partido-item" data-partido="${p.codigo}">${p.nombre} (${p.votos.toLocaleString()} votos, ${pct}%)</div>
                 <div class="candidatos-list" data-partido="${p.codigo}" style="display:none;"></div>`;
    });
    html += `</div>`;
    div.innerHTML = html;

    const candidatosPorPartido = {};
    candidatosData.forEach(c => {
        if (!candidatosPorPartido[c.codigoPartido]) candidatosPorPartido[c.codigoPartido] = [];
        candidatosPorPartido[c.codigoPartido].push({ nombre: c.nombre, votos: c.votos });
    });
    for (let code in candidatosPorPartido) {
        candidatosPorPartido[code].sort((a,b) => b.votos - a.votos);
    }

    document.querySelectorAll('.partido-item').forEach(el => {
        const partidoCode = el.getAttribute('data-partido');
        el.addEventListener('click', () => {
            const targetList = document.querySelector(`.candidatos-list[data-partido="${partidoCode}"]`);
            if (targetList.style.display === 'none') {
                if (targetList.innerHTML === '') {
                    const candidatos = candidatosPorPartido[partidoCode] || [];
                    if (candidatos.length) {
                        targetList.innerHTML = candidatos.map(c => `<div class="candidato-item"><a href="#" onclick="cambiarAMapaCalorCandidato('${c.nombre.replace(/'/g, "\\'")}'); return false;">${c.nombre}</a> (${c.votos.toLocaleString()} votos)</div>`).join('');
                    } else {
                        targetList.innerHTML = '<div class="candidato-item">No hay candidatos individuales</div>';
                    }
                }
                targetList.style.display = 'block';
            } else {
                targetList.style.display = 'none';
            }
        });
    });

    let datosGrafico = partidosData.map(p => ({ nombre: p.nombre, votos: p.votos, partido: p.nombre }));
    if (filtrarConsejos) datosGrafico = datosGrafico.filter(d => !d.nombre.toUpperCase().includes('CONSEJO COMUNITARIO'));
    dibujarGrafico(datosGrafico, `Puesto: ${puesto}`, false);
}

function mostrarDetallePuesto(municipio, puesto, resultados) {
    ultimoElementoDetalle = {
        nombre: `${puesto} (${municipio})`,
        tipo: 'puesto',
        rawResultados: resultados
    };

    const corpActual = currentCorporacion;
    const corpMapping = {
        'camara': 'CÁMARA',
        'senado': 'SENADO',
        'consulta': 'CONSULTA'
    };
    const corpFiltro = corpMapping[corpActual] || '';

    let filtered = resultados.filter(r => r.CORNOMBRE === corpFiltro);
    if (filtrarConsejos) {
        filtered = filtered.filter(r => !r.CANNOMBRE.toUpperCase().includes('CONSEJO COMUNITARIO'));
    }

    if (filtered.length === 0) {
        renderPuestoDetalle(municipio, puesto, [], [], 0);
        return;
    }

    const grupoMap = new Map();
    filtered.forEach(r => {
        const key = `${r.PARNOMBRE}|${r.CORNOMBRE}`;
        if (!grupoMap.has(key)) {
            grupoMap.set(key, {
                nombre: `${r.PARNOMBRE} (${r.CORNOMBRE})`,
                codigo: key,
                votos: 0,
                candidatos: []
            });
        }
        const entry = grupoMap.get(key);
        entry.votos += r.VOTOS;
        let candidatoExistente = entry.candidatos.find(c => c.nombre === r.CANNOMBRE);
        if (candidatoExistente) {
            candidatoExistente.votos += r.VOTOS;
        } else {
            entry.candidatos.push({ nombre: r.CANNOMBRE, votos: r.VOTOS, codigoPartido: key });
        }
    });

    const gruposOrdenados = Array.from(grupoMap.values()).sort((a,b) => b.votos - a.votos);
    const totalVotos = gruposOrdenados.reduce((sum, g) => sum + g.votos, 0);
    const candidatosFlat = [];
    gruposOrdenados.forEach(g => {
        g.candidatos.forEach(c => {
            candidatosFlat.push({
                nombre: c.nombre,
                votos: c.votos,
                codigoPartido: g.codigo,
                partido: g.nombre
            });
        });
    });

    renderPuestoDetalle(municipio, puesto, gruposOrdenados, candidatosFlat, totalVotos);
}

// ==================== UTILIDADES UI ====================
function cambiarAMapaCalorCandidato(nombreCandidato) {
    const tipoVistaSelect = document.getElementById('tipo-vista');
    tipoVistaSelect.value = 'candidato_heat';
    const candidatoSelect = document.getElementById('candidato-selector');
    candidatoSelect.value = nombreCandidato;
    candidatoEspecificoActual = nombreCandidato;
    modoComparacion = false;
    actualizarMapaSimple();
}

function crearFilaComparacion(index) {
    const div = document.createElement('div');
    div.className = 'comparacion-item';
    div.setAttribute('data-index', index);
    div.innerHTML = `
        <select class="comparacion-anio" style="width:80px">
            <option value="2019">2019</option>
            <option value="2022">2022</option>
            <option value="2023">2023</option>
            <option value="2026">2026</option>
        </select>
        <select class="comparacion-corporacion" style="width:100px">
            <option value="camara">Cámara</option>
            <option value="senado">Senado</option>
            <option value="asamblea">Asamblea</option>
            <option value="gobernador">Gobernador</option>
            <option value="alcalde">Alcalde</option>
            <option value="concejo">Concejo</option>
        </select>
        <select class="comparacion-candidato" style="width:200px">
            <option value="">Seleccione candidato</option>
        </select>
        <button class="btn-eliminar-comparacion">🗑️</button>
    `;
    const anioSelect = div.querySelector('.comparacion-anio');
    const corpSelect = div.querySelector('.comparacion-corporacion');
    const candidatoSelect = div.querySelector('.comparacion-candidato');

    const cargar = () => {
        const anio = anioSelect.value;
        const corp = corpSelect.value;
        if (anio && corp) {
            cargarCandidatosParaSelector(anio, corp, candidatoSelect);
        } else {
            candidatoSelect.innerHTML = '<option value="">Seleccione año y corporación</option>';
        }
    };
    anioSelect.addEventListener('change', cargar);
    corpSelect.addEventListener('change', cargar);

    div.querySelector('.btn-eliminar-comparacion').addEventListener('click', () => {
        div.remove();
        document.querySelectorAll('.comparacion-item').forEach((item, i) => {
            item.setAttribute('data-index', i);
        });
    });

    return div;
}

// ==================== INIT + EVENTOS ====================
document.addEventListener('DOMContentLoaded', async () => {
    mapSimple = L.map('map').setView([5.75, -73.0], 8);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(mapSimple);

    mapA = L.map('map-a').setView([5.75, -73.0], 8);
    mapB = L.map('map-b').setView([5.75, -73.0], 8);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapA);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapB);

    try {
        const response = await fetch(geojsonPath);
        currentGeojson = await response.json();
        console.log(`GeoJSON cargado con ${currentGeojson.features.length} municipios`);
        llenarSelectorMunicipios();
    } catch (error) {
        console.error('Error cargando GeoJSON:', error);
        alert('No se pudo cargar el mapa base.');
        return;
    }

    try {
        const respProv = await fetch('data/provincias_boyaca.json');
        provinciasData = await respProv.json();
        console.log('Provincias cargadas:', Object.keys(provinciasData));
    } catch (error) {
        console.error('Error cargando provincias:', error);
    }

    function actualizarSelectorCorporacion(anio) {
        const selector = document.getElementById('corporacion-selector');
        const corporaciones = Object.keys(archivosPorAnio[anio] || {});
        selector.innerHTML = '';
        corporaciones.forEach(corp => {
            const option = document.createElement('option');
            option.value = corp;
            option.textContent = corp.charAt(0).toUpperCase() + corp.slice(1);
            selector.appendChild(option);
        });
    }

    actualizarSelectorCorporacion('2026');
    await cargarDatos('2026', 'camara');

    setTimeout(() => {
        mapSimple.invalidateSize();
        if (mapA) mapA.invalidateSize();
        if (mapB) mapB.invalidateSize();
    }, 200);

    // ==================== EVENTOS ====================
    document.getElementById('toggle-resumen').addEventListener('click', () => {
        const panel = document.getElementById('resumen-panel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });
    document.getElementById('btn-buscar').addEventListener('click', buscarMunicipio);
    document.getElementById('buscador-municipio').addEventListener('keypress', (e) => { if (e.key === 'Enter') buscarMunicipio(); });
    document.getElementById('btn-barras').addEventListener('click', () => {
        graficoTipo = 'bar';
        document.getElementById('btn-barras').classList.add('active');
        document.getElementById('btn-circular').classList.remove('active');
        if (ultimoElementoDetalle) {
            if (ultimoElementoDetalle.tipo === 'provincia') {
                mostrarDetalleProvincia(ultimoElementoDetalle.nombre, { partidos: ultimoElementoDetalle.datosPartidos, candidatos: ultimoElementoDetalle.datosCandidatos, totalVotos: ultimoElementoDetalle.datosPartidos.reduce((s,p)=>s+p['VOTOS'],0) });
            } else if (ultimoElementoDetalle.tipo === 'municipio') {
                mostrarDetalleMunicipio(ultimoElementoDetalle.nombre, ultimoElementoDetalle.datosPartidos, ultimoElementoDetalle.datosCandidatos, document.getElementById('tipo-vista').value);
            } else if (ultimoElementoDetalle.tipo === 'puesto') {
                const nombrePartes = ultimoElementoDetalle.nombre.split(' (');
                const puesto = nombrePartes[0];
                const municipio = nombrePartes[1] ? nombrePartes[1].slice(0, -1) : '';
                mostrarDetallePuesto(municipio, puesto, ultimoElementoDetalle.rawResultados);
            }
        }
    });
    document.getElementById('btn-circular').addEventListener('click', () => {
        graficoTipo = 'pie';
        document.getElementById('btn-circular').classList.add('active');
        document.getElementById('btn-barras').classList.remove('active');
        if (ultimoElementoDetalle) {
            if (ultimoElementoDetalle.tipo === 'provincia') {
                mostrarDetalleProvincia(ultimoElementoDetalle.nombre, { partidos: ultimoElementoDetalle.datosPartidos, candidatos: ultimoElementoDetalle.datosCandidatos, totalVotos: ultimoElementoDetalle.datosPartidos.reduce((s,p)=>s+p['VOTOS'],0) });
            } else if (ultimoElementoDetalle.tipo === 'municipio') {
                mostrarDetalleMunicipio(ultimoElementoDetalle.nombre, ultimoElementoDetalle.datosPartidos, ultimoElementoDetalle.datosCandidatos, document.getElementById('tipo-vista').value);
            } else if (ultimoElementoDetalle.tipo === 'puesto') {
                const nombrePartes = ultimoElementoDetalle.nombre.split(' (');
                const puesto = nombrePartes[0];
                const municipio = nombrePartes[1] ? nombrePartes[1].slice(0, -1) : '';
                mostrarDetallePuesto(municipio, puesto, ultimoElementoDetalle.rawResultados);
            }
        }
    });
    document.getElementById('btn-filtrar-consejos').addEventListener('click', () => {
        filtrarConsejos = !filtrarConsejos;
        const btn = document.getElementById('btn-filtrar-consejos');
        btn.style.backgroundColor = filtrarConsejos ? '#e74c3c' : '#ecf0f1';
        if (ultimoElementoDetalle) {
            if (ultimoElementoDetalle.tipo === 'provincia') {
                mostrarDetalleProvincia(ultimoElementoDetalle.nombre, { partidos: ultimoElementoDetalle.datosPartidos, candidatos: ultimoElementoDetalle.datosCandidatos, totalVotos: ultimoElementoDetalle.datosPartidos.reduce((s,p)=>s+p['VOTOS'],0) });
            } else if (ultimoElementoDetalle.tipo === 'municipio') {
                mostrarDetalleMunicipio(ultimoElementoDetalle.nombre, ultimoElementoDetalle.datosPartidos, ultimoElementoDetalle.datosCandidatos, document.getElementById('tipo-vista').value);
            } else if (ultimoElementoDetalle.tipo === 'puesto') {
                const nombrePartes = ultimoElementoDetalle.nombre.split(' (');
                const puesto = nombrePartes[0];
                const municipio = nombrePartes[1] ? nombrePartes[1].slice(0, -1) : '';
                mostrarDetallePuesto(municipio, puesto, ultimoElementoDetalle.rawResultados);
            }
        }
    });
    document.getElementById('heatmap-porcentaje-checkbox').addEventListener('change', (e) => {
        mapaCalorPorcentaje = e.target.checked;
        if (!modoComparacion && (document.getElementById('tipo-vista').value === 'partido_heat' || document.getElementById('tipo-vista').value === 'candidato_heat')) actualizarMapaSimple();
    });
    document.getElementById('comparar-tipo-a').addEventListener('change', () => {
        const tipo = document.getElementById('comparar-tipo-a').value;
        const selector = document.getElementById('comparar-valor-a');
        const lista = tipo === 'partido' ? partidosUnicos : candidatosUnicos;
        selector.innerHTML = '<option value="">Seleccione...</option>' + lista.map(v => `<option value="${v}">${v}</option>`).join('');
    });
    document.getElementById('comparar-tipo-b').addEventListener('change', () => {
        const tipo = document.getElementById('comparar-tipo-b').value;
        const selector = document.getElementById('comparar-valor-b');
        const lista = tipo === 'partido' ? partidosUnicos : candidatosUnicos;
        selector.innerHTML = '<option value="">Seleccione...</option>' + lista.map(v => `<option value="${v}">${v}</option>`).join('');
    });
    document.getElementById('comparar-update').addEventListener('click', () => {
        modoComparacion = true;
        actualizarComparacion();
    });
    document.getElementById('actualizar').addEventListener('click', () => {
        if (modoComparacion) {
            actualizarComparacion();
        } else {
            actualizarMapaSimple();
        }
    });
    document.getElementById('anio-selector').addEventListener('change', (e) => {
        currentAnio = e.target.value;
        actualizarSelectorCorporacion(currentAnio);
        const primeraCorp = Object.keys(archivosPorAnio[currentAnio])[0];
        if (primeraCorp) { currentCorporacion = primeraCorp; cargarDatos(currentAnio, currentCorporacion); }
    });
    document.getElementById('corporacion-selector').addEventListener('change', (e) => {
        currentCorporacion = e.target.value;
        cargarDatos(currentAnio, currentCorporacion);
    });
    document.getElementById('tipo-vista').addEventListener('change', (e) => {
        const valor = e.target.value;
        modoComparacion = (valor === 'comparar');
        if (modoComparacion) {
            const compararControls = document.getElementById('comparar-controls');
            if (compararControls) compararControls.style.display = 'inline-flex';
            const partidoSelector = document.getElementById('partido-selector-container');
            if (partidoSelector) partidoSelector.style.display = 'none';
            const candidatoSelector = document.getElementById('candidato-selector-container');
            if (candidatoSelector) candidatoSelector.style.display = 'none';
            const partidoGanador = document.getElementById('partido-ganador-container');
            if (partidoGanador) partidoGanador.style.display = 'none';
            const candidatoFiltro = document.getElementById('candidato-ganador-filtro-container');
            if (candidatoFiltro) candidatoFiltro.style.display = 'none';
            const heatmapPorcentaje = document.getElementById('heatmap-porcentaje-container');
            if (heatmapPorcentaje) heatmapPorcentaje.style.display = 'none';
            const mapSimpleContainer = document.getElementById('map-container-simple');
            if (mapSimpleContainer) mapSimpleContainer.style.display = 'none';
            const mapComparisonContainer = document.getElementById('map-container-comparison');
            if (mapComparisonContainer) mapComparisonContainer.style.display = 'flex';
            if (currentPartidoData && currentGeojson) {
                console.log("Ejecutando comparación automática");
                actualizarComparacion();
            } else {
                console.log("Datos o GeoJSON no listos aún");
            }
        } else {
            const compararControls = document.getElementById('comparar-controls');
            if (compararControls) compararControls.style.display = 'none';
            const mapComparisonContainer = document.getElementById('map-container-comparison');
            if (mapComparisonContainer) mapComparisonContainer.style.display = 'none';
            const mapSimpleContainer = document.getElementById('map-container-simple');
            if (mapSimpleContainer) mapSimpleContainer.style.display = 'flex';
            actualizarMapaSimple();
        }
    });
    document.getElementById('partido-selector').addEventListener('change', () => {
        if (!modoComparacion && document.getElementById('tipo-vista').value === 'partido_heat') actualizarMapaSimple();
    });
    document.getElementById('candidato-selector').addEventListener('change', () => {
        candidatoEspecificoActual = document.getElementById('candidato-selector').value;
        if (!modoComparacion && document.getElementById('tipo-vista').value === 'candidato_heat') actualizarMapaSimple();
    });
    document.getElementById('partido-ganador-selector').addEventListener('change', () => {
        if (!modoComparacion && document.getElementById('tipo-vista').value === 'candidato_ganador_por_partido') actualizarMapaSimple();
    });
    document.getElementById('candidato-ganador-filtro').addEventListener('change', () => {
        if (!modoComparacion && document.getElementById('tipo-vista').value === 'candidato_ganador') actualizarMapaSimple();
    });
    document.getElementById('toggle-puestos').addEventListener('change', async (e) => {
        if (e.target.checked) {
            await cargarPuestosVotacion();
            await cargarResultadosPuestos();
            const capa = crearCapaPuestosVotacion();
            capa.addTo(mapSimple);
        } else {
            if (capaPuestosVotacion) mapSimple.removeLayer(capaPuestosVotacion);
        }
    });
    document.getElementById('btn-agregar-comparacion').addEventListener('click', () => {
        const container = document.getElementById('comparaciones-list');
        const nuevaFila = crearFilaComparacion(container.children.length);
        container.appendChild(nuevaFila);
    });
    document.getElementById('btn-actualizar-trayectoria-municipio').addEventListener('click', () => {
        actualizarGraficoComparativoMunicipio();
    });
    const container = document.getElementById('comparaciones-list');
    if (container) {
        container.innerHTML = '';
        container.appendChild(crearFilaComparacion(0));
    }
    const escalaSelector = document.getElementById('escala-selector');
    if (escalaSelector) {
        escalaSelector.addEventListener('change', () => {
            if (!modoComparacion) {
                actualizarMapaSimple();
            }
        });
    }
});
