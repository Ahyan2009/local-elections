import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { name: 'ڈیش بورڈ (Dashboard)', path: '/admin/dashboard', icon: '📊' },
  { name: 'درخواستیں (Requests)', path: '/admin/requests', icon: '📩' },
  { name: 'تمام امیدوار (Candidates)', path: '/admin/candidates', icon: '👥' },
];

/**
 * Responsive admin shell:
 * - Desktop (md+): fixed-width sidebar (RTL right side via flex order)
 * - Mobile: top bar + hamburger + slide-over drawer + backdrop
 */
const AdminLayout = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    alert('لاگ آؤٹ ہو گیا ہے');
    navigate('/login');
  };

  const SidebarInner = ({ showClose }) => (
    <div className="flex flex-col h-full justify-between">
      <div>
        <div className="flex items-center gap-3 p-3 border-b border-slate-700 mb-6 relative">
          {showClose && (
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <div className="bg-emerald-600 text-white p-2 rounded-lg font-bold text-lg shrink-0">
            ایڈمن
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-base text-white truncate">انتخابات سسٹم</h2>
            <p className="text-xs text-slate-400">Admin Control Panel</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-600 text-white font-medium shadow-md'
                    : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                }`
              }
            >
              <span className="text-lg shrink-0">{item.icon}</span>
              <span className="truncate">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-700">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl text-sm font-medium transition duration-200 shadow-md"
        >
          <span>🚪</span>
          <span>لاگ آؤٹ (Logout)</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white" dir="rtl">
      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30 bg-slate-800 border-b border-slate-700 px-3 py-3 flex items-center gap-3 no-print">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white shrink-0"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-xs font-bold shrink-0">
            ایڈمن
          </span>
          <span className="text-sm font-semibold truncate">
            {title || 'انتخابات سسٹم'}
          </span>
        </div>
      </header>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile slide-over drawer */}
      <aside
        className={`
          fixed top-0 right-0 z-50 h-full w-72 max-w-[85vw]
          bg-slate-800 border-l border-slate-700 p-4
          transform transition-transform duration-300 ease-in-out
          md:hidden
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <SidebarInner showClose />
      </aside>

      {/* Desktop layout: sidebar + main */}
      <div className="flex min-h-[calc(100vh-0px)] md:min-h-screen">
        {/* Desktop sidebar — always visible from md up */}
        <aside className="hidden md:flex md:flex-col w-64 shrink-0 bg-slate-800 border-l border-slate-700 p-4 min-h-screen">
          <SidebarInner showClose={false} />
        </aside>

        {/* Main content — min-w-0 prevents flex child overflow */}
        <main className="flex-1 min-w-0 p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
