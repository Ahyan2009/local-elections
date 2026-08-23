import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert('براہ کرم ای میل اور پاس ورڈ درج کریں۔');
      return;
    }

    try {
      setLoading(true);
      const res = await API.post('/admin/login', { email, password });
      
      if (res.data.success || res.data.token) {
        localStorage.setItem('token', res.data.token);
        alert('خوش آمدید! لاگ ان کامیاب رہا۔');
        navigate('/admin/dashboard');
      } else {
        alert(res.data.message || 'غلط ای میل یا پاس ورڈ!');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'غلط ای میل یا پاس ورڈ!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-100 flex items-center justify-center p-4 text-slate-900" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 text-white py-3 text-center text-sm font-bold tracking-wide">
          ایڈمن لاگ ان
        </div>

        <div className="p-8 space-y-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 text-emerald-800 font-bold text-xl rounded-xl mx-auto shadow-sm">
            PK
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-bold text-slate-800">مقامی حکومت انتخابات</h1>
            <p className="text-emerald-700 font-semibold text-sm">ایڈمن پورٹل</p>
            <p className="text-xs text-slate-500 pt-1">سسٹم میں داخل ہونے کے لیے اپنی تفصیلات درج کریں۔</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-right">
            <div className="space-y-1">
              <label className="text-xs text-slate-600 font-medium block">ای میل درج کریں</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="مثال: admin@system.gov.pk"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition text-right"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-600 font-medium block">پاس ورڈ</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition text-right"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-medium py-3 rounded-lg transition duration-200 text-sm shadow-md mt-2 disabled:opacity-60"
            >
              {loading ? 'لاگ ان ہو رہا ہے...' : 'لاگ ان کریں'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
