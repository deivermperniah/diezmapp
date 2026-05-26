import {
  editOfrenda,
  getOfrendaById,
  getOfrendas,
  getOfrendasByIglesia,
  getOfrendasBySobre,
  registerOfrenda,
  removeOfrenda,
} from './ofrendas.service.js';

export const listOfrendas = async (req, res, next) => {
  try {
    const ofrendas = req.query.idIglesia
      ? await getOfrendasByIglesia(req.query.idIglesia)
      : await getOfrendas();

    res.status(200).json({
      success: true,
      data: ofrendas,
    });
  } catch (error) {
    next(error);
  }
};

export const showOfrenda = async (req, res, next) => {
  try {
    const ofrenda = await getOfrendaById(req.params.id);

    res.status(200).json({
      success: true,
      data: ofrenda,
    });
  } catch (error) {
    next(error);
  }
};

export const listOfrendasBySobre = async (req, res, next) => {
  try {
    const ofrendas = await getOfrendasBySobre(req.params.idSobre);

    res.status(200).json({
      success: true,
      data: ofrendas,
    });
  } catch (error) {
    next(error);
  }
};

export const storeOfrenda = async (req, res, next) => {
  try {
    const ofrenda = await registerOfrenda(req.body);

    res.status(201).json({
      success: true,
      message: 'Ofrenda registrada correctamente.',
      data: ofrenda,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOfrendaById = async (req, res, next) => {
  try {
    const ofrenda = await editOfrenda(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Ofrenda actualizada correctamente.',
      data: ofrenda,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteOfrendaById = async (req, res, next) => {
  try {
    await removeOfrenda(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Ofrenda eliminada correctamente.',
    });
  } catch (error) {
    next(error);
  }
};
