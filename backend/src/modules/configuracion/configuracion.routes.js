import { Router } from 'express';
import { showConfiguracion, updateConfiguracionById } from './configuracion.controller.js';

const router = Router();

router.get('/', showConfiguracion);
router.put('/', updateConfiguracionById);

export default router;
