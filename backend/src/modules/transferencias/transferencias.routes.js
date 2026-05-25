import { Router } from 'express';
import {
  deleteTransferenciaById,
  listTransferencias,
  listTransferenciasBySobre,
  showTransferencia,
  storeTransferencia,
  updateTransferenciaById,
} from './transferencias.controller.js';

const router = Router();

router.get('/', listTransferencias);
router.get('/sobre/:idSobre', listTransferenciasBySobre);
router.get('/:id', showTransferencia);
router.post('/', storeTransferencia);
router.put('/:id', updateTransferenciaById);
router.delete('/:id', deleteTransferenciaById);

export default router;
