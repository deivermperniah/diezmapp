import { Router } from 'express';
import { showTasaDolar } from './configuracion.controller.js';

const router = Router();

router.get('/tasa-dolar', showTasaDolar);

export default router;
