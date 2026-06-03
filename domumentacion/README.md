# DIEZMAPP - Funcionamiento general

DIEZMAPP es una aplicacion web para registrar y consultar sobres de diezmos y ofrendas de una o varias iglesias. El sistema permite administrar iglesias, miembros, sobres, ofrendas de colaboracion, transferencias y reportes semanales o mensuales.

La aplicacion no usa autenticacion. El usuario trabaja directamente con una iglesia activa, seleccionada desde la vista de configuracion. Toda la informacion que se muestra en dashboard, miembros, sobres y reportes se filtra por esa iglesia activa.

## Objetivo del sistema

El objetivo principal es controlar los sobres de diezmos y ofrendas entregados por los miembros de una iglesia.

Cada sobre contiene:

- Numero de sobre.
- Fecha.
- Miembro.
- Diezmo.
- Pacto de amor.
- Una o varias ofrendas de colaboracion.
- Una o varias transferencias.
- Total incluido.

La regla principal del negocio es:

```text
Diezmo + Pacto de amor + Ofrendas = Total incluido
```

Y tambien:

```text
Suma de transferencias = Total incluido
```

Si las transferencias no coinciden con el total incluido, el backend rechaza el guardado.

## Moneda y conversion

La base de datos guarda todos los montos operativos en dolares.

En el formulario de sobre el usuario puede capturar montos en:

- Dolares.
- Bolivares.

Si el usuario captura en dolares, el monto se guarda directamente.

Si el usuario captura en bolivares, el sistema consulta la tasa oficial externa y convierte el monto a dolares antes de guardar.

La tasa oficial se consulta desde:

```text
https://ve.dolarapi.com/v1/dolares/oficial
```

El sistema usa principalmente:

- `promedio`: valor de la tasa.
- `fechaActualizacion`: fecha de actualizacion.

## Flujo general de uso

1. El usuario entra al sistema.
2. El sistema carga o asigna una iglesia activa.
3. El usuario puede cambiar la iglesia activa desde Configuracion.
4. El dashboard muestra resumen y ultimos sobres de la iglesia activa.
5. En Miembros se administran los miembros de la iglesia activa.
6. En Sobres se registran, editan, eliminan y consultan detalles de sobres.
7. En Reportes se consulta por semana o por mes.
8. Los reportes se pueden exportar a Excel, PDF o CSV.

## Iglesia activa

La iglesia activa es clave para el funcionamiento del sistema.

Se guarda en `localStorage` usando:

```text
diezmapp.idIglesiaActiva
diezmapp.nombreIglesiaActiva
```

Cuando se selecciona una iglesia activa:

- Miembros se filtra por esa iglesia.
- Sobres se filtra por esa iglesia.
- Dashboard se actualiza para esa iglesia.
- Reportes consultan informacion de esa iglesia.
- El numero de sobre se calcula por mes, anio e iglesia.

## Numeracion mensual de sobres

Los sobres reinician su numeracion cada mes y por iglesia.

Ejemplo:

```text
Iglesia Principal - mayo 2026
Sobre 1
Sobre 2
Sobre 3

Iglesia Principal - junio 2026
Sobre 1
Sobre 2
```

La regla se controla en la tabla `SOBRE` con:

```sql
UNIQUE (Numero_Sobre, Mes, Anio, Id_Iglesia)
```

Esto evita repetir el mismo numero de sobre dentro del mismo mes, anio e iglesia.

## Pantallas principales

### Dashboard

Muestra un resumen operativo:

- Cantidad de miembros.
- Cantidad de sobres.
- Total general en dolares.
- Ultimos sobres registrados.

Desde la tabla de ultimos sobres se puede:

- Ver detalles.
- Editar.
- Eliminar.

### Miembros

Permite administrar los miembros de la iglesia activa.

Cada miembro tiene:

- Nombre.
- Apellido.
- Email.
- Iglesia asociada.

La tabla muestra:

- Nombre.
- Apellido.
- Email.

### Sobres

Es la pantalla principal de captura.

Permite:

- Registrar un nuevo sobre.
- Editar un sobre existente.
- Eliminar un sobre.
- Ver detalle tipo recibo/factura.

El formulario de sobre trabaja por pasos:

1. Datos generales.
2. Diezmo y pacto.
3. Ofrendas.
4. Transferencias.

### Reportes

Permite consultar reportes:

- Semanal.
- Mensual.

La tabla de reporte muestra:

- Sobre.
- Fecha.
- Miembro.
- Total.

Los reportes se pueden exportar a:

- Excel.
- PDF.
- CSV.

### Configuracion

Actualmente se usa para:

- Ver la tasa oficial del dolar.
- Actualizar visualmente la tasa.
- Abrir la pagina del Banco Central de Venezuela.
- Crear, editar y eliminar iglesias.
- Seleccionar la iglesia activa.

## Cache de pantallas

El frontend usa `KeepAlive` en las vistas principales.

Esto significa:

- La primera vez que se entra a una vista, carga los datos.
- Si el usuario navega a otra vista y vuelve, no recarga automaticamente.
- Si cambia la iglesia activa, las vistas escuchan ese cambio y vuelven a consultar datos.

Esto mejora la fluidez de navegacion.

## Tecnologias usadas

Frontend:

- Vue 3.
- Vite.
- Vue Router.
- PrimeVue.
- CSS propio.

Backend:

- Node.js.
- Express.
- PostgreSQL.
- pg.
- dotenv.
- cors.

Base de datos:

- PostgreSQL.

Package manager:

- pnpm.

## Comandos principales

Backend:

```bash
cd backend
pnpm db:setup
pnpm start
```

Frontend:

```bash
cd frontend
pnpm dev --host 127.0.0.1
```

## Estructura general

```text
DIEZMAPP/
├── backend/
│   └── src/
├── frontend/
│   └── src/
├── database/
│   └── diezmos_db.sql
└── domumentacion/
```

## Validaciones importantes

El sistema valida:

- Fechas en formato correcto.
- Montos mayores o iguales a cero.
- Transferencias mayores a cero.
- Existencia de iglesia.
- Existencia de miembro.
- Numeracion unica de sobres por mes, anio e iglesia.
- Que la suma de transferencias coincida con el total incluido.

## Resumen del flujo de guardado de un sobre

1. El usuario selecciona fecha, miembro y moneda.
2. El sistema calcula el numero de sobre siguiente.
3. El usuario ingresa diezmo, pacto y ofrendas.
4. El usuario ingresa una o varias transferencias.
5. El frontend calcula equivalentes en dolares si la moneda es bolivar.
6. El backend vuelve a validar y convertir montos.
7. El backend calcula el total incluido.
8. El backend compara total incluido contra transferencias.
9. Si todo esta correcto, guarda:
   - Registro en `SOBRE`.
   - Registros en `OFRENDA_COLABORACION`.
   - Registros en `TRANSFERENCIA`.

