import { AppError } from '../../utils/app-error.js';
import {
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

const validateMiembroPayload = ({ nombre, email, idIglesia }) => {
  if (!nombre || String(nombre).trim().length < 2) {
    throw new AppError('El nombre del miembro es obligatorio.', 400);
  }

  if (!idIglesia || Number.isNaN(Number(idIglesia))) {
    throw new AppError('La iglesia del miembro es obligatoria.', 400);
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AppError('El email del miembro no tiene un formato valido.', 400);
  }

  return {
    nombre: String(nombre).trim(),
    email: normalizeEmail(email),
    idIglesia: Number(idIglesia),
  };
};

const parseId = (idMiembro) => {
  const parsedId = Number(idMiembro);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    throw new AppError('El id del miembro no es valido.', 400);
  }

  return parsedId;
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
  const miembro = await deleteMiembro(parseId(idMiembro));

  if (!miembro) {
    throw new AppError('Miembro no encontrado.', 404);
  }

  return miembro;
};
