import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../api/axios';

const OtpVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Home page se pass ki gayi email get karna
  const email = location.state?.email || '';
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp) return alert('براہ کرم OTP کوڈ درج کریں۔');

    try {
      setLoading(true);
      // Backend verify OTP API hit
      await API.post('/candidate/verify-otp', { email, otp });
      
      alert('OTP کی تصدیق کامیابی سے ہو گئی ہے!');
      
      // Verification ke baad candidate registration form par redirect
     navigate(`/register-candidate?email=${encodeURIComponent(email)}`);
    } catch (error) {
      alert(error.response?.data?.message || 'غلط OTP کوڈ! دوبارہ کوشش کریں۔');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-100 flex items-center justify-center p-4 text-slate-900" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center space-y-6">
        
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-800">OTP کی تصدیق کریں</h2>
          <p className="text-xs text-slate-500">
            ہم نے <b>{email || 'آپ کی ای میل'}</b> پر تصدیقی کوڈ بھیجا ہے۔
          </p>
          <p className="text-xs text-emerald-600 font-semibold pt-1">
            (ٹیسٹنگ کے لیے 123456 درج کریں)
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-1 text-right">
            <label className="text-xs text-slate-600 font-medium block">6 ہندسوں کا OTP کوڈ</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              className="w-full text-center tracking-widest text-lg px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-emerald-600 font-mono"
              maxLength="6"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-medium py-3 rounded-lg transition duration-200 text-sm shadow-md disabled:opacity-50"
          >
            {loading ? 'تصدیق ہو رہی ہے...' : 'کوڈ کی تصدیق کریں'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default OtpVerification;