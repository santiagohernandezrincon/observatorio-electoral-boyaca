// ==================== RESUMEN DEPARTAMENTAL ====================
function actualizarResumenDepartamental(data, candidatoEspecifico = null) {
    const resumenDiv = document.getElementById('resumen-contenido');
    if (!resumenDiv) return;
    const votosPorPartido = {};
    let totalGeneral = 0;
    data.forEach(row => {
        totalGeneral += row['VOTOS'];
        if (!votosPorPartido[row['PARNOMBRE']]) votosPorPartido[row['PARNOMBRE']] = 0;
        votosPorPartido[row['PARNOMBRE']] += row['VOTOS'];
    });
    const top = Object.entries(votosPorPartido).sort((a, b) => b[1] - a[1]).slice(0, 5);
    let html = `<p><strong>Total votos válidos:</strong> ${totalGeneral.toLocaleString()}</p><ul>`;
    top.forEach(([partido, votos]) => {
        html += `<li>${partido}: ${votos.toLocaleString()} votos (${(votos/totalGeneral*100).toFixed(1)}%)</li>`;
    });
    html += '</ul>';

    if (candidatoEspecifico && currentCandidatoData) {
        let votosCandidato = 0;
        const votosPorMunicipio = {};
        currentCandidatoData.forEach(row => {
            if (row['CANNOMBRE'] === candidatoEspecifico) {
                votosCandidato += row['VOTOS'];
                if (!votosPorMunicipio[row['MUNNOMBRE']]) votosPorMunicipio[row['MUNNOMBRE']] = 0;
                votosPorMunicipio[row['MUNNOMBRE']] += row['VOTOS'];
            }
        });
        const pct = totalGeneral > 0 ? (votosCandidato / totalGeneral * 100).toFixed(1) : 0;
        html += `<hr><p><strong>🏆 ${candidatoEspecifico}</strong><br>Votos totales: ${votosCandidato.toLocaleString()} (${pct}% de votos válidos)</p>`;
        const topMun = Object.entries(votosPorMunicipio).sort((a, b) => b[1] - a[1]).slice(0, 5);
        if (topMun.length) {
            html += '<p><strong>Municipios con mayor votación:</strong></p><ul>';
            topMun.forEach(([mun, v]) => { html += `<li>${mun}: ${v.toLocaleString()} votos</li>`; });
            html += '</ul>';
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
    abrirSidebar();
    ultimoElementoDetalle = { nombre: provincia, tipo: 'provincia', datosPartidos: datosProv.partidos, datosCandidatos: datosProv.candidatos };

    const partidosOrdenados = [...datosProv.partidos].sort((a, b) => b['VOTOS'] - a['VOTOS']);
    let html = `<h4>${provincia}</h4><p><strong>Total votos válidos:</strong> ${datosProv.totalVotos.toLocaleString()}</p><div id="partidos-lista">`;
    partidosOrdenados.forEach(p => {
        const pct = (p['VOTOS'] / datosProv.totalVotos * 100).toFixed(1);
        html += `<div class="partido-item" data-partido="${p['PARNOMBRE']}">${p['PARNOMBRE']} (${p['VOTOS'].toLocaleString()} votos, ${pct}%)</div>
                 <div class="candidatos-list" data-partido="${p['PARNOMBRE']}" style="display:none;"></div>`;
    });
    html += '</div>';
    div.innerHTML = html;

    const candidatosPorPartido = {};
    datosProv.candidatos.forEach(c => {
        if (!candidatosPorPartido[c['PARNOMBRE']]) candidatosPorPartido[c['PARNOMBRE']] = [];
        candidatosPorPartido[c['PARNOMBRE']].push({ nombre: c['CANNOMBRE'], votos: c['VOTOS'] });
    });
    for (const p in candidatosPorPartido) candidatosPorPartido[p].sort((a, b) => b.votos - a.votos);
    _bindPartidoItemClicks(candidatosPorPartido);

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
    abrirSidebar();
    ultimoElementoDetalle = { nombre: municipioNombre, tipo: 'municipio', datosPartidos: partidosMunicipio, datosCandidatos: candidatosMunicipio };

    if (tipoVista === 'candidato_heat' || tipoVista === 'candidato_ganador' || tipoVista === 'candidato_ganador_por_partido') {
        const ordenado = [...candidatosMunicipio].sort((a, b) => b['VOTOS'] - a['VOTOS']);
        let html = `<h4>${municipioNombre}</h4>
                    <p><strong>Total votos válidos:</strong> ${candidatosMunicipio.reduce((s,f)=>s+f['VOTOS'],0).toLocaleString()}</p>
                    <table style="width:100%"><thead><th>Candidato</th><th>Votos</th></thead><tbody>`;
        ordenado.forEach(f => {
            html += `<tr><td><a href="#" onclick="cambiarAMapaCalorCandidato('${f['CANNOMBRE'].replace(/'/g,"\\'")}'); return false;">${f['CANNOMBRE']}</a></td><td style="text-align:right">${f['VOTOS'].toLocaleString()}</td></tr>`;
        });
        html += '</tbody></table>';
        div.innerHTML = html;
        let datosGrafico = ordenado.map(f => ({ nombre: f['CANNOMBRE'], votos: f['VOTOS'], partido: f['PARNOMBRE'] }));
        if (filtrarConsejos) datosGrafico = datosGrafico.filter(d => !d.nombre.toUpperCase().includes('CONSEJO COMUNITARIO'));
        dibujarGrafico(datosGrafico, municipioNombre, true);
        return;
    }

    const partidosMap = new Map();
    partidosMunicipio.forEach(f => { if (!partidosMap.has(f['PARNOMBRE'])) partidosMap.set(f['PARNOMBRE'], f['VOTOS']); });
    const partidosOrdenados = Array.from(partidosMap.entries()).sort((a, b) => b[1] - a[1]);

    let html = `<h4>${municipioNombre}</h4>
                <p><strong>Total votos válidos:</strong> ${partidosMunicipio[0]['TOTAL_VOTOS'].toLocaleString()}</p>
                <div id="partidos-lista">`;
    partidosOrdenados.forEach(([partido, votos]) => {
        const pct = (votos / partidosMunicipio[0]['TOTAL_VOTOS'] * 100).toFixed(1);
        html += `<div class="partido-item" data-partido="${partido}">${partido} (${votos.toLocaleString()} votos, ${pct}%)</div>
                 <div class="candidatos-list" data-partido="${partido}" style="display:none;"></div>`;
    });
    html += '</div>';
    div.innerHTML = html;

    const candidatosPorPartido = {};
    candidatosMunicipio.forEach(row => {
        if (!candidatosPorPartido[row['PARNOMBRE']]) candidatosPorPartido[row['PARNOMBRE']] = [];
        candidatosPorPartido[row['PARNOMBRE']].push({ nombre: row['CANNOMBRE'], votos: row['VOTOS'] });
    });
    for (const p in candidatosPorPartido) candidatosPorPartido[p].sort((a, b) => b.votos - a.votos);
    _bindPartidoItemClicks(candidatosPorPartido);

    let datosGrafico = partidosOrdenados.map(([p, v]) => ({ nombre: p, votos: v, partido: p }));
    if (filtrarConsejos) datosGrafico = datosGrafico.filter(d => !d.nombre.toUpperCase().includes('CONSEJO COMUNITARIO'));
    dibujarGrafico(datosGrafico, municipioNombre, false);
}

function renderPuestoDetalle(municipio, puesto, partidosData, candidatosData, totalVotos) {
    const div = document.getElementById('detalle-municipio');
    if (!partidosData || !partidosData.length) {
        div.innerHTML = `<p>No hay datos para el puesto "${puesto}" en ${municipio}.</p>`;
        ultimoElementoDetalle = null;
        return;
    }
    ultimoElementoDetalle = { nombre: `${puesto} (${municipio})`, tipo: 'puesto', rawResultados: ultimoElementoDetalle?.rawResultados || null };

    let html = `<h4>${puesto} - ${municipio}</h4>
                <p><strong>Total votos válidos:</strong> ${totalVotos.toLocaleString()}</p>
                <div id="partidos-lista">`;
    partidosData.forEach(p => {
        const pct = (p.votos / totalVotos * 100).toFixed(1);
        html += `<div class="partido-item" data-partido="${p.codigo}">${p.nombre} (${p.votos.toLocaleString()} votos, ${pct}%)</div>
                 <div class="candidatos-list" data-partido="${p.codigo}" style="display:none;"></div>`;
    });
    html += '</div>';
    div.innerHTML = html;

    const candidatosPorPartido = {};
    candidatosData.forEach(c => {
        if (!candidatosPorPartido[c.codigoPartido]) candidatosPorPartido[c.codigoPartido] = [];
        candidatosPorPartido[c.codigoPartido].push({ nombre: c.nombre, votos: c.votos });
    });
    for (const code in candidatosPorPartido) candidatosPorPartido[code].sort((a, b) => b.votos - a.votos);
    _bindPartidoItemClicks(candidatosPorPartido);

    let datosGrafico = partidosData.map(p => ({ nombre: p.nombre, votos: p.votos, partido: p.nombre }));
    if (filtrarConsejos) datosGrafico = datosGrafico.filter(d => !d.nombre.toUpperCase().includes('CONSEJO COMUNITARIO'));
    dibujarGrafico(datosGrafico, `Puesto: ${puesto}`, false);
}

function mostrarDetallePuesto(municipio, puesto, resultados) {
    ultimoElementoDetalle = { nombre: `${puesto} (${municipio})`, tipo: 'puesto', rawResultados: resultados };
    const corpMapping = { camara: 'CÁMARA', senado: 'SENADO', consulta: 'CONSULTA' };
    let filtered = resultados.filter(r => r.CORNOMBRE === (corpMapping[currentCorporacion] || ''));
    if (filtrarConsejos) filtered = filtered.filter(r => !r.CANNOMBRE.toUpperCase().includes('CONSEJO COMUNITARIO'));
    if (!filtered.length) { renderPuestoDetalle(municipio, puesto, [], [], 0); return; }

    const grupoMap = new Map();
    filtered.forEach(r => {
        const key = `${r.PARNOMBRE}|${r.CORNOMBRE}`;
        if (!grupoMap.has(key)) grupoMap.set(key, { nombre: `${r.PARNOMBRE} (${r.CORNOMBRE})`, codigo: key, votos: 0, candidatos: [] });
        const entry = grupoMap.get(key);
        entry.votos += r.VOTOS;
        const existente = entry.candidatos.find(c => c.nombre === r.CANNOMBRE);
        if (existente) { existente.votos += r.VOTOS; }
        else { entry.candidatos.push({ nombre: r.CANNOMBRE, votos: r.VOTOS, codigoPartido: key }); }
    });
    const gruposOrdenados = Array.from(grupoMap.values()).sort((a, b) => b.votos - a.votos);
    const totalVotos = gruposOrdenados.reduce((sum, g) => sum + g.votos, 0);
    const candidatosFlat = gruposOrdenados.flatMap(g => g.candidatos.map(c => ({ nombre: c.nombre, votos: c.votos, codigoPartido: g.codigo, partido: g.nombre })));
    renderPuestoDetalle(municipio, puesto, gruposOrdenados, candidatosFlat, totalVotos);
}

// helper interno: enlaza clicks en .partido-item para expandir candidatos
function _bindPartidoItemClicks(candidatosPorPartido) {
    document.querySelectorAll('.partido-item').forEach(el => {
        const key = el.getAttribute('data-partido');
        el.addEventListener('click', () => {
            const targetList = document.querySelector(`.candidatos-list[data-partido="${key}"]`);
            if (targetList.style.display === 'none') {
                if (targetList.innerHTML === '') {
                    const lista = candidatosPorPartido[key] || [];
                    targetList.innerHTML = lista.length
                        ? lista.map(c => `<div class="candidato-item"><a href="#" onclick="cambiarAMapaCalorCandidato('${c.nombre.replace(/'/g,"\\'")}'); return false;">${c.nombre}</a> (${c.votos.toLocaleString()} votos)</div>`).join('')
                        : '<div class="candidato-item">No hay candidatos individuales</div>';
                }
                targetList.style.display = 'block';
            } else {
                targetList.style.display = 'none';
            }
        });
    });
}

// ==================== UTILIDADES UI ====================
function cambiarAMapaCalorCandidato(nombreCandidato) {
    document.getElementById('tipo-vista').value = 'candidato_heat';
    document.getElementById('candidato-selector').value = nombreCandidato;
    candidatoEspecificoActual = nombreCandidato;
    modoComparacion = false;
    actualizarMapaSimple();
}

function crearFilaComparacion(index) {
    const div = document.createElement('div');
    div.className = 'comparacion-item';
    div.setAttribute('data-index', index);

    const aniosOptions = Object.keys(DATOS_DISPONIBLES)
        .map(Number).sort((a, b) => b - a)
        .map(a => `<option value="${a}">${a}</option>`).join('');

    div.innerHTML = `
        <select class="comparacion-anio" style="width:80px">${aniosOptions}</select>
        <select class="comparacion-corporacion" style="width:200px"></select>
        <select class="comparacion-candidato" style="width:200px">
            <option value="">Seleccione candidato</option>
        </select>
        <button class="btn-eliminar-comparacion">🗑️</button>
    `;
    const anioSel = div.querySelector('.comparacion-anio');
    const corpSel = div.querySelector('.comparacion-corporacion');
    const canSel  = div.querySelector('.comparacion-candidato');

    function actualizarCorpSel() {
        corpSel.innerHTML = (DATOS_DISPONIBLES[anioSel.value] || [])
            .map(corp => `<option value="${corp}">${LABELS_CORPORACION[corp] || corp}</option>`).join('');
    }

    const cargar = () => {
        if (anioSel.value && corpSel.value) cargarCandidatosParaSelector(anioSel.value, corpSel.value, canSel);
        else canSel.innerHTML = '<option value="">Seleccione año y corporación</option>';
    };

    actualizarCorpSel();
    anioSel.addEventListener('change', () => { actualizarCorpSel(); cargar(); });
    corpSel.addEventListener('change', cargar);
    div.querySelector('.btn-eliminar-comparacion').addEventListener('click', () => {
        div.remove();
        document.querySelectorAll('.comparacion-item').forEach((item, i) => item.setAttribute('data-index', i));
    });
    return div;
}

// ==================== FILTER PILLS ====================
function renderFilterPills() {
    const pillsAnio = document.getElementById('pills-anio');
    if (!pillsAnio) return;
    pillsAnio.innerHTML = '';
    Object.keys(DATOS_DISPONIBLES)
        .map(Number).sort((a, b) => b - a)
        .forEach(anio => {
            const btn = document.createElement('button');
            btn.className = 'pill' + (String(anio) === currentAnio ? ' active' : '');
            btn.textContent = String(anio);
            btn.dataset.value = String(anio);
            btn.addEventListener('click', () => {
                currentAnio = String(anio);
                document.querySelectorAll('#pills-anio .pill').forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                const sel = document.getElementById('anio-selector');
                sel.value = currentAnio;
                sel.dispatchEvent(new Event('change'));
            });
            pillsAnio.appendChild(btn);
        });
    renderCorpPills(currentAnio);
}

function renderCorpPills(anio) {
    const pillsCorp = document.getElementById('pills-corp');
    if (!pillsCorp) return;
    pillsCorp.innerHTML = '';
    (DATOS_DISPONIBLES[anio] || []).forEach(corp => {
        const btn = document.createElement('button');
        btn.className = 'pill' + (corp === currentCorporacion ? ' active' : '');
        btn.textContent = LABELS_CORPORACION[corp] || corp;
        btn.dataset.value = corp;
        btn.addEventListener('click', () => {
            currentCorporacion = corp;
            document.querySelectorAll('#pills-corp .pill').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const sel = document.getElementById('corporacion-selector');
            sel.value = corp;
            sel.dispatchEvent(new Event('change'));
        });
        pillsCorp.appendChild(btn);
    });
}

// ==================== SIDEBAR ====================
function abrirSidebar() {
    const layout = document.getElementById('map-layout');
    if (layout) layout.classList.add('sidebar-open');
    setTimeout(() => {
        if (typeof mapSimple !== 'undefined' && mapSimple) mapSimple.invalidateSize();
        if (typeof mapA !== 'undefined' && mapA) mapA.invalidateSize();
        if (typeof mapB !== 'undefined' && mapB) mapB.invalidateSize();
    }, 350);
}

function cerrarSidebar() {
    const layout = document.getElementById('map-layout');
    if (layout) layout.classList.remove('sidebar-open');
    setTimeout(() => {
        if (typeof mapSimple !== 'undefined' && mapSimple) mapSimple.invalidateSize();
        if (typeof mapA !== 'undefined' && mapA) mapA.invalidateSize();
        if (typeof mapB !== 'undefined' && mapB) mapB.invalidateSize();
    }, 350);
}

// ==================== KPI ANIMATION ====================
function animarKPIs() {
    const cards = document.querySelectorAll('.kpi-card[data-count]');
    cards.forEach(card => {
        const target = parseInt(card.dataset.count);
        const el = card.querySelector('.kpi-number');
        const duration = 1200;
        const steps = 40;
        const increment = target / steps;
        let current = 0;
        let step = 0;
        const timer = setInterval(() => {
            step++;
            current = Math.min(Math.round(increment * step), target);
            el.textContent = current.toLocaleString('es-CO');
            if (step >= steps) clearInterval(timer);
        }, duration / steps);
    });
    const kpiReg = document.getElementById('kpi-registros');
    if (kpiReg) {
        setTimeout(() => { kpiReg.textContent = '+50.000'; }, 800);
    }
}

// ==================== INIT + EVENTOS ====================
document.addEventListener('DOMContentLoaded', async () => {
    // Inicialización de mapas Leaflet
    mapSimple = L.map('map').setView([5.75, -73.0], 8);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapSimple);

    mapA = L.map('map-a').setView([5.75, -73.0], 8);
    mapB = L.map('map-b').setView([5.75, -73.0], 8);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapA);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapB);

    // Carga GeoJSON
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

    // Carga provincias
    try {
        provinciasData = await (await fetch('data/provincias_boyaca.json')).json();
        console.log('Provincias cargadas:', Object.keys(provinciasData));
    } catch (error) {
        console.error('Error cargando provincias:', error);
    }

    // Selector de año
    function inicializarSelectorAnio() {
        const selector = document.getElementById('anio-selector');
        selector.innerHTML = '';
        Object.keys(DATOS_DISPONIBLES)
            .map(Number).sort((a, b) => b - a)
            .forEach(anio => {
                const opt = document.createElement('option');
                opt.value = String(anio);
                opt.textContent = String(anio);
                if (String(anio) === '2026') opt.selected = true;
                selector.appendChild(opt);
            });
    }

    // Selector de corporación
    function actualizarSelectorCorporacion(anio) {
        const selector = document.getElementById('corporacion-selector');
        selector.innerHTML = '';
        (DATOS_DISPONIBLES[anio] || []).forEach(corp => {
            const opt = document.createElement('option');
            opt.value = corp;
            opt.textContent = LABELS_CORPORACION[corp] || corp;
            selector.appendChild(opt);
        });
    }

    inicializarSelectorAnio();
    actualizarSelectorCorporacion('2026');
    await cargarDatos('2026', 'camara');

    setTimeout(() => {
        mapSimple.invalidateSize();
        if (mapA) mapA.invalidateSize();
        if (mapB) mapB.invalidateSize();
    }, 200);

    // ==================== EVENT LISTENERS ====================
    document.getElementById('toggle-resumen').addEventListener('click', () => {
        const panel = document.getElementById('resumen-panel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });

    document.getElementById('btn-buscar').addEventListener('click', buscarMunicipio);
    document.getElementById('buscador-municipio').addEventListener('keypress', e => { if (e.key === 'Enter') buscarMunicipio(); });

    function redibujarUltimoDetalle() {
        if (!ultimoElementoDetalle) return;
        if (ultimoElementoDetalle.tipo === 'provincia') {
            mostrarDetalleProvincia(ultimoElementoDetalle.nombre, {
                partidos: ultimoElementoDetalle.datosPartidos,
                candidatos: ultimoElementoDetalle.datosCandidatos,
                totalVotos: ultimoElementoDetalle.datosPartidos.reduce((s, p) => s + p['VOTOS'], 0)
            });
        } else if (ultimoElementoDetalle.tipo === 'municipio') {
            mostrarDetalleMunicipio(ultimoElementoDetalle.nombre, ultimoElementoDetalle.datosPartidos, ultimoElementoDetalle.datosCandidatos, document.getElementById('tipo-vista').value);
        } else if (ultimoElementoDetalle.tipo === 'puesto') {
            const partes = ultimoElementoDetalle.nombre.split(' (');
            mostrarDetallePuesto(partes[1] ? partes[1].slice(0, -1) : '', partes[0], ultimoElementoDetalle.rawResultados);
        }
    }

    document.getElementById('btn-barras').addEventListener('click', () => {
        graficoTipo = 'bar';
        document.getElementById('btn-barras').classList.add('active');
        document.getElementById('btn-circular').classList.remove('active');
        redibujarUltimoDetalle();
    });
    document.getElementById('btn-circular').addEventListener('click', () => {
        graficoTipo = 'pie';
        document.getElementById('btn-circular').classList.add('active');
        document.getElementById('btn-barras').classList.remove('active');
        redibujarUltimoDetalle();
    });
    document.getElementById('btn-filtrar-consejos').addEventListener('click', () => {
        filtrarConsejos = !filtrarConsejos;
        document.getElementById('btn-filtrar-consejos').style.backgroundColor = filtrarConsejos ? '#e74c3c' : '#ecf0f1';
        redibujarUltimoDetalle();
    });

    document.getElementById('heatmap-porcentaje-checkbox').addEventListener('change', e => {
        mapaCalorPorcentaje = e.target.checked;
        const vista = document.getElementById('tipo-vista').value;
        if (!modoComparacion && (vista === 'partido_heat' || vista === 'candidato_heat')) actualizarMapaSimple();
    });

    document.getElementById('comparar-tipo-a').addEventListener('change', () => {
        const tipo = document.getElementById('comparar-tipo-a').value;
        const lista = tipo === 'partido' ? partidosUnicos : candidatosUnicos;
        document.getElementById('comparar-valor-a').innerHTML = '<option value="">Seleccione...</option>' + lista.map(v => `<option value="${v}">${v}</option>`).join('');
    });
    document.getElementById('comparar-tipo-b').addEventListener('change', () => {
        const tipo = document.getElementById('comparar-tipo-b').value;
        const lista = tipo === 'partido' ? partidosUnicos : candidatosUnicos;
        document.getElementById('comparar-valor-b').innerHTML = '<option value="">Seleccione...</option>' + lista.map(v => `<option value="${v}">${v}</option>`).join('');
    });
    document.getElementById('comparar-update').addEventListener('click', () => { modoComparacion = true; actualizarComparacion(); });

    document.getElementById('actualizar').addEventListener('click', () => {
        if (modoComparacion) actualizarComparacion(); else actualizarMapaSimple();
    });

    document.getElementById('anio-selector').addEventListener('change', e => {
        currentAnio = e.target.value;
        actualizarSelectorCorporacion(currentAnio);
        const primera = (DATOS_DISPONIBLES[currentAnio] || [])[0];
        if (primera) {
            currentCorporacion = primera;
            renderCorpPills(currentAnio);
            cargarDatos(currentAnio, currentCorporacion);
        }
    });
    document.getElementById('corporacion-selector').addEventListener('change', e => {
        currentCorporacion = e.target.value;
        cargarDatos(currentAnio, currentCorporacion);
    });

    document.getElementById('tipo-vista').addEventListener('change', e => {
        const valor = e.target.value;
        modoComparacion = (valor === 'comparar');
        if (modoComparacion) {
            document.getElementById('comparar-controls').style.display        = 'inline-flex';
            document.getElementById('partido-selector-container').style.display= 'none';
            document.getElementById('candidato-selector-container').style.display= 'none';
            document.getElementById('partido-ganador-container').style.display = 'none';
            document.getElementById('candidato-ganador-filtro-container').style.display = 'none';
            document.getElementById('heatmap-porcentaje-container').style.display = 'none';
            document.getElementById('map-container-simple').style.display     = 'none';
            document.getElementById('map-container-comparison').style.display = 'flex';
            if (currentPartidoData && currentGeojson) actualizarComparacion();
        } else {
            document.getElementById('comparar-controls').style.display        = 'none';
            document.getElementById('map-container-comparison').style.display = 'none';
            document.getElementById('map-container-simple').style.display     = 'flex';
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

    document.getElementById('toggle-puestos').addEventListener('change', async e => {
        if (e.target.checked) {
            await cargarPuestosVotacion();
            await cargarResultadosPuestos();
            crearCapaPuestosVotacion().addTo(mapSimple);
        } else {
            if (capaPuestosVotacion) mapSimple.removeLayer(capaPuestosVotacion);
        }
    });

    document.getElementById('btn-agregar-comparacion').addEventListener('click', () => {
        const container = document.getElementById('comparaciones-list');
        container.appendChild(crearFilaComparacion(container.children.length));
    });
    document.getElementById('btn-actualizar-trayectoria-municipio').addEventListener('click', actualizarGraficoComparativoMunicipio);

    const comparacionesList = document.getElementById('comparaciones-list');
    if (comparacionesList) {
        comparacionesList.innerHTML = '';
        comparacionesList.appendChild(crearFilaComparacion(0));
    }

    document.getElementById('escala-selector')?.addEventListener('change', () => {
        if (!modoComparacion) actualizarMapaSimple();
    });

    renderFilterPills();

    // Tabs de análisis
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const panel = document.getElementById('tab-' + tabId);
            if (panel) panel.classList.add('active');
        });
    });

    animarKPIs();

    const hero = document.getElementById('hero-section');
    const colapsarHero = () => {
        if (hero) hero.classList.add('hero-collapsed');
    };
    if (hero) {
        // Colapsa al primer scroll
        window.addEventListener('scroll', colapsarHero, { once: true, passive: true });
        // Colapsa al primer clic en cualquier filtro
        document.addEventListener('click', function handler(e) {
            if (e.target.closest('.filter-bar')) {
                colapsarHero();
                document.removeEventListener('click', handler);
            }
        });
    }
});

function toggleMapSize() {
    const layout = document.getElementById('map-layout');
    const icon = document.getElementById('map-toggle-icon');
    if (!layout) return;
    const expanded = layout.classList.toggle('map-expanded');
    if (icon) icon.textContent = expanded ? '⛶' : '⛶';
    setTimeout(() => {
        if (typeof mapSimple !== 'undefined' && mapSimple) {
            mapSimple.invalidateSize();
        }
    }, 320);
}
