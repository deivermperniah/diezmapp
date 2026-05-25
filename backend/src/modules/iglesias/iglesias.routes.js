import { Router } from 'express';
import { listIglesias } from './iglesias.controller.js';

const router = Router();

router.get('/', listIglesias);

export default router;
