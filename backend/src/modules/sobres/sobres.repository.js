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
    m.Nombre AS "nombreMiembro",
    s.Monto_Diezmo AS "montoDiezmo",
    s.Id_Moneda_Diezmo AS "idMonedaDiezmo",
    s.Id_Moneda_Diezmo AS "simboloMonedaDiezmo",
    s.Monto_Diezmo_Original AS "montoDiezmoOriginal",
    s.Id_Moneda_Diezmo_Original AS "idMonedaDiezmoOriginal",
    s.Id_Moneda_Diezmo_Original AS "simboloMonedaDiezmoOriginal",
    s.Tasa_Bcv_Diezmo::FLOAT AS "tasaBcvDiezmo",
    s.Monto_Pacto_Amor AS "montoPactoAmor",
    s.Id_Moneda_Pacto AS "idMonedaPacto",
    s.Id_Moneda_Pacto AS "simboloMonedaPacto",
    s.Monto_Pacto_Amor_Original AS "montoPactoAmorOriginal",
    s.Id_Moneda_Pacto_Original AS "idMonedaPactoOriginal",
    s.Id_Moneda_Pacto_Original AS "simboloMonedaPactoOriginal",
    s.Tasa_Bcv_Pacto::FLOAT AS "tasaBcvPacto",
    s.Total_Incluido AS "totalIncluido"
  FROM SOBRE s
  INNER JOIN MIEMBRO m ON m.Id_Miembro = s.Id_Miembro
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
  idMonedaDiezmo,
  montoDiezmoOriginal,
  idMonedaDiezmoOriginal,
  tasaBcvDiezmo,
  montoPactoAmor,
  idMonedaPacto,
  montoPactoAmorOriginal,
  idMonedaPactoOriginal,
  tasaBcvPacto,
  totalIncluido,
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
          Id_Moneda_Diezmo,
          Monto_Diezmo_Original,
          Id_Moneda_Diezmo_Original,
          Tasa_Bcv_Diezmo,
          Monto_Pacto_Amor,
          Id_Moneda_Pacto,
          Monto_Pacto_Amor_Original,
          Id_Moneda_Pacto_Original,
          Tasa_Bcv_Pacto,
          Total_Incluido
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
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
        idMonedaDiezmo,
        montoDiezmoOriginal,
        idMonedaDiezmoOriginal,
        tasaBcvDiezmo,
        montoPactoAmor,
        idMonedaPacto,
        montoPactoAmorOriginal,
        idMonedaPactoOriginal,
        tasaBcvPacto,
        totalIncluido,
      ],
    );

    await client.query('COMMIT');

    return findSobreById(insertResult.rows[0].idSobre);
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
    idMonedaDiezmo,
    montoDiezmoOriginal,
    idMonedaDiezmoOriginal,
    tasaBcvDiezmo,
    montoPactoAmor,
    idMonedaPacto,
    montoPactoAmorOriginal,
    idMonedaPactoOriginal,
    tasaBcvPacto,
    totalIncluido,
  },
) => {
  const result = await query(
    `
      UPDATE SOBRE
      SET
        Fecha = $1,
        Mes = $2,
        Anio = $3,
        Id_Iglesia = $4,
        Id_Miembro = $5,
        Monto_Diezmo = $6,
        Id_Moneda_Diezmo = $7,
        Monto_Diezmo_Original = $8,
        Id_Moneda_Diezmo_Original = $9,
        Tasa_Bcv_Diezmo = $10,
        Monto_Pacto_Amor = $11,
        Id_Moneda_Pacto = $12,
        Monto_Pacto_Amor_Original = $13,
        Id_Moneda_Pacto_Original = $14,
        Tasa_Bcv_Pacto = $15,
        Total_Incluido = $16
      WHERE Id_Sobre = $17
      RETURNING Id_Sobre AS "idSobre"
    `,
    [
      fecha,
      mes,
      anio,
      idIglesia,
      idMiembro,
      montoDiezmo,
      idMonedaDiezmo,
      montoDiezmoOriginal,
      idMonedaDiezmoOriginal,
      tasaBcvDiezmo,
      montoPactoAmor,
      idMonedaPacto,
      montoPactoAmorOriginal,
      idMonedaPactoOriginal,
      tasaBcvPacto,
      totalIncluido,
      idSobre,
    ],
  );

  if (!result.rows[0]) return null;

  return findSobreById(result.rows[0].idSobre);
};

export const deleteSobre = async (idSobre) => {
  const result = await query(
    `
      DELETE FROM SOBRE
      WHERE Id_Sobre = $1
      RETURNING Id_Sobre AS "idSobre"
    `,
    [idSobre],
  );

  return result.rows[0] || null;
};
