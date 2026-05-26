import {
  editTransferencia,
  getTransferenciaById,
  getTransferencias,
  getTransferenciasByIglesia,
  getTransferenciasBySobre,
  registerTransferencia,
  removeTransferencia,
} from './transferencias.service.js';

export const listTransferencias = async (req, res, next) => {
  try {
    const transferencias = req.query.idIglesia
      ? await getTransferenciasByIglesia(req.query.idIglesia)
      : await getTransferencias();

    res.status(200).json({
      success: true,
      data: transferencias,
    });
  } catch (error) {
    next(error);
  }
};

export const showTransferencia = async (req, res, next) => {
  try {
    const transferencia = await getTransferenciaById(req.params.id);

    res.status(200).json({
      success: true,
      data: transferencia,
    });
  } catch (error) {
    next(error);
  }
};

export const listTransferenciasBySobre = async (req, res, next) => {
  try {
    const transferencias = await getTransferenciasBySobre(req.params.idSobre);

    res.status(200).json({
      success: true,
      data: transferencias,
    });
  } catch (error) {
    next(error);
  }
};

export const storeTransferencia = async (req, res, next) => {
  try {
    const transferencia = await registerTransferencia(req.body);

    res.status(201).json({
      success: true,
      message: 'Transferencia registrada correctamente.',
      data: transferencia,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTransferenciaById = async (req, res, next) => {
  try {
    const transferencia = await editTransferencia(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Transferencia actualizada correctamente.',
      data: transferencia,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTransferenciaById = async (req, res, next) => {
  try {
    await removeTransferencia(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Transferencia eliminada correctamente.',
    });
  } catch (error) {
    next(error);
  }
};
