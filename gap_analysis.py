import pandas as pd
import glob
import json
import subprocess
import sys

# 1. Collect all PARNOMBRE values from CSVs
archivos = glob.glob('data/**/*.csv', recursive=True)
partidos_raw = set()

for f in archivos:
    for enc in ['utf-8', 'latin-1', 'cp1252']:
        try:
            df = pd.read_csv(f, sep=';', encoding=enc, low_memory=False)
            for col in ['PARNOMBRE', 'partido', 'PARTIDO', 'partido_nombre', 'NOMBRE_PARTIDO']:
                if col in df.columns:
                    partidos_raw.update(
                        df[col].dropna().astype(str).str.strip().unique()
                    )
            break
        except Exception:
            continue

print(f'Total PARNOMBRE en CSVs: {len(partidos_raw)}', file=sys.stderr)

# 2. Extract NORMALIZAR_PARTIDO keys via Node.js
try:
    node_script = r"""
const fs = require('fs');
let src = fs.readFileSync('js/colores_partido.js', 'utf8');
src = src.replace(/const /g, 'var ');
eval(src);
const keys = Object.keys(NORMALIZAR_PARTIDO);
process.stdout.write(JSON.stringify(keys));
"""
    result = subprocess.run(
        ['node', '-e', node_script],
        capture_output=True,
        encoding='utf-8'
    )
    claves_norm = set(json.loads(result.stdout))
    print(f'Claves en NORMALIZAR_PARTIDO: {len(claves_norm)}', file=sys.stderr)
except Exception as e:
    print(f'Error Node.js: {e}', file=sys.stderr)
    claves_norm = set()

# 3. Case-insensitive check against NORMALIZAR keys
claves_upper = {k.upper(): k for k in claves_norm}

sin_mapeo = []
for p in partidos_raw:
    if p in ('nan', 'None', ''):
        continue
    if len(p) <= 3:
        continue
    if p in claves_norm:
        continue
    if p.upper() in claves_upper:
        continue
    sin_mapeo.append(p)

sin_mapeo.sort()
print(f'\nTotal sin mapeo: {len(sin_mapeo)}')
for p in sin_mapeo:
    print(p)
