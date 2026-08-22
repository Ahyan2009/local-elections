import Candidate from '../models/Candidate.js';

// 1. Request OTP
export const requestOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : '';

    if (!cleanEmail) {
      return res.status(400).json({ success: false, message: 'برائے مہربانی ای میل درج کریں' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'درست ای میل ایڈریس درج کریں' });
    }

    let candidate = await Candidate.findOne({ email: cleanEmail });

    if (candidate) {
      if (candidate.status === 'approved') {
        return res.status(200).json({
          success: true,
          message: 'ایڈمن نے آپ کی درخواست منظور کر لی ہے۔ برائے مہربانی OTP درج کریں۔',
        });
      }
      if (candidate.status === 'pending_approval' || candidate.status === 'pending') {
        return res.status(200).json({
          success: true,
          message: 'آپ کی درخواست پہلے سے زیرِ غور ہے۔ ایڈمن OTP بھیجے گا تو یہاں درج کریں۔',
        });
      }
      if (candidate.status === 'rejected') {
        candidate.status = 'pending_approval';
        candidate.otpCode = null;
        candidate.isOtpVerified = false;
        await candidate.save();
        return res.status(200).json({
          success: true,
          message: 'درخواست دوبارہ بھیج دی گئی ہے۔ ایڈمن کی منظوری کا انتظار کریں۔',
        });
      }
    }

    candidate = new Candidate({
      email: cleanEmail,
      status: 'pending_approval',
    });

    await candidate.save();

    res.status(201).json({
      success: true,
      message: 'درخواست کامیابی سے بھیج دی گئی ہے! ایڈمن کی منظوری کا انتظار کریں۔ OTP ملنے پر یہاں درج کریں۔',
    });
  } catch (error) {
    console.error('Error in requestOTP:', error);
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        message: 'آپ کی درخواست پہلے سے موجود ہے۔ ایڈمن OTP بھیجے گا تو یہاں درج کریں۔',
      });
    }
    res.status(500).json({ success: false, message: 'سرور ایرر: درخواست نہیں بھیجی جا سکی' });
  }
};

// 2. Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const cleanOTP = otp ? otp.toString().trim() : '';

    if (!cleanEmail || !cleanOTP) {
      return res.status(400).json({ success: false, message: 'ای میل اور OTP دونوں درج کریں' });
    }

    const candidate = await Candidate.findOne({ email: cleanEmail });

    if (!candidate) {
      return res.status(404).json({ success: false, message: 'ای میل ریکارڈ میں نہیں ملی' });
    }

    if (candidate.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'ابھی ایڈمن نے آپ کی درخواست منظور نہیں کی۔ OTP بھیجنے کا انتظار کریں۔',
      });
    }

    if (candidate.otpCode && candidate.otpCode.toString().trim() === cleanOTP) {
      candidate.isOtpVerified = true;
      await candidate.save();
      return res.status(200).json({ success: true, message: 'OTP تصدیق ہو گئی ہے!' });
    } else {
      return res.status(400).json({ success: false, message: 'غلط OTP کوڈ! دوبارہ کوشش کریں۔' });
    }
  } catch (error) {
    console.error('Error in verifyOTP:', error);
    res.status(500).json({ success: false, message: 'سرور ایرر: تصدیق نہیں ہو سکی' });
  }
};

// 3. Register Candidate
export const registerCandidate = async (req, res) => {
  try {
    const { email, fullName, cnic, phone, district, tehsil, unionCouncil, electionSymbol } = req.body;
    const candidate = await Candidate.findOneAndUpdate(
      { email: email?.trim()?.toLowerCase() },
      { fullName, cnic, phone, district, tehsil, unionCouncil, electionSymbol, status: 'pending' },
      { new: true }
    );
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'امیدوار نہیں ملا' });
    }
    res.status(200).json({ success: true, candidate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
