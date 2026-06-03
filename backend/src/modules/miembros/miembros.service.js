import { AppError } from '../../utils/app-error.js';
import { parsePositiveInteger } from '../../utils/validators.js';
import {
  countSobresByMiembro,
  createMiembro,
  deleteMiembro,
  findAllMiembros,
  findMiembroById,
  updateMiembro,
} from './miembros.repository.js';

const normalizeEmail = (email) => {
  if (!email) return null;
  return String(email).trim().toLowerCase();
};

const validateMiembroPayload = ({ nombre, apellido, email, idIglesia }) => {
  if (!nombre || String(nombre).trim().length < 2) {
    throw new AppError('El nombre del miembro es obligatorio.', 400);
  }

  if (!apellido || String(apellido).trim().length < 2) {
    throw new AppError('El apellido del miembro es obligatorio.', 400);
  }

  if (!idIglesia || Number.isNaN(Number(idIglesia))) {
    throw new AppError('La iglesia del miembro es obligatoria.', 400);
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AppError('El email del miembro no tiene un formato valido.', 400);
  }

  return {
    nombre: String(nombre).trim(),
    apellido: String(apellido).trim(),
    email: normalizeEmail(email),
    idIglesia: Number(idIglesia),
  };
};

const parseId = (idMiembro) => {
  return parsePositiveInteger(
    idMiembro,
    'El id del miembro',
    'El id del miembro no es valido.',
  );
};

export const getMiembros = async () => {
  return findAllMiembros();
};

export const getMiembrosByIglesia = async (idIglesia) => {
  return findAllMiembros({ idIglesia: parseId(idIglesia) });
};

export const getMiembroById = async (idMiembro) => {
  const miembro = await findMiembroById(parseId(idMiembro));

  if (!miembro) {
    throw new AppError('Miembro no encontrado.', 404);
  }

  return miembro;
};

export const registerMiembro = async (payload) => {
  const miembroData = validateMiembroPayload(payload);
  return createMiembro(miembroData);
};

export const editMiembro = async (idMiembro, payload) => {
  const miembroData = validateMiembroPayload(payload);
  const miembro = await updateMiembro(parseId(idMiembro), miembroData);

  if (!miembro) {
    throw new AppError('Miembro no encontrado.', 404);
  }

  return miembro;
};

export const removeMiembro = async (idMiembro) => {
  const parsedId = parseId(idMiembro);
  const totalSobres = await countSobresByMiembro(parsedId);

  if (totalSobres > 0) {
    throw new AppError('No se puede eliminar el miembro porque tiene sobres registrados.', 400);
  }

  const miembro = await deleteMiembro(parsedId);

  if (!miembro) {
    throw new AppError('Miembro no encontrado.', 404);
  }

  return miembro;
};
