# Guia archivo por archivo - DIEZMAPP

Esta guia explica que hace cada archivo importante del proyecto. La idea es que puedas abrir el codigo sin sentir que estas entrando a una caja negra.

El proyecto esta dividido en tres partes:

```text
backend/   API, reglas de negocio y conexion a PostgreSQL
frontend/  Interfaz web en Vue
database/  Script SQL para crear y actualizar la base de datos
```

## Backend

El backend es la API. Recibe peticiones del frontend, valida datos, consulta o guarda informacion en PostgreSQL y responde JSON.

### Archivos raiz del backend

#### `backend/package.json`

Define el proyecto backend.

Contiene:

- Nombre y version del backend.
- Scripts para ejecutar comandos.
- Dependencias como `express`, `pg`, `dotenv` y `cors`.

Scripts importantes:

```bash
pnpm dev
pnpm start
pnpm db:setup
```

`pnpm dev` arranca el servidor con `nodemon`, que reinicia cuando cambias codigo.

`pnpm start` arranca el servidor normal.

`pnpm db:setup` prepara la base de datos usando `database/diezmos_db.sql`.

#### `backend/pnpm-lock.yaml`

Archivo generado por pnpm.

Guarda las versiones exactas de las dependencias instaladas. No se edita a mano.

#### `backend/.env.example`

Plantilla de variables de entorno para desarrollo local.

Ejemplo actual:

```text
NODE_ENV=development
DB_SSL=false

DB_HOST=localhost
DB_PORT=5432
DB_NAME=diezmos_db
DB_USER=diezmapp_user
DB_PASSWORD=diezmapp_password
```

Este archivo se copia a `backend/.env` cuando quieres correr local:

```bash
cp backend/.env.example backend/.env
```

`backend/.env` no se sube a git porque puede tener contrasenas.

## Backend: entrada y configuracion

### `backend/src/server.js`

Es el archivo que arranca la API.

Hace tres cosas principales:

1. Importa la app de Express desde `app.js`.
2. Lee el puerto desde `env.port`.
3. Ejecuta `app.listen(...)`.

Tambien maneja cierre controlado:

- Si el proceso recibe `SIGTERM` o `SIGINT`, cierra el servidor.
- Tambien cierra el pool de PostgreSQL con `pool.end()`.

Este archivo es como el boton de encendido del backend.

### `backend/src/app.js`

Configura Express.

Aqui se agregan:

- CORS.
- Parser de JSON.
- Parser de formularios URL encoded.
- Ruta raiz `/`.
- Todas las rutas `/api`.
- Middleware de 404.
- Middleware de errores.

La parte clave:

```js
app.use('/api', routes);
```

Eso significa que todas las rutas del sistema empiezan con `/api`.

Ejemplos:

```text
/api/health
/api/miembros
/api/sobres
```

### `backend/src/config/env.js`

Lee y valida las variables de entorno.

Usa `dotenv` para cargar:

```text
backend/.env
```

Valida que existan estas variables:

```text
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD
```

Si falta alguna, el backend no arranca.

Tambien decide si PostgreSQL usa SSL:

```js
const isProduction = process.env.NODE_ENV === 'production';
const useDatabaseSsl = process.env.DB_SSL
  ? process.env.DB_SSL === 'true'
  : isProduction;
```

En palabras simples:

- Si `DB_SSL=true`, usa SSL.
- Si `DB_SSL=false`, no usa SSL.
- Si `DB_SSL` no existe, usa SSL solo cuando `NODE_ENV=production`.

La configuracion final exportada se llama `env`.

## Backend: base de datos

### `backend/src/db/pool.js`

Crea el pool de conexiones a PostgreSQL.

Un pool mantiene varias conexiones listas para usar. Asi el backend no abre una conexion nueva desde cero en cada consulta.

Usa los datos de `env.db`:

```js
host
port
database
user
password
ssl
```

Si `env.db.ssl` es `true`, conecta con:

```js
{ rejectUnauthorized: false }
```

Eso ayuda con bases remotas como Neon o servicios que requieren SSL.

### `backend/src/db/query.js`

Wrapper sencillo para ejecutar SQL.

Tiene una funcion:

```js
query(text, params)
```

Ejemplo conceptual:

```js
query('SELECT * FROM MIEMBRO WHERE Id_Miembro = $1', [id])
```

Se usa en repositorios para no importar `pool` en todos lados.

### `backend/src/db/setup-database.js`

