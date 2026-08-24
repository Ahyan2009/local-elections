import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import AdminLayout from '../components/AdminLayout';

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await API.get('/admin/candidates', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const pendingRequests = (response.data || []).filter(
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

  const handleSendOtp = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.put(
        `/admin/candidate/${id}/status`,
        { status: 'approved' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.message || 'OTP Send status update ho gaya');
      fetchRequests();
    } catch (error) {
      alert(error.response?.data?.message || 'عمل درآمد میں ناکامی');
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.put(
        `/admin/candidate/${id}/status`,
        { status: 'rejected' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.message || 'درخواست منسوخ کر دی گئی ہے');
      fetchRequests();
    } catch (error) {
      alert(error.response?.data?.message || 'منسوخی میں ناکامی');
    }
  };

  return (
    <AdminLayout title="درخواستیں">
      <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-700 pb-4 gap-2">
          <h1 className="text-xl sm:text-2xl font-bold">ایڈمن - درخواستیں</h1>
          <span className="bg-amber-600 text-xs px-3 py-1 rounded-full w-fit">
            زیرِ غور: {requests.length}
          </span>
        </div>

        <div className="bg-slate-800 rounded-lg shadow-md overflow-hidden border border-slate-700">
          {loading ? (
            <div className="p-6 text-center text-gray-400">ڈیٹا لوڈ ہو رہا ہے...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm min-w-[520px]">
                <thead className="bg-slate-950 text-gray-300 border-b border-slate-700">
                  <tr>
                    <th className="p-2 sm:p-3 whitespace-nowrap">نمبر</th>
                    <th className="p-2 sm:p-3 whitespace-nowrap">ای میل</th>
                    <th className="p-2 sm:p-3 whitespace-nowrap">تاریخ / وقت</th>
                    <th className="p-2 sm:p-3 text-center whitespace-nowrap">کارروائی</th>
                    <th className="p-2 sm:p-3 text-center whitespace-nowrap">حذف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {requests.map((item, index) => (
                    <tr key={item._id || index} className="hover:bg-slate-750 transition">
                      <td className="p-2 sm:p-3 font-medium whitespace-nowrap">{index + 1}</td>
                      <td className="p-2 sm:p-3 font-mono text-xs break-all" dir="ltr">
                        {item.email}
                      </td>
                      <td className="p-2 sm:p-3 text-gray-400 text-xs whitespace-nowrap">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleString('ur-PK')
                          : 'N/A'}
                      </td>
                      <td className="p-2 sm:p-3 text-center">
                        <button
                          onClick={() => handleSendOtp(item._id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 sm:px-3 py-1 rounded text-xs transition"
                        >
                          OTP بھیجیں
                        </button>
                      </td>
                      <td className="p-2 sm:p-3 text-center">
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-2 sm:px-3 py-1 rounded text-xs transition"
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && requests.length === 0 && (
            <div className="p-6 text-center text-gray-400">
              کوئی نئی درخواست موجود نہیں ہے۔
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminRequests;
