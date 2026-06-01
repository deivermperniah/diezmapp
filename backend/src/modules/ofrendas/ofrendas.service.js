import { AppError } from '../../utils/app-error.js';
import { convertMoneyToUsd } from '../../services/currency.service.js';
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

const parseCurrency = (value, fieldName) => {
  const parsedValue = String(value || '').trim();

  if (!['Bs', '$'].includes(parsedValue)) {
    throw new AppError(`${fieldName} debe ser Bs o $.`, 400);
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

const parseOptionalText = (value) => {
  const parsedValue = String(value || '').trim();
  return parsedValue || null;
};

const validateOfrendaPayload = async (payload) => {
  const conversion = await convertMoneyToUsd({
    amount: parseMoney(payload.montoOfrenda, 'El monto de ofrenda'),
    idMoneda: parseCurrency(payload.idMoneda, 'La moneda'),
  });

  return {
    idSobre: parsePositiveInteger(payload.idSobre, 'El sobre'),
    nombreOfrenda: parseOptionalText(payload.nombreOfrenda),
    montoOfrenda: conversion.amountUsd,
  };
};

export const getOfrendas = async () => {
  return findAllOfrendas();
};

export const getOfrendasByIglesia = async (idIglesia) => {
  return findAllOfrendas({ idIglesia: parsePositiveInteger(idIglesia, 'La iglesia') });
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
  const ofrendaData = await validateOfrendaPayload(payload);
  return createOfrenda(ofrendaData);
};

export const editOfrenda = async (idOfrenda, payload) => {
  const ofrendaData = await validateOfrendaPayload(payload);
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
