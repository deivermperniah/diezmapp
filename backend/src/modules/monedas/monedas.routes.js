import { Router } from 'express';
import { listMonedas } from './monedas.controller.js';

const router = Router();

router.get('/', listMonedas);

export default router;
