import express from 'express';
import {
  adminLogin,
  getAllCandidates,
  updateCandidateStatus,
  deleteCandidate,
} from '../controllers/adminController.js';
import protectAdmin from '../middleware/auth.js';

const router = express.Router();

// Public - login ke liye token ki zaroorat nahi
router.post('/login', adminLogin);

// Protected - inhe sirf valid token ke saath access kiya ja sakta hai
router.get('/candidates', protectAdmin, getAllCandidates);
router.put('/candidate/:id/status', protectAdmin, updateCandidateStatus);
router.delete('/candidate/:id', protectAdmin, deleteCandidate);

export default router;
