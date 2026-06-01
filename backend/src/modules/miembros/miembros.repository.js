import { query } from '../../db/query.js';

const miembroSelect = `
  SELECT
    m.Id_Miembro AS "idMiembro",
    m.Nombre AS "nombre",
    m.Apellido AS "apellido",
    CONCAT_WS(' ', m.Nombre, NULLIF(m.Apellido, '')) AS "nombreCompleto",
    m.Email AS "email",
    m.Id_Iglesia AS "idIglesia",
    i.Nombre_Iglesia AS "nombreIglesia"
  FROM MIEMBRO m
  INNER JOIN IGLESIA i ON i.Id_Iglesia = m.Id_Iglesia
`;

export const findAllMiembros = async ({ idIglesia } = {}) => {
  const params = [];
  const where = idIglesia ? 'WHERE m.Id_Iglesia = $1' : '';
  if (idIglesia) params.push(idIglesia);

  const result = await query(
    `
      ${miembroSelect}
      ${where}
  ORDER BY m.Nombre ASC, m.Apellido ASC
    `,
    params,
  );

  return result.rows;
};

export const findMiembroById = async (idMiembro) => {
  const result = await query(
    `
      ${miembroSelect}
      WHERE m.Id_Miembro = $1
    `,
    [idMiembro],
  );

  return result.rows[0] || null;
};

export const createMiembro = async ({ nombre, apellido, email, idIglesia }) => {
  const result = await query(
    `
      INSERT INTO MIEMBRO (Nombre, Apellido, Email, Id_Iglesia)
      VALUES ($1, $2, $3, $4)
      RETURNING
        Id_Miembro AS "idMiembro",
        Nombre AS "nombre",
        Apellido AS "apellido",
        Email AS "email",
        Id_Iglesia AS "idIglesia"
    `,
    [nombre, apellido, email, idIglesia],
  );

  return result.rows[0];
};

export const updateMiembro = async (idMiembro, { nombre, apellido, email, idIglesia }) => {
  const result = await query(
    `
      UPDATE MIEMBRO
      SET
        Nombre = $1,
        Apellido = $2,
        Email = $3,
        Id_Iglesia = $4
      WHERE Id_Miembro = $5
      RETURNING
        Id_Miembro AS "idMiembro",
        Nombre AS "nombre",
        Apellido AS "apellido",
        Email AS "email",
        Id_Iglesia AS "idIglesia"
    `,
    [nombre, apellido, email, idIglesia, idMiembro],
  );

  return result.rows[0] || null;
};

export const countSobresByMiembro = async (idMiembro) => {
  const result = await query(
    `
      SELECT COUNT(*)::INTEGER AS "totalSobres"
      FROM SOBRE
      WHERE Id_Miembro = $1
    `,
    [idMiembro],
  );

  return result.rows[0]?.totalSobres || 0;
};

export const deleteMiembro = async (idMiembro) => {
  const result = await query(
    `
      DELETE FROM MIEMBRO
      WHERE Id_Miembro = $1
      RETURNING Id_Miembro AS "idMiembro"
    `,
    [idMiembro],
  );

  return result.rows[0] || null;
};
