# Frontend - DIEZMAPP

El frontend de DIEZMAPP esta construido con Vue 3, Vite, Vue Router, PrimeVue y CSS propio. Su objetivo es ofrecer una interfaz simple para administrar iglesias, miembros, sobres y reportes.

## Ubicacion

```text
frontend/
└── src/
```

## Comando de desarrollo

```bash
cd frontend
pnpm dev --host 127.0.0.1
```

## Comando de build

```bash
cd frontend
pnpm build
```

## Archivos principales

### `src/main.js`

Inicializa la aplicacion Vue.

Configura:

- Vue Router.
- PrimeVue.
- Tema Aura de PrimeVue.
- Servicios globales de PrimeVue:
  - Toast.
  - ConfirmDialog.
- Componentes globales PrimeVue usados en el proyecto.
- Locale en espanol para calendarios y mensajes de PrimeVue.

Ejemplos de textos configurados:

```text
Hoy
Limpiar
No se encontraron resultados
Sin registros disponibles
```

### `src/App.vue`

Es el componente raiz.

Solo renderiza:

```vue
<RouterView />
```

La estructura visual principal se maneja desde `AppLayout.vue`.

### `src/layouts/AppLayout.vue`

Define la estructura general de la aplicacion:

- Sidebar.
- Topbar.
- Contenedor principal.
- Toast.
- ConfirmDialog.

Tambien carga la iglesia activa inicial.

Si no hay iglesia activa guardada, intenta usar la primera iglesia disponible.

Usa `KeepAlive` para que las paginas principales no se desmonten al navegar.

Esto evita recargas innecesarias al cambiar de pagina.

Las vistas con datos compartidos recargan en segundo plano cuando se activan de nuevo. Asi, si se crea un miembro desde Sobres, al volver a Miembros aparece sin forzar un skeleton completo.

## Rutas

Las rutas estan en:

```text
src/router/index.js
```

Rutas principales:

```text
/                  Dashboard
/miembros          Miembros
/sobres            Sobres
/reportes          Reportes
/configuracion     Configuracion
/iglesias          Redirecciona a /configuracion
```

Las rutas principales usan:

```js
meta: { keepAlive: true }
```

Esto permite conservar el estado de cada vista mientras el usuario navega.

## Iglesia activa

La iglesia activa se administra en:

```text
src/services/iglesia-activa.service.js
```

Guarda en `localStorage`:

```text
diezmapp.idIglesiaActiva
diezmapp.nombreIglesiaActiva
```

Funciones principales:

```js
getIglesiaActivaId()
setIglesiaActivaId(id, nombre)
withIglesiaActiva(path)
```

`withIglesiaActiva(path)` agrega el parametro `idIglesia` a las peticiones que deben filtrar por iglesia activa.

Ejemplo:

```text
/miembros?idIglesia=1
/sobres?idIglesia=1
/reportes/mensual?mes=6&anio=2026&idIglesia=1
```

## Servicios HTTP

La comunicacion con el backend se centraliza en:

```text
src/api/http.js
```

Base URL:

```js
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/_/backend/api' : 'http://localhost:3000/api')
```

En desarrollo apunta a `http://localhost:3000/api`.

En Vercel, si no se define `VITE_API_URL`, apunta al backend desplegado como servicio en `/_/backend/api`.

El helper `api` expone:

```js
api.get(path)
api.post(path, data)
api.put(path, data)
api.delete(path)
```

Si el backend responde con error, lanza un `Error` para que la vista muestre toast o mensaje.

## Servicios por modulo

### `catalogos.service.js`

Maneja:

- Iglesias.
- Monedas disponibles para captura.

Funciones:

```js
getIglesias()
createIglesia(payload)
updateIglesia(idIglesia, payload)
deleteIglesia(idIglesia)
getMonedas()
```

### `miembros.service.js`

Maneja miembros.

Funciones:

```js
getMiembros()
createMiembro(payload)
updateMiembro(idMiembro, payload)
deleteMiembro(idMiembro)
```

`getMiembros()` usa la iglesia activa.

### `sobres.service.js`

Maneja sobres.

Funciones:

```js
getSobres()
getSobre(idSobre)
getSiguienteNumeroSobre(fecha)
createSobre(payload)
updateSobre(idSobre, payload)
deleteSobre(idSobre)
```

`getSobres()` usa la iglesia activa.

### `reportes.service.js`

Maneja reportes.

Funciones:

```js
getReporteSemanal({ fechaInicio, fechaFin })
getReporteMensual({ mes, anio })
```

Ambas usan la iglesia activa.

### `configuracion.service.js`

Actualmente solo consulta la tasa del dolar:

```js
getTasaDolar()
```

## Componentes principales

### `AppSidebar.vue`

Barra lateral de navegacion.

Opciones:

- Dashboard.
- Miembros.
- Sobres.
- Reportes.
- Configuracion.

