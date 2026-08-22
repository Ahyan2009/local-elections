import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink, useNavigate } from 'react-router-dom';

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch live candidates/requests data from Backend API
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/candidates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter candidates with status 'pending' or 'pending_approval'
      const pendingRequests = response.data.filter(
        (item) => item.status === 'pending_approval' || item.status === 'pending'
      );
      setRequests(pendingRequests);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Update Status (Send OTP / Approve)
  const handleSendOtp = async (id) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/admin/candidate/${id}/status`, {
        status: 'approved'
      });
      alert(response.data.message || 'OTP Send status update ho gaya');
      fetchRequests(); // Refresh table
    } catch (error) {
      alert(error.response?.data?.message || 'عمل درآمد میں ناکامی');
    }
  };

  // Reject / Cancel Request
  const handleDelete = async (id) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/admin/candidate/${id}/status`, {
        status: 'rejected'
      });
      alert(response.data.message || 'درخواست منسوخ کر دی گئی ہے');
      fetchRequests(); // Refresh table
    } catch (error) {
      alert(error.response?.data?.message || 'منسوخی میں ناکامی');
    }
  };

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    alert('لاگ آؤٹ ہو گیا ہے');
    navigate('/login');
  };

  // Sidebar Links Array
  const navItems = [
    { name: 'ڈیش بورڈ (Dashboard)', path: '/admin/dashboard', icon: '📊' },
    { name: 'درخواستیں (Requests)', path: '/admin/requests', icon: '📩' },
    { name: 'تمام امیدوار (Candidates)', path: '/admin/candidates', icon: '👥' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-900 text-white" dir="rtl">
      
      {/* Sidebar Component */}
      <aside className="w-64 bg-slate-800 border-l border-slate-700 min-h-screen p-4 flex flex-col justify-between shrink-0">
        <div>
          {/* Sidebar Header */}
          <div className="flex items-center gap-3 p-3 border-b border-slate-700 mb-6">
            <div className="bg-emerald-600 text-white p-2 rounded-lg font-bold text-lg">
              ایڈمن
            </div>
            <div>
              <h2 className="font-bold text-base text-white">انتخابات سسٹم</h2>
              <p className="text-xs text-slate-400">Admin Control Panel</p>
            </div>
          </div>

          {/* Navigation Links */}
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

        {/* Logout Button */}
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

      {/* Main Content Area */}
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex justify-between items-center border-b border-slate-700 pb-4">
            <h1 className="text-2xl font-bold">ایڈمن - نئی درخواستیں</h1>
            <span className="bg-emerald-600 text-xs px-3 py-1 rounded-full">
              کل درخواستیں: {requests.length}
            </span>
          </div>

          {/* Requests Table */}
          <div className="bg-slate-800 rounded-lg shadow-md overflow-hidden border border-slate-700">
            {loading ? (
              <div className="p-6 text-center text-gray-400">ڈیٹا لوڈ ہو رہا ہے...</div>
            ) : (
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-950 text-gray-300 border-b border-slate-700">
                  <tr>
                    <th className="p-3">نمبر</th>
                    <th className="p-3">ای میل</th>
                    <th className="p-3">تاریخ / وقت</th>
                    <th className="p-3 text-center">کارروائی</th>
                    <th className="p-3 text-center">حذف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {requests.map((item, index) => (
                    <tr key={item._id || index} className="hover:bg-slate-750 transition">
                      <td className="p-3 font-medium">{index + 1}</td>
                      <td className="p-3 font-mono" dir="ltr">{item.email}</td>
                      <td className="p-3 text-gray-400">
                        {item.createdAt 
                          ? new Date(item.createdAt).toLocaleString('ur-PK') 
                          : 'N/A'}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleSendOtp(item._id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-xs transition"
                        >
                          OTP بھیجیں
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition"
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {!loading && requests.length === 0 && (
              <div className="p-6 text-center text-gray-400">
                کوئی نئی درخواست موجود نہیں ہے۔
              </div>
            )}
          </div>

        </div>
      </main>

    </div>
  );
};

export default AdminRequests;