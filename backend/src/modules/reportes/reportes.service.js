import { AppError } from '../../utils/app-error.js';
import {
  parseDateParts,
  parseMonth,
  parseOptionalPositiveInteger,
  parseYear,
} from '../../utils/validators.js';
import { findReporteMensual, findReporteSemanal } from './reportes.repository.js';

const parseOptionalId = (value, fieldName) => {
  return parseOptionalPositiveInteger(value, fieldName, `${fieldName} no es valida.`);
};

const toNumber = (value) => Number(value || 0);

const buildMensualTotals = (items) => {
  const totals = items.reduce(
    (acc, item) => ({
      totalDiezmos: acc.totalDiezmos + toNumber(item.montoDiezmo),
      totalPactoAmor: acc.totalPactoAmor + toNumber(item.montoPactoAmor),
      totalOfrendas: acc.totalOfrendas + toNumber(item.otrasOfrendas),
      totalGeneral: acc.totalGeneral + toNumber(item.totalSobre),
    }),
    {
      totalDiezmos: 0,
      totalPactoAmor: 0,
      totalOfrendas: 0,
      totalGeneral: 0,
    },
  );

  return {
    totalDiezmos: Number(totals.totalDiezmos.toFixed(2)),
    totalPactoAmor: Number(totals.totalPactoAmor.toFixed(2)),
    totalOfrendas: Number(totals.totalOfrendas.toFixed(2)),
    totalGeneral: Number(totals.totalGeneral.toFixed(2)),
  };
};

const buildSemanalTotals = (items) => {
  const totalGeneral = items.reduce((acc, item) => acc + toNumber(item.totalSobre), 0);

  return {
    totalGeneral: Number(totalGeneral.toFixed(2)),
  };
};

export const getReporteSemanal = async ({ fechaInicio, fechaFin, idIglesia }) => {
  const parsedFechaInicio = parseDateParts(fechaInicio, 'La fecha de inicio').fecha;
  const parsedFechaFin = parseDateParts(fechaFin, 'La fecha de fin').fecha;

  if (parsedFechaInicio > parsedFechaFin) {
    throw new AppError('La fecha de inicio no puede ser mayor que la fecha de fin.', 400);
  }

  const items = await findReporteSemanal({
    fechaInicio: parsedFechaInicio,
    fechaFin: parsedFechaFin,
    idIglesia: parseOptionalId(idIglesia, 'La iglesia'),
  });

  return {
    fechaInicio: parsedFechaInicio,
    fechaFin: parsedFechaFin,
    items,
    totals: buildSemanalTotals(items),
  };
};

export const getReporteMensual = async ({ mes, anio, idIglesia }) => {
  const parsedMes = parseMonth(mes);
  const parsedAnio = parseYear(anio);

  const items = await findReporteMensual({
    mes: parsedMes,
    anio: parsedAnio,
    idIglesia: parseOptionalId(idIglesia, 'La iglesia'),
  });

  return {
    mes: parsedMes,
    anio: parsedAnio,
    items,
    totals: buildMensualTotals(items),
  };
};
