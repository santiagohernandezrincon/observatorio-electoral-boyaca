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
        const clr = typeof colorPartido === 'function' ? colorPartido(p['PARNOMBRE']) : '#9CA3AF';
        html += `<div class="partido-item" data-partido="${p['PARNOMBRE']}">
          <div class="pi-row">
            <span class="pi-dot" style="background:${clr}"></span>
            <span class="pi-nombre">${p['PARNOMBRE']}</span>
            <span class="pi-pct">${pct}%</span>
          </div>
          <div class="pi-bar"><div class="pi-fill" style="width:${Math.min(pct,100)}%;background:${clr}"></div></div>
        </div>
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
    const drawerTitle = document.getElementById('obs-drawer-title');
    if (drawerTitle) drawerTitle.textContent = municipioNombre;
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
        const clr = typeof colorPartido === 'function' ? colorPartido(partido) : '#9CA3AF';
        html += `<div class="partido-item" data-partido="${partido}">
          <div class="pi-row">
            <span class="pi-dot" style="background:${clr}"></span>
            <span class="pi-nombre">${partido}</span>
            <span class="pi-pct">${pct}%</span>
          </div>
          <div class="pi-bar"><div class="pi-fill" style="width:${Math.min(pct,100)}%;background:${clr}"></div></div>
        </div>
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

// ==================== OBS NAV ====================
function inicializarNav() {
  const pillsAnio = document.getElementById('pills-anio');
  const pillsCorp = document.getElementById('pills-corp');
  if (!pillsAnio || !pillsCorp) return;
  const years = Object.keys(DATOS_DISPONIBLES).sort((a, b) => b - a);
  const grupos = [
    { label: 'Congresional', years: [] },
    { label: 'Local',        years: [] },
    { label: 'Otro',         years: [] }
  ];
  years.forEach(y => {
    const corps = DATOS_DISPONIBLES[y] || [];
    if (corps.includes('camara') || corps.includes('senado')) grupos[0].years.push(y);
    else if (corps.includes('alcalde')) grupos[1].years.push(y);
    else grupos[2].years.push(y);
  });

  pillsAnio.innerHTML = '';
  grupos.filter(g => g.years.length).forEach(grupo => {
    const wrap = document.createElement('div');
    wrap.className = 'obs-year-group';
    const label = document.createElement('span');
    label.className = 'obs-year-group__label';
    label.textContent = grupo.label;
    wrap.appendChild(label);

    const row = document.createElement('div');
    row.className = 'obs-pills-row';
    grupo.years.forEach(y => {
      const btn = document.createElement('button');
      btn.className = 'obs-pill obs-pill-year' + (String(y) === String(currentAnio) ? ' active' : '');
      btn.textContent = y;
      btn.onclick = () => {
        // 1. Actualizar variable global si existe
        if (typeof currentAnio !== 'undefined') currentAnio = y;
        // 2. Sincronizar el selector original para que el pipeline existente lo detecte
        const sel = document.getElementById('anio-selector');
        if (sel) {
          sel.value = y;
          sel.dispatchEvent(new Event('change'));
        }
        // 3. UI: marcar pill activa
        pillsAnio.querySelectorAll('.obs-pill').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        actualizarPillsCorp();
      };
      row.appendChild(btn);
    });
    wrap.appendChild(row);
    pillsAnio.appendChild(wrap);
  });

  actualizarPillsCorp();
}

function actualizarPillsCorp() {
  const pillsCorp = document.getElementById('pills-corp');
  if (!pillsCorp) return;
  const corps = DATOS_DISPONIBLES[currentAnio] || [];
  const labels = typeof LABELS_CORPORACION !== 'undefined' ? LABELS_CORPORACION : {};
  pillsCorp.innerHTML = '';
  if (!corps.includes(currentCorporacion) && corps.length > 0) {
    currentCorporacion = corps[0];
  }
  corps.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'obs-pill' + (c === currentCorporacion ? ' active' : '');
    btn.textContent = labels[c] || c;
    btn.onclick = () => {
      if (typeof currentCorporacion !== 'undefined') currentCorporacion = c;
      const sel = document.getElementById('corporacion-selector');
      if (sel) {
        sel.value = c;
        sel.dispatchEvent(new Event('change'));
      }
      pillsCorp.querySelectorAll('.obs-pill').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
    };
    pillsCorp.appendChild(btn);
  });
}

function actualizarBreadcrumb() {
  const el = document.getElementById('obs-breadcrumb');
  if (!el) return;
  const labels = typeof LABELS_CORPORACION !== 'undefined' ? LABELS_CORPORACION : {};
  el.textContent = `${labels[currentCorporacion] || currentCorporacion} · ${currentAnio}`;
}

let actorCandidatoActual = null; // { nombre, filas, listaCiclos }
let actorCicloActivo = null;     // null = agregado; o `${anio}_${corp}`

function seleccionarCandidatoActor(nombreCanonico) {
  const clave = normalizarNombre(nombreCanonico);
  const filas = actorTodasLasFilas.filter(r => normalizarNombre(r['CANNOMBRE']) === clave);
  if (!filas.length) return;

  const ciclos = new Map();
  filas.forEach(row => {
    const key = `${row.ANIO}_${row.CORP}`;
    if (!ciclos.has(key)) {
      const partido = resolverPartido(row['PARNOMBRE'], row['CANNOMBRE'], row.ANIO, row.CORP);
      ciclos.set(key, { key, anio: row.ANIO, corp: row.CORP, votos: 0, partido });
    }
    ciclos.get(key).votos += row['VOTOS'];
  });
  const listaCiclos = [...ciclos.values()].sort((a, b) => b.anio - a.anio || a.corp.localeCompare(b.corp));
  const votosTotales = listaCiclos.reduce((s, c) => s + c.votos, 0);
  const partidosUnicos = [...new Set(listaCiclos.map(c => c.partido))];

  actorCandidatoActual = { nombre: nombreCanonico, filas, listaCiclos };
  actorCicloActivo = null;

  document.getElementById('actor-empty').style.display = 'none';
  document.getElementById('actor-info').style.display = 'block';
  document.getElementById('actor-nombre').textContent = nombreCanonico;
  document.getElementById('actor-partido').innerHTML = partidosUnicos.map(p =>
    `<span class="actor-partido-badge" style="background:${colorPartido(p)}">${p}</span>`
  ).join('');
  document.getElementById('actor-stats').innerHTML = `
    <div class="actor-stat"><span class="actor-stat__num">${votosTotales.toLocaleString('es-CO')}</span><span class="actor-stat__label">Votos totales</span></div>
    <div class="actor-stat"><span class="actor-stat__num">${listaCiclos.length}</span><span class="actor-stat__label">${listaCiclos.length === 1 ? 'Ciclo electoral' : 'Ciclos electorales'}</span></div>
  `;

  renderCiclosActor();
  aplicarFiltroCicloActor();
  renderTimelineActor(listaCiclos);
}

