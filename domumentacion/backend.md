# Backend - DIEZMAPP

El backend de DIEZMAPP esta construido con Node.js, Express y PostgreSQL usando el paquete `pg`. Su funcion es exponer una API REST para que el frontend pueda administrar iglesias, miembros, sobres, reportes y tasa del dolar.

## Ubicacion

```text
backend/
└── src/
```

## Comandos

Instalar/aplicar base de datos:

```bash
cd backend
pnpm db:setup
```

Iniciar servidor:

```bash
cd backend
pnpm start
```

## Variables de entorno

Archivo:

```text
backend/.env
```

Variables requeridas:

```text
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173

DB_HOST=localhost
DB_PORT=5432
DB_NAME=diezmos_db
DB_ADMIN_DATABASE=postgres
DB_USER=diezmapp_user
DB_PASSWORD=diezmapp_password
```

Variable opcional:

```text
BCV_RATE_URL=https://ve.dolarapi.com/v1/dolares/oficial
```

Si `BCV_RATE_URL` no existe, el backend usa la URL anterior por defecto.

## Entrada del servidor

### `src/server.js`

Arranca el servidor Express.

Tambien maneja cierre controlado con:

- `SIGTERM`
- `SIGINT`

Cuando se cierra, tambien cierra el pool de PostgreSQL.

### `src/app.js`

Configura:

- CORS.
- JSON body parser.
- URL encoded parser.
- Ruta raiz `/`.
- Rutas `/api`.
- Middleware de 404.
- Middleware de errores.

Ruta raiz:

```text
GET /
```

Respuesta:

```json
{
  "success": true,
  "message": "DIEZMAPP API is running"
}
```

## Configuracion

Archivo:

```text
src/config/env.js
```

Lee variables de entorno con `dotenv`.

