# Base de datos - DIEZMAPP

La base de datos de DIEZMAPP esta construida en PostgreSQL. Su archivo principal de definicion esta en:

```text
database/diezmos_db.sql
```

Nombre de base de datos:

```text
diezmos_db
```

## Idea general del modelo

El modelo guarda la informacion necesaria para registrar sobres de diezmos y ofrendas.

Entidades principales:

- Iglesia.
- Miembro.
- Sobre.
- Ofrenda de colaboracion.
- Transferencia.

Todas las operaciones monetarias se guardan en dolares.

No existe tabla `MONEDA`. Las monedas disponibles para captura (`Bs` y `$`) se manejan desde el backend.

No existe tabla `CONFIGURACION_SISTEMA`. La configuracion de iglesias se trabaja directamente con la tabla `IGLESIA`.

## Tablas

## 1. IGLESIA

Tabla que representa una iglesia registrada en el sistema.

```sql
CREATE TABLE IF NOT EXISTS IGLESIA (
    Id_Iglesia SERIAL PRIMARY KEY,
    Nombre_Iglesia VARCHAR(100) NOT NULL,
    Ciudad VARCHAR(80) NOT NULL
);
```

### Campos

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `Id_Iglesia` | `SERIAL` | Identificador unico de la iglesia. |
| `Nombre_Iglesia` | `VARCHAR(100)` | Nombre de la iglesia. |
| `Ciudad` | `VARCHAR(80)` | Ciudad donde se encuentra la iglesia. |

### Uso

Se usa para:

- Crear varias iglesias.
- Seleccionar una iglesia activa.
- Filtrar miembros.
- Filtrar sobres.
- Filtrar reportes.

## 2. MIEMBRO

Tabla que representa los miembros o congregantes.

```sql
CREATE TABLE IF NOT EXISTS MIEMBRO (
    Id_Miembro SERIAL PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Apellido VARCHAR(100) NOT NULL DEFAULT '',
    Email VARCHAR(100),
    Id_Iglesia INTEGER NOT NULL REFERENCES IGLESIA(Id_Iglesia)
);
```

### Campos

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `Id_Miembro` | `SERIAL` | Identificador unico del miembro. |
| `Nombre` | `VARCHAR(100)` | Nombre del miembro. |
| `Apellido` | `VARCHAR(100)` | Apellido del miembro. |
| `Email` | `VARCHAR(100)` | Correo electronico. Es unico dentro de la misma iglesia. |
| `Id_Iglesia` | `INTEGER` | Iglesia a la que pertenece el miembro. |

### Claves

Primary key:

```text
Id_Miembro
```

Foreign key:

```text
Id_Iglesia -> IGLESIA(Id_Iglesia)
```

### Regla importante

No se debe eliminar un miembro que tenga sobres registrados.

La aplicacion valida esto en backend antes de borrar.

## 3. SOBRE

Tabla principal del sistema.

Representa un sobre de diezmos y ofrendas.

```sql
CREATE TABLE IF NOT EXISTS SOBRE (
    Id_Sobre SERIAL PRIMARY KEY,
    Numero_Sobre INTEGER NOT NULL,
    Fecha DATE NOT NULL,
    Mes SMALLINT NOT NULL,
    Anio SMALLINT NOT NULL,
    Id_Iglesia INTEGER NOT NULL REFERENCES IGLESIA(Id_Iglesia),
    Id_Miembro INTEGER NOT NULL REFERENCES MIEMBRO(Id_Miembro),
    Monto_Diezmo DECIMAL(10,2) NOT NULL,
    Monto_Pacto_Amor DECIMAL(10,2),
    Total_Incluido DECIMAL(10,2) NOT NULL,
    CONSTRAINT UQ_Sobre_Numero_Mes_Anio_Iglesia UNIQUE (Numero_Sobre, Mes, Anio, Id_Iglesia),
    CONSTRAINT CHK_Sobre_Mes CHECK (Mes BETWEEN 1 AND 12),
    CONSTRAINT CHK_Sobre_Anio CHECK (Anio >= 2000),
    CONSTRAINT CHK_Sobre_Numero_Sobre CHECK (Numero_Sobre > 0)
);
```

