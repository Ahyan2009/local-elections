import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import AdminLayout from '../components/AdminLayout';

const CandidateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCandidate = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await API.get('/admin/candidates', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = response.data || [];
      const found = list.find((c) => c._id === id);
      if (found) setCandidate(found);
      else setError('امیدوار نہیں ملا');
    } catch (err) {
      console.error(err);
      setError('ڈیٹا لوڈ نہیں ہو سکا');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCandidate();
    else {
      setError('کوئی ID نہیں ملی');
      setLoading(false);
    }
  }, [id]);

  const handleStatusUpdate = async (status) => {
    const msg =
      status === 'approved'
        ? 'کیا آپ اس امیدوار کو منظور کرنا چاہتے ہیں؟'
        : 'کیا آپ اس امیدوار کو مسترد کرنا چاہتے ہیں؟';
    if (!window.confirm(msg)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await API.put(
        `/admin/candidate/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message || 'اسٹیٹس اپ ڈیٹ ہو گیا');
      fetchCandidate();
    } catch (err) {
      alert(err.response?.data?.message || 'اسٹیٹس تبدیل نہیں ہو سکا');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('کیا آپ واقعی حذف کرنا چاہتے ہیں؟')) return;
    try {
      const token = localStorage.getItem('token');
      await API.delete(`/admin/candidate/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('حذف ہو گیا');
      navigate('/admin/candidates');
    } catch (err) {
      alert(err.response?.data?.message || 'حذف نہیں ہو سکا');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const statusText = (() => {
    const s = (candidate?.status || '').toLowerCase();
    if (s.includes('approved')) return 'منظور شدہ';
    if (s.includes('rejected')) return 'مسترد';
    return 'زیرِ غور';
  })();

  return (
    <AdminLayout title="امیدوار کی تفصیل">
      <style>{`
        @media print {
          header, aside, .no-print, .md\\:flex > aside { display: none !important; }
          main { margin: 0 !important; padding: 0 !important; }
          body { background: white !important; color: black !important; }
          .print-card { box-shadow: none !important; border: 2px solid #333 !important; background: white !important; color: black !important; }
        }
      `}</style>

      <div className="max-w-3xl mx-auto space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-700 pb-4 gap-3 no-print">
          <h1 className="text-xl sm:text-2xl font-bold">امیدوار کی تفصیل</h1>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handlePrint}
              className="text-sm bg-sky-600 hover:bg-sky-700 px-3 sm:px-4 py-2 rounded-lg"
            >
              🖨️ پرنٹ / کارڈ
            </button>
            <button
              onClick={() => navigate('/admin/candidates')}
              className="text-sm bg-slate-700 hover:bg-slate-600 px-3 sm:px-4 py-2 rounded-lg"
            >
              ← واپس
            </button>
          </div>
        </div>

        {loading && <div className="text-center text-slate-400 py-12">لوڈ ہو رہا ہے...</div>}
        {error && !loading && <div className="text-center text-red-400 py-12">{error}</div>}

        {candidate && !loading && (
          <>
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 sm:p-6 space-y-6 print-card">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-slate-700 overflow-hidden border-2 border-slate-600 flex items-center justify-center shrink-0">
                  {candidate.image ? (
                    <img
                      src={candidate.image}
                      alt={candidate.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl text-emerald-400 font-bold">
                      {(candidate.fullName || '?').charAt(0)}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold break-words">
                    {candidate.fullName || '---'}
                  </h2>
                  <p className="text-slate-400 text-sm mt-1 break-all" dir="ltr">
                    {candidate.email}
                  </p>
                  <span
                    className={`inline-block mt-2 px-3 py-1 rounded text-xs ${
                      statusText === 'منظور شدہ'
                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600'
                        : statusText === 'مسترد'
                        ? 'bg-red-600/20 text-red-400 border border-red-600'
                        : 'bg-amber-600/20 text-amber-400 border border-amber-600'
                    }`}
                  >
                    {statusText}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                <div className="bg-slate-900/50 p-3 sm:p-4 rounded-xl">
                  <p className="text-slate-400 mb-1">شناختی کارڈ (CNIC)</p>
                  <p className="font-medium break-all" dir="ltr">
                    {candidate.cnic || '---'}
                  </p>
                </div>
                <div className="bg-slate-900/50 p-3 sm:p-4 rounded-xl">
                  <p className="text-slate-400 mb-1">فون نمبر</p>
                  <p className="font-medium break-all" dir="ltr">
                    {candidate.phone || '---'}
                  </p>
                </div>
                <div className="bg-slate-900/50 p-3 sm:p-4 rounded-xl">
                  <p className="text-slate-400 mb-1">ضلع</p>
                  <p className="font-medium">{candidate.district || '---'}</p>
                </div>
                <div className="bg-slate-900/50 p-3 sm:p-4 rounded-xl">
                  <p className="text-slate-400 mb-1">تحصیل</p>
                  <p className="font-medium">{candidate.tehsil || '---'}</p>
                </div>
                <div className="bg-slate-900/50 p-3 sm:p-4 rounded-xl">
                  <p className="text-slate-400 mb-1">یونین کونسل (UC)</p>
                  <p className="font-medium">
                    {candidate.unionCouncil || candidate.uc || '---'}
                  </p>
                </div>
                <div className="bg-slate-900/50 p-3 sm:p-4 rounded-xl">
                  <p className="text-slate-400 mb-1">انتخابی نشان</p>
                  <div className="flex items-center gap-2 mt-1">
                    {candidate.symbolIcon && (
                      <img
                        src={candidate.symbolIcon}
                        alt={candidate.electionSymbol}
                        className="w-8 h-8 object-contain filter brightness-200"
                      />
                    )}
                    <span className="font-medium">{candidate.electionSymbol || '---'}</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-500 border-t border-slate-700 pt-4">
                رجسٹریشن تاریخ:{' '}
                {candidate.createdAt
                  ? new Date(candidate.createdAt).toLocaleString('ur-PK')
                  : '---'}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3 no-print">
              {statusText !== 'منظور شدہ' && (
                <button
                  onClick={() => handleStatusUpdate('approved')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 sm:px-5 py-2.5 rounded-xl text-sm font-medium"
                >
                  ✓ منظور کریں
                </button>
              )}
              {statusText !== 'مسترد' && (
                <button
                  onClick={() => handleStatusUpdate('rejected')}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-4 sm:px-5 py-2.5 rounded-xl text-sm font-medium"
                >
                  ✕ مسترد کریں
                </button>
              )}
              <button
                onClick={handleDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white px-4 sm:px-5 py-2.5 rounded-xl text-sm font-medium"
              >
                🗑️ حذف کریں
              </button>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default CandidateDetails;