Valida que existan:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`

Si falta alguna, el backend no arranca.

## Base de datos

### `src/db/pool.js`

Crea el pool de conexiones PostgreSQL.

Configuracion:

- `max: 10`
- `idleTimeoutMillis: 30000`
- `connectionTimeoutMillis: 5000`

### `src/db/query.js`

Wrapper sencillo para ejecutar consultas:

```js
query(text, params)
```

### `src/db/setup-database.js`

Script usado por:

```bash
pnpm db:setup
```

Hace:

1. Conecta a la base administrativa.
2. Crea `diezmos_db` si no existe.
3. Lee `database/diezmos_db.sql`.
4. Aplica el esquema en la base de datos.

## Middleware

### `error.middleware.js`

Centraliza errores.

Maneja errores conocidos de PostgreSQL:

- `23503`: registro relacionado no encontrado.
- `23505`: registro duplicado.

Tambien tiene mensaje especifico cuando se intenta eliminar un miembro que tiene sobres registrados.

### `not-found.middleware.js`

Devuelve error para rutas no existentes.

Ejemplo:

```json
{
  "success": false,
  "message": "Route GET /api/algo not found"
}
```

## Servicios generales

### `currency.service.js`

Maneja:

- Monedas disponibles para conversion.
- Consulta de tasa externa.
- Conversion de bolivares a dolares.

Monedas soportadas:

```js
[
  { idMoneda: 'Bs', nombreMoneda: 'Bolivar', simbolo: 'Bs' },
  { idMoneda: '$', nombreMoneda: 'Dolar', simbolo: '$' }
]
```

Funcion principal:

```js
convertMoneyToUsd({ amount, idMoneda, tasaBcvDolar })
```

Reglas:

- Si `idMoneda` es `$`, devuelve el mismo monto.
- Si `idMoneda` es `Bs`, consulta o usa tasa BCV y divide el monto entre la tasa.
- El resultado se redondea a 2 decimales.

La tasa se cachea durante 5 minutos para evitar consultar la API externa en cada operacion.

### `health.service.js`

Permite revisar:

- Estado del servidor.
- Estado de conexion a PostgreSQL.

## Rutas principales

Todas las rutas del sistema cuelgan de:

```text
/api
```

### Health

```text
GET /api/health
GET /api/health/database
```

### Configuracion

Actualmente solo expone la tasa del dolar.

```text
GET /api/configuracion/tasa-dolar
```

Respuesta esperada:

```json
{
  "success": true,
  "data": {
    "valor": 540.0431,
    "fechaActualizacion": "2026-05-27T00:00:00-04:00"
  }
}
```

### Iglesias

```text
GET    /api/iglesias
GET    /api/iglesias/:id
POST   /api/iglesias
PUT    /api/iglesias/:id
DELETE /api/iglesias/:id
```

Campos:

```json
{
  "nombreIglesia": "Iglesia Principal",
  "ciudad": "Lima"
}
```

### Miembros

```text
GET    /api/miembros
GET    /api/miembros?idIglesia=1
GET    /api/miembros/:id
POST   /api/miembros
PUT    /api/miembros/:id
DELETE /api/miembros/:id
```

Campos:

```json
{
  "nombre": "Deiver",
  "apellido": "Pernia",
  "email": "deiver@example.com",
  "idIglesia": 1
}
```

Regla importante:

- No se puede eliminar un miembro si tiene sobres registrados.

### Monedas

```text
GET /api/monedas
```

Devuelve monedas de captura:

```json
[
  { "idMoneda": "Bs", "nombreMoneda": "Bolivar", "simbolo": "Bs" },
  { "idMoneda": "$", "nombreMoneda": "Dolar", "simbolo": "$" }
]
```

No existe tabla `MONEDA`; esta respuesta se genera en backend.

### Sobres

```text
GET    /api/sobres
GET    /api/sobres?idIglesia=1
GET    /api/sobres/siguiente-numero?fecha=YYYY-MM-DD&idIglesia=1
GET    /api/sobres/:id
POST   /api/sobres
PUT    /api/sobres/:id
DELETE /api/sobres/:id
```

Payload de creacion/edicion:

```json
{
  "fecha": "2026-06-01",
  "idIglesia": 1,
  "idMiembro": 1,
  "idMoneda": "$",
  "montoDiezmo": 10,
  "montoPactoAmor": 5,
  "ofrendas": [
    {
      "nombreOfrenda": "Ayuda ninos",
      "montoOfrenda": 3
    }
  ],
  "transferencias": [
    {
      "fechaTransferencia": "2026-06-01",
      "numeroTransferencia": "REF-001",
      "bancoReceptorCuenta": "Banesco",
      "montoTransferencia": 18
    }
  ]
}
```

El backend:

1. Valida fecha.
2. Valida iglesia.
3. Valida miembro.
4. Convierte montos a dolares si vienen en bolivares.
5. Calcula total incluido.
6. Verifica que transferencias sumen el total.
7. Guarda sobre, ofrendas y transferencias en una transaccion.

### Ofrendas y transferencias

Las ofrendas y transferencias no tienen endpoints CRUD independientes.

Se guardan, editan y eliminan dentro del flujo de sobres:

```text
POST /api/sobres
PUT  /api/sobres/:id
GET  /api/sobres/:id
```

Esta decision mantiene una sola regla de negocio: la suma de transferencias debe ser igual al total incluido del sobre.

### Reportes

```text
GET /api/reportes/semanal?fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD&idIglesia=1
GET /api/reportes/mensual?mes=6&anio=2026&idIglesia=1
```

Reporte semanal devuelve:

- Numero de sobre.
- Nombre del miembro.
- Fecha.
- Total.

Reporte mensual devuelve:

- Numero de sobre.
- Nombre del miembro.
- Fecha.
- Diezmo.
- Pacto de amor.
- Ofrendas.
- Total.

El frontend actualmente muestra columnas resumidas:

- Sobre.
- Fecha.
- Miembro.
- Total.

## Arquitectura modular

Cada modulo normalmente tiene:

```text
modulo.routes.js
modulo.controller.js
modulo.service.js
modulo.repository.js
```

Responsabilidades:

- `routes`: define endpoints.
- `controller`: recibe request y responde JSON.
- `service`: valida datos y aplica reglas de negocio.
- `repository`: ejecuta SQL.

## Reglas importantes de negocio

### Guardado en dolares

La base de datos guarda montos finales en dolares.

El backend no guarda:

- Moneda original.
- Monto original.
- Tasa usada.

Solo guarda el resultado operativo en dolares.

### Transferencias

La suma de todas las transferencias debe ser igual al total incluido del sobre.

Si no coincide, se devuelve error:

```text
La suma de transferencias debe ser igual al total incluido.
```

### Mes y anio del sobre

El backend calcula `Mes` y `Anio` desde la fecha del sobre.

No se permite cambiar el mes o anio de un sobre existente al editar.

Mensaje:

```text
No se puede cambiar el mes o anio de un sobre existente. Cree un nuevo sobre para otra fecha.
```

## Respuestas

Formato exitoso:

```json
{
  "success": true,
  "data": {}
}
```

Formato con mensaje:

```json
{
  "success": true,
  "message": "Registro actualizado correctamente.",
  "data": {}
}
```

Formato de error:

```json
{
  "success": false,
  "message": "Mensaje de error"
}
```
