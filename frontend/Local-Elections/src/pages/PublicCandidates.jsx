import React, { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';

const PublicCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [layoutName, setLayoutName] = useState('default');
  const keyboardRef = useRef(null);
  const navigate = useNavigate();

  const urduLayout = {
    default: [
      'آ ا ب پ ت ٹ ث ج چ ح خ د ڈ ذ',
      'ر ڑ ز ژ س ش ص ض ط ظ ع غ ف',
      'ق ک گ ل م ن ں و ہ ھ ء ی ے',
      '{shift} {space} {bksp}',
    ],
    shift: [
      '! @ # $ % ^ & * ( ) _ +',
      '۱ ۲ ۳ ۴ ۵ ۶ ۷ ۸ ۹ ۰ - =',
      '؟ : " { } | < >',
      '{shift} {space} {bksp}',
    ],
  };

  const handleKeyPress = (button) => {
    if (button === '{shift}') {
      setLayoutName((prev) => (prev === 'default' ? 'shift' : 'default'));
    }
  };

  const onKeyboardChange = (input) => setSearchTerm(input);

  const handleSearchFocus = () => {
    setShowKeyboard(true);
    if (keyboardRef.current) keyboardRef.current.setInput(searchTerm);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (keyboardRef.current) keyboardRef.current.setInput(value);
  };

  useEffect(() => {
    const fetchPublic = async () => {
      try {
        const res = await API.get('/candidate/public');
        setCandidates(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPublic();
  }, []);

  const filtered = candidates.filter((c) => {
    const q = searchTerm.toLowerCase();
    if (!q) return true;
    return (
      (c.fullName || '').toLowerCase().includes(q) ||
      (c.district || '').toLowerCase().includes(q) ||
      (c.unionCouncil || '').toString().toLowerCase().includes(q) ||
      (c.electionSymbol || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-800">منظور شدہ امیدواروں کی فہرست</h1>
          <p className="text-slate-500 text-sm">
            صرف ایڈمن کی طرف سے منظور شدہ امیدوار یہاں دکھائے جاتے ہیں
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
          <input
            type="text"
            placeholder="نام، ضلع، UC یا انتخابی نشان سے تلاش..."
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            className="w-full sm:w-80 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 shadow-sm"
            dir="rtl"
          />
          <button
            onClick={() => navigate('/')}
            className="text-sm text-slate-600 hover:text-emerald-600 font-medium"
          >
            ← ہوم پیج
          </button>
        </div>

        {showKeyboard && (
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-md max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-500">اردو کی بورڈ</span>
              <button
                type="button"
                onClick={() => setShowKeyboard(false)}
                className="text-xs text-rose-500 hover:text-rose-600 font-medium"
              >
                بند کریں
              </button>
            </div>
            <Keyboard
              keyboardRef={(r) => (keyboardRef.current = r)}
              layoutName={layoutName}
              layout={urduLayout}
              onChange={onKeyboardChange}
              onKeyPress={handleKeyPress}
              theme="hg-theme-default"
            />
          </div>
        )}

        {loading ? (
          <div className="text-center text-slate-400 py-16">لوڈ ہو رہا ہے...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-slate-400 py-16">کوئی منظور شدہ امیدوار نہیں ملا</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((c) => (
              <div
                key={c._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden"
              >
                <div className="h-1 bg-gradient-to-l from-emerald-500 to-emerald-700"></div>

                <div className="p-3">
                  {/* ===== ASLI BALLOT PAPER STYLE ROW ===== */}
                  <div
                    className="flex items-center justify-center border-2 border-slate-300 rounded-md px-4 py-1.5 bg-white gap-12"
                    dir="ltr"
                  >
                    {/* Symbol */}
                    <div className="w-10 h-10 shrink-0 flex items-center justify-center border-r border-slate-300 pr-4">
                      {c.symbolIcon ? (
                        <img
                          src={c.symbolIcon}
                          alt={c.electionSymbol || 'symbol'}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </div>

                    {/* Photo */}
                    <div className="w-10 h-10 shrink-0 rounded-sm overflow-hidden border border-slate-300 bg-slate-50 flex items-center justify-center">
                      {c.image ? (
                        <img
                          src={c.image}
                          alt={c.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-bold text-emerald-600">
                          {(c.fullName || '?').charAt(0)}
                        </span>
                      )}
                    </div>

                    {/* Name */}
                    <div className="text-right" dir="rtl">
                      <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-tight truncate max-w-[120px]">
                        {c.fullName || '---'}
                      </h3>
                    </div>
                  </div>

                  {/* UC + تحصیل */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mt-3">
                    <div className="bg-slate-50 rounded-lg p-2">
                      <span className="text-slate-400 block">UC</span>
                      {c.unionCouncil || '---'}
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <span className="text-slate-400 block">تحصیل</span>
                      {c.tehsil || '---'}
                    </div>
                  </div>

                  {/* Bottom */}
                  <div className="flex items-center justify-between pt-3">
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full font-medium">
                      منظور شدہ
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {c.district || ''}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicCandidates;