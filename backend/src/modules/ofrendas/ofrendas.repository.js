import { query } from '../../db/query.js';

const ofrendaSelect = `
  SELECT
    o.Id_Ofrenda AS "idOfrenda",
    o.Id_Sobre AS "idSobre",
    s.Numero_Sobre AS "numeroSobre",
    TO_CHAR(s.Fecha, 'YYYY-MM-DD') AS "fechaSobre",
    m.Id_Miembro AS "idMiembro",
    CONCAT_WS(' ', m.Nombre, NULLIF(m.Apellido, '')) AS "nombreMiembro",
    o.Nombre_Ofrenda AS "nombreOfrenda",
    o.Monto_Ofrenda::FLOAT AS "montoOfrenda"
  FROM OFRENDA_COLABORACION o
  INNER JOIN SOBRE s ON s.Id_Sobre = o.Id_Sobre
  INNER JOIN MIEMBRO m ON m.Id_Miembro = s.Id_Miembro
`;

export const findAllOfrendas = async ({ idIglesia } = {}) => {
  const params = [];
  const where = idIglesia ? 'WHERE s.Id_Iglesia = $1' : '';
  if (idIglesia) params.push(idIglesia);

  const result = await query(
    `
      ${ofrendaSelect}
      ${where}
      ORDER BY s.Fecha DESC, s.Numero_Sobre DESC, o.Id_Ofrenda DESC
    `,
    params,
  );

  return result.rows;
};

export const findOfrendaById = async (idOfrenda) => {
  const result = await query(
    `
      ${ofrendaSelect}
      WHERE o.Id_Ofrenda = $1
    `,
    [idOfrenda],
  );

  return result.rows[0] || null;
};

export const findOfrendasBySobreId = async (idSobre) => {
  const result = await query(
    `
      ${ofrendaSelect}
      WHERE o.Id_Sobre = $1
      ORDER BY o.Id_Ofrenda DESC
    `,
    [idSobre],
  );

  return result.rows;
};

export const createOfrenda = async ({
  idSobre,
  nombreOfrenda,
  montoOfrenda,
}) => {
  const result = await query(
    `
      INSERT INTO OFRENDA_COLABORACION (
        Id_Sobre,
        Nombre_Ofrenda,
        Monto_Ofrenda
      )
      VALUES ($1, $2, $3)
      RETURNING Id_Ofrenda AS "idOfrenda"
    `,
    [idSobre, nombreOfrenda, montoOfrenda],
  );

  return findOfrendaById(result.rows[0].idOfrenda);
};

export const updateOfrenda = async (
  idOfrenda,
  { idSobre, nombreOfrenda, montoOfrenda },
) => {
  const result = await query(
    `
      UPDATE OFRENDA_COLABORACION
      SET
        Id_Sobre = $1,
        Nombre_Ofrenda = $2,
        Monto_Ofrenda = $3
      WHERE Id_Ofrenda = $4
      RETURNING Id_Ofrenda AS "idOfrenda"
    `,
    [idSobre, nombreOfrenda, montoOfrenda, idOfrenda],
  );

  if (!result.rows[0]) return null;

  return findOfrendaById(result.rows[0].idOfrenda);
};

export const deleteOfrenda = async (idOfrenda) => {
  const result = await query(
    `
      DELETE FROM OFRENDA_COLABORACION
      WHERE Id_Ofrenda = $1
      RETURNING Id_Ofrenda AS "idOfrenda"
    `,
    [idOfrenda],
  );

  return result.rows[0] || null;
};
