import { query } from '../../db/query.js';

const ofrendaSelect = `
  SELECT
    o.Id_Ofrenda AS "idOfrenda",
    o.Id_Sobre AS "idSobre",
    s.Numero_Sobre AS "numeroSobre",
    TO_CHAR(s.Fecha, 'YYYY-MM-DD') AS "fechaSobre",
    m.Id_Miembro AS "idMiembro",
    m.Nombre AS "nombreMiembro",
    o.Monto_Ofrenda AS "montoOfrenda",
    o.Id_Moneda AS "idMoneda",
    mo.Nombre_Moneda AS "nombreMoneda",
    mo.Simbolo AS "simboloMoneda"
  FROM OFRENDA_COLABORACION o
  INNER JOIN SOBRE s ON s.Id_Sobre = o.Id_Sobre
  INNER JOIN MIEMBRO m ON m.Id_Miembro = s.Id_Miembro
  INNER JOIN MONEDA mo ON mo.Id_Moneda = o.Id_Moneda
`;

export const findAllOfrendas = async () => {
  const result = await query(`
    ${ofrendaSelect}
    ORDER BY s.Fecha DESC, s.Numero_Sobre DESC, o.Id_Ofrenda DESC
  `);

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

export const createOfrenda = async ({ idSobre, montoOfrenda, idMoneda }) => {
  const result = await query(
    `
      INSERT INTO OFRENDA_COLABORACION (Id_Sobre, Monto_Ofrenda, Id_Moneda)
      VALUES ($1, $2, $3)
      RETURNING Id_Ofrenda AS "idOfrenda"
    `,
    [idSobre, montoOfrenda, idMoneda],
  );

  return findOfrendaById(result.rows[0].idOfrenda);
};

export const updateOfrenda = async (idOfrenda, { idSobre, montoOfrenda, idMoneda }) => {
  const result = await query(
    `
      UPDATE OFRENDA_COLABORACION
      SET
        Id_Sobre = $1,
        Monto_Ofrenda = $2,
        Id_Moneda = $3
      WHERE Id_Ofrenda = $4
      RETURNING Id_Ofrenda AS "idOfrenda"
    `,
    [idSobre, montoOfrenda, idMoneda, idOfrenda],
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
