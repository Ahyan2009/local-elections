import React, { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import AdminLayout from '../components/AdminLayout';

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
      const response = await API.get('/admin/candidates', {
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


  const handleStatusUpdate = async (id, status) => {
    const confirmMsg =
      status === 'approved'
        ? 'کیا آپ اس امیدوار کو منظور کرنا چاہتے ہیں؟'
        : 'کیا آپ اس امیدوار کو مسترد کرنا چاہتے ہیں؟';
    if (!window.confirm(confirmMsg)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await API.put(
        `/admin/candidate/${id}/status`,
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
      await API.delete(`/admin/candidate/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('امیدوار حذف کر دیا گیا');
      fetchCandidates();
    } catch (error) {
      alert(error.response?.data?.message || 'حذف نہیں ہو سکا');
    }
  };

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

  const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / perPage));
  const paginated = filteredCandidates.slice((currentPage - 1) * perPage, currentPage * perPage);

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


  return (
    <AdminLayout title="تمام امیدواروں کی فہرست">
      <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:flex-wrap justify-between items-start sm:items-center border-b border-slate-700 pb-4 gap-3">
          <h1 className="text-xl sm:text-2xl font-bold">ایڈمن - تمام امیدواروں کی فہرست</h1>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={handleExport}
              className="bg-sky-600 hover:bg-sky-700 text-white text-xs px-3 sm:px-4 py-2 rounded-lg font-medium"
            >
              📥 Excel Export
            </button>
            <span className="bg-emerald-600 text-xs px-3 py-1 rounded-full">
              کل امیدوار: {filteredCandidates.length}
            </span>
          </div>
        </div>

        <div className="bg-slate-800 p-3 sm:p-4 rounded-lg border border-slate-700 flex flex-col md:flex-row flex-wrap gap-3 md:gap-4 justify-between items-stretch md:items-center">
          <div className="w-full md:flex-1 md:min-w-[200px] md:max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              placeholder="نام، CNIC، فون، ضلع یا UC سے تلاش کریں..."
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              dir="rtl"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-sm text-slate-400 whitespace-nowrap">حیثیت:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">تمام</option>
              <option value="pending">زیرِ غور (pending)</option>
              <option value="approved">منظور (approved)</option>
              <option value="rejected">مسترد (rejected)</option>
            </select>
          </div>
        </div>

        {showKeyboard && (
          <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 shadow-inner">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400">اردو کی بورڈ</span>
              <button
                type="button"
                onClick={() => setShowKeyboard(false)}
                className="text-xs text-rose-400 hover:text-rose-300"
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

        <div className="bg-slate-800 rounded-lg shadow-md overflow-hidden border border-slate-700">
          {loading ? (
            <div className="p-6 text-center text-gray-400">ڈیٹا لوڈ ہو رہا ہے...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm min-w-[720px]">
                <thead className="bg-slate-950 text-gray-300 border-b border-slate-700">
                  <tr>
                    <th className="p-2 sm:p-3 whitespace-nowrap">نمبر</th>
                    <th className="p-2 sm:p-3 whitespace-nowrap">نام</th>
                    <th className="p-2 sm:p-3 whitespace-nowrap">CNIC</th>
                    <th className="p-2 sm:p-3 whitespace-nowrap">فون</th>
                    <th className="p-2 sm:p-3 whitespace-nowrap">ضلع</th>
                    <th className="p-2 sm:p-3 whitespace-nowrap">UC</th>
                    <th className="p-2 sm:p-3 whitespace-nowrap">حیثیت</th>
                    <th className="p-2 sm:p-3 text-center whitespace-nowrap">ایکشن</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {paginated.map((item, index) => (
                    <tr key={item._id || index} className="hover:bg-slate-750/50 transition">
                      <td className="p-2 sm:p-3 font-medium whitespace-nowrap">
                        {(currentPage - 1) * perPage + index + 1}
                      </td>
                      <td className="p-2 sm:p-3 whitespace-nowrap max-w-[140px] truncate">
                        {item.fullName || item.name || '---'}
                      </td>
                      <td className="p-2 sm:p-3 font-mono text-xs whitespace-nowrap" dir="ltr">
                        {item.cnic || '---'}
                      </td>
                      <td className="p-2 sm:p-3 font-mono text-xs whitespace-nowrap" dir="ltr">
                        {item.phone || '---'}
                      </td>
                      <td className="p-2 sm:p-3 whitespace-nowrap">{item.district || '---'}</td>
                      <td className="p-2 sm:p-3 whitespace-nowrap">
                        {item.unionCouncil || item.uc || '---'}
                      </td>
                      <td className="p-2 sm:p-3 whitespace-nowrap">
                        {(() => {
                          const s = (item.status || '').toLowerCase();
                          if (s.includes('approved'))
                            return (
                              <span className="px-2 py-0.5 rounded text-xs bg-emerald-900 text-emerald-300">
                                approved
                              </span>
                            );
                          if (s.includes('rejected'))
                            return (
                              <span className="px-2 py-0.5 rounded text-xs bg-rose-900 text-rose-300">
                                rejected
                              </span>
                            );
                          return (
                            <span className="px-2 py-0.5 rounded text-xs bg-amber-900 text-amber-300">
                              pending
                            </span>
                          );
                        })()}
                      </td>
                      <td className="p-2 sm:p-3 text-center">
                        <div className="flex gap-1 justify-center flex-wrap min-w-[160px]">
                          <button
                            onClick={() => navigate(`/admin/candidates/${item._id}`)}
                            className="bg-sky-600 hover:bg-sky-700 text-white px-2 py-1 rounded text-xs"
                          >
                            تفصیل
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(item._id, 'approved')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded text-xs"
                          >
                            منظور
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(item._id, 'rejected')}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-2 py-1 rounded text-xs"
                          >
                            مسترد
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="bg-rose-600 hover:bg-rose-700 text-white px-2 py-1 rounded text-xs"
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredCandidates.length === 0 && (
            <div className="p-6 text-center text-gray-400">کوئی امیدوار نہیں ملا۔</div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 flex-wrap">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-slate-700 rounded disabled:opacity-40 text-sm"
            >
              ← پچھلا
            </button>
            <span className="text-sm text-slate-400">
              صفحہ {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-slate-700 rounded disabled:opacity-40 text-sm"
            >
              اگلا →
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );

};

export default Candidates;
