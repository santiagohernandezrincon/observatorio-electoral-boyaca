# Observatorio Electoral de Boyacá

Visualizador interactivo de resultados electorales de Boyacá (Colombia), con mapas por municipio y provincia, trayectorias de partidos/candidatos a través del tiempo, análisis de competitividad y comparación entre elecciones.

**Sitio publicado:** https://santiagohernandezrincon.github.io/observatorio-electoral-boyaca/

## Datos

Fuente: **Registraduría Nacional del Estado Civil** — escrutinios oficiales de elecciones nacionales y locales, 2010–2026, para los 123 municipios de Boyacá. Cubre Cámara, Senado, Presidencia, Alcaldía, Gobernación, Asamblea, Concejo, JAL y consultas, según disponibilidad por año (ver `js/globals.js`, `DATOS_DISPONIBLES`).

## Cómo correrlo localmente

No requiere build ni dependencias — es HTML/CSS/JS estático. Solo necesita servirse por HTTP (abrir `index.html` directamente como archivo `file://` no funciona, porque el navegador bloquea el `fetch()` de los CSV/GeoJSON).

```bash
python -m http.server 8000
```

y abrir `http://localhost:8000` en el navegador.

## Estructura de carpetas

| Carpeta | Contenido |
|---|---|
| `data/` | CSV procesados (`votos_partido_municipio_*.csv`, `votos_candidato_municipio_*.csv`) listos para consumir en el front-end |
| `data/raw/` | Datos crudos tal como se descargan de la Registraduría, antes de procesar |
| `geojson/` | Geometría de municipios y provincias de Boyacá |
| `js/` | Lógica del front-end (carga de datos, mapas Leaflet, gráficos, UI) |
| `scripts/` | Pipeline en Python para procesar los crudos de `data/raw/` y generar los CSV de `data/` |

## Licencia

Este proyecto está bajo [Creative Commons Atribución-NoComercial 4.0 Internacional (CC BY-NC 4.0)](https://creativecommons.org/licenses/by-nc/4.0/deed.es). Ver [LICENSE](LICENSE).
