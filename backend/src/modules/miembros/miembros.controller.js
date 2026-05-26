import {
  editMiembro,
  getMiembroById,
  getMiembros,
  getMiembrosByIglesia,
  registerMiembro,
  removeMiembro,
} from './miembros.service.js';

export const listMiembros = async (req, res, next) => {
  try {
    const miembros = req.query.idIglesia
      ? await getMiembrosByIglesia(req.query.idIglesia)
      : await getMiembros();

    res.status(200).json({
      success: true,
      data: miembros,
    });
  } catch (error) {
    next(error);
  }
};

export const showMiembro = async (req, res, next) => {
  try {
    const miembro = await getMiembroById(req.params.id);

    res.status(200).json({
      success: true,
      data: miembro,
    });
  } catch (error) {
    next(error);
  }
};

export const storeMiembro = async (req, res, next) => {
  try {
    const miembro = await registerMiembro(req.body);

    res.status(201).json({
      success: true,
      message: 'Miembro registrado correctamente.',
      data: miembro,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMiembroById = async (req, res, next) => {
  try {
    const miembro = await editMiembro(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Miembro actualizado correctamente.',
      data: miembro,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMiembroById = async (req, res, next) => {
  try {
    await removeMiembro(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Miembro eliminado correctamente.',
    });
  } catch (error) {
    next(error);
  }
};
