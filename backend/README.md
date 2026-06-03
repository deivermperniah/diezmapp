# DIEZMAPP Backend

API REST para administracion de sobres de diezmos, ofrendas, transferencias y reportes.

## Stack

- Node.js
- Express
- PostgreSQL
- pg
- dotenv
- cors
- ES Modules

## Configuracion

Crear o revisar el archivo `.env`:

```env
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173

DB_HOST=localhost
DB_PORT=5432
DB_NAME=diezmos_db
DB_ADMIN_DATABASE=postgres
DB_USER=diezmapp_user
DB_PASSWORD=diezmapp_password
DB_SSL=false
```

Para Neon/Vercel o cualquier PostgreSQL que requiera SSL:

```env
NODE_ENV=production
DB_SSL=true
```

## Comandos

```bash
pnpm db:setup
pnpm dev
pnpm start
```

`pnpm db:setup` crea la base `diezmos_db` si no existe y aplica el schema desde `../database/diezmos_db.sql`.

## Endpoints Base

```text
GET /api/health
GET /api/health/database
GET /api/iglesias
GET /api/monedas
GET /api/configuracion/tasa-dolar
```

## Modulos Principales

```text
/api/miembros
/api/sobres
/api/reportes
```

Las ofrendas de colaboracion y transferencias se administran dentro del flujo de sobres. No tienen rutas CRUD independientes en la version actual.

## Reportes

```text
GET /api/reportes/semanal?fechaInicio=2026-05-18&fechaFin=2026-05-24
GET /api/reportes/mensual?mes=5&anio=2026
```

## Numeracion De Sobres

`SOBRE.Id_Sobre` es el identificador interno global.

`SOBRE.Numero_Sobre` es el numero visible mensual y se calcula automaticamente al crear un sobre.

La restriccion:

```sql
UNIQUE (Numero_Sobre, Mes, Anio, Id_Iglesia)
```

permite que cada iglesia empiece cada mes desde 1 sin repetir numeros dentro del mismo mes.