Script para crear y preparar la base de datos.

Lo ejecutas con:

```bash
pnpm --dir backend db:setup
```

Hace esto:

1. Lee variables desde `backend/.env`.
2. Conecta a una base administrativa, normalmente `postgres`.
3. Crea `diezmos_db` si no existe.
4. Lee el SQL desde `database/diezmos_db.sql`.
5. Aplica ese esquema en `diezmos_db`.

Tambien respeta `DB_SSL`, igual que el servidor.

## Backend: rutas generales

### `backend/src/routes/index.js`

Junta todas las rutas principales de la API.

Aqui se conectan los modulos:

```text
/health
/configuracion
/iglesias
/miembros
/monedas
/reportes
/sobres
```

Como `app.js` monta esto en `/api`, la ruta final queda:

```text
/api/sobres
```

### `backend/src/routes/health.routes.js`

Define rutas para revisar si el backend esta vivo.

Rutas:

```text
GET /api/health
GET /api/health/database
```

La primera revisa el servidor.

La segunda prueba conexion a PostgreSQL.

### `backend/src/controllers/health.controller.js`

Controlador de health.

Recibe la peticion y responde JSON.

Usa funciones de `health.service.js`.

### `backend/src/services/health.service.js`

Tiene la logica real del health check.

`getServerHealth()` devuelve informacion simple del servidor.

`getDatabaseHealth()` ejecuta:

```sql
SELECT NOW() AS current_time
```

Si esa consulta funciona, PostgreSQL esta conectado.

## Backend: middlewares y utilidades

### `backend/src/middlewares/error.middleware.js`

Centraliza errores.

Si un controlador o servicio lanza error, Express llega aqui.

Devuelve JSON con este formato:

```json
{
  "success": false,
  "message": "Mensaje de error"
}
```

Tambien traduce algunos errores de PostgreSQL:

- `23503`: registro relacionado no encontrado.
- `23505`: registro duplicado.

En desarrollo agrega el stack del error para depurar.

### `backend/src/middlewares/not-found.middleware.js`

Responde cuando la ruta no existe.

Ejemplo:

```text
GET /api/lo-que-sea
```

Respuesta:

```json
{
  "success": false,
  "message": "Route GET /api/lo-que-sea not found"
}
```

### `backend/src/utils/app-error.js`

Define una clase `AppError`.

Sirve para lanzar errores con codigo HTTP.

Ejemplo:

```js
throw new AppError('Miembro no encontrado.', 404);
```

Sin esta clase, todos los errores terminarian pareciendo errores internos `500`.

### `backend/src/utils/validators.js`

Funciones reutilizables para validar datos.

Incluye:

- `parsePositiveInteger`: valida IDs positivos.
- `parseOptionalPositiveInteger`: valida IDs opcionales.
- `parseDateParts`: valida fechas `YYYY-MM-DD`.
- `parseMoney`: valida montos.
- `parseRequiredText`: valida texto obligatorio.
- `parseOptionalText`: valida texto opcional.
- `parseCurrency`: valida moneda `Bs` o `$`.
- `parseMonth`: valida mes entre 1 y 12.
- `parseYear`: valida anio desde 2000.

Estas funciones ayudan a que los servicios no repitan validaciones por todos lados.

## Backend: servicios generales

### `backend/src/services/currency.service.js`

Maneja monedas y conversion a dolares.

Monedas disponibles:

```js
[
  { idMoneda: 'Bs', nombreMoneda: 'Bolivar', simbolo: 'Bs' },
  { idMoneda: '$', nombreMoneda: 'Dolar', simbolo: '$' }
]
```

Consulta la tasa oficial desde:

```text
https://ve.dolarapi.com/v1/dolares/oficial
```

Funciones principales:

- `getCurrencies()`: devuelve las monedas.
- `getTasaDolarOficial()`: consulta la tasa externa.
- `getTasaBcvDolar()`: devuelve solo el numero de la tasa.
- `convertMoneyToUsd(...)`: convierte Bs a dolares o deja dolares igual.

La tasa se guarda en cache 5 minutos para no consultar la API externa en cada operacion.

## Backend: patron de modulos

La mayoria de modulos usa esta estructura:

```text
modulo.routes.js
modulo.controller.js
modulo.service.js
modulo.repository.js
```

Cada capa tiene una responsabilidad:

```text
routes       Define URLs y metodo HTTP
controller   Recibe req/res y responde JSON
service      Valida datos y aplica reglas de negocio
repository   Ejecuta SQL contra PostgreSQL
```

