import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/admin', label: 'Dashboard & Analisis', icon: 'fa-chart-line' },
    { path: '/admin/reports', label: 'Semua Laporan', icon: 'fa-list-check' },
    { path: '/admin/users', label: 'Manajemen User', icon: 'fa-users-viewfinder' },
    { path: '/admin/settings', label: 'Pengaturan', icon: 'fa-gear' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans bg-[#020204] text-slate-200">
      <div className="fixed inset-0 z-[-1] opacity-30" style={{backgroundImage: 'linear-gradient(#1a1a2e 1px, transparent 1px), linear-gradient(90deg, #1a1a2e 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>

      <aside className="w-full md:w-64 glass-panel border-r border-white/10 flex flex-col z-20 md:h-screen md:sticky md:top-0">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
             <div className="w-8 h-8 rounded bg-[#FF2A6D] flex items-center justify-center text-white shadow-[0_0_15px_#FF2A6D]">
                <i className="fa-solid fa-shield-cat"></i>
            </div>
            <div>
                <h1 className="font-display font-bold text-lg tracking-wider text-white">SG<span className="text-[#FF2A6D]">ADMIN</span></h1>
                <p className="text-[9px] text-gray-500 tracking-[0.2em]">COMMAND CENTER</p>
            </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
                <button 
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded transition ${location.pathname === item.path ? 'bg-white/5 text-white border-l-2 border-[#FF2A6D] shadow-[0_0_10px_rgba(255,42,109,0.2)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    <i className={`fa-solid ${item.icon} w-5`}></i>
                    <span className="text-sm font-bold">{item.label}</span>
                </button>
            ))}
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;