import { getMonedas } from './monedas.service.js';

export const listMonedas = async (_req, res, next) => {
  try {
    const monedas = await getMonedas();

    res.status(200).json({
      success: true,
      data: monedas,
    });
  } catch (error) {
    next(error);
  }
};
