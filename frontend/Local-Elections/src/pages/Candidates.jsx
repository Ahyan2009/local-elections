import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { NavLink, useNavigate } from 'react-router-dom';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [layoutName, setLayoutName] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
  const keyboardRef = useRef(null);
  const navigate = useNavigate();

  const urduLayout = {
    default: [
      'آ ا ب پ ت ٹ ث ج چ ح خ د ڈ ذ',
      'ر ڑ ز ژ س ش ص ض ط ظ ع غ ف',
      'ق ک گ ل م ن ں و ہ ھ ء ی ے',
      '{shift} {space} {bksp}'
    ],
    shift: [
      '! @ # $ % ^ & * ( ) _ +',
      '۱ ۲ ۳ ۴ ۵ ۶ ۷ ۸ ۹ ۰ - =',
      '؟ : " { } | < >',
      '{shift} {space} {bksp}'
    ]
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
    setCurrentPage(1);
    if (keyboardRef.current) keyboardRef.current.setInput(value);
  };

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/candidates', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const validRealCandidates = (response.data || []).filter((item) => {
        if (!item) return false;
        const name = item.fullName || item.name || '';
        const district = item.district || '';
        const cnic = item.cnic || '';
        const isNameValid = name.trim() !== '' && !name.toLowerCase().includes('test') && !name.toLowerCase().includes('dummy');
        const isDistrictValid = district.trim() !== '' && district !== 'Pending' && district !== 'null';
        const isCnicValid = cnic.trim() !== '' && cnic !== 'Pending';
        return isNameValid && isDistrictValid && isCnicValid;
      });

      setCandidates(validRealCandidates);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    alert('لاگ آؤٹ ہو گیا ہے');
    navigate('/login');
  };

  const handleStatusUpdate = async (id, status) => {
    const confirmMsg =
      status === 'approved'
        ? 'کیا آپ اس امیدوار کو منظور کرنا چاہتے ہیں؟'
        : 'کیا آپ اس امیدوار کو مسترد کرنا چاہتے ہیں؟';
    if (!window.confirm(confirmMsg)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `http://localhost:5000/api/admin/candidate/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message || 'اسٹیٹس اپ ڈیٹ ہو گیا');
      fetchCandidates();
    } catch (error) {
      alert(error.response?.data?.message || 'اسٹیٹس تبدیل نہیں ہو سکا');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('کیا آپ واقعی اس امیدوار کو حذف کرنا چاہتے ہیں؟ یہ عمل واپس نہیں ہو سکتا۔')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/candidate/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('امیدوار حذف کر دیا گیا');
      fetchCandidates();
    } catch (error) {
      alert(error.response?.data?.message || 'حذف نہیں ہو سکا');
    }
  };

  // Search: name, district, UC, CNIC, phone
  const filteredCandidates = candidates.filter((item) => {
    const name = (item.fullName || item.name || '').toLowerCase();
    const district = (item.district || '').toLowerCase();
    const uc = (item.unionCouncil || item.uc || '').toString().toLowerCase();
    const cnic = (item.cnic || '').toString().toLowerCase();
    const phone = (item.phone || '').toString().toLowerCase();
    const q = searchTerm.toLowerCase();

    const matchesSearch =
      !q ||
      name.includes(q) ||
      district.includes(q) ||
      uc.includes(q) ||
      cnic.includes(q) ||
      phone.includes(q);

    const rawStatus = (item.status || '').toLowerCase();
    const isPending = rawStatus.includes('pending') || rawStatus === 'زیرِ غور';
    const isApproved = rawStatus.includes('approved') || rawStatus === 'منظور شدہ';
    const isRejected = rawStatus.includes('rejected') || rawStatus === 'مسترد';

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && isPending) ||
      (statusFilter === 'approved' && isApproved) ||
      (statusFilter === 'rejected' && isRejected);

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / perPage));
  const paginated = filteredCandidates.slice((currentPage - 1) * perPage, currentPage * perPage);

  // Export CSV (Excel compatible)
  const handleExport = () => {
    const headers = ['نام', 'CNIC', 'فون', 'ای میل', 'ضلع', 'تحصیل', 'UC', 'انتخابی نشان', 'حیثیت'];
    const rows = filteredCandidates.map((c) => [
      c.fullName || c.name || '',
      c.cnic || '',
      c.phone || '',
      c.email || '',
      c.district || '',
      c.tehsil || '',
      c.unionCouncil || c.uc || '',
      c.electionSymbol || '',
      c.status || '',
    ]);
    const csvContent =
      '\uFEFF' +
      [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidates_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
          <div className="flex flex-wrap justify-between items-center border-b border-slate-700 pb-4 gap-3">
            <h1 className="text-2xl font-bold">ایڈمن - تمام امیدواروں کی فہرست</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                className="bg-sky-600 hover:bg-sky-700 text-white text-xs px-4 py-2 rounded-lg font-medium"
              >
                📥 Excel Export
              </button>
              <span className="bg-emerald-600 text-xs px-3 py-1 rounded-full">
                کل امیدوار: {filteredCandidates.length}
              </span>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-wrap gap-4 justify-between items-center">
            <div className="w-full md:w-1/3">
              <input
                type="text"
                placeholder="نام، CNIC، فون، ضلع یا UC سے تلاش کریں..."
                value={searchTerm}
                onFocus={handleSearchFocus}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-md text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-300">حیثیت:</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="all">تمام</option>
                <option value="pending">زیرِ غور (Pending)</option>
                <option value="approved">منظور شدہ (Approved)</option>
                <option value="rejected">مسترد شدہ (Rejected)</option>
              </select>
            </div>
          </div>

          {/* Urdu Keyboard */}
          {showKeyboard && (
            <>
              <style>{`
                .hg-theme-default {
                  background-color: #e2e8f0 !important;
                  border-radius: 10px !important;
                  padding: 10px !important;
                  border: 1px solid #94a3b8 !important;
                }
                .hg-theme-default .hg-button {
                  background: #ffffff !important;
                  color: #0f172a !important;
                  border-bottom: 2px solid #64748b !important;
                  height: 44px !important;
                  font-size: 17px !important;
                  font-weight: 600 !important;
                  border-radius: 6px !important;
                }
                .hg-theme-default .hg-button:hover,
                .hg-theme-default .hg-button:active {
                  background: #10b981 !important;
                  color: #ffffff !important;
                }
                .hg-theme-default .hg-button.hg-functionBtn {
                  background: #cbd5e1 !important;
                  color: #0f172a !important;
                  font-size: 13px !important;
                  font-weight: 700 !important;
                }
              `}</style>
              <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 shadow-inner">
                <div className="flex justify-between items-center mb-2 px-1">
                  <span className="text-xs font-semibold text-emerald-400">اردو کی بورڈ</span>
                  <button
                    type="button"
                    onClick={() => setShowKeyboard(false)}
                    className="text-xs text-rose-400 hover:underline font-bold"
                  >
                    بند کریں ✕
                  </button>
                </div>
                <Keyboard
                  keyboardRef={(r) => (keyboardRef.current = r)}
                  layoutName={layoutName}
                  layout={urduLayout}
                  onChange={onKeyboardChange}
                  onKeyPress={handleKeyPress}
                  theme="hg-theme-default hg-layout-default"
                  display={{
                    '{bksp}': 'Back ⌫',
                    '{space}': 'Space ␣',
                    '{shift}': 'Shift ⇧',
                  }}
                />
              </div>
            </>
          )}

          {/* Table */}
          <div className="bg-slate-800 rounded-lg shadow-md overflow-hidden border border-slate-700">
            {loading ? (
              <div className="p-6 text-center text-gray-400">ڈیٹا لوڈ ہو رہا ہے...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-slate-950 text-gray-300 border-b border-slate-700">
                    <tr>
                      <th className="p-3">نمبر</th>
                      <th className="p-3">تصویر</th>
                      <th className="p-3">نام</th>
                      <th className="p-3">ضلع</th>
                      <th className="p-3">تحصیل</th>
                      <th className="p-3">UC</th>
                      <th className="p-3">انتخابی نشان</th>
                      <th className="p-3">حیثیت</th>
                      <th className="p-3 text-center">کارروائی</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {paginated.map((item, index) => {
                      const rawStatus = (item.status || '').toLowerCase();
                      const isApproved = rawStatus.includes('approved');
                      const isRejected = rawStatus.includes('rejected');
                      const statusText = isApproved ? 'منظور شدہ' : isRejected ? 'مسترد' : 'زیرِ غور';
                      const candidateName = item.fullName || item.name;
                      const userImage = item.imageUrl || item.image || item.photo;

                      return (
                        <tr key={item._id || index} className="hover:bg-slate-750 transition">
                          <td className="p-3">{(currentPage - 1) * perPage + index + 1}</td>
                          <td className="p-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-700 overflow-hidden flex items-center justify-center text-xs font-bold text-emerald-400 border border-slate-600">
                              {userImage ? (
                                <img src={userImage} alt={candidateName} className="w-full h-full object-cover" />
                              ) : (
                                (candidateName || '?').charAt(0)
                              )}
                            </div>
                          </td>
                          <td className="p-3 font-semibold">{candidateName}</td>
                          <td className="p-3">{item.district}</td>
                          <td className="p-3">{item.tehsil}</td>
                          <td className="p-3">{item.unionCouncil || item.uc}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {item.symbolIcon && (
                                <img
                                  src={item.symbolIcon}
                                  alt={item.electionSymbol}
                                  className="w-6 h-6 object-contain filter brightness-200"
                                />
                              )}
                              <span className="text-xs">{item.electionSymbol || '---'}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                statusText === 'منظور شدہ'
                                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600'
                                  : statusText === 'مسترد'
                                  ? 'bg-red-600/20 text-red-400 border border-red-600'
                                  : 'bg-amber-600/20 text-amber-400 border border-amber-600'
                              }`}
                            >
                              {statusText}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1 justify-center">
                              <button
                                onClick={() => navigate(`/admin/candidates/${item._id}`)}
                                className="bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded text-xs"
                              >
                                تفصیل
                              </button>
                              {!isApproved && (
                                <button
                                  onClick={() => handleStatusUpdate(item._id, 'approved')}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded text-xs"
                                >
                                  منظور
                                </button>
                              )}
                              {!isRejected && (
                                <button
                                  onClick={() => handleStatusUpdate(item._id, 'rejected')}
                                  className="bg-amber-600 hover:bg-amber-700 text-white px-2 py-1 rounded text-xs"
                                >
                                  مسترد
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(item._id)}
                                className="bg-rose-600 hover:bg-rose-700 text-white px-2 py-1 rounded text-xs"
                              >
                                حذف
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && filteredCandidates.length === 0 && (
              <div className="p-6 text-center text-gray-400">کوئی اصلی امیدوار موجود نہیں ہے۔</div>
            )}

            {/* Pagination */}
            {!loading && filteredCandidates.length > 0 && (
              <div className="flex items-center justify-center gap-2 p-4 border-t border-slate-700">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-3 py-1 rounded bg-slate-700 text-sm disabled:opacity-40"
                >
                  پچھلا
                </button>
                <span className="text-sm text-slate-300">
                  صفحہ {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-1 rounded bg-slate-700 text-sm disabled:opacity-40"
                >
                  اگلا
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Candidates;
