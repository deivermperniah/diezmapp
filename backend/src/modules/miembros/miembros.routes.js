import { Router } from 'express';
import {
  deleteMiembroById,
  listMiembros,
  showMiembro,
  storeMiembro,
  updateMiembroById,
} from './miembros.controller.js';

const router = Router();

router.get('/', listMiembros);
router.get('/:id', showMiembro);
router.post('/', storeMiembro);
router.put('/:id', updateMiembroById);
router.delete('/:id', deleteMiembroById);

export default router;
