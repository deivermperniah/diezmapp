import { AppError } from '../../utils/app-error.js';
import {
  parseCurrency,
  parseDateParts,
  parseMoney,
  parseOptionalText,
  parsePositiveInteger,
  parseRequiredText,
} from '../../utils/validators.js';
import { convertMoneyToUsd, getTasaBcvDolar } from '../../services/currency.service.js';
import { findMiembroById } from '../miembros/miembros.repository.js';
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

const parseFecha = (fecha) => parseDateParts(fecha);

const parseId = (idSobre) => parsePositiveInteger(idSobre, 'El id del sobre');

const needsBcvRate = (idMoneda) => parseCurrency(idMoneda, 'La moneda') === 'Bs';

const validateMiembroIglesia = async (idMiembro, idIglesia) => {
  const miembro = await findMiembroById(idMiembro);

  if (!miembro) {
    throw new AppError('Miembro no encontrado.', 404);
  }

  if (Number(miembro.idIglesia) !== Number(idIglesia)) {
    throw new AppError('El miembro no pertenece a la iglesia seleccionada.', 400);
  }
};

const validateOfrendas = async (ofrendas = [], idMoneda, tasaBcvDolar = null) => {
  if (!Array.isArray(ofrendas)) {
    throw new AppError('Las ofrendas de colaboracion no son validas.', 400);
  }

  return Promise.all(
    ofrendas
      .filter((ofrenda) => Number(ofrenda?.montoOfrenda || 0) > 0)
      .map(async (ofrenda, index) => {
        const conversion = await convertMoneyToUsd({
          amount: parseMoney(ofrenda.montoOfrenda, `El monto de la ofrenda ${index + 1}`),
          idMoneda,
          tasaBcvDolar,
        });

        return {
          nombreOfrenda: parseOptionalText(ofrenda.nombreOfrenda),
          montoOfrenda: conversion.amountUsd,
        };
      }),
  );
};

const validateTransferencias = async (transferencias = [], idMoneda, tasaBcvDolar = null) => {
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
        idMoneda,
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
  const idIglesia = parsePositiveInteger(payload.idIglesia, 'La iglesia');
  const idMiembro = parsePositiveInteger(payload.idMiembro, 'El miembro');
  const montoDiezmo = parseMoney(payload.montoDiezmo, 'El monto de diezmo');
  const montoPactoAmor = parseMoney(payload.montoPactoAmor, 'El monto de pacto de amor', {
    required: false,
  });
  const ofrendaInputs = payload.ofrendas || [];
  const transferenciaInputs = payload.transferencias || [];
  const idMoneda = parseCurrency(payload.idMoneda, 'La moneda del sobre');
  const requiresBcvRate = needsBcvRate(idMoneda);
  const tasaBcvDolar = requiresBcvRate ? await getTasaBcvDolar() : null;
  const diezmo = await convertMoneyToUsd({
    amount: montoDiezmo,
    idMoneda,
    tasaBcvDolar,
  });
  const pacto =
    montoPactoAmor > 0
      ? await convertMoneyToUsd({
          amount: montoPactoAmor,
          idMoneda,
          tasaBcvDolar,
        })
      : null;
  const ofrendas = await validateOfrendas(ofrendaInputs, idMoneda, tasaBcvDolar);
  const transferencias = await validateTransferencias(transferenciaInputs, idMoneda, tasaBcvDolar);
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

  await validateMiembroIglesia(idMiembro, idIglesia);

  return {
    fecha,
    mes,
    anio,
    idIglesia,
    idMiembro,
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