### Campos

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `Id_Sobre` | `SERIAL` | Identificador unico del sobre. |
| `Numero_Sobre` | `INTEGER` | Numero visible del sobre. Reinicia cada mes. |
| `Fecha` | `DATE` | Fecha del sobre. |
| `Mes` | `SMALLINT` | Mes extraido de la fecha. |
| `Anio` | `SMALLINT` | Anio extraido de la fecha. |
| `Id_Iglesia` | `INTEGER` | Iglesia a la que pertenece el sobre. |
| `Id_Miembro` | `INTEGER` | Miembro que entrega el sobre. |
| `Monto_Diezmo` | `DECIMAL(10,2)` | Monto del diezmo en dolares. |
| `Monto_Pacto_Amor` | `DECIMAL(10,2)` | Monto del pacto de amor en dolares. |
| `Total_Incluido` | `DECIMAL(10,2)` | Total del sobre en dolares. |

### Claves

Primary key:

```text
Id_Sobre
```

Foreign keys:

```text
Id_Iglesia -> IGLESIA(Id_Iglesia)
Id_Miembro -> MIEMBRO(Id_Miembro)
```

Clave unica:

```text
Numero_Sobre + Mes + Anio + Id_Iglesia
```

Esto permite que el numero de sobre reinicie cada mes y por iglesia.

### Checks

```text
Mes BETWEEN 1 AND 12
Anio >= 2000
Numero_Sobre > 0
```

## 4. OFRENDA_COLABORACION

Tabla de ofrendas adicionales asociadas a un sobre.

Un sobre puede tener muchas ofrendas de colaboracion.

```sql
CREATE TABLE IF NOT EXISTS OFRENDA_COLABORACION (
    Id_Ofrenda SERIAL PRIMARY KEY,
    Id_Sobre INTEGER NOT NULL REFERENCES SOBRE(Id_Sobre) ON DELETE CASCADE,
    Nombre_Ofrenda VARCHAR(120),
    Monto_Ofrenda DECIMAL(10,2) NOT NULL
);
```

### Campos

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `Id_Ofrenda` | `SERIAL` | Identificador unico de la ofrenda. |
| `Id_Sobre` | `INTEGER` | Sobre al que pertenece. |
| `Nombre_Ofrenda` | `VARCHAR(120)` | Nombre o detalle de la ofrenda. |
| `Monto_Ofrenda` | `DECIMAL(10,2)` | Monto de la ofrenda en dolares. |

### Claves

Primary key:

```text
Id_Ofrenda
```

Foreign key:

```text
Id_Sobre -> SOBRE(Id_Sobre)
```

La relacion tiene:

```sql
ON DELETE CASCADE
```

Esto significa que si se elimina un sobre, se eliminan automaticamente sus ofrendas.

## 5. TRANSFERENCIA

Tabla de comprobantes de pago asociados a un sobre.

Un sobre puede tener varias transferencias.

```sql
CREATE TABLE IF NOT EXISTS TRANSFERENCIA (
    Id_Transferencia SERIAL PRIMARY KEY,
    Id_Sobre INTEGER NOT NULL REFERENCES SOBRE(Id_Sobre) ON DELETE CASCADE,
    Fecha_Transferencia DATE NOT NULL,
    Numero_Transferencia VARCHAR(50) NOT NULL,
    Banco_Receptor_Cuenta VARCHAR(120) NOT NULL,
    Monto_Transferencia DECIMAL(10,2) NOT NULL
);
```

### Campos

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `Id_Transferencia` | `SERIAL` | Identificador unico de la transferencia. |
| `Id_Sobre` | `INTEGER` | Sobre al que pertenece. |
| `Fecha_Transferencia` | `DATE` | Fecha de la transferencia. |
| `Numero_Transferencia` | `VARCHAR(50)` | Numero de referencia. |
| `Banco_Receptor_Cuenta` | `VARCHAR(120)` | Banco o cuenta receptora. |
| `Monto_Transferencia` | `DECIMAL(10,2)` | Monto de la transferencia en dolares. |

### Claves

Primary key:

```text
Id_Transferencia
```

Foreign key:

```text
Id_Sobre -> SOBRE(Id_Sobre)
```

Tambien usa:

```sql
ON DELETE CASCADE
```

Si se elimina un sobre, se eliminan sus transferencias.

## Relaciones

```text
IGLESIA 1 ─── N MIEMBRO
IGLESIA 1 ─── N SOBRE
MIEMBRO 1 ─── N SOBRE
SOBRE 1 ─── N OFRENDA_COLABORACION
SOBRE 1 ─── N TRANSFERENCIA
```

## Explicacion de claves foraneas

Una clave foranea conecta una tabla hija con una tabla padre.

Ejemplo:

```text
MIEMBRO.Id_Iglesia -> IGLESIA.Id_Iglesia
```

Esto quiere decir:

- Un miembro debe pertenecer a una iglesia existente.
- No se puede crear un miembro con una iglesia que no existe.

