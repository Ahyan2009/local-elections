import Admin from '../models/Admin.js';
import Candidate from '../models/Candidate.js';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/sendEmail.js';

// 1. Admin Login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const validEmail = process.env.ADMIN_EMAIL;
    const validPassword = process.env.ADMIN_PASSWORD;

    if (email === validEmail && password === validPassword) {
      const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET || 'secretkey', {
        expiresIn: '1d',
      });
      return res.status(200).json({
        success: true,
        message: 'لاگ ان کامیاب رہا',
        token
      });
    }

    res.status(401).json({
      success: false,
      message: 'غلط ای میل یا پاس ورڈ'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 2. Get All Candidates
export const getAllCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });
    res.status(200).json(candidates);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 3. Update Status + Send OTP
export const updateCandidateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    let updateFields = { status };

    if (status === 'approved') {
      const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
      updateFields.otpCode = generatedOTP;
      updateFields.isOtpVerified = false;

      const candidateToEmail = await Candidate.findById(req.params.id);
      if (candidateToEmail && candidateToEmail.email) {
        try {
          await sendEmail(candidateToEmail.email, generatedOTP);
          console.log(`OTP ${generatedOTP} sent to ${candidateToEmail.email}`);
        } catch (mailErr) {
          console.error('Email send failed:', mailErr.message);
          const candidate = await Candidate.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { new: true }
          );
          return res.status(200).json({
            success: true,
            message: `OTP generate ہو گیا (${generatedOTP}) لیکن ای میل بھیجنے میں مسئلہ آیا۔ براہ کرم OTP دستی طور پر شیئر کریں۔`,
            candidate,
            otp: generatedOTP
          });
        }
      }
    }

    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'امیدوار نہیں ملا'
      });
    }

    res.status(200).json({
      success: true,
      message: status === 'approved'
        ? 'درخواست منظور کر لی گئی ہے اور OTP ای میل پر بھیج دیا گیا ہے!'
        : 'درخواست کا اسٹیٹس تبدیل ہو گیا ہے!',
      candidate
    });
  } catch (error) {
    console.error('Error in updateCandidateStatus:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'سرور ایرر: اسٹیٹس اپ ڈیٹ نہیں ہو سکا'
    });
  }
};

// 4. Delete Candidate
export const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'امیدوار نہیں ملا',
      });
    }
    res.status(200).json({
      success: true,
      message: 'امیدوار کامیابی سے حذف کر دیا گیا ہے',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'حذف نہیں ہو سکا',
    });
  }
};