function renderTimelineActor(listaCiclos) {
  const wrap = document.getElementById('actor-timeline-wrap');
  wrap.style.display = 'block';
  const ordenCronologico = [...listaCiclos].sort((a, b) => a.anio - b.anio || a.corp.localeCompare(b.corp));

  // Delay: deja que el browser haga reflow del panel antes de que Chart.js
  // mida el canvas (si no, queda 0×0 porque el wrap recién se hizo visible).
  setTimeout(() => {
    const canvasEl = document.getElementById('actor-timeline-chart');
    if (!canvasEl) return;
    const ctx = canvasEl.getContext('2d');
    if (actorTimelineChart) actorTimelineChart.destroy();

    const labels = ordenCronologico.map(c => `${LABELS_CORPORACION[c.corp] || c.corp} · ${c.anio}`);
    const valores = ordenCronologico.map(c => c.votos);
    const colores = ordenCronologico.map(c => colorPartido(c.partido));
    const colorLinea = colorPartido(ordenCronologico[ordenCronologico.length - 1].partido);

    const darkTick = { color: 'rgba(255,255,255,0.55)', font: { size: 10 } };
    const darkGrid = { color: 'rgba(255,255,255,0.07)' };

    actorTimelineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data: valores,
          borderColor: colorLinea,
          backgroundColor: colorLinea + '33',
          pointBackgroundColor: colores,
          pointRadius: 5,
          pointHoverRadius: 7,
          borderWidth: 2,
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => `${ctx.raw.toLocaleString('es-CO')} votos` } }
        },
        scales: {
          x: { ticks: darkTick, grid: { display: false } },
          y: { beginAtZero: true, ticks: { ...darkTick, callback: v => v.toLocaleString('es-CO') }, grid: darkGrid }
        }
      }
    });
  }, 60);
}

function renderCiclosActor() {
  const { listaCiclos } = actorCandidatoActual;
  const cont = document.getElementById('actor-cycles');

  const cardTodos = `
    <div class="actor-cycle-card actor-cycle-card--todos${actorCicloActivo === null ? ' actor-cycle-card--active' : ''}" data-key="">
      <div class="actor-cycle-card__dot" style="background:rgba(255,255,255,0.25)"></div>
      <div class="actor-cycle-card__info">
        <div class="actor-cycle-card__title">Todos los ciclos</div>
      </div>
    </div>`;

  const cards = listaCiclos.map(c => `
    <div class="actor-cycle-card${actorCicloActivo === c.key ? ' actor-cycle-card--active' : ''}" data-key="${c.key}">
      <div class="actor-cycle-card__dot" style="background:${colorPartido(c.partido)}"></div>
      <div class="actor-cycle-card__info">
        <div class="actor-cycle-card__title">${LABELS_CORPORACION[c.corp] || c.corp} · ${c.anio}</div>
        <div class="actor-cycle-card__votos">${c.votos.toLocaleString('es-CO')} votos</div>
      </div>
    </div>
  `).join('');

  cont.innerHTML = cardTodos + cards;
  cont.querySelectorAll('.actor-cycle-card').forEach(el => {
    el.addEventListener('click', () => {
      actorCicloActivo = el.dataset.key || null;
      renderCiclosActor();
      aplicarFiltroCicloActor();
    });
  });
}

function aplicarFiltroCicloActor() {
  const { filas, listaCiclos } = actorCandidatoActual;
  let filasFiltradas, colorBase;
  if (actorCicloActivo === null) {
    filasFiltradas = filas;
    colorBase = colorPartido(listaCiclos[0].partido);
  } else {
    const ciclo = listaCiclos.find(c => c.key === actorCicloActivo);
    filasFiltradas = filas.filter(r => `${r.ANIO}_${r.CORP}` === actorCicloActivo);
    colorBase = colorPartido(ciclo.partido);
  }
  const votosPorMunicipio = {};
  filasFiltradas.forEach(row => {
    const mun = normalizarNombre(row['MUNNOMBRE']);
    votosPorMunicipio[mun] = (votosPorMunicipio[mun] || 0) + row['VOTOS'];
  });
  actualizarMapaActor(votosPorMunicipio, colorBase);
  renderTablaMunicipiosActor(votosPorMunicipio, colorBase);
}

function renderTablaMunicipiosActor(votosPorMunicipio, colorBase) {
  const cont = document.getElementById('actor-table');
  const total = Object.values(votosPorMunicipio).reduce((s, v) => s + v, 0);
  const top = Object.entries(votosPorMunicipio).sort((a, b) => b[1] - a[1]).slice(0, 10);
  if (!top.length) { cont.innerHTML = '<p class="actor-table-empty">Sin datos para este ciclo</p>'; return; }
  cont.innerHTML = top.map(([munNorm, votos], i) => {
    const pct = total > 0 ? (votos / total * 100).toFixed(1) : 0;
    const feature = currentGeojson?.features.find(f => normalizarNombre(f.properties.MPIO_CNMBR) === munNorm);
    const nombre = feature ? feature.properties.MPIO_CNMBR : munNorm;
    return `
      <div class="partido-item">
        <div class="pi-row">
          <span class="pi-rank">${i + 1}</span>
          <span class="pi-nombre">${nombre}</span>
          <span class="pi-pct">${votos.toLocaleString('es-CO')}</span>
        </div>
        <div class="pi-bar"><div class="pi-fill" style="width:${Math.min(pct,100)}%;background:${colorBase}"></div></div>
      </div>`;
  }).join('');
}

