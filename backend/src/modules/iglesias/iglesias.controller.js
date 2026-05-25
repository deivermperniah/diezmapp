import { getIglesias } from './iglesias.service.js';

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
