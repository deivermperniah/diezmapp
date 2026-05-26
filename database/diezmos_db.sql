-- Base de Datos: Diezmos y Ofrendas
-- PostgreSQL
-- Los montos operativos se guardan en dolares. Los campos *_Original
-- preservan lo capturado por el usuario junto con la tasa BCV usada.

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
    Email VARCHAR(100) UNIQUE,
    Id_Iglesia INTEGER NOT NULL REFERENCES IGLESIA(Id_Iglesia)
);

CREATE TABLE IF NOT EXISTS SOBRE (
    Id_Sobre SERIAL PRIMARY KEY,
    Numero_Sobre INTEGER NOT NULL,
    Fecha DATE NOT NULL,
    Mes SMALLINT NOT NULL,
    Anio SMALLINT NOT NULL,
    Id_Iglesia INTEGER REFERENCES IGLESIA(Id_Iglesia),
    Id_Miembro INTEGER NOT NULL REFERENCES MIEMBRO(Id_Miembro),
    Monto_Diezmo DECIMAL(10,2) NOT NULL,
    Id_Moneda_Diezmo VARCHAR(10),
    Monto_Diezmo_Original DECIMAL(10,2),
    Id_Moneda_Diezmo_Original VARCHAR(10),
    Tasa_Bcv_Diezmo DECIMAL(12,4),
    Monto_Pacto_Amor DECIMAL(10,2),
    Id_Moneda_Pacto VARCHAR(10),
    Monto_Pacto_Amor_Original DECIMAL(10,2),
    Id_Moneda_Pacto_Original VARCHAR(10),
    Tasa_Bcv_Pacto DECIMAL(12,4),
    Total_Incluido DECIMAL(10,2) NOT NULL,
    CONSTRAINT UQ_Sobre_Numero_Mes_Anio_Iglesia UNIQUE (Numero_Sobre, Mes, Anio, Id_Iglesia),
    CONSTRAINT CHK_Sobre_Mes CHECK (Mes BETWEEN 1 AND 12),
    CONSTRAINT CHK_Sobre_Anio CHECK (Anio >= 2000),
    CONSTRAINT CHK_Sobre_Numero_Sobre CHECK (Numero_Sobre > 0)
);

CREATE TABLE IF NOT EXISTS OFRENDA_COLABORACION (
    Id_Ofrenda SERIAL PRIMARY KEY,
    Id_Sobre INTEGER NOT NULL REFERENCES SOBRE(Id_Sobre),
    Monto_Ofrenda DECIMAL(10,2) NOT NULL,
    Id_Moneda VARCHAR(10) NOT NULL,
    Monto_Ofrenda_Original DECIMAL(10,2),
    Id_Moneda_Original VARCHAR(10),
    Tasa_Bcv_Dolar DECIMAL(12,4)
);

CREATE TABLE IF NOT EXISTS TRANSFERENCIA (
    Id_Transferencia SERIAL PRIMARY KEY,
    Id_Sobre INTEGER NOT NULL REFERENCES SOBRE(Id_Sobre),
    Fecha_Transferencia DATE NOT NULL,
    Numero_Transferencia VARCHAR(50) NOT NULL,
    Banco_Receptor_Cuenta VARCHAR(120) NOT NULL,
    Monto_Transferencia DECIMAL(10,2) NOT NULL,
    Monto_Transferencia_Original DECIMAL(10,2),
    Id_Moneda_Original VARCHAR(10),
    Tasa_Bcv_Dolar DECIMAL(12,4)
);

ALTER TABLE SOBRE
ADD COLUMN IF NOT EXISTS Id_Iglesia INTEGER,
ADD COLUMN IF NOT EXISTS Monto_Diezmo_Original DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS Id_Moneda_Diezmo_Original VARCHAR(10),
ADD COLUMN IF NOT EXISTS Tasa_Bcv_Diezmo DECIMAL(12,4),
ADD COLUMN IF NOT EXISTS Monto_Pacto_Amor_Original DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS Id_Moneda_Pacto_Original VARCHAR(10),
ADD COLUMN IF NOT EXISTS Tasa_Bcv_Pacto DECIMAL(12,4);

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
ADD COLUMN IF NOT EXISTS Monto_Ofrenda_Original DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS Id_Moneda_Original VARCHAR(10),
ADD COLUMN IF NOT EXISTS Tasa_Bcv_Dolar DECIMAL(12,4);

