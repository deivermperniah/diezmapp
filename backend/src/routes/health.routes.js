import { Router } from 'express';
import { databaseHealthCheck, healthCheck } from '../controllers/health.controller.js';

const router = Router();

router.get('/', healthCheck);
router.get('/database', databaseHealthCheck);

export default router;
