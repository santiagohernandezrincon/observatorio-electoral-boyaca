// ==================== GRÁFICO MUNICIPIO / PARTIDO / CANDIDATO ====================
function dibujarGrafico(datos, titulo, esCandidato) {
    if (!datos || datos.length === 0) return;
    const ctx = document.getElementById('chart-municipio').getContext('2d');
    if (window.municipioChart) window.municipioChart.destroy();

    let datosMostrar = [...datos];
    if (graficoTipo === 'bar' && datosMostrar.length > 13) datosMostrar = datosMostrar.slice(0, 13);

    const labels  = datosMostrar.map(d => d.nombre);
    const valores  = datosMostrar.map(d => d.votos);
    const colores  = esCandidato
        ? datosMostrar.map(d => getColorCandidato(d.nombre))
        : datosMostrar.map(d => {
            const row = currentPartidoData.find(p => p['PARNOMBRE'] === d.partido);
            return row ? row.COLOR_BASE : '#3498db';
          });

    const titulo_completo = `Votación en ${titulo}${esCandidato ? ' (Candidatos)' : ' (Partidos)'}`;

    if (graficoTipo === 'bar') {
        window.municipioChart = new Chart(ctx, {
            type: 'bar',
            data: { labels, datasets: [{ label: 'Votos', data: valores, backgroundColor: colores, borderWidth: 1 }] },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: titulo_completo }
                },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Votos' } },
                    x: { ticks: { autoSkip: true, maxRotation: 45 } }
                }
            }
        });
    } else {
        window.municipioChart = new Chart(ctx, {
            type: 'pie',
            data: { labels, datasets: [{ data: valores, backgroundColor: colores, borderWidth: 1 }] },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'right', labels: { font: { size: 10 } } },
                    title: { display: true, text: titulo_completo }
                }
            }
        });
    }
}

// ==================== TRAYECTORIA DE PARTIDO EN EL TIEMPO ====================
async function actualizarTrayectoriaPartido() {
    const municipio  = document.getElementById('municipio-selector-trayectoria').value;
    const cargo      = document.getElementById('tray-cargo').value;
    const partido    = document.getElementById('tray-partido').value;
    const showVotos  = document.getElementById('tray-show-votos').checked;
    const showPct    = document.getElementById('tray-show-pct').checked;

    if (!municipio || !cargo || !partido) { alert('Seleccione municipio, cargo y partido'); return; }
    if (!showVotos && !showPct) { alert('Active al menos un eje (Votos o %)'); return; }

    const anios = Object.entries(DATOS_DISPONIBLES)
        .filter(([, corps]) => corps.includes(cargo))
        .map(([a]) => a)
        .sort();

    const resultados = await Promise.all(anios.map(a => cargarPartidosPorAnioCorp(a, cargo)));

    const munNorm = normalizarNombre(municipio);
    const serie = anios.map((anio, i) => {
        const fila = resultados[i].find(r =>
            normalizarNombre(r['MUNNOMBRE']) === munNorm && r['PARNOMBRE'] === partido
        );
        return { anio, votos: fila ? fila['VOTOS'] : 0, pct: fila ? fila['PORCENTAJE'] : 0 };
    });

    const ctx = document.getElementById('trajectory-municipio-chart').getContext('2d');
    if (trajectoryMunicipioChart) trajectoryMunicipioChart.destroy();

    const color = colorPartido(partido);
    const datasets = [];

    if (showVotos) {
        datasets.push({
            label: 'Votos',
            data: serie.map(s => s.votos),
            yAxisID: 'y-votos',
            borderColor: color,
            backgroundColor: color + '33',
            borderWidth: 2,
            tension: 0.3,
            fill: !showPct,
            pointRadius: 5,
            pointHoverRadius: 7
        });
    }
    if (showPct) {
        datasets.push({
            label: '% votos válidos',
            data: serie.map(s => parseFloat(s.pct.toFixed(2))),
            yAxisID: 'y-pct',
            borderColor: color,
            backgroundColor: color + '22',
            borderDash: showVotos ? [6, 4] : [],
            borderWidth: 2,
            tension: 0.3,
            fill: !showVotos,
            pointRadius: 5,
            pointHoverRadius: 7
        });
    }

    const scales = {
        x: { title: { display: true, text: 'Año electoral' } }
    };
    if (showVotos) {
        scales['y-votos'] = {
            type: 'linear', position: 'left', beginAtZero: true,
            title: { display: true, text: 'Votos' },
            ticks: { callback: v => v.toLocaleString('es-CO') }
        };
    }
    if (showPct) {
        scales['y-pct'] = {
            type: 'linear',
            position: showVotos ? 'right' : 'left',
            beginAtZero: true,
            max: 100,
            title: { display: true, text: '% votos válidos' },
            ticks: { callback: v => v + '%' },
            grid: { drawOnChartArea: !showVotos }
        };
    }

    trajectoryMunicipioChart = new Chart(ctx, {
        type: 'line',
        data: { labels: serie.map(s => s.anio), datasets },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                title: {
                    display: true,
                    text: `${partido} · ${LABELS_CORPORACION[cargo] || cargo} · ${municipio}`
                },
                tooltip: {
                    callbacks: {
                        label: ctx => ctx.dataset.yAxisID === 'y-votos'
                            ? `Votos: ${ctx.raw.toLocaleString('es-CO')}`
                            : `%: ${ctx.raw.toFixed(1)}%`
                    }
                }
            },
            scales
        }
    });
}

