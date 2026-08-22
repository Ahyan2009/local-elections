import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gradient-to-br from-slate-50 via-emerald-50/40 to-slate-100" dir="rtl">
      
      <div className="max-w-5xl mx-auto px-4 py-12 md:py-20">
        
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-semibold px-4 py-1.5 rounded-full border border-emerald-200">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            پنجاب مقامی حکومت انتخابات
          </span>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-l from-emerald-500 via-emerald-600 to-slate-800"></div>

          <div className="p-8 md:p-12 text-center space-y-8">
            
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                <span className="text-3xl">🇵🇰</span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 leading-tight">
                مقامی حکومت انتخابات پورٹل
              </h1>
              
              <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                یہ مقامی حکومت کے انتخابات کے لیے ایک محفوظ اور آسان پورٹل ہے۔ 
                یہاں امیدوار رجسٹریشن کی درخواست جمع کروا سکتے ہیں اور ایڈمن پورٹل کے ذریعے تمام 
                درخواستوں کی تصدیق اور منظوری کا عمل مکمل کیا جاتا ہے۔
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm text-slate-600">
                <span className="text-emerald-600">✓</span>
                محفوظ رجسٹریشن
              </div>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm text-slate-600">
                <span className="text-emerald-600">✓</span>
                OTP تصدیق
              </div>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm text-slate-600">
                <span className="text-emerald-600">✓</span>
                ایڈمن منظوری
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              
              <button
                onClick={() => navigate('/landingpage')}
                className="group relative w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>امیدوار درخواست بھیجیں</span>
                <span className="group-hover:-translate-x-1 transition-transform">←</span>
              </button>

              <button
                onClick={() => navigate('/candidates')}
                className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-800 font-semibold px-8 py-3.5 rounded-xl border-2 border-slate-200 hover:border-emerald-300 shadow-sm transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>منظور شدہ امیدوار دیکھیں</span>
              </button>

              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 text-white font-semibold px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>ایڈمن لاگ ان</span>
              </button>

            </div>

          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          تمام معلومات محفوظ ہیں • صرف تصدیق شدہ امیدوار ہی رجسٹر ہو سکتے ہیں
        </p>

      </div>
    </div>
  );
};

export default Home;
