import { AppError } from './app-error.js';

export const parsePositiveInteger = (value, fieldName, message = `${fieldName} no es valido.`) => {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new AppError(message, 400);
  }

  return parsedValue;
};

export const parseOptionalPositiveInteger = (value, fieldName, message) => {
  if (value === undefined || value === null || value === '') return null;
  return parsePositiveInteger(value, fieldName, message);
};

export const parseDateParts = (fecha, fieldName = 'La fecha') => {
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

  return { fecha, mes, anio };
};

export const parseMoney = (value, fieldName, { required = true, positive = false } = {}) => {
  if ((value === undefined || value === null || value === '') && !required) return 0;

  const parsedValue = Number(value);
  const invalid = Number.isNaN(parsedValue) || (positive ? parsedValue <= 0 : parsedValue < 0);

  if (invalid) {
    throw new AppError(
      positive
        ? `${fieldName} debe ser mayor a cero.`
        : `${fieldName} debe ser un monto mayor o igual a cero.`,
      400,
    );
  }

  return Number(parsedValue.toFixed(2));
};

export const parseRequiredText = (value, fieldName, minLength = 2) => {
  const parsedValue = String(value || '').trim();

  if (parsedValue.length < minLength) {
    throw new AppError(`${fieldName} es obligatorio.`, 400);
  }

  return parsedValue;
};

export const parseOptionalText = (value) => {
  const parsedValue = String(value || '').trim();
  return parsedValue || null;
};

export const parseCurrency = (value, fieldName) => {
  const parsedValue = String(value || '').trim();

  if (!['Bs', '$'].includes(parsedValue)) {
    throw new AppError(`${fieldName} debe ser Bs o $.`, 400);
  }

  return parsedValue;
};

export const parseMonth = (mes) => {
  const parsedMes = Number(mes);

  if (!Number.isInteger(parsedMes) || parsedMes < 1 || parsedMes > 12) {
    throw new AppError('El mes debe estar entre 1 y 12.', 400);
  }

  return parsedMes;
};

export const parseYear = (anio) => {
  const parsedAnio = Number(anio);

  if (!Number.isInteger(parsedAnio) || parsedAnio < 2000) {
    throw new AppError('El anio no es valido.', 400);
  }

  return parsedAnio;
};