Ejemplo con miembros:

```text
miembros.routes.js      GET / POST / PUT / DELETE
miembros.controller.js  Lee req.params, req.body, req.query
miembros.service.js     Valida nombre, email, iglesia
miembros.repository.js  INSERT, SELECT, UPDATE, DELETE
```

## Backend: modulo configuracion

### `backend/src/modules/configuracion/configuracion.routes.js`

Define:

```text
GET /api/configuracion/tasa-dolar
```

### `backend/src/modules/configuracion/configuracion.controller.js`

Recibe la peticion para mostrar la tasa del dolar.

Llama a `getTasaDolar()`.

Responde:

```json
{
  "success": true,
  "data": {
    "valor": 123.45,
    "fechaActualizacion": "..."
  }
}
```

### `backend/src/modules/configuracion/configuracion.service.js`

Servicio pequeño.

Actualmente solo llama a:

```js
getTasaDolarOficial()
```

desde `currency.service.js`.

## Backend: modulo iglesias

### `backend/src/modules/iglesias/iglesias.routes.js`

Define rutas CRUD para iglesias:

```text
GET    /api/iglesias
GET    /api/iglesias/:id
POST   /api/iglesias
PUT    /api/iglesias/:id
DELETE /api/iglesias/:id
```

### `backend/src/modules/iglesias/iglesias.controller.js`

Controlador de iglesias.

Cada funcion recibe la peticion y llama al servicio:

- `listIglesias`
- `showIglesia`
- `storeIglesia`
- `updateIglesiaById`
- `deleteIglesiaById`

### `backend/src/modules/iglesias/iglesias.service.js`

Valida datos de iglesias.

Reglas:

- El ID debe ser entero positivo.
- `nombreIglesia` es obligatorio.
- `ciudad` es obligatoria.

Si la iglesia no existe, lanza:

```text
Iglesia no encontrada.
```

### `backend/src/modules/iglesias/iglesias.repository.js`

Ejecuta SQL para iglesias.

Funciones:

- `findAllIglesias`
- `findIglesiaById`
- `createIglesia`
- `updateIglesia`
- `deleteIglesia`

Trabaja con la tabla:

```text
IGLESIA
```

## Backend: modulo miembros

### `backend/src/modules/miembros/miembros.routes.js`

Define rutas CRUD para miembros:

```text
GET    /api/miembros
GET    /api/miembros?idIglesia=1
GET    /api/miembros/:id
POST   /api/miembros
PUT    /api/miembros/:id
DELETE /api/miembros/:id
```

### `backend/src/modules/miembros/miembros.controller.js`

Controlador de miembros.

Si llega `idIglesia` por query, lista solo miembros de esa iglesia.

Ejemplo:

```text
/api/miembros?idIglesia=1
```

### `backend/src/modules/miembros/miembros.service.js`

Valida reglas de miembros.

Reglas:

- `nombre` obligatorio.
- `apellido` obligatorio.
- `email` opcional, pero si viene debe tener formato valido.
- `idIglesia` obligatorio.

Tambien evita eliminar un miembro si tiene sobres registrados.

### `backend/src/modules/miembros/miembros.repository.js`

Ejecuta SQL para miembros.

Funciones:

- `findAllMiembros`
- `findMiembroById`
- `createMiembro`
- `updateMiembro`
- `countSobresByMiembro`
- `deleteMiembro`

Trabaja con:

```text
MIEMBRO
IGLESIA
SOBRE
```

## Backend: modulo monedas

### `backend/src/modules/monedas/monedas.routes.js`

Define:

```text
GET /api/monedas
```

### `backend/src/modules/monedas/monedas.controller.js`

Devuelve las monedas disponibles.

No consulta base de datos. Usa `getCurrencies()` desde `currency.service.js`.

## Backend: modulo sobres

### `backend/src/modules/sobres/sobres.routes.js`

Define rutas para sobres:

```text
GET    /api/sobres
GET    /api/sobres?idIglesia=1
GET    /api/sobres/siguiente-numero?fecha=YYYY-MM-DD&idIglesia=1
GET    /api/sobres/:id
POST   /api/sobres
PUT    /api/sobres/:id
DELETE /api/sobres/:id
```

### `backend/src/modules/sobres/sobres.controller.js`

Controlador de sobres.

Recibe peticiones para:

