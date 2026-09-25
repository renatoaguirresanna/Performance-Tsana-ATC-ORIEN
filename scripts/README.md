# Scripts de ingesta

## CSV de atenciones

Se sube desde el panel admin (`/admin/reportes`). Se fusiona automáticamente:
cada fila se identifica por `attention_id` y se hace `upsert` (insert-or-update),
así que si subes un reporte que se superpone en fechas con uno anterior, las
filas duplicadas se sobrescriben con la versión más reciente y los días que no
estaban cubiertos simplemente se agregan. No hace falta borrar ni recortar el
archivo antes de subirlo.

## JSON de conversaciones (Heynow / TSANA OFICIAL / Orientaciones)

Este archivo puede pesar más de 100MB, así que se ingiere por script en vez de
por el navegador:

```bash
SUPABASE_URL=https://fevjtpgdebkukbwfxzst.supabase.co \
SUPABASE_ANON_KEY=<anon o publishable key> \
ADMIN_EMAIL=tu-correo-admin@... \
ADMIN_PASSWORD=tu-contraseña \
node scripts/ingest-conversaciones.mjs ruta/al/archivo.json
```

Igual que el CSV, usa el `id` de cada sesión como llave natural (`session_key`)
y hace `upsert`: un scrape nuevo que se superponga con uno anterior sobrescribe
los duplicados y agrega los días nuevos, sin duplicar nada. Puedes correr este
script cuantas veces quieras con scrapes actualizados.

El script registra cada carga en `report_uploads` (con el rango de fechas
declarado por el propio scrape) para que el panel de reportes muestre el
historial de cargas y su cobertura.
