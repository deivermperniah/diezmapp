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
