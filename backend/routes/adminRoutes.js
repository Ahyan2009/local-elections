import express from 'express';
import {
  adminLogin,
  getAllCandidates,
  updateCandidateStatus,
  deleteCandidate,
} from '../controllers/adminController.js';

const router = express.Router();

router.post('/login', adminLogin);
router.get('/candidates', getAllCandidates);
router.put('/candidate/:id/status', updateCandidateStatus);
router.delete('/candidate/:id', deleteCandidate);

export default router;