Otro ejemplo:

```text
SOBRE.Id_Miembro -> MIEMBRO.Id_Miembro
```

Esto quiere decir:

- Un sobre debe estar asociado a un miembro existente.
- No se puede registrar un sobre para un miembro que no existe.
- La aplicacion tambien valida que el miembro pertenezca a la misma iglesia del sobre.

Ejemplo con cascade:

```text
OFRENDA_COLABORACION.Id_Sobre -> SOBRE.Id_Sobre ON DELETE CASCADE
```

Esto quiere decir:

- Una ofrenda depende de un sobre.
- Si se borra el sobre, la ofrenda tambien se borra.

## Por que `Mes` y `Anio` estan en SOBRE

Aunque `Mes` y `Anio` se pueden obtener desde `Fecha`, se guardan para controlar mas facil la regla:

```text
Cada sobre de un mes empieza en 1.
```

La restriccion unica necesita comparar:

```text
Numero_Sobre
Mes
Anio
Id_Iglesia
```

Asi se evita repetir un numero dentro del mismo periodo.

## Guardado de montos

La base de datos guarda:

- `Monto_Diezmo`
- `Monto_Pacto_Amor`
- `Monto_Ofrenda`
- `Monto_Transferencia`
- `Total_Incluido`

Todos estos montos se guardan en dolares.

Si el usuario escribe en bolivares, la conversion ocurre antes de insertar.

## Total incluido

El total incluido se calcula como:

```text
Monto_Diezmo + Monto_Pacto_Amor + SUM(Monto_Ofrenda)
```

Las transferencias deben sumar ese mismo valor.

## Tablas eliminadas o no usadas

El modelo actual no usa:

- `MONEDA`
- `CONFIGURACION_SISTEMA`

El script SQL las elimina si existen:

```sql
DROP TABLE IF EXISTS CONFIGURACION_SISTEMA;
DROP TABLE IF EXISTS MONEDA;
```

Tambien elimina columnas antiguas relacionadas con moneda original y tasa BCV porque el modelo actual guarda solo dolares.

## Datos iniciales

El script crea una iglesia por defecto si no existe:

```sql
INSERT INTO IGLESIA (Nombre_Iglesia, Ciudad)
SELECT 'Iglesia Principal', 'Lima'
WHERE NOT EXISTS (
    SELECT 1
    FROM IGLESIA
    WHERE Nombre_Iglesia = 'Iglesia Principal'
);
```

## Consultas utiles

Ver iglesias:

```sql
SELECT * FROM IGLESIA;
```

Ver miembros con su iglesia:

```sql
SELECT
  m.Id_Miembro,
  m.Nombre,
  m.Apellido,
  m.Email,
  i.Nombre_Iglesia
FROM MIEMBRO m
JOIN IGLESIA i ON i.Id_Iglesia = m.Id_Iglesia;
```

Ver sobres con miembro:

```sql
SELECT
  s.Numero_Sobre,
  s.Fecha,
  s.Mes,
  s.Anio,
  m.Nombre,
  m.Apellido,
  s.Monto_Diezmo,
  s.Monto_Pacto_Amor,
  s.Total_Incluido
FROM SOBRE s
JOIN MIEMBRO m ON m.Id_Miembro = s.Id_Miembro
ORDER BY s.Fecha DESC, s.Numero_Sobre DESC;
```

Ver ofrendas de un sobre:

```sql
SELECT *
FROM OFRENDA_COLABORACION
WHERE Id_Sobre = 1;
```

Ver transferencias de un sobre:

```sql
SELECT *
FROM TRANSFERENCIA
WHERE Id_Sobre = 1;
```

Ver total de transferencias por sobre:

```sql
SELECT
  Id_Sobre,
  SUM(Monto_Transferencia) AS Total_Transferido
FROM TRANSFERENCIA
GROUP BY Id_Sobre;
```

Ver total de ofrendas por sobre:

```sql
SELECT
  Id_Sobre,
  SUM(Monto_Ofrenda) AS Total_Ofrendas
FROM OFRENDA_COLABORACION
GROUP BY Id_Sobre;
```

## Recomendaciones de mantenimiento

- No insertar sobres manualmente sin respetar `Mes`, `Anio` y `Numero_Sobre`.
- No insertar ofrendas o transferencias sin `Id_Sobre`.
- No modificar montos directamente si no se recalcula `Total_Incluido`.
- Mantener la regla de que transferencias sumen el total incluido.
- Usar siempre el backend para registrar sobres, porque ahi estan las validaciones.
