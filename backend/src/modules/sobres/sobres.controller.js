import {
  editSobre,
  getSiguienteNumeroSobre,
  getSobreById,
  getSobres,
  getSobresByIglesia,
  registerSobre,
  removeSobre,
} from './sobres.service.js';

export const listSobres = async (req, res, next) => {
  try {
    const sobres = req.query.idIglesia
      ? await getSobresByIglesia(req.query.idIglesia)
      : await getSobres();

    res.status(200).json({
      success: true,
      data: sobres,
    });
  } catch (error) {
    next(error);
  }
};

export const showSobre = async (req, res, next) => {
  try {
    const sobre = await getSobreById(req.params.id);

    res.status(200).json({
      success: true,
      data: sobre,
    });
  } catch (error) {
    next(error);
  }
};

export const showSiguienteNumeroSobre = async (req, res, next) => {
  try {
    const siguienteNumero = await getSiguienteNumeroSobre(req.query.fecha, req.query.idIglesia);

    res.status(200).json({
      success: true,
      data: siguienteNumero,
    });
  } catch (error) {
    next(error);
  }
};

export const storeSobre = async (req, res, next) => {
  try {
    const sobre = await registerSobre(req.body);

    res.status(201).json({
      success: true,
      message: 'Sobre registrado correctamente.',
      data: sobre,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSobreById = async (req, res, next) => {
  try {
    const sobre = await editSobre(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Sobre actualizado correctamente.',
      data: sobre,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSobreById = async (req, res, next) => {
  try {
    await removeSobre(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Sobre eliminado correctamente.',
    });
  } catch (error) {
    next(error);
  }
};