// ==================== GRÁFICO TRAYECTORIA MUNICIPAL (CANDIDATOS) ====================
async function actualizarGraficoComparativoMunicipio() {
    const municipio = document.getElementById('municipio-selector-trayectoria').value;
    if (!municipio) { alert('Seleccione un municipio'); return; }

    const comparaciones = [];
    document.querySelectorAll('.comparacion-item').forEach(item => {
        const anio       = item.querySelector('.comparacion-anio').value;
        const corporacion= item.querySelector('.comparacion-corporacion').value;
        const candidato  = item.querySelector('.comparacion-candidato').value;
        if (anio && corporacion && candidato) comparaciones.push({ anio, corporacion, candidato });
    });
    if (!comparaciones.length) { alert('Agregue al menos una comparación'); return; }

    const labels          = [];
    const datosMunicipio  = [];
    const datosDepartamento = [];

    for (const comp of comparaciones) {
        const votosMun = await obtenerVotosCandidatoMunicipio(comp.anio, comp.corporacion, comp.candidato, municipio);
        const votosDep = await obtenerVotosCandidatoDepartamento(comp.anio, comp.corporacion, comp.candidato);
        labels.push(`${comp.candidato} (${comp.anio} - ${comp.corporacion})`);
        datosMunicipio.push(votosMun);
        datosDepartamento.push(votosDep);
    }

    const ctx = document.getElementById('trajectory-municipio-chart').getContext('2d');
    if (trajectoryMunicipioChart) trajectoryMunicipioChart.destroy();

    trajectoryMunicipioChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: `Votos en ${municipio}`,
                data: datosMunicipio,
                backgroundColor: '#3498db',
                borderColor: '#2980b9',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Número de votos' } },
                x: { ticks: { autoSkip: false, maxRotation: 45 } }
            },
            plugins: {
                tooltip: { callbacks: { label: ctx => `${ctx.raw.toLocaleString()} votos` } },
                title: { display: true, text: `Evolución de candidatos en ${municipio}` }
            }
        }
    });

    let html = '<div style="margin-top:15px;font-size:12px;border-top:1px solid #ccc;padding-top:10px;"><strong>Votación departamental:</strong><br>';
    labels.forEach((l, i) => { html += `${l}: ${datosDepartamento[i].toLocaleString()} votos<br>`; });
    html += '</div>';

    let container = document.getElementById('departamento-texto');
    if (!container) {
        container = document.createElement('div');
        container.id = 'departamento-texto';
        document.querySelector('.trajectory-municipio-container').appendChild(container);
    }
    container.innerHTML = html;
}