let competitividadIniciada = false;

function inicializarCompetitividad() {
  const selector = document.getElementById('comp-cargo-selector');
  if (!selector) return;
  const cargos = cargosConHistoria();
  selector.innerHTML = cargos.map(c => `<option value="${c}">${LABELS_CORPORACION[c] || c}</option>`).join('');
  selector.addEventListener('change', () => actualizarCompetitividad(selector.value));
}

async function cargarCompetitividadSiNecesario() {
  if (competitividadIniciada) return;
  competitividadIniciada = true;
  const selector = document.getElementById('comp-cargo-selector');
  if (selector && selector.value) await actualizarCompetitividad(selector.value);
}

async function actualizarCompetitividad(cargo) {
  const loading = document.getElementById('comp-loading');
  if (loading) loading.style.display = 'flex';
  try {
    const promedios = await calcularCompetitividad(cargo);
    actualizarMapaCompetitividad(promedios);
    renderRankingCompetitividad(promedios);
  } finally {
    if (loading) loading.style.display = 'none';
  }
}

function renderRankingCompetitividad(promedios) {
  const conNombre = Object.entries(promedios).map(([mun, margen]) => {
    const feature = currentGeojson?.features.find(f => normalizarNombre(f.properties.MPIO_CNMBR) === mun);
    return { nombre: feature ? feature.properties.MPIO_CNMBR : mun, margen };
  });

  const renidos = [...conNombre].sort((a, b) => a.margen - b.margen).slice(0, 10);
  const dominados = [...conNombre].sort((a, b) => b.margen - a.margen).slice(0, 10);

  const fila = ({ nombre, margen }) => `
    <div class="partido-item">
      <div class="pi-row">
        <span class="pi-nombre">${nombre}</span>
        <span class="pi-pct">${(margen * 100).toFixed(1)}%</span>
      </div>
      <div class="pi-bar"><div class="pi-fill" style="width:${Math.min(margen / 0.35 * 100, 100)}%;background:${colorPorMargen(margen)}"></div></div>
    </div>`;

  document.getElementById('comp-tabla-renidos').innerHTML = renidos.map(fila).join('') || '<p class="actor-table-empty">Sin datos</p>';
  document.getElementById('comp-tabla-dominados').innerHTML = dominados.map(fila).join('') || '<p class="actor-table-empty">Sin datos</p>';
}

let compararTablaSort = { campo: 'margenB', asc: true };

function renderTablaComparar() {
  const wrap = document.getElementById('comparar-tabla');
  const cont = document.getElementById('comparar-tabla-body');
  if (!wrap || !cont) return;
  if (!comparacionActual) { wrap.style.display = 'none'; return; }

  const filas = construirFilasTablaComparar(comparacionActual);
  const { campo, asc } = compararTablaSort;
  filas.sort((a, b) => {
    let va = a[campo], vb = b[campo];
    if (campo === 'cambio') { va = va ? 1 : 0; vb = vb ? 1 : 0; }
    if (typeof va === 'string') return asc ? va.localeCompare(vb) : vb.localeCompare(va);
    va = va == null ? Infinity : va;
    vb = vb == null ? Infinity : vb;
    return asc ? va - vb : vb - va;
  });

  cont.innerHTML = filas.map(f => `
    <div class="ct-row">
      <span class="ct-col ct-col--mun">${f.municipio}</span>
      <span class="ct-col ct-col--cambio">${f.cambio ? '<span class="ct-badge ct-badge--si">Sí</span>' : '<span class="ct-badge">No</span>'}</span>
      <span class="ct-col ct-col--partido">
        <span class="ct-dot" style="background:${colorPartido(f.partidoA)}"></span>${f.partidoA}
        <span class="ct-arrow">→</span>
        <span class="ct-dot" style="background:${colorPartido(f.partidoB)}"></span>${f.partidoB}
      </span>
      <span class="ct-col ct-col--margen">${f.margenB != null ? f.margenB.toFixed(1) + '%' : '—'}</span>
    </div>`).join('') || '<p class="actor-table-empty">Sin municipios con datos en ambas elecciones</p>';

  wrap.querySelectorAll('.comparar-tabla__header .ct-col[data-sort]').forEach(el => {
    const activo = el.dataset.sort === campo;
    el.classList.toggle('ct-col--activo', activo);
    el.dataset.dir = activo ? (asc ? '▲' : '▼') : '';
  });
  wrap.style.display = 'block';
}