- Listar sobres.
- Ver detalle de un sobre.
- Consultar siguiente numero de sobre.
- Crear sobre.
- Editar sobre.
- Eliminar sobre.

### `backend/src/modules/sobres/sobres.service.js`

Es uno de los archivos mas importantes del backend.

Aqui viven las reglas de negocio para guardar sobres.

Valida:

- Fecha del sobre.
- Iglesia.
- Miembro.
- Que el miembro pertenezca a la iglesia seleccionada.
- Moneda.
- Montos.
- Ofrendas.
- Transferencias.
- Que el total incluido coincida con las transferencias.

Tambien convierte montos a dolares si la moneda es `Bs`.

Regla principal:

```text
Diezmo + Pacto de amor + Ofrendas = Transferencias
```

Si no coincide, devuelve:

```text
La suma de transferencias debe ser igual al total incluido.
```

Al editar, no permite cambiar el mes o anio del sobre.

### `backend/src/modules/sobres/sobres.repository.js`

Ejecuta SQL para sobres.

Es el repositorio mas complejo porque trabaja con transacciones.

Funciones principales:

- `findAllSobres`
- `findSobreById`
- `findNextNumeroSobre`
- `createSobre`
- `updateSobre`
- `deleteSobre`

`createSobre` hace:

1. Abre transaccion.
2. Bloquea numeracion con `pg_advisory_xact_lock`.
3. Calcula siguiente numero de sobre.
4. Inserta `SOBRE`.
5. Inserta ofrendas.
6. Inserta transferencias.
7. Hace `COMMIT`.

Si algo falla, hace `ROLLBACK`.

Esto evita que dos sobres creados al mismo tiempo reciban el mismo numero.

## Backend: modulo ofrendas

### `backend/src/modules/ofrendas/ofrendas.repository.js`

No tiene rutas propias.

Solo tiene consultas para traer ofrendas asociadas a un sobre.

Funcion:

```js
findOfrendasBySobreId(idSobre)
```

Se usa cuando se abre el detalle de un sobre.

## Backend: modulo transferencias

### `backend/src/modules/transferencias/transferencias.repository.js`

No tiene rutas propias.

Solo trae transferencias asociadas a un sobre.

Funcion:

```js
findTransferenciasBySobreId(idSobre)
```

Se usa cuando se abre el detalle de un sobre.

## Backend: modulo reportes

### `backend/src/modules/reportes/reportes.routes.js`

Define:

```text
GET /api/reportes/semanal
GET /api/reportes/mensual
```

### `backend/src/modules/reportes/reportes.controller.js`

Controlador de reportes.

Lee filtros desde query params:

```text
fechaInicio
fechaFin
mes
anio
idIglesia
```

### `backend/src/modules/reportes/reportes.service.js`

Valida filtros de reportes.

Para semanal:

- Valida fecha inicio.
- Valida fecha fin.
- Revisa que inicio no sea mayor que fin.

Para mensual:

- Valida mes.
- Valida anio.

Tambien calcula totales del reporte.

### `backend/src/modules/reportes/reportes.repository.js`

Ejecuta SQL para reportes.

Funciones:

- `findReporteSemanal`
- `findReporteMensual`

Filtra por iglesia si llega `idIglesia`.

## Frontend

El frontend es la interfaz que ve el usuario. Esta hecho con Vue 3, Vite, Vue Router y PrimeVue.

## Frontend: archivos raiz

### `frontend/package.json`

Define el proyecto frontend.

Contiene:

- Scripts.
- Dependencias.
- Versiones de Node soportadas.

Scripts importantes:

```bash
pnpm dev
pnpm build
pnpm run lint
```

### `frontend/pnpm-lock.yaml`

Archivo generado por pnpm.

Guarda versiones exactas de paquetes. No se edita a mano.

### `frontend/index.html`

HTML base de la aplicacion.

Vite inyecta aqui el JavaScript generado.

Tiene el elemento donde Vue monta la app:

```html
<div id="app"></div>
```

### `frontend/vite.config.js`

Configuracion de Vite.

Hace:

- Activa plugin de Vue.
- Activa Vue DevTools solo en desarrollo.
- Configura alias `@` hacia `frontend/src`.
- Configura separacion de chunks para build.

Gracias al alias puedes importar asi:

```js
import DataTable from '@/components/DataTable.vue'
```

en vez de rutas largas como:

```js
../../../components/DataTable.vue
```

### `frontend/eslint.config.js`

Configuracion del linter.

