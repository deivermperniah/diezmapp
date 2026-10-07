## Reglas de comportamiento (obligatorias)

- Haz SOLO el cambio mínimo necesario para resolver lo que se pide. Nada de "mientras estaba aquí, también...".
- No generes código, componentes, archivos ni carpetas que no se hayan pedido, salvo que sean indispensables para el cambio.
- No refactorices, reorganices ni "mejores" código que no forme parte de la tarea.
- No modifiques estilos, layout ni estructura visual si no se pidió.
- No agregues comentarios ni documentación dentro del código salvo que se pida.
- Si hay dudas sobre el alcance, pregunta antes de tocar código adicional.
- No repitas código: antes de crear algo, busca si ya existe y reutilízalo.
- Nada de lógica compleja: prefiere la solución más simple que funcione.

## Stack

- Frontend: Vue 3 + Vite + Vue Router + PrimeVue, CSS propio.
- Backend: Node.js + Express + PostgreSQL (`pg`, `dotenv`, `cors`).
- Base de datos: PostgreSQL (esquema en `database/diezmos_db.sql`).
- Gestor de paquetes: pnpm (monorepo con `backend/` y `frontend/`).

## Estructura

- `backend/src/`: Express. Organizado por módulos de dominio en `modules/` (iglesias, miembros, sobres, ofrendas, transferencias, reportes, configuracion, monedas), cada uno con `controller`, `service`, `repository` y `routes`.
- `backend/src/config/`, `db/`, `middlewares/`, `services/`, `utils/`: configuración, pool de conexión, middlewares y utilidades.
- `frontend/src/`: Vue. `views/` (una por ruta), `components/` y `components/ui/` (reutilizables), `services/` (llamadas al backend), `router/`, `api/`, `composables/`, `utils/` y `styles/`.
- `database/`: script SQL del esquema.
- `documents/`: documentación detallada del proyecto.

## Convenciones

- Backend organizado por módulos con capas controller/service/repository/routes; no escribir SQL suelto fuera de los repositories.
- Regla de negocio principal: `Diezmo + Pacto de amor + Ofrendas = Total incluido`, y `Suma de transferencias = Total incluido`. El backend rechaza el guardado si no coincide.
- Los montos operativos se guardan en dólares; la conversión desde bolívares usa la tasa oficial configurada en el backend.
- No hay autenticación: todo se filtra por la iglesia activa seleccionada en Configuración.
- Frontend: formularios en diálogos con `FormDialog` y componentes de `components/ui/`; las llamadas al backend van en `src/services/`, no en las vistas.
- Exportaciones (Excel, PDF, CSV) centralizadas en `utils/exporters.js`.
- Variables de entorno del backend en `backend/.env` (ver `backend/.env.example`).
- Textos de la interfaz en español; código (nombres, variables) en inglés.

## Fuera de alcance por ahora

No agregar autenticación, multiusuario ni tests salvo que se pida explícitamente.

## Verificación

- Antes de cada commit: `pnpm --dir frontend lint` sin errores.
- Probar el flujo con el backend y la base de datos corriendo (ver README).
- No tocar datos de producción.

## Git y commits

- Commits pequeños, uno por cambio, solo cuando el usuario lo pida.
- Nunca hacer push, crear ramas ni reescribir el historial sin que se pida.
- Formato: `<tipo>: <descripción breve en inglés, minúsculas, imperativo>`.
- Tipos permitidos: feat, fix, style, refactor, chore, docs.
- Máximo ~60 caracteres, sin punto final.

## Development

Iniciar backend y frontend por separado:

```
pnpm --dir backend dev
pnpm --dir frontend dev --host 127.0.0.1
```

## Documentation

- Vue: https://vuejs.org/guide/introduction
- PrimeVue: https://primevue.org
- Express: https://expressjs.com
