import { getConfiguracion, saveConfiguracion } from './configuracion.service.js';

export const showConfiguracion = async (_req, res, next) => {
  try {
    const configuracion = await getConfiguracion();

    res.status(200).json({
      success: true,
      data: configuracion,
    });
  } catch (error) {
    next(error);
  }
};

export const updateConfiguracionById = async (req, res, next) => {
  try {
    const configuracion = await saveConfiguracion(req.body);

    res.status(200).json({
      success: true,
      message: 'Configuracion actualizada correctamente.',
      data: configuracion,
    });
  } catch (error) {
    next(error);
  }
};
