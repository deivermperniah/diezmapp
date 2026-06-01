import { pool } from '../../db/pool.js';
import { query } from '../../db/query.js';

const sobreSelect = `
  SELECT
    s.Id_Sobre AS "idSobre",
    s.Numero_Sobre AS "numeroSobre",
    TO_CHAR(s.Fecha, 'YYYY-MM-DD') AS "fecha",
    s.Mes AS "mes",
    s.Anio AS "anio",
    s.Id_Iglesia AS "idIglesia",
    s.Id_Miembro AS "idMiembro",
    CONCAT_WS(' ', m.Nombre, NULLIF(m.Apellido, '')) AS "nombreMiembro",
    s.Monto_Diezmo::FLOAT AS "montoDiezmo",
    COALESCE(s.Monto_Pacto_Amor, 0)::FLOAT AS "montoPactoAmor",
    COALESCE(o.Total_Ofrendas, 0)::FLOAT AS "totalOfrendas",
    s.Total_Incluido::FLOAT AS "totalIncluido"
  FROM SOBRE s
  INNER JOIN MIEMBRO m ON m.Id_Miembro = s.Id_Miembro
  LEFT JOIN (
    SELECT
      Id_Sobre,
      SUM(Monto_Ofrenda) AS Total_Ofrendas
    FROM OFRENDA_COLABORACION
    GROUP BY Id_Sobre
  ) o ON o.Id_Sobre = s.Id_Sobre
`;

export const findAllSobres = async ({ idIglesia } = {}) => {
  const params = [];
  const where = idIglesia ? 'WHERE s.Id_Iglesia = $1' : '';
  if (idIglesia) params.push(idIglesia);

  const result = await query(
    `
      ${sobreSelect}
      ${where}
      ORDER BY s.Fecha DESC, s.Numero_Sobre DESC
    `,
    params,
  );

  return result.rows;
};

export const findSobreById = async (idSobre) => {
  const result = await query(
    `
      ${sobreSelect}
      WHERE s.Id_Sobre = $1
    `,
    [idSobre],
  );

  return result.rows[0] || null;
};

export const findNextNumeroSobre = async ({ mes, anio, idIglesia }) => {
  const result = await query(
    `
      SELECT COALESCE(MAX(Numero_Sobre), 0) + 1 AS "siguienteNumero"
      FROM SOBRE s
      WHERE s.Mes = $1 AND s.Anio = $2
        AND ($3::INTEGER IS NULL OR s.Id_Iglesia = $3)
    `,
    [mes, anio, idIglesia || null],
  );

  return Number(result.rows[0].siguienteNumero);
};

export const createSobre = async ({
  fecha,
  mes,
  anio,
  idIglesia,
  idMiembro,
  montoDiezmo,
  montoPactoAmor,
  totalIncluido,
  ofrendas = [],
  transferencias = [],
}) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const nextNumberResult = await client.query(
      `
        SELECT COALESCE(MAX(Numero_Sobre), 0) + 1 AS "siguienteNumero"
        FROM SOBRE
        WHERE Mes = $1 AND Anio = $2 AND Id_Iglesia = $3
      `,
      [mes, anio, idIglesia],
    );

    const numeroSobre = Number(nextNumberResult.rows[0].siguienteNumero);

    const insertResult = await client.query(
      `
        INSERT INTO SOBRE (
          Numero_Sobre,
          Fecha,
          Mes,
          Anio,
          Id_Iglesia,
          Id_Miembro,
          Monto_Diezmo,
          Monto_Pacto_Amor,
          Total_Incluido
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING Id_Sobre AS "idSobre"
      `,
      [
        numeroSobre,
        fecha,
        mes,
        anio,
        idIglesia,
        idMiembro,
        montoDiezmo,
        montoPactoAmor,
        totalIncluido,
      ],
    );
    const idSobre = insertResult.rows[0].idSobre;

    for (const ofrenda of ofrendas) {
      await client.query(
        `
          INSERT INTO OFRENDA_COLABORACION (
            Id_Sobre,
            Nombre_Ofrenda,
            Monto_Ofrenda
          )
          VALUES ($1, $2, $3)
        `,
        [
          idSobre,
          ofrenda.nombreOfrenda,
          ofrenda.montoOfrenda,
        ],
      );
    }

    for (const transferencia of transferencias) {
      await client.query(
        `
          INSERT INTO TRANSFERENCIA (
            Id_Sobre,
            Fecha_Transferencia,
            Numero_Transferencia,
            Banco_Receptor_Cuenta,
            Monto_Transferencia
          )
          VALUES ($1, $2, $3, $4, $5)
        `,
        [
          idSobre,
          transferencia.fechaTransferencia,
          transferencia.numeroTransferencia,
          transferencia.bancoReceptorCuenta,
          transferencia.montoTransferencia,
        ],
      );
    }

    await client.query('COMMIT');

    return findSobreById(idSobre);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const updateSobre = async (
  idSobre,
  {
    fecha,
    mes,
    anio,
    idIglesia,
    idMiembro,
    montoDiezmo,
    montoPactoAmor,
    totalIncluido,
    ofrendas = [],
    transferencias = [],
  },
) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const result = await client.query(
      `
        UPDATE SOBRE
        SET
          Fecha = $1,
          Mes = $2,
          Anio = $3,
          Id_Iglesia = $4,
          Id_Miembro = $5,
          Monto_Diezmo = $6,
          Monto_Pacto_Amor = $7,
          Total_Incluido = $8
        WHERE Id_Sobre = $9
        RETURNING Id_Sobre AS "idSobre"
      `,
      [
        fecha,
        mes,
        anio,
        idIglesia,
        idMiembro,
        montoDiezmo,
        montoPactoAmor,
        totalIncluido,
        idSobre,
      ],
    );

    if (!result.rows[0]) {
      await client.query('ROLLBACK');
      return null;
    }

    await client.query('DELETE FROM OFRENDA_COLABORACION WHERE Id_Sobre = $1', [idSobre]);
    await client.query('DELETE FROM TRANSFERENCIA WHERE Id_Sobre = $1', [idSobre]);

    for (const ofrenda of ofrendas) {
      await client.query(
        `
          INSERT INTO OFRENDA_COLABORACION (
            Id_Sobre,
            Nombre_Ofrenda,
            Monto_Ofrenda
          )
          VALUES ($1, $2, $3)
        `,
        [
          idSobre,
          ofrenda.nombreOfrenda,
          ofrenda.montoOfrenda,
        ],
      );
    }

    for (const transferencia of transferencias) {
      await client.query(
        `
          INSERT INTO TRANSFERENCIA (
            Id_Sobre,
            Fecha_Transferencia,
            Numero_Transferencia,
            Banco_Receptor_Cuenta,
            Monto_Transferencia
          )
          VALUES ($1, $2, $3, $4, $5)
        `,
        [
          idSobre,
          transferencia.fechaTransferencia,
          transferencia.numeroTransferencia,
          transferencia.bancoReceptorCuenta,
          transferencia.montoTransferencia,
        ],
      );
    }

    await client.query('COMMIT');

    return findSobreById(idSobre);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const deleteSobre = async (idSobre) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM TRANSFERENCIA WHERE Id_Sobre = $1', [idSobre]);
    await client.query('DELETE FROM OFRENDA_COLABORACION WHERE Id_Sobre = $1', [idSobre]);
    const result = await client.query(
      `
        DELETE FROM SOBRE
        WHERE Id_Sobre = $1
        RETURNING Id_Sobre AS "idSobre"
      `,
      [idSobre],
    );
    await client.query('COMMIT');

    return result.rows[0] || null;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
