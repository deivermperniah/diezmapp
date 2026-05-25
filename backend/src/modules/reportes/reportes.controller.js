import { getReporteMensual, getReporteSemanal } from './reportes.service.js';

export const showReporteSemanal = async (req, res, next) => {
  try {
    const reporte = await getReporteSemanal({
      fechaInicio: req.query.fechaInicio,
      fechaFin: req.query.fechaFin,
    });

    res.status(200).json({
      success: true,
      data: reporte,
    });
  } catch (error) {
    next(error);
  }
};

export const showReporteMensual = async (req, res, next) => {
  try {
    const reporte = await getReporteMensual({
      mes: req.query.mes,
      anio: req.query.anio,
    });

    res.status(200).json({
      success: true,
      data: reporte,
    });
  } catch (error) {
    next(error);
  }
};
