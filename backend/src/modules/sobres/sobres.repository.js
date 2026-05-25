import { pool } from '../../db/pool.js';
import { query } from '../../db/query.js';

const sobreSelect = `
  SELECT
    s.Id_Sobre AS "idSobre",
    s.Numero_Sobre AS "numeroSobre",
    TO_CHAR(s.Fecha, 'YYYY-MM-DD') AS "fecha",
    s.Mes AS "mes",
    s.Anio AS "anio",
    s.Id_Miembro AS "idMiembro",
    m.Nombre AS "nombreMiembro",
    s.Monto_Diezmo AS "montoDiezmo",
    s.Id_Moneda_Diezmo AS "idMonedaDiezmo",
    md.Simbolo AS "simboloMonedaDiezmo",
    s.Monto_Pacto_Amor AS "montoPactoAmor",
    s.Id_Moneda_Pacto AS "idMonedaPacto",
    mp.Simbolo AS "simboloMonedaPacto",
    s.Total_Incluido AS "totalIncluido"
  FROM SOBRE s
  INNER JOIN MIEMBRO m ON m.Id_Miembro = s.Id_Miembro
  LEFT JOIN MONEDA md ON md.Id_Moneda = s.Id_Moneda_Diezmo
  LEFT JOIN MONEDA mp ON mp.Id_Moneda = s.Id_Moneda_Pacto
`;

export const findAllSobres = async () => {
  const result = await query(`
    ${sobreSelect}
    ORDER BY s.Fecha DESC, s.Numero_Sobre DESC
  `);

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

export const findNextNumeroSobre = async ({ mes, anio }) => {
  const result = await query(
    `
      SELECT COALESCE(MAX(Numero_Sobre), 0) + 1 AS "siguienteNumero"
      FROM SOBRE
      WHERE Mes = $1 AND Anio = $2
    `,
    [mes, anio],
  );

  return Number(result.rows[0].siguienteNumero);
};

export const createSobre = async ({
  fecha,
  mes,
  anio,
  idMiembro,
  montoDiezmo,
  idMonedaDiezmo,
  montoPactoAmor,
  idMonedaPacto,
  totalIncluido,
}) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const nextNumberResult = await client.query(
      `
        SELECT COALESCE(MAX(Numero_Sobre), 0) + 1 AS "siguienteNumero"
        FROM SOBRE
        WHERE Mes = $1 AND Anio = $2
      `,
      [mes, anio],
    );

    const numeroSobre = Number(nextNumberResult.rows[0].siguienteNumero);

    const insertResult = await client.query(
      `
        INSERT INTO SOBRE (
          Numero_Sobre,
          Fecha,
          Mes,
          Anio,
          Id_Miembro,
          Monto_Diezmo,
          Id_Moneda_Diezmo,
          Monto_Pacto_Amor,
          Id_Moneda_Pacto,
          Total_Incluido
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING Id_Sobre AS "idSobre"
      `,
      [
        numeroSobre,
        fecha,
        mes,
        anio,
        idMiembro,
        montoDiezmo,
        idMonedaDiezmo,
        montoPactoAmor,
        idMonedaPacto,
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
    idMiembro,
    montoDiezmo,
    idMonedaDiezmo,
    montoPactoAmor,
    idMonedaPacto,
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
        Id_Miembro = $4,
        Monto_Diezmo = $5,
        Id_Moneda_Diezmo = $6,
        Monto_Pacto_Amor = $7,
        Id_Moneda_Pacto = $8,
        Total_Incluido = $9
      WHERE Id_Sobre = $10
      RETURNING Id_Sobre AS "idSobre"
    `,
    [
      fecha,
      mes,
      anio,
      idMiembro,
      montoDiezmo,
      idMonedaDiezmo,
      montoPactoAmor,
      idMonedaPacto,
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
