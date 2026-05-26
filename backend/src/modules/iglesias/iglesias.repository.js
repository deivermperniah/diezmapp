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

export const findIglesiaById = async (idIglesia) => {
  const result = await query(
    `
      SELECT
        Id_Iglesia AS "idIglesia",
        Nombre_Iglesia AS "nombreIglesia",
        Ciudad AS "ciudad"
      FROM IGLESIA
      WHERE Id_Iglesia = $1
    `,
    [idIglesia],
  );

  return result.rows[0] || null;
};

export const createIglesia = async ({ nombreIglesia, ciudad }) => {
  const result = await query(
    `
      INSERT INTO IGLESIA (Nombre_Iglesia, Ciudad)
      VALUES ($1, $2)
      RETURNING Id_Iglesia AS "idIglesia"
    `,
    [nombreIglesia, ciudad],
  );

  return findIglesiaById(result.rows[0].idIglesia);
};

export const updateIglesia = async (idIglesia, { nombreIglesia, ciudad }) => {
  const result = await query(
    `
      UPDATE IGLESIA
      SET Nombre_Iglesia = $1, Ciudad = $2
      WHERE Id_Iglesia = $3
      RETURNING Id_Iglesia AS "idIglesia"
    `,
    [nombreIglesia, ciudad, idIglesia],
  );

  if (!result.rows[0]) return null;

  return findIglesiaById(result.rows[0].idIglesia);
};

export const deleteIglesia = async (idIglesia) => {
  const result = await query(
    `
      DELETE FROM IGLESIA
      WHERE Id_Iglesia = $1
      RETURNING Id_Iglesia AS "idIglesia"
    `,
    [idIglesia],
  );

  return result.rows[0] || null;
};
