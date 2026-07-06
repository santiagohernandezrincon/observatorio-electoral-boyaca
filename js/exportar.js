// ==================== EXPORTAR MAPA COMO IMAGEN ====================
// Un control de Leaflet (mismo patrón visual que el zoom +/-) en la esquina de
// cada mapa (Vista Mapa, Actor, Competitividad, Comparar) que exporta el mapa
// (+ leyenda, donde aplique) como PNG via html2canvas.

// Clave de propietario: cambia este valor si quieres otra. Se compara en el
// navegador (cualquiera que vea el código fuente puede leerla) -- no protege
// nada sensible, solo evita que un visitante casual quite la marca de agua.
const OBS_EXPORT_CLAVE = 'boyaca2026';
const OBS_EXPORT_LOCALSTORAGE_KEY = 'obsExportSinMarca';

function obsTienePermisoSinMarca() {
    return localStorage.getItem(OBS_EXPORT_LOCALSTORAGE_KEY) === 'true';
}

function obsSolicitarPermisoSinMarca() {
    if (obsTienePermisoSinMarca()) return true;
    const clave = window.prompt('Clave de propietario (déjalo vacío para exportar con marca de agua):');
    if (clave === null) return false;
    if (clave === OBS_EXPORT_CLAVE) {
        localStorage.setItem(OBS_EXPORT_LOCALSTORAGE_KEY, 'true');
        return true;
    }
    return false;
}

async function exportarComoImagen(selectorContenedor, nombreArchivoBase) {
    const contenedor = document.querySelector(selectorContenedor);
    if (!contenedor) { console.error('exportarComoImagen: no se encontró', selectorContenedor); return; }
    if (typeof html2canvas === 'undefined') {
        alert('No se pudo cargar la librería de exportación (revisa tu conexión) — intenta de nuevo.');
        return;
    }

    const sinMarca = obsSolicitarPermisoSinMarca();

    let capturado;
    try {
        capturado = await html2canvas(contenedor, {
            useCORS: true,
            backgroundColor: '#ffffff',
            ignoreElements: el => el.classList && (
                el.classList.contains('obs-drawer') ||
                el.classList.contains('obs-export-control')
            )
        });
    } catch (e) {
        console.error('Error exportando el mapa:', e);
        alert('No se pudo generar la imagen. Revisa la consola para más detalle.');
        return;
    }

    // El canvas que devuelve html2canvas no admite dibujado posterior en esta
    // versión (fillRect/fillText no tienen efecto ahí, verificado). Se copia
    // a un canvas nuevo -- ese sí es mutable normalmente -- antes de agregar
    // la marca de agua.
    const canvas = document.createElement('canvas');
    canvas.width = capturado.width;
    canvas.height = capturado.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(capturado, 0, 0);

    if (!sinMarca) {
        const texto = 'Santiago Hernández Rincón · Observatorio Electoral de Boyacá';
        const fontSize = Math.max(12, Math.round(canvas.width * 0.014));
        ctx.font = `${fontSize}px sans-serif`;
        const metrics = ctx.measureText(texto);
        const paddingX = 10, paddingY = 8;
        const boxW = metrics.width + paddingX * 2;
        const boxH = fontSize + paddingY * 2;
        const x = Math.max(8, canvas.width - boxW - 12);
        const y = Math.max(8, canvas.height - boxH - 12);
        ctx.fillStyle = 'rgba(11, 25, 41, 0.8)';
        ctx.fillRect(x, y, boxW, boxH);
        ctx.fillStyle = '#ffffff';
        ctx.textBaseline = 'middle';
        ctx.fillText(texto, x + paddingX, y + boxH / 2);
    }

    const enlace = document.createElement('a');
    const fecha = new Date().toISOString().slice(0, 10);
    enlace.download = `observatorio-boyaca-${nombreArchivoBase}-${fecha}.png`;
    enlace.href = canvas.toDataURL('image/png');
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
}

// Agrega el botón de exportar como control de Leaflet, esquina superior derecha
// (mismo patrón visual que el control de zoom).
function agregarControlExportar(map, selectorContenedor, nombreArchivoBase) {
    const control = L.control({ position: 'topright' });
    control.onAdd = function () {
        const div = L.DomUtil.create('div', 'leaflet-bar obs-export-control');
        div.innerHTML = '<a href="#" title="Exportar mapa como imagen" role="button" aria-label="Exportar mapa como imagen"><i class="fas fa-download"></i></a>';
        L.DomEvent.disableClickPropagation(div);
        div.querySelector('a').addEventListener('click', e => {
            e.preventDefault();
            exportarComoImagen(selectorContenedor, nombreArchivoBase);
        });
        return div;
    };
    control.addTo(map);
}
