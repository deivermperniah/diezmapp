import { Router } from 'express';
import {
  deleteIglesiaById,
  listIglesias,
  showIglesia,
  storeIglesia,
  updateIglesiaById,
} from './iglesias.controller.js';

const router = Router();

router.get('/', listIglesias);
router.get('/:id', showIglesia);
router.post('/', storeIglesia);
router.put('/:id', updateIglesiaById);
router.delete('/:id', deleteIglesiaById);

export default router;