Sirve para detectar errores de codigo en Vue y JavaScript.

Se usa con:

```bash
pnpm run lint
```

### `frontend/jsconfig.json`

Ayuda al editor a entender imports con `@`.

Tambien mejora autocompletado y navegacion de archivos.

### `frontend/public/logo.png`

Logo publico de la app.

Se usa desde la sidebar:

```html
<img src="/logo.png" />
```

Todo lo que esta en `public/` queda disponible directamente desde la raiz del sitio.

## Frontend: arranque

### `frontend/src/main.js`

Archivo que inicializa Vue.

Hace:

1. Crea la app con `createApp(App)`.
2. Instala Vue Router.
3. Instala PrimeVue.
4. Configura el tema Aura.
5. Configura idioma espanol para calendarios.
6. Registra componentes globales como `PButton`, `PDialog`, `PSelect`.
7. Monta la app en `#app`.

### `frontend/src/App.vue`

Componente raiz.

Solo renderiza:

```vue
<RouterView />
```

La estructura real de pantalla vive en `AppLayout.vue`.

### `frontend/src/router/index.js`

Define las rutas del frontend.

Rutas:

```text
/               Dashboard
/miembros       Miembros
/sobres         Sobres
/reportes       Reportes
/configuracion  Configuracion
/iglesias       Redirecciona a configuracion
```

Las vistas se cargan con imports dinamicos:

```js
const DashboardView = () => import('@/views/DashboardView.vue')
```

Eso ayuda a que el build se divida en partes y no cargue todo al inicio.

## Frontend: comunicacion con backend

### `frontend/src/api/http.js`

Cliente HTTP central.

Define la URL base de la API:

```js
const API_BASE_URL = import.meta.env.PROD ? '/_/backend/api' : 'http://localhost:3000/api'
```

Significa:

- En local usa `http://localhost:3000/api`.
- En Vercel usa `/_/backend/api`.

Expone:

```js
api.get(path)
api.post(path, data)
api.put(path, data)
api.delete(path)
```

Todas las peticiones al backend pasan por aqui.

Si el backend responde error, lanza un `Error` para que la vista muestre un toast.

## Frontend: servicios

Los servicios son funciones que llaman a la API. Separan la vista del detalle tecnico de URLs.

### `frontend/src/services/iglesia-activa.service.js`

Maneja la iglesia activa.

Usa `localStorage` para recordar:

```text
diezmapp.idIglesiaActiva
diezmapp.nombreIglesiaActiva
```

Tambien expone variables reactivas:

- `iglesiaActivaId`
- `iglesiaActivaNombre`
- `iglesiaActivaReady`

Funcion importante:

```js
withIglesiaActiva(path)
```

Agrega `idIglesia` a URLs.

Ejemplo:

```text
/sobres
```

se convierte en:

```text
/sobres?idIglesia=1
```

### `frontend/src/services/catalogos.service.js`

Servicio para catalogos.

Maneja:

- Iglesias.
- Monedas.

Funciones:

- `getIglesias`
- `createIglesia`
- `updateIglesia`
- `deleteIglesia`
- `getMonedas`

### `frontend/src/services/miembros.service.js`

Servicio para miembros.

Funciones:

- `getMiembros`
- `createMiembro`
- `updateMiembro`
- `deleteMiembro`

`getMiembros()` usa la iglesia activa automaticamente.

### `frontend/src/services/sobres.service.js`

Servicio para sobres.

Funciones:

- `getSobres`
- `getSobre`
- `getSiguienteNumeroSobre`
- `createSobre`
- `updateSobre`
- `deleteSobre`

Tambien usa la iglesia activa para listar y calcular el siguiente numero.

### `frontend/src/services/reportes.service.js`

Servicio para reportes.

Funciones:

- `getReporteSemanal`
- `getReporteMensual`

Ambas agregan la iglesia activa.

### `frontend/src/services/configuracion.service.js`

Servicio pequeno.

Actualmente solo tiene:

```js
getTasaDolar()
```

Llama a:

```text
/configuracion/tasa-dolar
```

## Frontend: layout

### `frontend/src/layouts/AppLayout.vue`

Estructura general de la app.

Contiene:

- Toast.
- ConfirmDialog.
- Sidebar.
- Topbar.
- Contenedor principal.

Tambien carga la iglesia activa inicial:

1. Lee la iglesia guardada en localStorage.
2. Consulta iglesias.
3. Si la iglesia guardada existe, la usa.
4. Si no existe, usa la primera iglesia disponible.
5. Marca `iglesiaActivaReady`.

