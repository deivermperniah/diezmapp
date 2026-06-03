# DIEZMAPP

Aplicacion web para administrar sobres de diezmos y ofrendas por iglesia.

## Stack

- Frontend: Vue 3, Vite, Vue Router, PrimeVue, CSS propio.
- Backend: Node.js, Express, PostgreSQL, `pg`, `dotenv`, `cors`.
- Package manager: pnpm.
- Base de datos: PostgreSQL.

## Funcionamiento general

El sistema permite:

- Administrar iglesias.
- Seleccionar una iglesia activa.
- Administrar miembros por iglesia.
- Registrar sobres por fecha.
- Reiniciar el numero de sobre cada mes y por iglesia.
- Guardar diezmo, pacto de amor, ofrendas de colaboracion y transferencias.
- Convertir montos capturados en bolivares a dolares antes de guardar.
- Consultar reportes semanales y mensuales.
- Exportar reportes en Excel, PDF y CSV.

Los montos operativos se guardan en dolares. Si el usuario captura en bolivares, el backend consulta la tasa oficial configurada y convierte antes de persistir.

## Variables de entorno

Backend:

```bash
cp backend/.env.example backend/.env
```

En desarrollo local normalmente se usa `DB_SSL=false`.

En Neon/Vercel usa:

```env
NODE_ENV=production
DB_SSL=true
```

Frontend:

```bash
cp frontend/.env.example frontend/.env
```

## Instalacion

```bash
pnpm --dir backend install
pnpm --dir frontend install
```

## Base de datos

PostgreSQL debe estar instalado y corriendo.

Configura `backend/.env` con las credenciales de PostgreSQL y ejecuta:

```bash
pnpm --dir backend db:setup
```

El script crea la base si no existe y aplica:

```text
database/diezmos_db.sql
```

## Ejecutar en desarrollo

Backend:

```bash
pnpm --dir backend dev
```

Frontend:

```bash
pnpm --dir frontend dev --host 127.0.0.1
```

## Build frontend

```bash
pnpm --dir frontend build
```

## Despliegue en Vercel

El proyecto usa `vercel.json` con dos servicios:

- `frontend`: Vite, publicado en `/`.
- `backend`: Express, publicado en `/_/backend`.

En produccion el frontend llama automaticamente al backend en:

```text
/_/backend/api
```

Si frontend y backend se despliegan juntos en Vercel, no hace falta definir `VITE_API_URL`.

## Validacion recomendada

```bash
pnpm --dir frontend run lint
pnpm --dir frontend build
node -e "import('./backend/src/app.js').then(() => console.log('backend import ok'))"
```

## Documentacion

```text
domumentacion/funcionamiento-general.md
domumentacion/frontend.md
domumentacion/backend.md
domumentacion/database.md
```

## Rutas principales

Frontend:

- `/`
- `/miembros`
- `/sobres`
- `/reportes`
- `/configuracion`

Backend:

- `GET /api/health`
- `GET /api/health/database`
- `GET /api/iglesias`
- `GET /api/monedas`
- `GET /api/miembros`
- `GET /api/sobres`
- `GET /api/reportes/semanal`
- `GET /api/reportes/mensual`
- `GET /api/configuracion/tasa-dolar`
