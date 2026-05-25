import { AppError } from '../../utils/app-error.js';
import {
  createOfrenda,
  deleteOfrenda,
  findAllOfrendas,
  findOfrendaById,
  findOfrendasBySobreId,
  updateOfrenda,
} from './ofrendas.repository.js';

const parsePositiveInteger = (value, fieldName) => {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new AppError(`${fieldName} no es valido.`, 400);
  }

  return parsedValue;
};

const parseMoney = (value, fieldName) => {
  const parsedValue = Number(value);

  if (Number.isNaN(parsedValue) || parsedValue <= 0) {
    throw new AppError(`${fieldName} debe ser mayor a cero.`, 400);
  }

  return Number(parsedValue.toFixed(2));
};

const validateOfrendaPayload = (payload) => ({
  idSobre: parsePositiveInteger(payload.idSobre, 'El sobre'),
  montoOfrenda: parseMoney(payload.montoOfrenda, 'El monto de ofrenda'),
  idMoneda: parsePositiveInteger(payload.idMoneda, 'La moneda'),
});

export const getOfrendas = async () => {
  return findAllOfrendas();
};

export const getOfrendaById = async (idOfrenda) => {
  const ofrenda = await findOfrendaById(parsePositiveInteger(idOfrenda, 'El id de la ofrenda'));

  if (!ofrenda) {
    throw new AppError('Ofrenda no encontrada.', 404);
  }

  return ofrenda;
};

export const getOfrendasBySobre = async (idSobre) => {
  return findOfrendasBySobreId(parsePositiveInteger(idSobre, 'El id del sobre'));
};

export const registerOfrenda = async (payload) => {
  const ofrendaData = validateOfrendaPayload(payload);
  return createOfrenda(ofrendaData);
};

export const editOfrenda = async (idOfrenda, payload) => {
  const ofrendaData = validateOfrendaPayload(payload);
  const ofrenda = await updateOfrenda(
    parsePositiveInteger(idOfrenda, 'El id de la ofrenda'),
    ofrendaData,
  );

  if (!ofrenda) {
    throw new AppError('Ofrenda no encontrada.', 404);
  }

  return ofrenda;
};

export const removeOfrenda = async (idOfrenda) => {
  const ofrenda = await deleteOfrenda(parsePositiveInteger(idOfrenda, 'El id de la ofrenda'));

  if (!ofrenda) {
    throw new AppError('Ofrenda no encontrada.', 404);
  }

  return ofrenda;
};
