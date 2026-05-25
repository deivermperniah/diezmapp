import { Router } from 'express';
import {
  deleteOfrendaById,
  listOfrendas,
  listOfrendasBySobre,
  showOfrenda,
  storeOfrenda,
  updateOfrendaById,
} from './ofrendas.controller.js';

const router = Router();

router.get('/', listOfrendas);
router.get('/sobre/:idSobre', listOfrendasBySobre);
router.get('/:id', showOfrenda);
router.post('/', storeOfrenda);
router.put('/:id', updateOfrendaById);
router.delete('/:id', deleteOfrendaById);

export default router;
