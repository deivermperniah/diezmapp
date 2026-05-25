import { AppError } from '../../utils/app-error.js';
import { findReporteMensual, findReporteSemanal } from './reportes.repository.js';

const parseFecha = (fecha, fieldName) => {
  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    throw new AppError(`${fieldName} debe tener formato YYYY-MM-DD.`, 400);
  }

  const [anio, mes, dia] = fecha.split('-').map(Number);
  const parsedDate = new Date(Date.UTC(anio, mes - 1, dia));

  if (
    parsedDate.getUTCFullYear() !== anio ||
    parsedDate.getUTCMonth() + 1 !== mes ||
    parsedDate.getUTCDate() !== dia
  ) {
    throw new AppError(`${fieldName} no es valida.`, 400);
  }

  return fecha;
};

const parseMes = (mes) => {
  const parsedMes = Number(mes);

  if (!Number.isInteger(parsedMes) || parsedMes < 1 || parsedMes > 12) {
    throw new AppError('El mes debe estar entre 1 y 12.', 400);
  }

  return parsedMes;
};

const parseAnio = (anio) => {
  const parsedAnio = Number(anio);

  if (!Number.isInteger(parsedAnio) || parsedAnio < 2000) {
    throw new AppError('El anio no es valido.', 400);
  }

  return parsedAnio;
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

export const getReporteSemanal = async ({ fechaInicio, fechaFin }) => {
  const parsedFechaInicio = parseFecha(fechaInicio, 'La fecha de inicio');
  const parsedFechaFin = parseFecha(fechaFin, 'La fecha de fin');

  if (parsedFechaInicio > parsedFechaFin) {
    throw new AppError('La fecha de inicio no puede ser mayor que la fecha de fin.', 400);
  }

  const items = await findReporteSemanal({
    fechaInicio: parsedFechaInicio,
    fechaFin: parsedFechaFin,
  });

  return {
    fechaInicio: parsedFechaInicio,
    fechaFin: parsedFechaFin,
    items,
    totals: buildSemanalTotals(items),
  };
};

export const getReporteMensual = async ({ mes, anio }) => {
  const parsedMes = parseMes(mes);
  const parsedAnio = parseAnio(anio);

  const items = await findReporteMensual({
    mes: parsedMes,
    anio: parsedAnio,
  });

  return {
    mes: parsedMes,
    anio: parsedAnio,
    items,
    totals: buildMensualTotals(items),
  };
};
