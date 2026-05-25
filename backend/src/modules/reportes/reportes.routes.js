import { Router } from 'express';
import { showReporteMensual, showReporteSemanal } from './reportes.controller.js';

const router = Router();

router.get('/semanal', showReporteSemanal);
router.get('/mensual', showReporteMensual);

export default router;