Las ofrendas y transferencias se trabajan dentro del formulario y detalle del sobre.

### `AppTopbar.vue`

Barra horizontal superior.

Muestra la iglesia activa excepto en la vista de configuracion.

Formato visual:

```text
Iglesia Nombre de iglesia
```

### `DataTable.vue`

Componente reutilizable para tablas.

Incluye:

- Buscador opcional.
- Paginacion.
- Skeleton de carga.
- Acciones por fila.
- Toolbar para botones.
- Texto de estado vacio.

Props principales:

```js
columns
rows
emptyText
loading
searchable
actionsWidth
```

Cada columna puede definir:

```js
{
  key: 'nombre',
  label: 'Nombre',
  width: '190px',
  skeletonWidth: '82px'
}
```

### `StatCard.vue`

Tarjeta de indicador.

Se usa en dashboard y detalle.

Muestra:

- Label.
- Valor.
- Icono.
- Skeleton si esta cargando.

### `FormDialog.vue`

Wrapper reutilizable para modales de formulario.

Se usa en:

- Miembros.
- Iglesias.
- Sobres.

Incluye:

- Header con icono.
- Contenido.
- Footer con botones, si no se oculta.

## Vistas

### DashboardView

Carga:

- Miembros.
- Monedas.
- Sobres.

Muestra:

- Total de miembros.
- Total de sobres.
- Total general.
- Ultimos sobres registrados.

Acciones sobre un sobre:

- Detalles.
- Editar.
- Eliminar.

Despues de editar o eliminar, actualiza datos sin mostrar skeleton completo.

### MiembrosView

Carga miembros de la iglesia activa.

Permite:

- Crear miembro.
- Editar miembro.
- Eliminar miembro.

Campos:

- Nombre.
- Apellido.
- Email.

### SobresView

Pantalla principal de registro de sobres.

Carga:

- Miembros.
- Monedas.
- Sobres.
- Siguiente numero de sobre.

Permite:

- Crear sobre.
- Editar sobre.
- Eliminar sobre.
- Ver detalles.
- Crear miembro desde el formulario de sobre.

### ReportesView

Permite consultar reportes:

- Semanal.
- Mensual.

Para semanal:

- Se selecciona fecha inicio.
- El sistema completa fecha fin sumando 6 dias.
- Si se selecciona fecha fin, completa fecha inicio restando 6 dias.

Para mensual:

- Se usa DatePicker de mes/anio.

La tabla muestra:

- Sobre.
- Fecha.
- Miembro.
- Total.

Exportaciones:

- Excel.
- PDF.
- CSV.

Si no hay datos y se intenta exportar, muestra toast `Sin datos`.

### ConfiguracionView

Muestra:

- Tasa oficial del dolar.
- Fecha de actualizacion.
- Boton para actualizar tasa.
- Boton para abrir BCV.
- Tabla de iglesias.

Permite:

- Crear iglesia.
- Editar iglesia.
- Eliminar iglesia.
- Activar iglesia.

## Formulario de sobre

Archivo:

```text
src/components/ContributionFormDialog.vue
```

Trabaja en cuatro pasos:

1. Datos generales.
2. Diezmos y pacto.
3. Ofrendas.
4. Transferencias.

### Datos generales

Incluye:

- Fecha.
- Numero de sobre.
- Moneda.
- Miembro.

### Diezmos y pacto

Incluye:

- Diezmo.
- Pacto de amor.

Si la moneda es bolivar, muestra equivalente en dolares.

### Ofrendas

Permite varias ofrendas.

Cada ofrenda tiene:

- Nombre.
- Monto.

El primer item no se puede eliminar para mantener al menos una fila visible.

### Transferencias

Permite varias transferencias.

Cada transferencia tiene:

- Fecha.
- Numero de transferencia.
- Banco.
- Monto.

El primer item no se puede eliminar.

### Validacion visual del total

El formulario muestra:

```text
Total: $ monto
Transferencias: $ monto
```

Si la moneda es bolivar:

```text
Total: Bs monto = $ monto
Transferencias: $ monto
```

El boton guardar solo se habilita si:

- Hay total capturado.
- Hay transferencias.
- El total capturado coincide con las transferencias.

## Utilidades

### `date.js`

Funciones:

```js
toLocalDateString(date)
formatDateEs(value)
formatDateTimeEs(value)
```

Se usa para evitar errores por zona horaria y mostrar fechas en formato legible.

### `loading.js`

Funcion:

```js
withMinimumDelay(task, delay = 600)
```

Permite que los skeletons se vean al menos durante 600 ms cuando corresponde.

## Estilos

Los estilos globales estan en:

```text
src/styles/base.css
src/styles/theme.css
```

`theme.css` define variables de color, radios, sombras y dimensiones.

`base.css` define:

- Layout base.
- Estilos PrimeVue comunes.
- Tablas.
- Botones.
- Menus.
- Dialogos.
- Scroll del selector de miembros.
