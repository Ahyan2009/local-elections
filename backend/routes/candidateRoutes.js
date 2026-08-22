import express from 'express';
import multer from 'multer';
import { requestOTP, verifyOTP } from '../controllers/candidateController.js';
import Candidate from '../models/Candidate.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/request-otp', requestOTP);
router.post('/verify-otp', verifyOTP);

router.post('/register', upload.single('image'), async (req, res) => {
  try {
    const {
      email,
      fullName,
      cnic,
      phone,
      district,
      tehsil,
      unionCouncil,
      electionSymbol,
      symbolIcon,
    } = req.body;

    const profileImage = req.file;

    if (!email) {
      return res.status(400).json({ message: 'ای میل ایڈریس ضروری ہے۔' });
    }

    // CNIC unique check
    if (cnic && cnic.trim()) {
      const existingCnic = await Candidate.findOne({
        cnic: cnic.trim(),
        email: { $ne: email.trim().toLowerCase() },
      });
      if (existingCnic) {
        return res.status(400).json({
          message: 'یہ شناختی کارڈ نمبر (CNIC) پہلے سے رجسٹرڈ ہے۔',
        });
      }
    }

    const updateData = {
      fullName: fullName || 'Pending',
      cnic: cnic || null,
      phone: phone || 'Pending',
      district: district || 'Pending',
      tehsil: tehsil || 'Pending',
      unionCouncil: unionCouncil || 'Pending',
      electionSymbol: electionSymbol || 'Pending',
      symbolIcon: symbolIcon || null,
      status: 'pending',
    };

    if (profileImage) {
      const base64 = profileImage.buffer.toString('base64');
      const mime = profileImage.mimetype || 'image/jpeg';
      updateData.image = `data:${mime};base64,${base64}`;
    }

    const candidate = await Candidate.findOneAndUpdate(
      { email: email.trim().toLowerCase() },
      updateData,
      { new: true }
    );

    if (!candidate) {
      return res.status(404).json({
        message: 'پہلے OTP کی تصدیق کریں یا درخواست بھیجیں۔',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'امیدوار کی رجسٹریشن کامیابی سے ہو گئی ہے۔',
      candidate,
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({
      message: error.message || 'سرور میں خرابی ہے۔',
    });
  }
});

// Public: approved candidates only (complete profiles)
router.get('/public', async (req, res) => {
  try {
    const candidates = await Candidate.find({
      status: 'approved',
      fullName: { $nin: [null, '', 'Pending'] },
      district: { $nin: [null, '', 'Pending'] },
    }).sort({ createdAt: -1 });

    res.status(200).json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
