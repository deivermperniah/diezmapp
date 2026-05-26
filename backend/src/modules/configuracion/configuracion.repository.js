import { pool } from '../../db/pool.js';
import { query } from '../../db/query.js';
import { AppError } from '../../utils/app-error.js';

export const findConfiguracion = async () => {
  const result = await query(`
    SELECT
      i.Id_Iglesia AS "idIglesia",
      i.Nombre_Iglesia AS "nombreIglesia",
      i.Ciudad AS "ciudad",
      '$' AS "idMonedaPrincipal",
      'Dolar' AS "nombreMonedaPrincipal",
      '$' AS "simboloMonedaPrincipal"
    FROM IGLESIA i
    ORDER BY i.Id_Iglesia ASC
    LIMIT 1
  `);

  return result.rows[0] || null;
};

export const updateConfiguracion = async ({ nombreIglesia, ciudad }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const currentResult = await client.query(`
      SELECT Id_Iglesia
      FROM IGLESIA
      ORDER BY Id_Iglesia ASC
      LIMIT 1
    `);

    const currentConfig = currentResult.rows[0];

    if (!currentConfig) {
      throw new AppError('Configuracion no encontrada.', 404);
    }

    await client.query(
      `
        UPDATE IGLESIA
        SET Nombre_Iglesia = $1, Ciudad = $2
        WHERE Id_Iglesia = $3
      `,
      [nombreIglesia, ciudad, currentConfig.id_iglesia],
    );

    await client.query('COMMIT');

    return findConfiguracion();
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
