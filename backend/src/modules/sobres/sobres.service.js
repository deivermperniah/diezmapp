import { AppError } from '../../utils/app-error.js';
import { convertMoneyToUsd } from '../../services/currency.service.js';
import {
  createSobre,
  deleteSobre,
  findAllSobres,
  findNextNumeroSobre,
  findSobreById,
  updateSobre,
} from './sobres.repository.js';

const parsePositiveInteger = (value, fieldName) => {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new AppError(`${fieldName} no es valido.`, 400);
  }

  return parsedValue;
};

const parseOptionalPositiveInteger = (value, fieldName) => {
  if (value === undefined || value === null || value === '') return null;
  return parsePositiveInteger(value, fieldName);
};

const parseCurrency = (value, fieldName) => {
  const parsedValue = String(value || '').trim();

  if (!['Bs', '$'].includes(parsedValue)) {
    throw new AppError(`${fieldName} debe ser Bs o $.`, 400);
  }

  return parsedValue;
};

const parseMoney = (value, fieldName, { required = true } = {}) => {
  if ((value === undefined || value === null || value === '') && !required) return 0;

  const parsedValue = Number(value);

  if (Number.isNaN(parsedValue) || parsedValue < 0) {
    throw new AppError(`${fieldName} debe ser un monto mayor o igual a cero.`, 400);
  }

  return Number(parsedValue.toFixed(2));
};

const parseFecha = (fecha) => {
  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    throw new AppError('La fecha debe tener formato YYYY-MM-DD.', 400);
  }

  const [anio, mes, dia] = fecha.split('-').map(Number);
  const parsedDate = new Date(Date.UTC(anio, mes - 1, dia));

  if (
    parsedDate.getUTCFullYear() !== anio ||
    parsedDate.getUTCMonth() + 1 !== mes ||
    parsedDate.getUTCDate() !== dia
  ) {
    throw new AppError('La fecha no es valida.', 400);
  }

  return { fecha, mes, anio };
};

const parseId = (idSobre) => parsePositiveInteger(idSobre, 'El id del sobre');

const validateSobrePayload = async (payload) => {
  const { fecha, mes, anio } = parseFecha(payload.fecha);
  const montoDiezmo = parseMoney(payload.montoDiezmo, 'El monto de diezmo');
  const montoPactoAmor = parseMoney(payload.montoPactoAmor, 'El monto de pacto de amor', {
    required: false,
  });
  const diezmo = await convertMoneyToUsd({
    amount: montoDiezmo,
    idMoneda: parseCurrency(payload.idMonedaDiezmo, 'La moneda del diezmo'),
  });
  const pacto =
    montoPactoAmor > 0
      ? await convertMoneyToUsd({
          amount: montoPactoAmor,
          idMoneda: parseCurrency(payload.idMonedaPacto, 'La moneda del pacto'),
        })
      : null;

  return {
    fecha,
    mes,
    anio,
    idIglesia: parsePositiveInteger(payload.idIglesia, 'La iglesia'),
    idMiembro: parsePositiveInteger(payload.idMiembro, 'El miembro'),
    montoDiezmo: diezmo.amountUsd,
    idMonedaDiezmo: diezmo.usdCurrencyId,
    montoDiezmoOriginal: diezmo.originalAmount,
    idMonedaDiezmoOriginal: diezmo.originalCurrencyId,
    tasaBcvDiezmo: diezmo.tasaBcvDolar,
    montoPactoAmor: pacto?.amountUsd || 0,
    idMonedaPacto: pacto?.usdCurrencyId || diezmo.usdCurrencyId,
    montoPactoAmorOriginal: pacto?.originalAmount || 0,
    idMonedaPactoOriginal: pacto?.originalCurrencyId || null,
    tasaBcvPacto: pacto?.tasaBcvDolar || 1,
    totalIncluido: Number((diezmo.amountUsd + (pacto?.amountUsd || 0)).toFixed(2)),
  };
};

export const getSobres = async () => {
  return findAllSobres();
};

export const getSobresByIglesia = async (idIglesia) => {
  return findAllSobres({ idIglesia: parsePositiveInteger(idIglesia, 'La iglesia') });
};

export const getSobreById = async (idSobre) => {
  const sobre = await findSobreById(parseId(idSobre));

  if (!sobre) {
    throw new AppError('Sobre no encontrado.', 404);
  }

  return sobre;
};

export const getSiguienteNumeroSobre = async (fecha, idIglesia) => {
  const { mes, anio } = parseFecha(fecha);
  const siguienteNumero = await findNextNumeroSobre({
    mes,
    anio,
    idIglesia: idIglesia ? parsePositiveInteger(idIglesia, 'La iglesia') : null,
  });

  return {
    fecha,
    mes,
    anio,
    siguienteNumero,
  };
};

export const registerSobre = async (payload) => {
  const sobreData = await validateSobrePayload(payload);
  return createSobre(sobreData);
};

export const editSobre = async (idSobre, payload) => {
  const currentSobre = await getSobreById(idSobre);
  const sobreData = await validateSobrePayload(payload);

  if (currentSobre.mes !== sobreData.mes || currentSobre.anio !== sobreData.anio) {
    throw new AppError(
      'No se puede cambiar el mes o anio de un sobre existente. Cree un nuevo sobre para otra fecha.',
      400,
    );
  }

  const sobre = await updateSobre(parseId(idSobre), sobreData);

  if (!sobre) {
    throw new AppError('Sobre no encontrado.', 404);
  }

  return sobre;
};

export const removeSobre = async (idSobre) => {
  const sobre = await deleteSobre(parseId(idSobre));

  if (!sobre) {
    throw new AppError('Sobre no encontrado.', 404);
  }

  return sobre;
};
