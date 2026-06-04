// ==================== GRÁFICO MUNICIPIO / PARTIDO ====================
function dibujarGrafico(datos, titulo, esCandidato) {
    if (!datos || datos.length === 0) return;
    const ctx = document.getElementById('chart-municipio').getContext('2d');
    if (window.municipioChart) window.municipioChart.destroy();

    let datosMostrar = [...datos];
    if (graficoTipo === 'bar' && datosMostrar.length > 13) datosMostrar = datosMostrar.slice(0, 13);

    const labels = datosMostrar.map(d => d.nombre);
    const valores = datosMostrar.map(d => d.votos);

    let colores;
    if (esCandidato) {
        colores = datosMostrar.map(d => getColorCandidato(d.nombre));
    } else {
        colores = datosMostrar.map(d => {
            const partidoRow = currentPartidoData.find(p => p['PARNOMBRE'] === d.partido);
            return partidoRow ? partidoRow.COLOR_BASE : '#3498db';
        });
    }

    if (graficoTipo === 'bar') {
        window.municipioChart = new Chart(ctx, {
            type: 'bar',
            data: { labels, datasets: [{ label: 'Votos', data: valores, backgroundColor: colores, borderWidth: 1 }] },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { display: false }, title: { display: true, text: `Votación en ${titulo}${esCandidato ? ' (Candidatos)' : ' (Partidos)'}` } },
                scales: { y: { beginAtZero: true, title: { display: true, text: 'Votos' } }, x: { ticks: { autoSkip: true, maxRotation: 45 } } }
            }
        });
    } else {
        window.municipioChart = new Chart(ctx, {
            type: 'pie',
            data: { labels, datasets: [{ data: valores, backgroundColor: colores, borderWidth: 1 }] },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { position: 'right', labels: { font: { size: 10 } } }, title: { display: true, text: `Votación en ${titulo}${esCandidato ? ' (Candidatos)' : ' (Partidos)'}` } }
            }
        });
    }
}

// ==================== GRÁFICO TRAYECTORIA MUNICIPAL ====================
async function actualizarGraficoComparativoMunicipio() {
    const municipio = document.getElementById('municipio-selector-trayectoria').value;
    if (!municipio) {
        alert('Seleccione un municipio');
        return;
    }

    const items = document.querySelectorAll('.comparacion-item');
    const comparaciones = [];
    items.forEach(item => {
        const anio = item.querySelector('.comparacion-anio').value;
        const corporacion = item.querySelector('.comparacion-corporacion').value;
        const candidato = item.querySelector('.comparacion-candidato').value;
        if (anio && corporacion && candidato) {
            comparaciones.push({ anio, corporacion, candidato });
        }
    });
    if (comparaciones.length === 0) {
        alert('Agregue al menos una comparación');
        return;
    }

    const labels = [];
    const datosMunicipio = [];
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
            labels: labels,
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
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Número de votos' }
                },
                x: {
                    ticks: { autoSkip: false, maxRotation: 45 }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.raw.toLocaleString()} votos`
                    }
                },
                title: {
                    display: true,
                    text: `Evolución de candidatos en ${municipio}`
                }
            }
        }
    });

    let textoDepartamento = '<div style="margin-top: 15px; font-size: 12px; border-top: 1px solid #ccc; padding-top: 10px;"><strong>Votación departamental:</strong><br>';
    for (let i = 0; i < labels.length; i++) {
        textoDepartamento += `${labels[i]}: ${datosDepartamento[i].toLocaleString()} votos<br>`;
    }
    textoDepartamento += '</div>';

    let container = document.getElementById('departamento-texto');
    if (!container) {
        container = document.createElement('div');
        container.id = 'departamento-texto';
        document.querySelector('.trajectory-municipio-container').appendChild(container);
    }
    container.innerHTML = textoDepartamento;
}
