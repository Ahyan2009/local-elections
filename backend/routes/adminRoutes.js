import express from 'express';
import {
  adminLogin,
  getAllCandidates,
  updateCandidateStatus,
  deleteCandidate,
} from '../controllers/adminController.js';
import protectAdmin from '../middleware/auth.js';

const router = express.Router();

router.post('/login', adminLogin);

router.get('/candidates', protectAdmin, getAllCandidates);
router.put('/candidate/:id/status', protectAdmin, updateCandidateStatus);
router.delete('/candidate/:id', protectAdmin, deleteCandidate);

export default router;