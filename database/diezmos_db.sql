-- Base de Datos: Diezmos y Ofrendas
-- PostgreSQL
-- Los montos operativos se guardan en dolares.
-- Si el usuario captura en bolivares, la aplicacion convierte antes de guardar.

CREATE DATABASE diezmos_db;

-- \c diezmos_db

CREATE TABLE IF NOT EXISTS IGLESIA (
    Id_Iglesia SERIAL PRIMARY KEY,
    Nombre_Iglesia VARCHAR(100) NOT NULL,
    Ciudad VARCHAR(80) NOT NULL
);

CREATE TABLE IF NOT EXISTS MIEMBRO (
    Id_Miembro SERIAL PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Apellido VARCHAR(100) NOT NULL DEFAULT '',
    Email VARCHAR(100) UNIQUE,
    Id_Iglesia INTEGER NOT NULL REFERENCES IGLESIA(Id_Iglesia)
);

ALTER TABLE MIEMBRO
ADD COLUMN IF NOT EXISTS Apellido VARCHAR(100) NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS SOBRE (
    Id_Sobre SERIAL PRIMARY KEY,
    Numero_Sobre INTEGER NOT NULL,
    Fecha DATE NOT NULL,
    Mes SMALLINT NOT NULL,
    Anio SMALLINT NOT NULL,
    Id_Iglesia INTEGER REFERENCES IGLESIA(Id_Iglesia),
    Id_Miembro INTEGER NOT NULL REFERENCES MIEMBRO(Id_Miembro),
    Monto_Diezmo DECIMAL(10,2) NOT NULL,
    Monto_Pacto_Amor DECIMAL(10,2),
    Total_Incluido DECIMAL(10,2) NOT NULL,
    CONSTRAINT UQ_Sobre_Numero_Mes_Anio_Iglesia UNIQUE (Numero_Sobre, Mes, Anio, Id_Iglesia),
    CONSTRAINT CHK_Sobre_Mes CHECK (Mes BETWEEN 1 AND 12),
    CONSTRAINT CHK_Sobre_Anio CHECK (Anio >= 2000),
    CONSTRAINT CHK_Sobre_Numero_Sobre CHECK (Numero_Sobre > 0)
);

CREATE TABLE IF NOT EXISTS OFRENDA_COLABORACION (
    Id_Ofrenda SERIAL PRIMARY KEY,
    Id_Sobre INTEGER NOT NULL REFERENCES SOBRE(Id_Sobre) ON DELETE CASCADE,
    Nombre_Ofrenda VARCHAR(120),
    Monto_Ofrenda DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS TRANSFERENCIA (
    Id_Transferencia SERIAL PRIMARY KEY,
    Id_Sobre INTEGER NOT NULL REFERENCES SOBRE(Id_Sobre) ON DELETE CASCADE,
    Fecha_Transferencia DATE NOT NULL,
    Numero_Transferencia VARCHAR(50) NOT NULL,
    Banco_Receptor_Cuenta VARCHAR(120) NOT NULL,
    Monto_Transferencia DECIMAL(10,2) NOT NULL
);

ALTER TABLE SOBRE
ADD COLUMN IF NOT EXISTS Id_Iglesia INTEGER;

ALTER TABLE SOBRE
DROP COLUMN IF EXISTS Id_Moneda_Diezmo,
DROP COLUMN IF EXISTS Monto_Diezmo_Original,
DROP COLUMN IF EXISTS Id_Moneda_Diezmo_Original,
DROP COLUMN IF EXISTS Tasa_Bcv_Diezmo,
DROP COLUMN IF EXISTS Id_Moneda_Pacto,
DROP COLUMN IF EXISTS Monto_Pacto_Amor_Original,
DROP COLUMN IF EXISTS Id_Moneda_Pacto_Original,
DROP COLUMN IF EXISTS Tasa_Bcv_Pacto;

ALTER TABLE SOBRE DROP CONSTRAINT IF EXISTS uq_sobre_numero_mes_anio;

UPDATE SOBRE s
SET Id_Iglesia = m.Id_Iglesia
FROM MIEMBRO m
WHERE m.Id_Miembro = s.Id_Miembro
  AND s.Id_Iglesia IS NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'sobre_id_iglesia_fkey'
    ) THEN
        ALTER TABLE SOBRE
        ADD CONSTRAINT sobre_id_iglesia_fkey
        FOREIGN KEY (Id_Iglesia)
        REFERENCES IGLESIA(Id_Iglesia);
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'uq_sobre_numero_mes_anio_iglesia'
    ) THEN
        ALTER TABLE SOBRE
        ADD CONSTRAINT UQ_Sobre_Numero_Mes_Anio_Iglesia
        UNIQUE (Numero_Sobre, Mes, Anio, Id_Iglesia);
    END IF;
END $$;

ALTER TABLE OFRENDA_COLABORACION
ADD COLUMN IF NOT EXISTS Nombre_Ofrenda VARCHAR(120);

ALTER TABLE OFRENDA_COLABORACION
DROP COLUMN IF EXISTS Id_Moneda,
DROP COLUMN IF EXISTS Monto_Ofrenda_Original,
DROP COLUMN IF EXISTS Id_Moneda_Original,
DROP COLUMN IF EXISTS Tasa_Bcv_Dolar;

ALTER TABLE TRANSFERENCIA
DROP COLUMN IF EXISTS Id_Moneda,
DROP COLUMN IF EXISTS Monto_Transferencia_Original,
DROP COLUMN IF EXISTS Id_Moneda_Original,
DROP COLUMN IF EXISTS Tasa_Bcv_Dolar;

DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    IF to_regclass('public.moneda') IS NOT NULL THEN
        FOR constraint_record IN
            SELECT conrelid::regclass AS table_name, conname
            FROM pg_constraint
            WHERE confrelid = 'public.moneda'::regclass
        LOOP
            EXECUTE format(
                'ALTER TABLE %s DROP CONSTRAINT IF EXISTS %I',
                constraint_record.table_name,
                constraint_record.conname
            );
        END LOOP;
    END IF;
END $$;

DROP TABLE IF EXISTS CONFIGURACION_SISTEMA;
ALTER TABLE IGLESIA DROP COLUMN IF EXISTS Tasa_Bcv_Dolar;

INSERT INTO IGLESIA (Nombre_Iglesia, Ciudad)
SELECT 'Iglesia Principal', 'Lima'
WHERE NOT EXISTS (
    SELECT 1
    FROM IGLESIA
    WHERE Nombre_Iglesia = 'Iglesia Principal'
);

DROP TABLE IF EXISTS MONEDA;
