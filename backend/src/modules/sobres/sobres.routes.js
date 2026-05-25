import { Router } from 'express';
import {
  deleteSobreById,
  listSobres,
  showSiguienteNumeroSobre,
  showSobre,
  storeSobre,
  updateSobreById,
} from './sobres.controller.js';

const router = Router();

router.get('/', listSobres);
router.get('/siguiente-numero', showSiguienteNumeroSobre);
router.get('/:id', showSobre);
router.post('/', storeSobre);
router.put('/:id', updateSobreById);
router.delete('/:id', deleteSobreById);

export default router;
