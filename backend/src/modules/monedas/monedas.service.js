import { findAllMonedas } from './monedas.repository.js';

export const getMonedas = async () => {
  return findAllMonedas();
};
