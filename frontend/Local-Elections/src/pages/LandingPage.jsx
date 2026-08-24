import React, { useState } from 'react';
import API from '../api/axios';

const LandingPage = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const res = await API.post('/candidate/request-otp', { email });
      setMessage(res.data.message || 'درخواست بھیج دی گئی ہے! ایڈمن کی منظوری کے بعد OTP یہاں درج کریں۔');
      setIsError(false);
      setStep(2);
    } catch (err) {
      setMessage(err.response?.data?.message || 'ایرر: درخواست نہیں بھیجی جا سکی');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const res = await API.post('/candidate/verify-otp', { email, otp });

      if (res.data.success) {
        setMessage('OTP تصدیق ہو گئی ہے! اب اپنا رجسٹریشن فارم مکمل کریں۔');
        setIsError(false);
        setTimeout(() => {
          window.location.href = `/register-candidate?email=${encodeURIComponent(email)}`;
        }, 1200);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'غلط OTP! دوبارہ کوشش کریں۔');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6 text-right space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 text-center">
          {step === 1 ? 'امیدوار رجسٹریشن درخواست' : 'OTP تصدیق'}
        </h2>

        <p className="text-sm text-gray-600 text-center">
          {step === 1
            ? 'پہلے اپنی ای میل سے درخواست بھیجیں۔ ایڈمن کی منظوری کے بعد آپ کو ای میل پر OTP ملے گا۔'
            : 'ایڈمن نے OTP بھیجا ہو تو نیچے 6 ہندسوں کا کوڈ درج کریں۔'}
        </p>

        {message && (
          <div
            className={`p-3 text-sm rounded-lg text-center ${
              isError ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
            }`}
          >
            {message}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleRequestSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">ای میل</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600 text-left"
                dir="ltr"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'بھیج رہا ہے...' : 'درخواست بھیجیں'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">OTP کوڈ</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600 text-center tracking-widest font-mono"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'تصدیق ہو رہی ہے...' : 'OTP تصدیق کریں'}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              ← واپس جائیں
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
