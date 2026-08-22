import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    alert('لاگ آؤٹ ہو گیا ہے');
    navigate('/login');
  };

  const navItems = [
    { name: 'ڈیش بورڈ (Dashboard)', path: '/admin/dashboard', icon: '📊' },
    { name: 'درخواستیں (Requests)', path: '/admin/requests', icon: '📩' },
    { name: 'تمام امیدوار (Candidates)', path: '/admin/candidates', icon: '👥' },
  ];

  return (
    <aside className="w-64 bg-slate-800 text-slate-200 min-h-screen p-4 flex flex-col justify-between border-l border-slate-700" dir="rtl">
      <div>
        {/* Header */}
        <div className="flex items-center gap-3 p-3 border-b border-slate-700 mb-6">
          <div className="bg-emerald-600 text-white p-2 rounded-lg font-bold text-lg">
            ایڈمن
          </div>
          <div>
            <h1 className="font-bold text-base text-white">انتخابات سسٹم</h1>
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
  );
};

export default Sidebar;