Tambien usa `KeepAlive` para conservar vistas al navegar.

### `frontend/src/components/AppSidebar.vue`

Menu lateral.

Opciones:

- Dashboard.
- Miembros.
- Sobres.
- Reportes.
- Configuracion.

Usa Vue Router para navegar.

### `frontend/src/components/AppTopbar.vue`

Barra superior.

Muestra el titulo de la pagina actual.

Tambien muestra la iglesia activa, excepto en la vista de configuracion.

## Frontend: vistas principales

### `frontend/src/views/DashboardView.vue`

Pantalla inicial.

Carga:

- Miembros.
- Monedas.
- Sobres.

Muestra:

- Total de miembros.
- Total de sobres.
- Total general.
- Ultimos sobres registrados.

Desde aqui puedes:

- Ver detalle de un sobre.
- Editar un sobre.
- Eliminar un sobre.

### `frontend/src/views/MiembrosView.vue`

Pantalla para administrar miembros.

Carga miembros de la iglesia activa.

Permite:

- Crear miembro.
- Editar miembro.
- Eliminar miembro.

Usa `MemberFormDialog.vue` para crear/editar.

### `frontend/src/views/SobresView.vue`

Pantalla principal para registrar sobres.

Carga:

- Miembros.
- Monedas.
- Sobres.
- Siguiente numero de sobre.

Permite:

- Crear sobre.
- Editar sobre.
- Eliminar sobre.
- Ver detalle.
- Crear miembro desde el formulario del sobre.

Usa:

- `ContributionFormDialog.vue`
- `MemberFormDialog.vue`
- `SobreDetailDialog.vue`
- `DataTable.vue`

### `frontend/src/views/ReportesView.vue`

Pantalla para reportes.

Permite:

- Reporte mensual.
- Reporte semanal.

Puede exportar:

- Excel.
- PDF.
- CSV.

Usa utilidades de `exporters.js`.

### `frontend/src/views/ConfiguracionView.vue`

Pantalla de configuracion.

Muestra:

- Tasa oficial del dolar.
- Fecha de actualizacion.
- Boton para refrescar tasa.
- Boton para abrir BCV.
- Tabla de iglesias.

Permite:

- Crear iglesia.
- Editar iglesia.
- Eliminar iglesia.
- Activar iglesia.

## Frontend: componentes principales

### `frontend/src/components/ContributionFormDialog.vue`

Formulario de sobre.

Es uno de los componentes mas importantes del frontend.

Trabaja en 4 pasos:

1. Datos generales.
2. Diezmos y pacto.
3. Ofrendas.
4. Transferencias.

Hace calculos visuales:

- Total capturado.
- Total de transferencias.
- Equivalente en dolares si la moneda es Bs.

Solo permite guardar si:

- Hay total capturado.
- Hay transferencias.
- El total capturado coincide con las transferencias.

Aunque el frontend valida, el backend vuelve a validar todo.

### `frontend/src/components/SobreDetailDialog.vue`

Modal de detalle de sobre.

Carga un sobre por ID y muestra:

- Numero.
- Miembro.
- Fecha.
- Diezmo.
- Pacto.
- Ofrendas.
- Transferencias.
- Total.

### `frontend/src/components/DataTable.vue`

Tabla reutilizable.

Incluye:

- Buscador.
- Paginacion.
- Skeleton de carga.
- Mensaje de estado vacio.
- Slot para acciones por fila.

Se usa en:

- Dashboard.
- Miembros.
- Sobres.
- Reportes.
- Configuracion.

### `frontend/src/components/StatCard.vue`

Tarjeta de estadistica.

Muestra:

- Label.
- Valor.
- Icono.
- Skeleton cuando carga.

Se usa en Dashboard.

### `frontend/src/components/MemberFormDialog.vue`

Formulario modal para crear o editar miembros.

Campos:

- Nombre.
- Apellido.
- Email.

Recibe la iglesia activa como `defaultIglesia`.

### `frontend/src/components/ChurchFormDialog.vue`

Formulario modal para crear o editar iglesias.

Campos:

- Nombre de iglesia.
- Ciudad.

### `frontend/src/components/ui/AppButton.vue`

Wrapper de `PButton`.

Permite usar botones con una interfaz mas simple:

```vue
<AppButton label="Guardar" icon="pi pi-check" />
```

