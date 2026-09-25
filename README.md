# Buscador de Tsana

Buscador interno estilo Google para el equipo de Atención al Cliente (ATC) de
Tsana, con un panel de administración para gestionar la base de conocimiento,
revisar qué se está preguntando, y ver el performance real de Atenciones y
Orientaciones.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres + Auth + RLS) — proyecto **Performance Tsana**, org Pacífico Salud
- Recharts para los gráficos del dashboard

## Roles

- **pending**: cuenta recién registrada, esperando aprobación.
- **agent** (ATC): solo puede usar el buscador.
- **admin** (sub admin): buscador + dashboard de performance + panel de consultas + base de conocimiento + reportes.

Un admin aprueba cuentas nuevas y les asigna rol en `/admin/usuarios`.

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # completa con la URL y anon key del proyecto Supabase
npm run dev
```

## Estructura relevante

- `src/app/(auth)` — login y registro.
- `src/app/page.tsx` — el buscador (Buscador de Tsana).
- `src/app/admin/*` — panel admin (usuarios, consultas, base de conocimiento, reportes).
- `src/app/api/search/*` — endpoint del buscador (full-text search + registro de cada consulta).
- `scripts/` — ingesta del JSON pesado de conversaciones (ver `scripts/README.md`).

## Reportes y fusión de datos

Tanto el CSV de atenciones (subido desde `/admin/reportes`) como el JSON de
conversaciones (`scripts/ingest-conversaciones.mjs`) se cargan por `upsert`
sobre una llave natural (`attention_id` / `session_key`). Esto significa que
subir un reporte que se superpone en fechas con uno anterior no duplica nada:
los registros repetidos se actualizan y los días nuevos se agregan solos.

## Despliegue

Pendiente de configurar (Cloudflare Pages/Workers).
