import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';

const PublicCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

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
          <p className="text-slate-500 text-sm">صرف ایڈمن کی طرف سے منظور شدہ امیدوار یہاں دکھائے جاتے ہیں</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
          <input
            type="text"
            placeholder="نام، ضلع، UC یا انتخابی نشان سے تلاش..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-80 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 shadow-sm"
          />
          <button
            onClick={() => navigate('/')}
            className="text-sm text-slate-600 hover:text-emerald-600 font-medium"
          >
            ← ہوم پیج
          </button>
        </div>

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
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center shrink-0">
                      {c.image ? (
                        <img src={c.image} alt={c.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-bold text-emerald-600">
                          {(c.fullName || '?').charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{c.fullName}</h3>
                      <p className="text-xs text-slate-500">{c.district} • {c.tehsil}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="bg-slate-50 rounded-lg p-2">
                      <span className="text-slate-400 block">UC</span>
                      {c.unionCouncil || '---'}
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <span className="text-slate-400 block">نشان</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        {c.symbolIcon && (
                          <img src={c.symbolIcon} alt="" className="w-5 h-5 object-contain" />
                        )}
                        <span>{c.electionSymbol || '---'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                      منظور شدہ
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