function inicializarComparar() {
  const cargoSel = document.getElementById('comparar-cargo-selector');
  const aSel = document.getElementById('comparar-anio-a');
  const bSel = document.getElementById('comparar-anio-b');
  const btn = document.getElementById('comparar-btn-actualizar');
  if (!cargoSel || !aSel || !bSel) return;

  const cargos = Object.keys(aniosPorCargoComparable());
  cargoSel.innerHTML = cargos.map(c => `<option value="${c}">${LABELS_CORPORACION[c] || c}</option>`).join('');

  function actualizarAnioA() {
    const pares = paresComparables(cargoSel.value);
    aSel.innerHTML = pares.map(([a]) => `<option value="${a}">${a}</option>`).join('');
    actualizarAnioB();
  }
  function actualizarAnioB() {
    const pares = paresComparables(cargoSel.value);
    const par = pares.find(([a]) => String(a) === aSel.value);
    bSel.innerHTML = par ? `<option value="${par[1]}">${par[1]}</option>` : '';
  }

  cargoSel.addEventListener('change', actualizarAnioA);
  aSel.addEventListener('change', actualizarAnioB);
  actualizarAnioA();

  // Encabezados de la tabla: click para ordenar (toggle asc/desc en la misma columna)
  document.querySelectorAll('#comparar-tabla .comparar-tabla__header .ct-col[data-sort]').forEach(el => {
    el.addEventListener('click', () => {
      const campo = el.dataset.sort;
      compararTablaSort = compararTablaSort.campo === campo
        ? { campo, asc: !compararTablaSort.asc }
        : { campo, asc: true };
      renderTablaComparar();
    });
  });

  // Pills de modo de mapa: Cambios / ENP A / ENP B — solo re-renderizan, no recargan datos
  document.querySelectorAll('#comparar-modo-mapa .pill').forEach(btnPill => {
    btnPill.addEventListener('click', () => {
      if (!comparacionActual) return;
      comparaModoMapaActual = btnPill.dataset.modo;
      document.querySelectorAll('#comparar-modo-mapa .pill').forEach(p => p.classList.remove('active'));
      btnPill.classList.add('active');
      actualizarMapaComparar(comparaModoMapaActual);
    });
  });

  btn?.addEventListener('click', async () => {
    const cargo = cargoSel.value;
    const anioA = aSel.value;
    const anioB = bSel.value;
    if (!cargo || !anioA || !anioB) return;
    const loading = document.getElementById('comparar-loading');
    const kpis = document.getElementById('comparar-kpis');
    const detalle = document.getElementById('comparar-kpi-detalle');
    const nota = document.getElementById('comparar-kpi-nota');
    if (loading) loading.style.display = 'flex';
    if (kpis) kpis.style.display = 'none';
    if (detalle) detalle.style.display = 'none';
    if (nota) nota.style.display = 'none';
    try {
      const [resA, resB] = await Promise.all([
        cargarDatosComparacion(anioA, cargo),
        cargarDatosComparacion(anioB, cargo)
      ]);
      const ganadoresA = ganadorPorMunicipioComparacion(resA);
      const ganadoresB = ganadorPorMunicipioComparacion(resB);
      const cambios = calcularComparacionMunicipios(ganadoresA, ganadoresB);
      const enpA = enpPorMunicipio(resA);
      const enpB = enpPorMunicipio(resB);
      const enpPromA = promedioEnpDepartamental(enpA);
      const enpPromB = promedioEnpDepartamental(enpB);
      const margenB = margenPorMunicipioComparacion(resB);

      const conDatos = Object.values(cambios).filter(c => c.ganadorA && c.ganadorB);
      const numCambios = conDatos.filter(c => c.cambio).length;
      const pctCambio = conDatos.length ? (numCambios / conDatos.length * 100) : 0;

      document.getElementById('comparar-kpi-pct-cambio').textContent = pctCambio.toFixed(1) + '%';
      document.getElementById('comparar-kpi-enp-a').textContent = enpPromA.toFixed(2);
      document.getElementById('comparar-kpi-enp-a-anio').textContent = anioA;
      document.getElementById('comparar-kpi-enp-b').textContent = enpPromB.toFixed(2);
      document.getElementById('comparar-kpi-enp-b-anio').textContent = anioB;
      document.getElementById('comparar-pill-enp-a-anio').textContent = anioA;
      document.getElementById('comparar-pill-enp-b-anio').textContent = anioB;
      if (kpis) kpis.style.display = 'flex';
      if (detalle) {
        detalle.textContent = `${numCambios} de ${conDatos.length} municipios con datos en ambas elecciones`;
        detalle.style.display = 'block';
      }
      if (nota && ['alcalde', 'gobernador'].includes(cargo) && pctCambio > 60) {
        nota.textContent = 'Alta rotación es normal en este cargo: no hay reelección inmediata, así que el candidato siempre cambia y las coaliciones locales suelen renombrarse cada ciclo.';
        nota.style.display = 'block';
      }

      comparacionActual = { cargo, anioA, anioB, ganadoresA, ganadoresB, cambios, enpA, enpB, margenB };

      comparaModoMapaActual = 'cambios';
      document.querySelectorAll('#comparar-modo-mapa .pill').forEach(p => p.classList.remove('active'));
      document.querySelector('#comparar-modo-mapa .pill[data-modo="cambios"]')?.classList.add('active');
      document.getElementById('comparar-modo-mapa').style.display = 'flex';
      document.getElementById('comparar-empty').style.display = 'none';
      document.getElementById('map-comparar').style.display = 'block';
      actualizarMapaComparar('cambios');
      renderTablaComparar();

      console.log(`Comparar ${cargo} ${anioA}->${anioB}: ${numCambios}/${conDatos.length} cambiaron (${pctCambio.toFixed(1)}%), ENP ${anioA}=${enpPromA.toFixed(2)} ENP ${anioB}=${enpPromB.toFixed(2)}`);
    } finally {
      if (loading) loading.style.display = 'none';
    }
  });
}

function inicializarActor() {
  const input = document.getElementById('actor-search-input');
  const autocomplete = document.getElementById('actor-autocomplete');
  const loading = document.getElementById('actor-loading');
  if (!input) return;

  let indiceIniciado = false;
  async function asegurarIndice() {
    if (indiceIniciado) return;
    indiceIniciado = true;
    loading.style.display = 'flex';
    await construirIndiceActor();
    loading.style.display = 'none';
  }
  input.addEventListener('focus', asegurarIndice);

  input.addEventListener('input', () => {
    const q = input.value.trim();
    autocomplete.innerHTML = '';
    if (!actorIndiceListo || q.length < 2) { autocomplete.style.display = 'none'; return; }
    const qNorm = normalizarNombre(q);
    const nombres = [...actorNombresPorClave.entries()]
      .filter(([clave]) => clave.includes(qNorm))
      .map(([, nombre]) => nombre)
      .sort((a, b) => a.localeCompare(b))
      .slice(0, 8);
    if (!nombres.length) { autocomplete.style.display = 'none'; return; }
    autocomplete.style.display = 'block';
    nombres.forEach(nombre => {
      const item = document.createElement('div');
      item.className = 'actor-autocomplete__item';
      item.textContent = nombre;
      item.addEventListener('click', () => {
        input.value = nombre;
        autocomplete.style.display = 'none';
        seleccionarCandidatoActor(nombre);
      });
      autocomplete.appendChild(item);
    });
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.actor-search-wrap')) autocomplete.style.display = 'none';
  });
}

