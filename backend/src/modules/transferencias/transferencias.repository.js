import { query } from '../../db/query.js';

const transferenciaSelect = `
  SELECT
    t.Id_Transferencia AS "idTransferencia",
    t.Id_Sobre AS "idSobre",
    s.Numero_Sobre AS "numeroSobre",
    TO_CHAR(s.Fecha, 'YYYY-MM-DD') AS "fechaSobre",
    m.Id_Miembro AS "idMiembro",
    m.Nombre AS "nombreMiembro",
    TO_CHAR(t.Fecha_Transferencia, 'YYYY-MM-DD') AS "fechaTransferencia",
    t.Numero_Transferencia AS "numeroTransferencia",
    t.Banco_Receptor_Cuenta AS "bancoReceptorCuenta",
    t.Monto_Transferencia AS "montoTransferencia",
    t.Monto_Transferencia_Original AS "montoTransferenciaOriginal",
    t.Id_Moneda_Original AS "idMonedaOriginal",
    CASE WHEN t.Id_Moneda_Original = '$' THEN 'Dolar' ELSE 'Bolivar' END AS "nombreMonedaOriginal",
    t.Id_Moneda_Original AS "simboloMonedaOriginal",
    t.Tasa_Bcv_Dolar::FLOAT AS "tasaBcvDolar"
  FROM TRANSFERENCIA t
  INNER JOIN SOBRE s ON s.Id_Sobre = t.Id_Sobre
  INNER JOIN MIEMBRO m ON m.Id_Miembro = s.Id_Miembro
`;

export const findAllTransferencias = async ({ idIglesia } = {}) => {
  const params = [];
  const where = idIglesia ? 'WHERE s.Id_Iglesia = $1' : '';
  if (idIglesia) params.push(idIglesia);

  const result = await query(
    `
      ${transferenciaSelect}
      ${where}
      ORDER BY t.Fecha_Transferencia DESC, t.Id_Transferencia DESC
    `,
    params,
  );

  return result.rows;
};

export const findTransferenciaById = async (idTransferencia) => {
  const result = await query(
    `
      ${transferenciaSelect}
      WHERE t.Id_Transferencia = $1
    `,
    [idTransferencia],
  );

  return result.rows[0] || null;
};

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

export const createTransferencia = async ({
  idSobre,
  fechaTransferencia,
  numeroTransferencia,
  bancoReceptorCuenta,
  montoTransferencia,
  montoTransferenciaOriginal,
  idMonedaOriginal,
  tasaBcvDolar,
}) => {
  const result = await query(
    `
      INSERT INTO TRANSFERENCIA (
        Id_Sobre,
        Fecha_Transferencia,
        Numero_Transferencia,
        Banco_Receptor_Cuenta,
        Monto_Transferencia,
        Monto_Transferencia_Original,
        Id_Moneda_Original,
        Tasa_Bcv_Dolar
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING Id_Transferencia AS "idTransferencia"
    `,
    [
      idSobre,
      fechaTransferencia,
      numeroTransferencia,
      bancoReceptorCuenta,
      montoTransferencia,
      montoTransferenciaOriginal,
      idMonedaOriginal,
      tasaBcvDolar,
    ],
  );

  return findTransferenciaById(result.rows[0].idTransferencia);
};

export const updateTransferencia = async (
  idTransferencia,
  {
    idSobre,
    fechaTransferencia,
    numeroTransferencia,
    bancoReceptorCuenta,
    montoTransferencia,
    montoTransferenciaOriginal,
    idMonedaOriginal,
    tasaBcvDolar,
  },
) => {
  const result = await query(
    `
      UPDATE TRANSFERENCIA
      SET
        Id_Sobre = $1,
        Fecha_Transferencia = $2,
        Numero_Transferencia = $3,
        Banco_Receptor_Cuenta = $4,
        Monto_Transferencia = $5,
        Monto_Transferencia_Original = $6,
        Id_Moneda_Original = $7,
        Tasa_Bcv_Dolar = $8
      WHERE Id_Transferencia = $9
      RETURNING Id_Transferencia AS "idTransferencia"
    `,
    [
      idSobre,
      fechaTransferencia,
      numeroTransferencia,
      bancoReceptorCuenta,
      montoTransferencia,
      montoTransferenciaOriginal,
      idMonedaOriginal,
      tasaBcvDolar,
      idTransferencia,
    ],
  );

  if (!result.rows[0]) return null;

  return findTransferenciaById(result.rows[0].idTransferencia);
};

export const deleteTransferencia = async (idTransferencia) => {
  const result = await query(
    `
      DELETE FROM TRANSFERENCIA
      WHERE Id_Transferencia = $1
      RETURNING Id_Transferencia AS "idTransferencia"
    `,
    [idTransferencia],
  );

  return result.rows[0] || null;
};
