import { AppError } from '../utils/app-error.js';

const currencies = [
  { idMoneda: 'Bs', nombreMoneda: 'Bolivar', simbolo: 'Bs' },
  { idMoneda: '$', nombreMoneda: 'Dolar', simbolo: '$' },
];

const BCV_RATE_URL = process.env.BCV_RATE_URL || 'https://ve.dolarapi.com/v1/dolares/oficial';
const RATE_CACHE_TTL_MS = 5 * 60 * 1000;
let cachedRate = null;

const getCurrencyById = (idMoneda) => {
  const value = String(idMoneda || '').trim();
  return currencies.find((currency) => currency.idMoneda === value || currency.simbolo === value) || null;
};

export const getTasaDolarOficial = async () => {
  if (cachedRate && Date.now() - cachedRate.cachedAt < RATE_CACHE_TTL_MS) {
    return {
      valor: cachedRate.valor,
      fechaActualizacion: cachedRate.fechaActualizacion,
    };
  }

  let response;

  try {
    response = await fetch(BCV_RATE_URL, {
      headers: {
        Accept: 'application/json',
      },
    });
  } catch {
    throw new AppError('No se pudo consultar la tasa BCV externa.', 502);
  }

  if (!response.ok) {
    throw new AppError('La API externa de tasa BCV no respondio correctamente.', 502);
  }

  const payload = await response.json().catch(() => null);
  const valor = Number(payload?.promedio);
  const fechaActualizacion = payload?.fechaActualizacion || null;

  if (Number.isNaN(valor) || valor <= 0) {
    throw new AppError('La API externa no devolvio una tasa BCV valida.', 502);
  }

  cachedRate = {
    valor,
    fechaActualizacion,
    cachedAt: Date.now(),
  };

  return {
    valor: cachedRate.valor,
    fechaActualizacion: cachedRate.fechaActualizacion,
  };
};

export const getTasaBcvDolar = async () => {
  const tasa = await getTasaDolarOficial();
  return tasa.valor;
};

export const convertMoneyToUsd = async ({ amount, idMoneda, tasaBcvDolar }) => {
  const currency = getCurrencyById(idMoneda);

  if (!currency) {
    throw new AppError('La moneda no existe.', 400);
  }

  const simbolo = String(currency.simbolo).trim();

  if (simbolo === '$') {
    return {
      amountUsd: Number(amount.toFixed(2)),
    };
  }

  if (simbolo === 'Bs') {
    const tasa = tasaBcvDolar || (await getTasaBcvDolar());

    return {
      amountUsd: Number((amount / tasa).toFixed(2)),
    };
  }

  throw new AppError('Solo se aceptan montos en Bolivar o Dolar.', 400);
};
