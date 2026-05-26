import { AppError } from '../utils/app-error.js';

const currencies = [
  { idMoneda: 'Bs', nombreMoneda: 'Bolivar', simbolo: 'Bs' },
  { idMoneda: '$', nombreMoneda: 'Dolar', simbolo: '$' },
];

const BCV_RATE_URL = process.env.BCV_RATE_URL || 'https://bcv.today/api/v1/rate.json';

const getCurrencyById = (idMoneda) => {
  const value = String(idMoneda || '').trim();
  return currencies.find((currency) => currency.idMoneda === value || currency.simbolo === value) || null;
};

export const getUsdCurrency = async () => {
  return currencies.find((currency) => currency.simbolo === '$');
};

export const getTasaBcvDolar = async () => {
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
  const tasa = Number(payload?.USD ?? payload?.tasa ?? payload?.rate);

  if (Number.isNaN(tasa) || tasa <= 0) {
    throw new AppError('La API externa no devolvio una tasa BCV valida.', 502);
  }

  return tasa;
};

export const convertMoneyToUsd = async ({ amount, idMoneda }) => {
  const currency = await getCurrencyById(idMoneda);

  if (!currency) {
    throw new AppError('La moneda no existe.', 400);
  }

  const tasaBcvDolar = await getTasaBcvDolar();
  const usdCurrency = await getUsdCurrency();
  const simbolo = String(currency.simbolo).trim();

  if (simbolo === '$') {
    return {
      amountUsd: Number(amount.toFixed(2)),
      originalAmount: Number(amount.toFixed(2)),
      originalCurrencyId: currency.idMoneda,
      usdCurrencyId: usdCurrency.idMoneda,
      tasaBcvDolar: 1,
    };
  }

  if (simbolo === 'Bs') {
    return {
      amountUsd: Number((amount / tasaBcvDolar).toFixed(2)),
      originalAmount: Number(amount.toFixed(2)),
      originalCurrencyId: currency.idMoneda,
      usdCurrencyId: usdCurrency.idMoneda,
      tasaBcvDolar,
    };
  }

  throw new AppError('Solo se aceptan montos en Bolivar o Dolar.', 400);
};
