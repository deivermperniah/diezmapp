import { findAllIglesias } from './iglesias.repository.js';

export const getIglesias = async () => {
  return findAllIglesias();
};