function inicializarBuscador() {
  const input = document.getElementById('obs-search');
  if (!input) return;
  input.addEventListener('input', function() {
    const q = this.value.trim().toLowerCase();
    if (!q || q.length < 2) return;
    if (typeof mapSimple !== 'undefined' && mapSimple && typeof currentLayerSimple !== 'undefined' && currentLayerSimple) {
      currentLayerSimple.eachLayer(layer => {
        const props = layer.feature?.properties || {};
        const nombre = (props.MPIO_CNMBR || props.nombre || props.NOM_MPIO || '').toLowerCase();
        if (nombre.includes(q)) {
          mapSimple.fitBounds(layer.getBounds(), { padding: [40, 40] });
          layer.openPopup && layer.openPopup();
        }
      });
    }
  });
}

// ==================== SIDEBAR ====================
function abrirSidebar() {
    // Abrir drawer derecho con los datos del municipio
    const drawer = document.getElementById('obs-drawer');
    if (drawer) {
        drawer.classList.add('obs-drawer--open');
        drawer.removeAttribute('aria-hidden');
    }
    // Invalidar tamaño del mapa levemente (drawer cubre sin redimensionar)
    setTimeout(() => {
        if (typeof mapSimple !== 'undefined' && mapSimple) mapSimple.invalidateSize();
    }, 320);
}

function cerrarDrawer() {
    const drawer = document.getElementById('obs-drawer');
    if (drawer) {
        drawer.classList.remove('obs-drawer--open');
        drawer.setAttribute('aria-hidden', 'true');
    }
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
  if (typeof DATOS_DISPONIBLES === 'undefined') return;

  const anios  = Object.keys(DATOS_DISPONIBLES);
  const corps  = [...new Set(anios.flatMap(a => DATOS_DISPONIBLES[a] || []))];

  function animarElemento(el, target) {
    if (!el) return;
    let n = 0;
    const step = Math.max(1, Math.ceil(target / 40));
    const t = setInterval(() => {
      n = Math.min(n + step, target);
      el.textContent = n.toLocaleString('es-CO');
      if (n >= target) clearInterval(t);
    }, 40);
  }

  animarElemento(document.getElementById('kpi-ciclos'),     anios.length);
  animarElemento(document.getElementById('kpi-municipios'), 123);
  animarElemento(document.getElementById('kpi-cargos'),     corps.length);

  const elReg = document.getElementById('kpi-registros');
  if (elReg) setTimeout(() => { elReg.textContent = '+50.000'; }, 800);
}

