import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';

const AdminDashboard = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCandidates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.get('/admin/candidates', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCandidates(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.put(
        `/admin/candidate/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.message);
      fetchCandidates();
    } catch (error) {
      alert(error.response?.data?.message || 'ایرر پیش آگیا');
    }
  };

  const totalCount = candidates.length;
  const approvedCount = candidates.filter((c) =>
    (c.status || '').toLowerCase().includes('approved')
  ).length;
  const pendingCount = candidates.filter((c) => {
    const s = (c.status || '').toLowerCase();
    return s.includes('pending') || s === 'زیرِ غور';
  }).length;
  const rejectedCount = candidates.filter((c) =>
    (c.status || '').toLowerCase().includes('rejected')
  ).length;
  const completeProfiles = candidates.filter(
    (c) =>
      c.fullName &&
      c.fullName !== 'Pending' &&
      c.district &&
      c.district !== 'Pending'
  ).length;

  const stats = [
    { label: 'کل امیدوار', value: totalCount, color: 'bg-sky-600' },
    { label: 'منظور شدہ', value: approvedCount, color: 'bg-emerald-600' },
    { label: 'زیرِ غور', value: pendingCount, color: 'bg-amber-600' },
    { label: 'مسترد', value: rejectedCount, color: 'bg-rose-600' },
    { label: 'مکمل پروفائل', value: completeProfiles, color: 'bg-violet-600' },
  ];

  return (
    <AdminLayout title="ڈیش بورڈ">
      <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
        <div className="border-b border-slate-700 pb-4">
          <h1 className="text-xl sm:text-2xl font-bold">ایڈمن ڈیش بورڈ</h1>
          <p className="text-sm text-slate-400 mt-1">انتخابات سسٹم — مجموعی جائزہ</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-slate-800 border border-slate-700 rounded-xl p-3 sm:p-4 text-center"
            >
              <div
                className={`${s.color} w-10 h-10 sm:w-12 sm:h-12 rounded-full mx-auto flex items-center justify-center text-lg sm:text-xl font-bold mb-2`}
              >
                {s.value}
              </div>
              <p className="text-xs sm:text-sm text-slate-300">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/requests')}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg"
          >
            درخواستیں دیکھیں
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/candidates')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg"
          >
            تمام امیدوار
          </button>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="px-3 sm:px-4 py-3 border-b border-slate-700 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold text-sm sm:text-base">زیرِ غور درخواستیں</h2>
            <span className="text-xs text-slate-400">آخری 8</span>
          </div>
          {loading ? (
            <div className="p-6 text-center text-gray-400 text-sm">ڈیٹا لوڈ ہو رہا ہے...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm text-gray-300 min-w-[400px]">
                <thead className="bg-slate-900 text-gray-400">
                  <tr>
                    <th className="p-2 sm:p-3 whitespace-nowrap">ای میل</th>
                    <th className="p-2 sm:p-3 whitespace-nowrap">اسٹیٹس</th>
                    <th className="p-2 sm:p-3 whitespace-nowrap">ایکشن</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates
                    .filter((c) => {
                      const s = (c.status || '').toLowerCase();
                      return s.includes('pending');
                    })
                    .slice(0, 8)
                    .map((c) => (
                      <tr key={c._id} className="border-b border-slate-700">
                        <td className="p-2 sm:p-3 font-mono text-xs break-all" dir="ltr">
                          {c.email}
                        </td>
                        <td className="p-2 sm:p-3">
                          <span className="px-2 py-1 rounded text-xs bg-amber-900 text-amber-300 whitespace-nowrap">
                            {c.status}
                          </span>
                        </td>
                        <td className="p-2 sm:p-3">
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => handleStatusUpdate(c._id, 'approved')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 sm:px-3 py-1 rounded text-xs"
                            >
                              Send OTP
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(c._id, 'rejected')}
                              className="bg-rose-600 hover:bg-rose-700 text-white px-2 sm:px-3 py-1 rounded text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {candidates.filter((c) =>
                (c.status || '').toLowerCase().includes('pending')
              ).length === 0 && (
                <p className="text-center text-slate-500 py-4 text-sm">
                  کوئی زیرِ غور درخواست نہیں
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
