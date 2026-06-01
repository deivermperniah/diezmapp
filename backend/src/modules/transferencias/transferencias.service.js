import { AppError } from '../../utils/app-error.js';
import { convertMoneyToUsd } from '../../services/currency.service.js';
import {
  createTransferencia,
  deleteTransferencia,
  findAllTransferencias,
  findTransferenciaById,
  findTransferenciasBySobreId,
  updateTransferencia,
} from './transferencias.repository.js';

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

const parseRequiredText = (value, fieldName, minLength = 2) => {
  const parsedValue = String(value || '').trim();

  if (parsedValue.length < minLength) {
    throw new AppError(`${fieldName} es obligatorio.`, 400);
  }

  return parsedValue;
};

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

const validateTransferenciaPayload = async (payload) => {
  const conversion = await convertMoneyToUsd({
    amount: parseMoney(payload.montoTransferencia, 'El monto de transferencia'),
    idMoneda: parseCurrency(payload.idMoneda, 'La moneda'),
  });

  return {
    idSobre: parsePositiveInteger(payload.idSobre, 'El sobre'),
    fechaTransferencia: parseFecha(payload.fechaTransferencia, 'La fecha de transferencia'),
    numeroTransferencia: parseRequiredText(
      payload.numeroTransferencia,
      'El numero de transferencia',
    ),
    bancoReceptorCuenta: parseRequiredText(
      payload.bancoReceptorCuenta,
      'El banco o cuenta receptora',
    ),
    montoTransferencia: conversion.amountUsd,
  };
};

export const getTransferencias = async () => {
  return findAllTransferencias();
};

export const getTransferenciasByIglesia = async (idIglesia) => {
  return findAllTransferencias({ idIglesia: parsePositiveInteger(idIglesia, 'La iglesia') });
};

export const getTransferenciaById = async (idTransferencia) => {
  const transferencia = await findTransferenciaById(
    parsePositiveInteger(idTransferencia, 'El id de la transferencia'),
  );

  if (!transferencia) {
    throw new AppError('Transferencia no encontrada.', 404);
  }

  return transferencia;
};

export const getTransferenciasBySobre = async (idSobre) => {
  return findTransferenciasBySobreId(parsePositiveInteger(idSobre, 'El id del sobre'));
};

export const registerTransferencia = async (payload) => {
  const transferenciaData = await validateTransferenciaPayload(payload);
  return createTransferencia(transferenciaData);
};

export const editTransferencia = async (idTransferencia, payload) => {
  const transferenciaData = await validateTransferenciaPayload(payload);
  const transferencia = await updateTransferencia(
    parsePositiveInteger(idTransferencia, 'El id de la transferencia'),
    transferenciaData,
  );

  if (!transferencia) {
    throw new AppError('Transferencia no encontrada.', 404);
  }

  return transferencia;
};

export const removeTransferencia = async (idTransferencia) => {
  const transferencia = await deleteTransferencia(
    parsePositiveInteger(idTransferencia, 'El id de la transferencia'),
  );

  if (!transferencia) {
    throw new AppError('Transferencia no encontrada.', 404);
  }

  return transferencia;
};
