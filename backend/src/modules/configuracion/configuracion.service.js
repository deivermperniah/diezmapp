import { AppError } from '../../utils/app-error.js';
import { getTasaDolarOficial } from '../../services/currency.service.js';
import { findConfiguracion, updateConfiguracion } from './configuracion.repository.js';

const parseRequiredText = (value, fieldName) => {
  const parsedValue = String(value || '').trim();

  if (parsedValue.length < 2) {
    throw new AppError(`${fieldName} es obligatorio.`, 400);
  }

  return parsedValue;
};

export const getConfiguracion = async () => {
  const configuracion = await findConfiguracion();

  if (!configuracion) {
    throw new AppError('Configuracion no encontrada.', 404);
  }

  return configuracion;
};

export const getTasaDolar = async () => getTasaDolarOficial();

export const saveConfiguracion = async (payload) => {
  const configuracionData = {
    nombreIglesia: parseRequiredText(payload.nombreIglesia, 'El nombre de la iglesia'),
    ciudad: parseRequiredText(payload.ciudad, 'La ciudad'),
  };

  return updateConfiguracion(configuracionData);
};
