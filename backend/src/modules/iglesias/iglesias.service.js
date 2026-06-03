import { AppError } from '../../utils/app-error.js';
import { parsePositiveInteger, parseRequiredText } from '../../utils/validators.js';
import {
  createIglesia,
  deleteIglesia,
  findAllIglesias,
  findIglesiaById,
  updateIglesia,
} from './iglesias.repository.js';

const parseId = (value, fieldName = 'La iglesia') => {
  return parsePositiveInteger(value, fieldName, `${fieldName} no es valida.`);
};

const parseText = (value, fieldName) => {
  return parseRequiredText(value, fieldName);
};

const validateIglesiaPayload = (payload) => ({
  nombreIglesia: parseText(payload.nombreIglesia, 'El nombre de la iglesia'),
  ciudad: parseText(payload.ciudad, 'La ciudad'),
});

export const getIglesias = async () => {
  return findAllIglesias();
};

export const getIglesiaById = async (idIglesia) => {
  const iglesia = await findIglesiaById(parseId(idIglesia));

  if (!iglesia) {
    throw new AppError('Iglesia no encontrada.', 404);
  }

  return iglesia;
};

export const registerIglesia = async (payload) => {
  return createIglesia(validateIglesiaPayload(payload));
};

export const editIglesia = async (idIglesia, payload) => {
  const iglesia = await updateIglesia(parseId(idIglesia), validateIglesiaPayload(payload));

  if (!iglesia) {
    throw new AppError('Iglesia no encontrada.', 404);
  }

  return iglesia;
};

export const removeIglesia = async (idIglesia) => {
  const iglesia = await deleteIglesia(parseId(idIglesia));

  if (!iglesia) {
    throw new AppError('Iglesia no encontrada.', 404);
  }

  return iglesia;
};
