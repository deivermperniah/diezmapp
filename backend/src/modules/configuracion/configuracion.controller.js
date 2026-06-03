import { getTasaDolar } from './configuracion.service.js';

export const showTasaDolar = async (_req, res, next) => {
  try {
    const tasa = await getTasaDolar();

    res.status(200).json({
      success: true,
      data: tasa,
    });
  } catch (error) {
    next(error);
  }
};