// ==================== INIT + EVENTOS ====================
document.addEventListener('DOMContentLoaded', async () => {
    // Inicialización de mapas Leaflet
    mapSimple = L.map('map').setView([5.75, -73.0], 8);
    // crossOrigin: necesario para exportar el mapa a imagen (html2canvas) sin
    // "tainted canvas" -- CartoDB ya envía CORS, pero Leaflet no lo pide sin esto.
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        crossOrigin: true
    }).addTo(mapSimple);
    agregarControlExportar(mapSimple, '#obs-vista-mapa', 'mapa'); // incluye #obs-legend (hermano de .map-layout); el drawer se excluye en exportarComoImagen()

    mapA = L.map('map-a').setView([5.75, -73.0], 8);
    mapB = L.map('map-b').setView([5.75, -73.0], 8);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { crossOrigin: true }).addTo(mapA);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { crossOrigin: true }).addTo(mapB);

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

        currentGeojsonProvincias = await (await fetch('geojson/boyaca_provincias.geojson')).json();
        console.log(`GeoJSON de provincias cargado con ${currentGeojsonProvincias.features.length} provincias`);
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
    if (typeof actualizarLeyenda === 'function') setTimeout(() => actualizarLeyenda('candidato_ganador'), 500);
    animarKPIs();

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
        actualizarBreadcrumb();
    });
    document.getElementById('corporacion-selector').addEventListener('change', e => {
        currentCorporacion = e.target.value;
        cargarDatos(currentAnio, currentCorporacion);
        actualizarBreadcrumb();
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
        const vista = document.getElementById('tipo-vista').value;
        if (!modoComparacion && (vista === 'partido_heat' || vista === 'partido_desviacion')) actualizarMapaSimple();
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

    // ==================== TRAYECTORIA: INICIALIZACIÓN ====================
    const trayCargo = document.getElementById('tray-cargo');
    if (trayCargo) {
        const cuentaPorCargo = Object.values(DATOS_DISPONIBLES)
            .flat()
            .reduce((acc, c) => { acc[c] = (acc[c] || 0) + 1; return acc; }, {});
        const cargosValidos = Object.entries(cuentaPorCargo)
            .filter(([, n]) => n >= 2)
            .map(([c]) => c)
            .sort((a, b) => (LABELS_CORPORACION[a] || a).localeCompare(LABELS_CORPORACION[b] || b));
        trayCargo.innerHTML = '<option value="">Seleccione cargo</option>' +
            cargosValidos.map(c => `<option value="${c}">${LABELS_CORPORACION[c] || c}</option>`).join('');

        trayCargo.addEventListener('change', async () => {
            const cargo = trayCargo.value;
            const trayPartido = document.getElementById('tray-partido');
            if (!cargo || !trayPartido) return;
            trayPartido.innerHTML = '<option value="">Cargando partidos…</option>';
            const anioReciente = Object.entries(DATOS_DISPONIBLES)
                .filter(([, corps]) => corps.includes(cargo))
                .map(([a]) => Number(a))
                .sort((a, b) => b - a)[0];
            if (!anioReciente) return;
            const datos = await cargarPartidosPorAnioCorp(String(anioReciente), cargo);
            const partidos = [...new Set(datos.map(r => r['PARNOMBRE']))].filter(Boolean).sort();
            trayPartido.innerHTML = '<option value="">Seleccione partido</option>' +
                partidos.map(p => `<option value="${p}">${p}</option>`).join('');
        });
    }

    document.getElementById('btn-actualizar-trayectoria')
        ?.addEventListener('click', actualizarTrayectoriaPartido);

    ['tray-show-votos', 'tray-show-pct'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', () => {
            if (trajectoryMunicipioChart) actualizarTrayectoriaPartido();
        });
    });

    document.getElementById('escala-selector')?.addEventListener('change', () => {
        if (!modoComparacion) actualizarMapaSimple();
    });

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

    inicializarNav();
    actualizarBreadcrumb();
    inicializarBuscador();
    inicializarActor();
    inicializarCompetitividad();
    inicializarComparar();

    // ── Drawer: cerrar, minimizar, tabs ──
    // ── Menú móvil: abre el panel activo (Mapa o Actor/Competitividad/Comparar)
    // como overlay a ≤660px (ver style.css). El mismo botón/backdrop sirve para
    // cualquier vista porque solo un panel (.obs-panel o .actor-panel) está
    // visible a la vez.
    document.getElementById('obs-mobile-menu-toggle')?.addEventListener('click', () => {
        document.body.classList.toggle('obs-mobile-panel-open');
    });
    document.getElementById('obs-mobile-backdrop')?.addEventListener('click', () => {
        document.body.classList.remove('obs-mobile-panel-open');
    });

    document.getElementById('obs-drawer-close')?.addEventListener('click', cerrarDrawer);

    // Minimizar/expandir drawer
    document.getElementById('obs-drawer-toggle')?.addEventListener('click', () => {
        const drawer = document.getElementById('obs-drawer');
        const icon   = document.getElementById('obs-drawer-toggle-icon');
        if (!drawer) return;
        const min = drawer.classList.toggle('obs-drawer--minimized');
        if (icon) {
            icon.className = min ? 'fas fa-chevron-left' : 'fas fa-chevron-right';
        }
        setTimeout(() => {
            if (typeof mapSimple !== 'undefined' && mapSimple) mapSimple.invalidateSize();
        }, 320);
    });

    // Tabs Datos / Gráfica en el drawer
    document.querySelectorAll('.obs-drawer__tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.obs-drawer__tab').forEach(t => t.classList.remove('obs-drawer__tab--active'));
            document.querySelectorAll('.obs-drawer__panel').forEach(p => p.classList.remove('obs-drawer__panel--active'));
            tab.classList.add('obs-drawer__tab--active');
            const panel = document.getElementById('obs-draw-' + tab.dataset.drawtab);
            if (panel) panel.classList.add('obs-drawer__panel--active');
            // Si se activa la tab de gráfica, redibuja el chart (puede haber cambiado)
            if (tab.dataset.drawtab === 'grafica' && ultimoElementoDetalle) {
                const { datosPartidos, datosCandidatos, nombre, tipo } = ultimoElementoDetalle;
                if (datosPartidos || datosCandidatos) {
                    const tipoVista = document.getElementById('tipo-vista')?.value;
                    const esC = tipoVista === 'candidato_ganador' || tipoVista === 'candidato_heat' || tipoVista === 'candidato_ganador_por_partido';
                    const datos = esC
                        ? (datosCandidatos || []).sort((a,b)=>b['VOTOS']-a['VOTOS']).map(f => ({ nombre: f['CANNOMBRE'], votos: f['VOTOS'], partido: f['PARNOMBRE'] }))
                        : (datosPartidos || []).sort((a,b)=>b['VOTOS']-a['VOTOS']).map(p => ({ nombre: p['PARNOMBRE'], votos: p['VOTOS'], partido: p['PARNOMBRE'] }));
                    dibujarGrafico(datos, nombre, esC);
                }
            }
        });
    });

    // ── invalidateSize en arranque: da tiempo al browser de calcular el layout ──
    setTimeout(() => {
        if (typeof mapSimple !== 'undefined' && mapSimple) {
            mapSimple.invalidateSize();
        }
    }, 400);

    // Lógica botones de modo (Ganadores / Por partido / Calor / Margen)
    document.querySelectorAll('.obs-pill-modo').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.obs-pill-modo').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const modo = btn.dataset.modo;

            const selectVista    = document.getElementById('tipo-vista');
            const groupPartido   = document.getElementById('group-partido');
            const groupCandidato = document.getElementById('group-candidato');
            const groupCandidatoPartido = document.getElementById('group-candidato-partido');
            const groupHeatToggle = document.getElementById('group-heat-toggle');

            if (groupPartido)   groupPartido.style.display   = 'none';
            if (groupCandidato) groupCandidato.style.display = 'none';
            if (groupCandidatoPartido) groupCandidatoPartido.style.display = 'none';
            if (groupHeatToggle) groupHeatToggle.style.display = (modo === 'partido' || modo === 'calor') ? 'block' : 'none';

            if (modo === 'ganadores' || modo === 'ganador') {
                if (selectVista) selectVista.value = 'candidato_ganador';
                if (typeof actualizarMapaSimple === 'function') actualizarMapaSimple();
                if (typeof actualizarLeyenda === 'function') setTimeout(() => actualizarLeyenda('candidato_ganador'), 100);

            } else if (modo === 'candidato_partido') {
                // Candidato mas votado de UN partido especifico en cada
                // municipio -- no necesariamente el ganador absoluto del
                // municipio, a diferencia de 'ganadores'.
                if (selectVista) selectVista.value = 'candidato_ganador_por_partido';
                if (groupCandidatoPartido) groupCandidatoPartido.style.display = 'flex';
                _poblarDropdownPartidoGanador();
                if (typeof actualizarLeyenda === 'function') actualizarLeyenda('candidato_ganador_por_partido');

            } else if (modo === 'lista_ganadora') {
                // Colorea por la lista/partido con mas votos SUMADOS en el
                // municipio (currentPartidoData), a diferencia de 'ganadores'
                // que colorea por el partido del candidato individual mas
                // votado -- en listas abiertas estos dos pueden diferir.
                if (selectVista) selectVista.value = 'partido';
                if (typeof actualizarMapaSimple === 'function') actualizarMapaSimple();
                if (typeof actualizarLeyenda === 'function') setTimeout(() => actualizarLeyenda('partido'), 100);

            } else if (modo === 'partido') {
                if (selectVista) selectVista.value = 'partido_heat';
                if (groupPartido) groupPartido.style.display = 'flex';
                _poblarDropdownPartido();

            } else if (modo === 'calor') {
                if (selectVista) selectVista.value = 'calor';
                if (typeof actualizarMapaSimple === 'function') actualizarMapaSimple();
                if (typeof actualizarLeyenda === 'function') actualizarLeyenda('calor');

            } else if (modo === 'margen') {
                if (selectVista) selectVista.value = 'margen';
                if (typeof actualizarMapaSimple === 'function') actualizarMapaSimple();
                if (typeof actualizarLeyenda === 'function') actualizarLeyenda('margen');

            } else if (modo === 'desviacion') {
                if (selectVista) selectVista.value = 'partido_desviacion';
                if (groupPartido) groupPartido.style.display = 'flex';
                _poblarDropdownPartido();
                if (typeof actualizarLeyenda === 'function') actualizarLeyenda('partido_desviacion');
            }
        });
    });

    document.getElementById('heat-pct-toggle')?.addEventListener('change', e => {
        mapaCalorPorcentaje = e.target.checked;
        if (typeof actualizarMapaSimple === 'function') actualizarMapaSimple();
    });

    // Toggle de escala del mapa (Municipio / Provincia) — independiente
    // del dropdown "Saltar a provincia" (ese solo hace zoom).
    document.querySelectorAll('.obs-pill-escala').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.obs-pill-escala').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const escalaSel = document.getElementById('escala-selector');
            if (escalaSel) {
                escalaSel.value = btn.dataset.escala;
                escalaSel.dispatchEvent(new Event('change'));
            }
        });
    });

    // Poblar dropdown visual de partidos y conectarlo al selector legacy
    function _poblarDropdownPartido() {
        const lista     = document.getElementById('partido-dropdown');
        const legacySel = document.getElementById('partido-selector');
        const wrap      = document.querySelector('.obs-partido-dropdown-wrap');
        const trigger   = document.getElementById('partido-trigger');
        const triggerDot   = document.getElementById('partido-trigger-dot');
        const triggerLabel = document.getElementById('partido-trigger-label');
        if (!lista || typeof currentPartidoData === 'undefined' || !currentPartidoData) return;

        const excluir = ['CANDIDATOS TOTALES','VOTOS EN BLANCO','VOTOS NO MARCADOS','VOTOS NULOS'];
        const conteo = {};
        currentPartidoData.forEach(r => {
            if (r['PARNOMBRE'] && !excluir.includes(r['PARNOMBRE'])) {
                conteo[r['PARNOMBRE']] = (conteo[r['PARNOMBRE']] || 0) + r['VOTOS'];
            }
        });
        const partidos = Object.entries(conteo).sort((a, b) => b[1] - a[1]).map(([p]) => p);

        lista.innerHTML = partidos.map(p => {
            const clr = typeof colorPartido === 'function' ? colorPartido(p) : '#9CA3AF';
            return `<button class="obs-partido-btn" data-partido="${p}">
                <span class="obs-partido-btn__dot" style="background:${clr}"></span>
                <span class="obs-partido-btn__name">${p}</span>
            </button>`;
        }).join('');

        lista.querySelectorAll('.obs-partido-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                lista.querySelectorAll('.obs-partido-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                if (legacySel) {
                    legacySel.value = btn.dataset.partido;
                    legacySel.dispatchEvent(new Event('change'));
                }
                if (triggerLabel) triggerLabel.textContent = btn.dataset.partido;
                if (triggerDot) {
                    triggerDot.style.background = typeof colorPartido === 'function' ? colorPartido(btn.dataset.partido) : '#9CA3AF';
                    triggerDot.style.display = 'inline-block';
                }
                if (wrap) wrap.classList.remove('obs-partido-dropdown-wrap--open');
                if (typeof actualizarMapaSimple === 'function') actualizarMapaSimple();
            });
        });

        if (trigger && wrap && !trigger.dataset.wired) {
            trigger.dataset.wired = '1';
            trigger.addEventListener('click', () => wrap.classList.toggle('obs-partido-dropdown-wrap--open'));
            document.addEventListener('click', e => {
                if (!wrap.contains(e.target)) wrap.classList.remove('obs-partido-dropdown-wrap--open');
            });
        }
    }

    // Poblar dropdown visual de partidos para "Candidato por Partido" y
    // conectarlo al selector legacy #partido-ganador-selector.
    function _poblarDropdownPartidoGanador() {
        const lista     = document.getElementById('cxp-dropdown');
        const legacySel = document.getElementById('partido-ganador-selector');
        const wrap      = document.getElementById('cxp-dropdown-wrap');
        const trigger   = document.getElementById('cxp-trigger');
        const triggerDot   = document.getElementById('cxp-trigger-dot');
        const triggerLabel = document.getElementById('cxp-trigger-label');
        if (!lista || typeof ganadorPorPartidoPorMunicipio === 'undefined') return;

        const conteo = {};
        (currentPartidoData || []).forEach(r => {
            if (r['PARNOMBRE'] && ganadorPorPartidoPorMunicipio[r['PARNOMBRE']]) {
                conteo[r['PARNOMBRE']] = (conteo[r['PARNOMBRE']] || 0) + r['VOTOS'];
            }
        });
        const partidos = Object.keys(ganadorPorPartidoPorMunicipio).sort((a, b) => (conteo[b] || 0) - (conteo[a] || 0));

        lista.innerHTML = partidos.map(p => {
            const clr = typeof colorPartido === 'function' ? colorPartido(p) : '#9CA3AF';
            return `<button class="obs-partido-btn" data-partido="${p}">
                <span class="obs-partido-btn__dot" style="background:${clr}"></span>
                <span class="obs-partido-btn__name">${p}</span>
            </button>`;
        }).join('');

        lista.querySelectorAll('.obs-partido-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                lista.querySelectorAll('.obs-partido-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                if (legacySel) {
                    legacySel.value = btn.dataset.partido;
                    legacySel.dispatchEvent(new Event('change'));
                }
                if (triggerLabel) triggerLabel.textContent = btn.dataset.partido;
                if (triggerDot) {
                    triggerDot.style.background = typeof colorPartido === 'function' ? colorPartido(btn.dataset.partido) : '#9CA3AF';
                    triggerDot.style.display = 'inline-block';
                }
                if (wrap) wrap.classList.remove('obs-partido-dropdown-wrap--open');
                if (typeof actualizarMapaSimple === 'function') actualizarMapaSimple();
                if (typeof actualizarLeyenda === 'function') actualizarLeyenda('candidato_ganador_por_partido');
            });
        });

        if (trigger && wrap && !trigger.dataset.wired) {
            trigger.dataset.wired = '1';
            trigger.addEventListener('click', () => wrap.classList.toggle('obs-partido-dropdown-wrap--open'));
            document.addEventListener('click', e => {
                if (!wrap.contains(e.target)) wrap.classList.remove('obs-partido-dropdown-wrap--open');
            });
        }
    }
});

