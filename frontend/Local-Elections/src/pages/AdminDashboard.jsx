import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink, useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCandidates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/candidates', {
        headers: { Authorization: `Bearer ${token}` }
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
      const response = await axios.put(
        `http://localhost:5000/api/admin/candidate/${id}/status`,
        { status }
      );
      alert(response.data.message);
      fetchCandidates();
    } catch (error) {
      alert(error.response?.data?.message || 'ایرر پیش آگیا');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    alert('لاگ آؤٹ ہو گیا ہے');
    navigate('/login');
  };

  const totalCount = candidates.length;
  const approvedCount = candidates.filter(
    (c) => (c.status || '').toLowerCase().includes('approved')
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

  const navItems = [
    { name: 'ڈیش بورڈ (Dashboard)', path: '/admin/dashboard', icon: '📊' },
    { name: 'درخواستیں (Requests)', path: '/admin/requests', icon: '📩' },
    { name: 'تمام امیدوار (Candidates)', path: '/admin/candidates', icon: '👥' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-900 text-white" dir="rtl">
      <aside className="w-64 bg-slate-800 border-l border-slate-700 min-h-screen p-4 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-3 p-3 border-b border-slate-700 mb-6">
            <div className="bg-emerald-600 text-white p-2 rounded-lg font-bold text-lg">ایڈمن</div>
            <div>
              <h2 className="font-bold text-base text-white">انتخابات سسٹم</h2>
              <p className="text-xs text-slate-400">Admin Control Panel</p>
            </div>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-600 text-white font-medium shadow-md'
                      : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="pt-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl text-sm font-medium transition duration-200 shadow-md"
          >
            <span>🚪</span>
            <span>لاگ آؤٹ (Logout)</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="border-b border-slate-700 pb-4 text-right">
            <h1 className="text-2xl font-bold">ایڈمن ڈیش بورڈ</h1>
            <p className="text-sm text-slate-400 mt-1">درخواستوں اور امیدواروں کا مجموعی جائزہ</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-right">
            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">کل ریکارڈز</p>
              <span className="text-3xl font-bold text-blue-400">{totalCount}</span>
            </div>
            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">مکمل پروفائلز</p>
              <span className="text-3xl font-bold text-cyan-400">{completeProfiles}</span>
            </div>
            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">منظور شدہ</p>
              <span className="text-3xl font-bold text-emerald-400">{approvedCount}</span>
            </div>
            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">زیرِ غور</p>
              <span className="text-3xl font-bold text-amber-400">{pendingCount}</span>
            </div>
            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">مسترد</p>
              <span className="text-3xl font-bold text-rose-400">{rejectedCount}</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/admin/requests')}
              className="bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl p-5 text-right transition"
            >
              <p className="text-lg font-bold">📩 درخواستیں دیکھیں</p>
              <p className="text-xs text-slate-400 mt-1">OTP بھیجیں / مسترد کریں</p>
            </button>
            <button
              onClick={() => navigate('/admin/candidates')}
              className="bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl p-5 text-right transition"
            >
              <p className="text-lg font-bold">👥 تمام امیدوار</p>
              <p className="text-xs text-slate-400 mt-1">فہرست، سرچ، ایکسپورٹ</p>
            </button>
          </div>

          {/* Recent pending requests */}
          <div className="bg-slate-800 rounded-lg p-5 border border-slate-700 space-y-4">
            <h2 className="text-lg font-bold border-b border-slate-700 pb-2">
              حالیہ زیرِ غور درخواستیں
            </h2>

            {loading ? (
              <p className="text-gray-400 text-center py-4">ڈیٹا لوڈ ہو رہا ہے...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm text-gray-300">
                  <thead className="bg-slate-900 text-gray-400">
                    <tr>
                      <th className="p-3">ای میل</th>
                      <th className="p-3">اسٹیٹس</th>
                      <th className="p-3">ایکشن</th>
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
                          <td className="p-3" dir="ltr">
                            {c.email}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-1 rounded text-xs bg-amber-900 text-amber-300">
                              {c.status}
                            </span>
                          </td>
                          <td className="p-3 flex gap-2">
                            <button
                              onClick={() => handleStatusUpdate(c._id, 'approved')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-xs"
                            >
                              Send OTP
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(c._id, 'rejected')}
                              className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded text-xs"
                            >
                              Cancel
                            </button>
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
      </main>
    </div>
  );
};

export default AdminDashboard;