### `frontend/src/components/ui/AppField.vue`

Wrapper para campos de formulario.

Renderiza:

- Label.
- Slot del input.

Ayuda a que los formularios tengan estructura consistente.

### `frontend/src/components/ui/AppInput.vue`

Wrapper para inputs.

Segun `type`, usa:

- `PInputText` para texto.
- `PInputNumber` para numeros.
- `PDatePicker` para fechas.

Convierte fechas entre `Date` y `YYYY-MM-DD`.

### `frontend/src/components/ui/AppSelect.vue`

Wrapper para `PSelect`.

Maneja:

- Opciones.
- Campo label.
- Campo value.
- Filtro opcional.
- Slots para personalizar como se ven opciones y valor seleccionado.

### `frontend/src/components/ui/FormDialog.vue`

Wrapper para modales de formulario.

Incluye:

- Header con icono.
- Titulo.
- Contenido.
- Footer con Cancelar y Guardar.

Tambien permite ocultar el footer, como en el formulario de sobres.

## Frontend: composables y utilidades

### `frontend/src/composables/useContributionAmounts.js`

Composable para calculos del formulario de sobres.

Calcula:

- Monto convertido a dolares.
- Total capturado.
- Total capturado en moneda de entrada.
- Total de transferencias.
- Si los totales coinciden.

Se usa en `ContributionFormDialog.vue`.

### `frontend/src/utils/date.js`

Utilidades de fecha.

Funciones:

- `toLocalDateString`: convierte una fecha a `YYYY-MM-DD`.
- `formatDateEs`: muestra fecha en formato legible.
- `formatDateTimeEs`: muestra fecha y hora.

Ayuda a evitar errores de zona horaria.

### `frontend/src/utils/money.js`

Utilidades de dinero.

Funciones:

- `formatMoney`: muestra numeros con 2 decimales.
- `parseAmount`: convierte texto o numero a numero usable.

### `frontend/src/utils/loading.js`

Utilidad para skeletons.

Funcion:

```js
withMinimumDelay(task, delay = 600)
```

Hace que una carga dure al menos 600 ms. Esto evita parpadeos visuales cuando una peticion responde demasiado rapido.

### `frontend/src/utils/sobrePayload.js`

Construye el payload que se envia al backend al crear o editar sobres.

Toma el formulario del frontend y lo convierte a la estructura que espera la API.

Incluye:

- Fecha.
- Iglesia.
- Miembro.
- Moneda.
- Montos.
- Ofrendas.
- Transferencias.

### `frontend/src/utils/exporters.js`

Exporta reportes.

Funciones:

- `exportCsvFile`
- `exportExcelFile`
- `exportPdfFile`

CSV:

- Genera texto separado por comas.

Excel:

- Genera un HTML compatible con hojas de calculo.
- Escapa contenido HTML para que nombres y referencias salgan como texto.

PDF:

- Genera un PDF simple sin librerias externas.

## Frontend: estilos

### `frontend/src/styles/theme.css`

Variables visuales del proyecto.

Define:

- Colores.
- Sombras.
- Radios.
- Anchos de layout.
- Alturas principales.

Ejemplo:

```css
--color-primary
--sidebar-width
--topbar-height
```

### `frontend/src/styles/base.css`

Estilos globales.

Incluye:

- Reset base.
- Layout de paginas.
- Grids.
- Estados.
- Botones.
- Formularios.
- Ajustes visuales para PrimeVue.

## Database

### `database/diezmos_db.sql`

Script SQL principal del proyecto.

Sirve para crear o actualizar la estructura de la base de datos.

Crea estas tablas:

```text
IGLESIA
MIEMBRO
SOBRE
OFRENDA_COLABORACION
TRANSFERENCIA
```

Tambien elimina tablas antiguas que ya no se usan:

```text
MONEDA
CONFIGURACION_SISTEMA
```

## Database: tablas

### `IGLESIA`

Guarda iglesias.

Campos:

- `Id_Iglesia`
- `Nombre_Iglesia`
- `Ciudad`

Se usa para filtrar miembros, sobres y reportes.

### `MIEMBRO`

Guarda miembros.

Campos:

- `Id_Miembro`
- `Nombre`
- `Apellido`
- `Email`
- `Id_Iglesia`

Cada miembro pertenece a una iglesia.

El email es unico dentro de la misma iglesia.

### `SOBRE`

Tabla principal.

Guarda sobres de diezmos y ofrendas.

