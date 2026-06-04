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

// ==================== GRÁFICO TRAYECTORIA MUNICIPAL ====================
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
