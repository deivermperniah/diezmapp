# DIEZMAPP

Aplicacion web para administrar sobres de diezmos, ofrendas, transferencias y reportes por iglesia.

## Resumen

DIEZMAPP permite registrar sobres por miembro e iglesia, calcular el total incluido, validar que las transferencias coincidan con ese total y consultar reportes semanales o mensuales. El sistema guarda los montos operativos en dolares y convierte desde bolivares usando la tasa oficial configurada por el backend.

Funciones principales:

- Administrar iglesias.
- Seleccionar una iglesia activa.
- Administrar miembros por iglesia.
- Registrar sobres con diezmo, pacto de amor, ofrendas y transferencias.
- Reiniciar la numeracion de sobres cada mes y por iglesia.
- Consultar dashboard, detalles de sobres y reportes.
- Exportar reportes en Excel, PDF y CSV.

## Stack

- Frontend: Vue 3, Vite, Vue Router, PrimeVue y CSS propio.
- Backend: Node.js, Express, PostgreSQL, `pg`, `dotenv` y `cors`.
- Base de datos: PostgreSQL.
- Package manager: pnpm.

## Documentacion

Los detalles completos del proyecto estan en:

```text
domumentacion/funcionamiento-general.md
domumentacion/frontend.md
domumentacion/backend.md
domumentacion/database.md
```

## Inicio rapido

```bash
pnpm --dir backend install
pnpm --dir frontend install
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
pnpm --dir backend db:setup
pnpm --dir backend dev
pnpm --dir frontend dev --host 127.0.0.1
```

PostgreSQL debe estar instalado y corriendo antes de ejecutar `pnpm --dir backend db:setup`.

## Rutas principales

- Frontend: `/`, `/miembros`, `/sobres`, `/reportes`, `/configuracion`.
- Backend: `/api/health`, `/api/iglesias`, `/api/miembros`, `/api/sobres`, `/api/reportes`, `/api/configuracion/tasa-dolar`.