Campos importantes:

- `Numero_Sobre`
- `Fecha`
- `Mes`
- `Anio`
- `Id_Iglesia`
- `Id_Miembro`
- `Monto_Diezmo`
- `Monto_Pacto_Amor`
- `Total_Incluido`

Tiene una restriccion unica:

```text
Numero_Sobre + Mes + Anio + Id_Iglesia
```

Eso hace que los numeros de sobre reinicien cada mes y por iglesia.

### `OFRENDA_COLABORACION`

Guarda ofrendas adicionales de un sobre.

Campos:

- `Id_Ofrenda`
- `Id_Sobre`
- `Nombre_Ofrenda`
- `Monto_Ofrenda`

Tiene `ON DELETE CASCADE`, asi que si se borra un sobre, se borran sus ofrendas.

### `TRANSFERENCIA`

Guarda transferencias asociadas a un sobre.

Campos:

- `Id_Transferencia`
- `Id_Sobre`
- `Fecha_Transferencia`
- `Numero_Transferencia`
- `Banco_Receptor_Cuenta`
- `Monto_Transferencia`

Tambien tiene `ON DELETE CASCADE`.

## Como seguir un flujo en el codigo

### Ejemplo: crear un sobre

1. El usuario llena `ContributionFormDialog.vue`.
2. `SobresView.vue` recibe el formulario.
3. `sobrePayload.js` arma el payload.
4. `sobres.service.js` del frontend llama `api.post('/sobres', payload)`.
5. `http.js` envia la peticion a backend.
6. Backend entra por `sobres.routes.js`.
7. `sobres.controller.js` recibe la peticion.
8. `sobres.service.js` valida reglas y convierte moneda.
9. `sobres.repository.js` guarda todo en una transaccion.
10. El backend responde JSON.
11. El frontend muestra toast y recarga la tabla.

### Ejemplo: cambiar iglesia activa

1. El usuario va a Configuracion.
2. `ConfiguracionView.vue` carga iglesias.
3. El usuario pulsa `Usar`.
4. Se llama `setIglesiaActivaId`.
5. `iglesia-activa.service.js` guarda ID y nombre en localStorage.
6. Las vistas que observan `iglesiaActivaId` recargan datos.

### Ejemplo: consultar reporte

1. El usuario elige mensual o semanal en `ReportesView.vue`.
2. `reportes.service.js` arma la URL.
3. `withIglesiaActiva` agrega `idIglesia`.
4. Backend entra por `reportes.routes.js`.
5. `reportes.service.js` del backend valida filtros.
6. `reportes.repository.js` ejecuta SQL.
7. Frontend muestra tabla.
8. Si el usuario exporta, usa `exporters.js`.

## Que archivos tocar segun lo que quieras cambiar

### Cambiar una regla de negocio de sobres

Primero mira:

```text
backend/src/modules/sobres/sobres.service.js
```

Si la regla requiere SQL, mira:

```text
backend/src/modules/sobres/sobres.repository.js
```

### Cambiar una pantalla

Mira primero en:

```text
frontend/src/views/
```

Luego los componentes que usa esa vista.

### Cambiar el formulario de sobres

Mira:

```text
frontend/src/components/ContributionFormDialog.vue
frontend/src/composables/useContributionAmounts.js
frontend/src/utils/sobrePayload.js
```

### Cambiar tablas o columnas

Mira:

```text
database/diezmos_db.sql
backend/src/modules/*/*.repository.js
```

Si cambias una columna en SQL, normalmente tambien debes actualizar algun repositorio.

### Cambiar endpoints

Mira:

```text
backend/src/modules/*/*.routes.js
backend/src/modules/*/*.controller.js
frontend/src/services/*.service.js
```

### Cambiar estilos generales

Mira:

```text
frontend/src/styles/theme.css
frontend/src/styles/base.css
```

### Cambiar botones, inputs o modales reutilizables

Mira:

```text
frontend/src/components/ui/
```

## Resumen mental del proyecto

Piensalo asi:

```text
Vista Vue
  -> servicio frontend
    -> http.js
      -> ruta backend
        -> controlador
          -> servicio backend
            -> repositorio
              -> PostgreSQL
```

Y de regreso:

```text
PostgreSQL
  -> repositorio
    -> servicio backend
      -> controlador
        -> JSON
          -> frontend
            -> tabla, formulario o toast
```

Si entiendes esa cadena, ya tienes el mapa principal de DIEZMAPP.
