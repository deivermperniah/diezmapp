import { getCurrencies } from '../../services/currency.service.js';

export const listMonedas = async (_req, res, next) => {
  try {
    const monedas = getCurrencies();

    res.status(200).json({
      success: true,
      data: monedas,
    });
  } catch (error) {
    next(error);
  }
};
