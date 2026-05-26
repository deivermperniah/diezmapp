import { Router } from 'express';
import configuracionRoutes from '../modules/configuracion/configuracion.routes.js';
import iglesiasRoutes from '../modules/iglesias/iglesias.routes.js';
import miembrosRoutes from '../modules/miembros/miembros.routes.js';
import monedasRoutes from '../modules/monedas/monedas.routes.js';
import ofrendasRoutes from '../modules/ofrendas/ofrendas.routes.js';
import reportesRoutes from '../modules/reportes/reportes.routes.js';
import sobresRoutes from '../modules/sobres/sobres.routes.js';
import transferenciasRoutes from '../modules/transferencias/transferencias.routes.js';
import healthRoutes from './health.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/configuracion', configuracionRoutes);
router.use('/iglesias', iglesiasRoutes);
router.use('/miembros', miembrosRoutes);
router.use('/monedas', monedasRoutes);
router.use('/ofrendas', ofrendasRoutes);
router.use('/reportes', reportesRoutes);
router.use('/sobres', sobresRoutes);
router.use('/transferencias', transferenciasRoutes);

export default router;
