// ==================== EXPORTAR MAPA COMO IMAGEN ====================
// Un control de Leaflet (mismo patrón visual que el zoom +/-) en la esquina de
// cada mapa (Vista Mapa, Actor, Competitividad, Comparar) que exporta el mapa
// (+ leyenda, donde aplique) como PNG via html2canvas.

// Clave de propietario: cambia este valor si quieres otra. Se compara en el
// navegador (cualquiera que vea el código fuente puede leerla) -- no protege
// nada sensible, solo evita que un visitante casual quite la marca de agua.
const OBS_EXPORT_CLAVE = 'boyaca2026';
const OBS_EXPORT_LOCALSTORAGE_KEY = 'obsExportSinMarca';
const OBS_HTML2CANVAS_URL = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';

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

// html2canvas no compone bien las capas de Leaflet: el panel de tiles se
// mueve con el transform de .leaflet-map-pane, pero el SVG de los polígonos
// (overlayPane) tiene ADEMÁS su propio transform anidado (truco de Leaflet
// para viewBox), y html2canvas 1.4.1 no aplica ambos transforms en conjunto
// -- el resultado es que los polígonos salen desplazados de los tiles en
// TODA exportación, con o sin pan/zoom. Antes de capturar, convertimos cada
// transform anidado a left/top absolutos (posición real en pantalla via
// getBoundingClientRect, que el navegador sí compone bien) y lo restauramos
// después -- así html2canvas ya no tiene que interpretar el transform.
function bakeLeafletTransforms(contenedor) {
    const elementos = contenedor.querySelectorAll(
        '.leaflet-pane[style*="transform"], .leaflet-pane [style*="transform"]'
    );
    const restaurar = [];
    const contRect = contenedor.getBoundingClientRect();
    elementos.forEach(el => {
        const rect = el.getBoundingClientRect();
        restaurar.push({
            el,
            transform: el.style.transform,
            position: el.style.position,
            left: el.style.left,
            top: el.style.top
        });
        el.style.transform = 'none';
        el.style.position = 'absolute';
        el.style.left = (rect.left - contRect.left) + 'px';
        el.style.top = (rect.top - contRect.top) + 'px';
    });
    return () => restaurar.forEach(r => {
        r.el.style.transform = r.transform;
        r.el.style.position = r.position;
        r.el.style.left = r.left;
        r.el.style.top = r.top;
    });
}

async function exportarComoImagen(selectorContenedor, nombreArchivoBase) {
    const contenedor = document.querySelector(selectorContenedor);
    if (!contenedor) { console.error('exportarComoImagen: no se encontró', selectorContenedor); return; }
    try {
        await cargarScriptSiNecesario(OBS_HTML2CANVAS_URL, () => typeof html2canvas !== 'undefined');
    } catch (e) {
        console.error('Error cargando html2canvas:', e);
        alert('No se pudo cargar la librería de exportación (revisa tu conexión) — intenta de nuevo.');
        return;
    }

    const sinMarca = obsSolicitarPermisoSinMarca();

    let capturado;
    const restaurarTransforms = bakeLeafletTransforms(contenedor);
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
    } finally {
        restaurarTransforms();
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