// ==================== LEYENDA DEL MAPA ====================
const RENOMBRAR_LEYENDA = {
    'Partido Conservador Colombiano': 'Partido Conservador',
    'Partido Liberal Colombiano': 'Partido Liberal',
    'Dignidad y Compromiso': 'Dignidad & Compromiso'
};
function formatearNombrePartido(nombre) {
    if (RENOMBRAR_LEYENDA[nombre]) return RENOMBRAR_LEYENDA[nombre];
    // Nombres ya en formato mixto (ej. "Alianza Verde") se dejan intactos;
    // solo se reformatean los que vienen todo en mayúsculas.
    if (nombre !== nombre.toUpperCase()) return nombre;
    return nombre.toLowerCase().replace(/(^|[\s-])([a-záéíóúñ])/g, (m, sep, c) => sep + c.toUpperCase());
}

document.getElementById('obs-legend')?.addEventListener('click', e => {
    if (e.target.closest('.ley-title--toggle')) {
        document.getElementById('obs-legend').classList.toggle('ley--open');
    }
});

function actualizarLeyenda(tipoVista) {
    const el = document.getElementById('obs-legend');
    if (!el) return;

    if (tipoVista === 'candidato_ganador' || tipoVista === 'partido') {
        // Leyenda de partidos presentes en el mapa actual
        if (!currentPartidoData) { el.innerHTML = ''; return; }
        const excluir = ['CANDIDATOS TOTALES','VOTOS EN BLANCO','VOTOS NO MARCADOS','VOTOS NULOS'];
        const UMBRAL_LEYENDA = 0.005; // 0.5% del total: oculta listas hiperlocales sin peso real (consejos comunitarios, etc.)
        const votosPorPartido = {};
        currentPartidoData.forEach(r => {
            if (r['PARNOMBRE'] && !excluir.includes(r['PARNOMBRE'])) {
                votosPorPartido[r['PARNOMBRE']] = (votosPorPartido[r['PARNOMBRE']] || 0) + r['VOTOS'];
            }
        });
        const totalVotos = Object.values(votosPorPartido).reduce((s, v) => s + v, 0);
        const partidos = Object.keys(votosPorPartido)
            .filter(p => totalVotos > 0 && (votosPorPartido[p] / totalVotos) >= UMBRAL_LEYENDA)
            .sort((a, b) => votosPorPartido[b] - votosPorPartido[a]);
        if (!partidos.length) { el.innerHTML = ''; return; }
        el.innerHTML = `
            <div class="ley-title ley-title--toggle" data-toggle="partidos">
                <span>PARTIDOS (${partidos.length})</span>
                <i class="fas fa-chevron-down ley-chevron"></i>
            </div>
            <div class="ley-partidos-list">
                ${partidos.map(p => {
                    const c = colorPartido(p);
                    return `<div class="ley-item"><span class="ley-dot" style="background:${c}"></span><span class="ley-label">${formatearNombrePartido(p)}</span></div>`;
                }).join('')}
            </div>`;

    } else if (tipoVista === 'calor') {
        el.innerHTML = `
            <div class="ley-title">DOMINANCIA DEL GANADOR</div>
            <div class="ley-gradient ley-gradient--calor"></div>
            <div class="ley-scale"><span>Competido</span><span>Dominado</span></div>
            <div class="ley-note">% de votos del partido ganador</div>`;

    } else if (tipoVista === 'margen') {
        el.innerHTML = `
            <div class="ley-title">MARGEN DE VICTORIA</div>
            <div class="ley-gradient ley-gradient--margen"></div>
            <div class="ley-scale"><span>Muy reñido</span><span>Dominio claro</span></div>
            <div class="ley-note">Diferencia entre 1° y 2° lugar</div>`;

    } else if (tipoVista === 'partido_desviacion') {
        el.innerHTML = `
            <div class="ley-title">DESVIACIÓN VS. PROMEDIO</div>
            <div class="ley-gradient ley-gradient--desviacion"></div>
            <div class="ley-scale"><span>Bajo el promedio</span><span>Sobre el promedio</span></div>
            <div class="ley-note">% local del partido menos su promedio departamental</div>`;

    } else if (tipoVista === 'candidato_ganador_por_partido') {
        const partidoSel = document.getElementById('partido-ganador-selector')?.value;
        if (!partidoSel || typeof ganadorPorPartidoPorMunicipio === 'undefined' || !ganadorPorPartidoPorMunicipio[partidoSel]) {
            el.innerHTML = `<div class="ley-note">Selecciona un partido para ver sus candidatos</div>`;
            return;
        }
        const votosPorCandidato = {};
        Object.values(ganadorPorPartidoPorMunicipio[partidoSel]).forEach(row => {
            votosPorCandidato[row['CANNOMBRE']] = (votosPorCandidato[row['CANNOMBRE']] || 0) + row['VOTOS'];
        });
        const candidatos = Object.keys(votosPorCandidato).sort((a, b) => votosPorCandidato[b] - votosPorCandidato[a]);
        el.innerHTML = `
            <div class="ley-title ley-title--toggle" data-toggle="candidatos">
                <span>CANDIDATOS DE ${formatearNombrePartido(partidoSel).toUpperCase()} (${candidatos.length})</span>
                <i class="fas fa-chevron-down ley-chevron"></i>
            </div>
            <div class="ley-partidos-list">
                ${candidatos.map(c => {
                    const clr = getColorCandidato(c);
                    return `<div class="ley-item"><span class="ley-dot" style="background:${clr}"></span><span class="ley-label">${c}</span></div>`;
                }).join('')}
            </div>`;

    } else {
        el.innerHTML = '';
    }
}

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
