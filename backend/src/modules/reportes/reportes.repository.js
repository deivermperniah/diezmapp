import { query } from '../../db/query.js';

export const findReporteSemanal = async ({ fechaInicio, fechaFin }) => {
  const result = await query(
    `
      SELECT
        s.Numero_Sobre AS "numeroSobre",
        m.Nombre AS "nombre",
        TO_CHAR(s.Fecha, 'YYYY-MM-DD') AS "fecha",
        s.Total_Incluido::FLOAT AS "totalIncluido",
        COALESCE(o.Total_Ofrendas, 0)::FLOAT AS "totalOfrendas",
        (s.Total_Incluido + COALESCE(o.Total_Ofrendas, 0))::FLOAT AS "totalSobre"
      FROM SOBRE s
      INNER JOIN MIEMBRO m ON m.Id_Miembro = s.Id_Miembro
      LEFT JOIN (
        SELECT
          Id_Sobre,
          SUM(Monto_Ofrenda) AS Total_Ofrendas
        FROM OFRENDA_COLABORACION
        GROUP BY Id_Sobre
      ) o ON o.Id_Sobre = s.Id_Sobre
      WHERE s.Fecha BETWEEN $1 AND $2
      ORDER BY s.Fecha ASC, s.Numero_Sobre ASC
    `,
    [fechaInicio, fechaFin],
  );

  return result.rows;
};

export const findReporteMensual = async ({ mes, anio }) => {
  const result = await query(
    `
      SELECT
        s.Numero_Sobre AS "numeroSobre",
        m.Nombre AS "nombre",
        TO_CHAR(s.Fecha, 'YYYY-MM-DD') AS "fecha",
        s.Monto_Diezmo::FLOAT AS "montoDiezmo",
        COALESCE(s.Monto_Pacto_Amor, 0)::FLOAT AS "montoPactoAmor",
        COALESCE(o.Total_Ofrendas, 0)::FLOAT AS "otrasOfrendas",
        (
          s.Monto_Diezmo +
          COALESCE(s.Monto_Pacto_Amor, 0) +
          COALESCE(o.Total_Ofrendas, 0)
        )::FLOAT AS "totalSobre"
      FROM SOBRE s
      INNER JOIN MIEMBRO m ON m.Id_Miembro = s.Id_Miembro
      LEFT JOIN (
        SELECT
          Id_Sobre,
          SUM(Monto_Ofrenda) AS Total_Ofrendas
        FROM OFRENDA_COLABORACION
        GROUP BY Id_Sobre
      ) o ON o.Id_Sobre = s.Id_Sobre
      WHERE s.Mes = $1 AND s.Anio = $2
      ORDER BY s.Fecha ASC, s.Numero_Sobre ASC
    `,
    [mes, anio],
  );

  return result.rows;
};
