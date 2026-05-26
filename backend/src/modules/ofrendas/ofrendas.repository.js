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
    CASE WHEN o.Id_Moneda = '$' THEN 'Dolar' ELSE 'Bolivar' END AS "nombreMoneda",
    o.Id_Moneda AS "simboloMoneda",
    o.Monto_Ofrenda_Original AS "montoOfrendaOriginal",
    o.Id_Moneda_Original AS "idMonedaOriginal",
    CASE WHEN o.Id_Moneda_Original = '$' THEN 'Dolar' ELSE 'Bolivar' END AS "nombreMonedaOriginal",
    o.Id_Moneda_Original AS "simboloMonedaOriginal",
    o.Tasa_Bcv_Dolar::FLOAT AS "tasaBcvDolar"
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
  montoOfrenda,
  idMoneda,
  montoOfrendaOriginal,
  idMonedaOriginal,
  tasaBcvDolar,
}) => {
  const result = await query(
    `
      INSERT INTO OFRENDA_COLABORACION (
        Id_Sobre,
        Monto_Ofrenda,
        Id_Moneda,
        Monto_Ofrenda_Original,
        Id_Moneda_Original,
        Tasa_Bcv_Dolar
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING Id_Ofrenda AS "idOfrenda"
    `,
    [idSobre, montoOfrenda, idMoneda, montoOfrendaOriginal, idMonedaOriginal, tasaBcvDolar],
  );

  return findOfrendaById(result.rows[0].idOfrenda);
};

export const updateOfrenda = async (
  idOfrenda,
  { idSobre, montoOfrenda, idMoneda, montoOfrendaOriginal, idMonedaOriginal, tasaBcvDolar },
) => {
  const result = await query(
    `
      UPDATE OFRENDA_COLABORACION
      SET
        Id_Sobre = $1,
        Monto_Ofrenda = $2,
        Id_Moneda = $3,
        Monto_Ofrenda_Original = $4,
        Id_Moneda_Original = $5,
        Tasa_Bcv_Dolar = $6
      WHERE Id_Ofrenda = $7
      RETURNING Id_Ofrenda AS "idOfrenda"
    `,
    [idSobre, montoOfrenda, idMoneda, montoOfrendaOriginal, idMonedaOriginal, tasaBcvDolar, idOfrenda],
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
