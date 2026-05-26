import {
  editIglesia,
  getIglesiaById,
  getIglesias,
  registerIglesia,
  removeIglesia,
} from './iglesias.service.js';

export const listIglesias = async (_req, res, next) => {
  try {
    const iglesias = await getIglesias();

    res.status(200).json({
      success: true,
      data: iglesias,
    });
  } catch (error) {
    next(error);
  }
};

export const showIglesia = async (req, res, next) => {
  try {
    const iglesia = await getIglesiaById(req.params.id);

    res.status(200).json({
      success: true,
      data: iglesia,
    });
  } catch (error) {
    next(error);
  }
};

export const storeIglesia = async (req, res, next) => {
  try {
    const iglesia = await registerIglesia(req.body);

    res.status(201).json({
      success: true,
      message: 'Iglesia registrada correctamente.',
      data: iglesia,
    });
  } catch (error) {
    next(error);
  }
};

export const updateIglesiaById = async (req, res, next) => {
  try {
    const iglesia = await editIglesia(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Iglesia actualizada correctamente.',
      data: iglesia,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteIglesiaById = async (req, res, next) => {
  try {
    await removeIglesia(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Iglesia eliminada correctamente.',
    });
  } catch (error) {
    next(error);
  }
};
