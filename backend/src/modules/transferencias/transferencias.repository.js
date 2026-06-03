import { query } from '../../db/query.js';

const transferenciaSelect = `
  SELECT
    t.Id_Transferencia AS "idTransferencia",
    t.Id_Sobre AS "idSobre",
    s.Numero_Sobre AS "numeroSobre",
    TO_CHAR(s.Fecha, 'YYYY-MM-DD') AS "fechaSobre",
    m.Id_Miembro AS "idMiembro",
    CONCAT_WS(' ', m.Nombre, NULLIF(m.Apellido, '')) AS "nombreMiembro",
    TO_CHAR(t.Fecha_Transferencia, 'YYYY-MM-DD') AS "fechaTransferencia",
    t.Numero_Transferencia AS "numeroTransferencia",
    t.Banco_Receptor_Cuenta AS "bancoReceptorCuenta",
    t.Monto_Transferencia::FLOAT AS "montoTransferencia"
  FROM TRANSFERENCIA t
  INNER JOIN SOBRE s ON s.Id_Sobre = t.Id_Sobre
  INNER JOIN MIEMBRO m ON m.Id_Miembro = s.Id_Miembro
`;

export const findTransferenciasBySobreId = async (idSobre) => {
  const result = await query(
    `
      ${transferenciaSelect}
      WHERE t.Id_Sobre = $1
      ORDER BY t.Fecha_Transferencia DESC, t.Id_Transferencia DESC
    `,
    [idSobre],
  );

  return result.rows;
};
