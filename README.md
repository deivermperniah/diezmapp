# DIEZMAPP · Proyecto académico

Aplicación web para administrar sobres de diezmos, ofrendas, transferencias y reportes por iglesia.

## Stack

- Frontend: Vue 3 + Vite + PrimeVue.
- Backend: Node.js + Express + PostgreSQL.
- Gestor de paquetes: pnpm.

## Estructura

```text
backend/
├── src/
│   ├── modules/     # iglesias, miembros, sobres, ofrendas, transferencias, reportes…
│   ├── config/      # Variables de entorno
│   ├── db/          # Pool y setup de la base de datos
│   ├── middlewares/ # Manejo de errores
│   └── services/    # Salud y conversión de moneda
frontend/
├── src/
│   ├── views/       # Dashboard, Miembros, Sobres, Reportes, Configuración
│   ├── components/  # Componentes y diálogos reutilizables
│   ├── services/    # Llamadas al backend
│   ├── router/      # Vue Router
│   └── utils/       # Exportadores y utilidades de dinero/fechas
database/            # Esquema SQL
documents/           # Documentación del proyecto
```

## Puesta en marcha

PostgreSQL debe estar instalado y corriendo.

1. Instala dependencias:

   ```sh
   pnpm --dir backend install
   pnpm --dir frontend install
   ```

2. Configura el backend:

   ```sh
   cp backend/.env.example backend/.env
   pnpm --dir backend db:setup
   ```

3. Levanta backend y frontend:

   ```sh
   pnpm --dir backend dev
   pnpm --dir frontend dev --host 127.0.0.1
   ```

## Comandos

| Comando | Acción |
| :-- | :-- |
| `pnpm --dir backend dev` | Backend con recarga automática (nodemon) |
| `pnpm --dir backend start` | Backend en producción |
| `pnpm --dir frontend dev` | Dev server de Vite |
| `pnpm --dir frontend build` | Build de producción |
| `pnpm --dir frontend lint` | Lint (oxlint + eslint) |

## Rutas principales

- Frontend: `/`, `/miembros`, `/sobres`, `/reportes`, `/configuracion`.
- Backend: `/api/health`, `/api/iglesias`, `/api/miembros`, `/api/sobres`, `/api/reportes`, `/api/configuracion/tasa-dolar`.