ALTER TABLE TRANSFERENCIA
ADD COLUMN IF NOT EXISTS Monto_Transferencia_Original DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS Id_Moneda_Original VARCHAR(10),
ADD COLUMN IF NOT EXISTS Tasa_Bcv_Dolar DECIMAL(12,4);

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

ALTER TABLE SOBRE
ALTER COLUMN Id_Moneda_Diezmo TYPE VARCHAR(10) USING Id_Moneda_Diezmo::TEXT,
ALTER COLUMN Id_Moneda_Diezmo_Original TYPE VARCHAR(10) USING Id_Moneda_Diezmo_Original::TEXT,
ALTER COLUMN Id_Moneda_Pacto TYPE VARCHAR(10) USING Id_Moneda_Pacto::TEXT,
ALTER COLUMN Id_Moneda_Pacto_Original TYPE VARCHAR(10) USING Id_Moneda_Pacto_Original::TEXT;

ALTER TABLE OFRENDA_COLABORACION
ALTER COLUMN Id_Moneda TYPE VARCHAR(10) USING Id_Moneda::TEXT,
ALTER COLUMN Id_Moneda_Original TYPE VARCHAR(10) USING Id_Moneda_Original::TEXT;

ALTER TABLE TRANSFERENCIA
ALTER COLUMN Id_Moneda_Original TYPE VARCHAR(10) USING Id_Moneda_Original::TEXT;

DO $$
BEGIN
    IF to_regclass('public.moneda') IS NOT NULL THEN
        UPDATE SOBRE s SET Id_Moneda_Diezmo = m.Simbolo FROM MONEDA m WHERE s.Id_Moneda_Diezmo = m.Id_Moneda::TEXT;
        UPDATE SOBRE s SET Id_Moneda_Diezmo_Original = m.Simbolo FROM MONEDA m WHERE s.Id_Moneda_Diezmo_Original = m.Id_Moneda::TEXT;
        UPDATE SOBRE s SET Id_Moneda_Pacto = m.Simbolo FROM MONEDA m WHERE s.Id_Moneda_Pacto = m.Id_Moneda::TEXT;
        UPDATE SOBRE s SET Id_Moneda_Pacto_Original = m.Simbolo FROM MONEDA m WHERE s.Id_Moneda_Pacto_Original = m.Id_Moneda::TEXT;
        UPDATE OFRENDA_COLABORACION o SET Id_Moneda = m.Simbolo FROM MONEDA m WHERE o.Id_Moneda = m.Id_Moneda::TEXT;
        UPDATE OFRENDA_COLABORACION o SET Id_Moneda_Original = m.Simbolo FROM MONEDA m WHERE o.Id_Moneda_Original = m.Id_Moneda::TEXT;
        UPDATE TRANSFERENCIA t SET Id_Moneda_Original = m.Simbolo FROM MONEDA m WHERE t.Id_Moneda_Original = m.Id_Moneda::TEXT;
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

UPDATE SOBRE
SET
    Monto_Diezmo_Original = COALESCE(Monto_Diezmo_Original, Monto_Diezmo),
    Id_Moneda_Diezmo_Original = COALESCE(Id_Moneda_Diezmo_Original, Id_Moneda_Diezmo),
    Tasa_Bcv_Diezmo = COALESCE(Tasa_Bcv_Diezmo, 1),
    Monto_Pacto_Amor_Original = COALESCE(Monto_Pacto_Amor_Original, Monto_Pacto_Amor),
    Id_Moneda_Pacto_Original = COALESCE(Id_Moneda_Pacto_Original, Id_Moneda_Pacto),
    Tasa_Bcv_Pacto = COALESCE(Tasa_Bcv_Pacto, 1);

UPDATE OFRENDA_COLABORACION
SET
    Monto_Ofrenda_Original = COALESCE(Monto_Ofrenda_Original, Monto_Ofrenda),
    Id_Moneda_Original = COALESCE(Id_Moneda_Original, Id_Moneda),
    Tasa_Bcv_Dolar = COALESCE(Tasa_Bcv_Dolar, 1);

UPDATE TRANSFERENCIA
SET
    Monto_Transferencia_Original = COALESCE(Monto_Transferencia_Original, Monto_Transferencia),
    Tasa_Bcv_Dolar = COALESCE(Tasa_Bcv_Dolar, 1);
