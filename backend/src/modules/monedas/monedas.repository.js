import { query } from '../../db/query.js';

export const findAllMonedas = async () => {
  const result = await query(`
    SELECT
      Id_Moneda AS "idMoneda",
      Nombre_Moneda AS "nombreMoneda",
      Simbolo AS "simbolo"
    FROM MONEDA
    ORDER BY Id_Moneda ASC
  `);

  return result.rows;
};
