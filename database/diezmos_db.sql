-- Base de Datos: Diezmos y Ofrendas
-- Modelo normalizado hasta 3FN
-- PostgreSQL

CREATE DATABASE diezmos_db;

-- \c diezmos_db

CREATE TABLE IGLESIA (
    Id_Iglesia SERIAL PRIMARY KEY,
    Nombre_Iglesia VARCHAR(100) NOT NULL,
    Ciudad VARCHAR(80) NOT NULL
);

CREATE TABLE MONEDA (
    Id_Moneda SERIAL PRIMARY KEY,
    Nombre_Moneda VARCHAR(50) NOT NULL,
    Simbolo VARCHAR(10) NOT NULL
);

CREATE TABLE MIEMBRO (
    Id_Miembro SERIAL PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE,
    Id_Iglesia INTEGER NOT NULL,
    FOREIGN KEY (Id_Iglesia)
    REFERENCES IGLESIA(Id_Iglesia)
);

CREATE TABLE SOBRE (
    Id_Sobre SERIAL PRIMARY KEY,
    Numero_Sobre INTEGER NOT NULL,
    Fecha DATE NOT NULL,
    Mes SMALLINT NOT NULL,
    Anio SMALLINT NOT NULL,
    Id_Miembro INTEGER NOT NULL,
    Monto_Diezmo DECIMAL(10,2) NOT NULL,
    Id_Moneda_Diezmo INTEGER,
    Monto_Pacto_Amor DECIMAL(10,2),
    Id_Moneda_Pacto INTEGER,
    Total_Incluido DECIMAL(10,2) NOT NULL,

    CONSTRAINT UQ_Sobre_Numero_Mes_Anio
    UNIQUE (Numero_Sobre, Mes, Anio),

    CONSTRAINT CHK_Sobre_Mes
    CHECK (Mes BETWEEN 1 AND 12),

    CONSTRAINT CHK_Sobre_Anio
    CHECK (Anio >= 2000),

    CONSTRAINT CHK_Sobre_Numero_Sobre
    CHECK (Numero_Sobre > 0),

    FOREIGN KEY (Id_Miembro)
    REFERENCES MIEMBRO(Id_Miembro),

    FOREIGN KEY (Id_Moneda_Diezmo)
    REFERENCES MONEDA(Id_Moneda),

    FOREIGN KEY (Id_Moneda_Pacto)
    REFERENCES MONEDA(Id_Moneda)
);

CREATE TABLE OFRENDA_COLABORACION (
    Id_Ofrenda SERIAL PRIMARY KEY,
    Id_Sobre INTEGER NOT NULL,
    Monto_Ofrenda DECIMAL(10,2) NOT NULL,
    Id_Moneda INTEGER NOT NULL,

    FOREIGN KEY (Id_Sobre)
    REFERENCES SOBRE(Id_Sobre),

    FOREIGN KEY (Id_Moneda)
    REFERENCES MONEDA(Id_Moneda)
);

CREATE TABLE TRANSFERENCIA (
    Id_Transferencia SERIAL PRIMARY KEY,
    Id_Sobre INTEGER NOT NULL,
    Fecha_Transferencia DATE NOT NULL,
    Numero_Transferencia VARCHAR(50) NOT NULL,
    Banco_Receptor_Cuenta VARCHAR(120) NOT NULL,
    Monto_Transferencia DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (Id_Sobre)
    REFERENCES SOBRE(Id_Sobre)
);

INSERT INTO IGLESIA (Nombre_Iglesia, Ciudad)
SELECT 'Iglesia Principal', 'Lima'
WHERE NOT EXISTS (
    SELECT 1
    FROM IGLESIA
    WHERE Nombre_Iglesia = 'Iglesia Principal'
);

INSERT INTO MONEDA (Nombre_Moneda, Simbolo)
SELECT 'Bolivar', 'Bs'
WHERE NOT EXISTS (
    SELECT 1
    FROM MONEDA
    WHERE Simbolo = 'Bs'
);

INSERT INTO MONEDA (Nombre_Moneda, Simbolo)
SELECT 'Dolar', '$'
WHERE NOT EXISTS (
    SELECT 1
    FROM MONEDA
    WHERE Simbolo = '$'
);
