"""
procesar_presidencia_2026.py
Procesa 2026_presidencia_1v.dta.csv / 2026_presidencia_2v.dta.csv
(formato "columnas abreviadas 2026", igual a Cámara/Senado 2026, pero
con separador ';' en vez de ',' -- _procesar_generico_mesa() en
procesar_raw.py tiene el separador hardcodeado a ',', así que no sirve
tal cual para estos 2 archivos).

Reutiliza las funciones ya probadas de procesar_raw.py (formatear_nombre,
EXCLUIR, guardar_candidato, guardar_partido -- ninguna tiene relación
con el drift de partido_map/NOMBRES_PARTIDO, que solo afecta al formato
"viejo" CEDAE de procesar_dta()). No modifica procesar_raw.py ni corre
su main(): script quirúrgico, aislado, solo para estos 2 archivos.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from procesar_raw import RAW, EXCLUIR, formatear_nombre, guardar_candidato, guardar_partido, leer_csv

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')


def procesar_presidencia_2026(vuelta):
    nombre = f'2026_presidencia_{vuelta}v.dta.csv'
    ruta = RAW / nombre
    cargo = f'presidencia_{vuelta}v'
    print(f"── {nombre}  →  2026 / {cargo} ──")

    df = leer_csv(ruta, separador=';')
    df.columns = [c.strip() for c in df.columns]
    print(f"    filas totales : {len(df)}")

    df['DEP_CLEAN'] = df['DEPNOMBRE'].astype(str).str.strip().str.upper()
    df = df[df['DEP_CLEAN'] == 'BOYACA'].copy()
    print(f"    filas Boyacá  : {len(df)}")
    if df.empty:
        print("    ⚠  Sin datos para Boyacá — archivo omitido.")
        return

    df['VOTOS'] = pd_to_numeric_safe(df['VOTOS'])
    df['MUNNOMBRE'] = df['MUNNOMBRE'].astype(str).str.strip().str.upper()
    df['CANNOMBRE'] = df['CANNOMBRE'].apply(
        lambda n: formatear_nombre({'nombres': n, 'primer_apellido': '', 'segundo_apellido': ''})
    )
    df['PARNOMBRE'] = df['PARNOMBRE'].astype(str).str.strip()

    df_valido = df[
        ~df['CANNOMBRE'].str.upper().isin(EXCLUIR) &
        ~df['PARNOMBRE'].str.upper().isin(EXCLUIR)
    ].copy()

    guardar_candidato(df_valido, '2026', cargo)
    guardar_partido(df_valido, '2026', cargo)


def pd_to_numeric_safe(serie):
    import pandas as pd
    return pd.to_numeric(serie, errors='coerce').fillna(0).astype(int)


if __name__ == '__main__':
    procesar_presidencia_2026('1')
    procesar_presidencia_2026('2')
    print("\n✅  Presidencia 2026 (1ª y 2ª vuelta) procesada.")
