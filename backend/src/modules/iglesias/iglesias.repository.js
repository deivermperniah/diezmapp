import { query } from '../../db/query.js';

export const findAllIglesias = async () => {
  const result = await query(`
    SELECT
      Id_Iglesia AS "idIglesia",
      Nombre_Iglesia AS "nombreIglesia",
      Ciudad AS "ciudad"
    FROM IGLESIA
    ORDER BY Nombre_Iglesia ASC
  `);

  return result.rows;
};
