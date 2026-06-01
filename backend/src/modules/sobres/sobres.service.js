import { AppError } from '../../utils/app-error.js';
import { convertMoneyToUsd, getTasaBcvDolar } from '../../services/currency.service.js';
import { findOfrendasBySobreId } from '../ofrendas/ofrendas.repository.js';
import { findTransferenciasBySobreId } from '../transferencias/transferencias.repository.js';
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

const parseRequiredText = (value, fieldName, minLength = 2) => {
  const parsedValue = String(value || '').trim();

  if (parsedValue.length < minLength) {
    throw new AppError(`${fieldName} es obligatorio.`, 400);
  }

  return parsedValue;
};

const parseOptionalText = (value) => {
  const parsedValue = String(value || '').trim();
  return parsedValue || null;
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

const needsBcvRate = (idMoneda) => parseCurrency(idMoneda, 'La moneda') === 'Bs';

const validateOfrendas = async (ofrendas = [], tasaBcvDolar = null) => {
  if (!Array.isArray(ofrendas)) {
    throw new AppError('Las ofrendas de colaboracion no son validas.', 400);
  }

  return Promise.all(
    ofrendas
      .filter((ofrenda) => Number(ofrenda?.montoOfrenda || 0) > 0)
      .map(async (ofrenda, index) => {
        const conversion = await convertMoneyToUsd({
          amount: parseMoney(ofrenda.montoOfrenda, `El monto de la ofrenda ${index + 1}`),
          idMoneda: parseCurrency(ofrenda.idMoneda, `La moneda de la ofrenda ${index + 1}`),
          tasaBcvDolar,
        });

        return {
          nombreOfrenda: parseOptionalText(ofrenda.nombreOfrenda),
          montoOfrenda: conversion.amountUsd,
        };
      }),
  );
};

const validateTransferencias = async (transferencias = [], tasaBcvDolar = null) => {
  if (!Array.isArray(transferencias) || transferencias.length === 0) {
    throw new AppError('Debe registrar al menos una transferencia.', 400);
  }

  return Promise.all(
    transferencias.map(async (transferencia, index) => {
      const conversion = await convertMoneyToUsd({
        amount: parseMoney(
          transferencia.montoTransferencia,
          `El monto de la transferencia ${index + 1}`,
        ),
        idMoneda: parseCurrency(
          transferencia.idMoneda,
          `La moneda de la transferencia ${index + 1}`,
        ),
        tasaBcvDolar,
      });

      return {
        fechaTransferencia: parseFecha(transferencia.fechaTransferencia).fecha,
        numeroTransferencia: parseRequiredText(
          transferencia.numeroTransferencia,
          `El numero de la transferencia ${index + 1}`,
        ),
        bancoReceptorCuenta: parseRequiredText(
          transferencia.bancoReceptorCuenta,
          `El banco o cuenta de la transferencia ${index + 1}`,
        ),
        montoTransferencia: conversion.amountUsd,
      };
    }),
  );
};

const validateSobrePayload = async (payload) => {
  const { fecha, mes, anio } = parseFecha(payload.fecha);
  const montoDiezmo = parseMoney(payload.montoDiezmo, 'El monto de diezmo');
  const montoPactoAmor = parseMoney(payload.montoPactoAmor, 'El monto de pacto de amor', {
    required: false,
  });
  const ofrendaInputs = payload.ofrendas || [];
  const transferenciaInputs = payload.transferencias || [];
  const requiresBcvRate = [
    payload.idMonedaDiezmo,
    payload.idMonedaPacto,
    ...ofrendaInputs.map((ofrenda) => ofrenda?.idMoneda),
    ...transferenciaInputs.map((transferencia) => transferencia?.idMoneda),
  ].some((idMoneda) => idMoneda && needsBcvRate(idMoneda));
  const tasaBcvDolar = requiresBcvRate ? await getTasaBcvDolar() : null;
  const diezmo = await convertMoneyToUsd({
    amount: montoDiezmo,
    idMoneda: parseCurrency(payload.idMonedaDiezmo, 'La moneda del diezmo'),
    tasaBcvDolar,
  });
  const pacto =
    montoPactoAmor > 0
      ? await convertMoneyToUsd({
          amount: montoPactoAmor,
          idMoneda: parseCurrency(payload.idMonedaPacto, 'La moneda del pacto'),
          tasaBcvDolar,
        })
      : null;
  const ofrendas = await validateOfrendas(ofrendaInputs, tasaBcvDolar);
  const transferencias = await validateTransferencias(transferenciaInputs, tasaBcvDolar);
  const totalOfrendas = ofrendas.reduce((total, ofrenda) => total + ofrenda.montoOfrenda, 0);
  const totalIncluido = Number((diezmo.amountUsd + (pacto?.amountUsd || 0) + totalOfrendas).toFixed(2));
  const totalTransferencias = Number(
    transferencias
      .reduce((total, transferencia) => total + transferencia.montoTransferencia, 0)
      .toFixed(2),
  );

  if (Math.abs(totalIncluido - totalTransferencias) > 0.01) {
    throw new AppError('La suma de transferencias debe ser igual al total incluido.', 400);
  }

  return {
    fecha,
    mes,
    anio,
    idIglesia: parsePositiveInteger(payload.idIglesia, 'La iglesia'),
    idMiembro: parsePositiveInteger(payload.idMiembro, 'El miembro'),
    montoDiezmo: diezmo.amountUsd,
    montoPactoAmor: pacto?.amountUsd || 0,
    totalIncluido,
    ofrendas,
    transferencias,
  };
};

export const getSobres = async () => {
  return findAllSobres();
};

export const getSobresByIglesia = async (idIglesia) => {
  return findAllSobres({ idIglesia: parsePositiveInteger(idIglesia, 'La iglesia') });
};

export const getSobreById = async (idSobre) => {
  const parsedId = parseId(idSobre);
  const sobre = await findSobreById(parsedId);

  if (!sobre) {
    throw new AppError('Sobre no encontrado.', 404);
  }

  const [ofrendas, transferencias] = await Promise.all([
    findOfrendasBySobreId(parsedId),
    findTransferenciasBySobreId(parsedId),
  ]);

  return {
    ...sobre,
    ofrendas,
    transferencias,
  };
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
