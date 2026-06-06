import pandas as pd, glob, re

archivos = glob.glob('data/**/*.csv', recursive=True)
codigos_numericos = {}
for f in archivos:
    for enc in ['utf-8','latin-1','cp1252']:
        try:
            df = pd.read_csv(f, sep=';', encoding=enc, low_memory=False)
            for col in ['PARNOMBRE','partido','PARTIDO']:
                if col in df.columns:
                    valores = df[col].dropna().astype(str).str.strip()
                    numericos = valores[valores.str.match(r'^\d{6,}$')]
                    for v in numericos.unique():
                        if v not in codigos_numericos:
                            codigos_numericos[v] = []
                        codigos_numericos[v].append(f)
            break
        except:
            continue

print(f'Codigos numericos sin mapear: {len(codigos_numericos)}')
for codigo, archivos_lista in sorted(codigos_numericos.items()):
    archivos_cortos = [a.replace('data\\','').replace('data/','') for a in archivos_lista[:2]]
    print(f'  {codigo} -> aparece en: {archivos_cortos}')
