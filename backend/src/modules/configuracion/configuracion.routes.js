import { Router } from 'express';
import { showConfiguracion, showTasaDolar, updateConfiguracionById } from './configuracion.controller.js';

const router = Router();

router.get('/tasa-dolar', showTasaDolar);
router.get('/', showConfiguracion);
router.put('/', updateConfiguracionById);

export default router;
