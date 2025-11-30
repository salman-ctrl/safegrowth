import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const UserLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'BERANDA', id: 'landing' },
    { path: '/map', label: 'PETA LIVE', id: 'map' },
    { path: '/route', label: 'AI ROUTE', id: 'route' },
    { path: '/report', label: 'LAPOR', id: 'report' },
  ];

  return (
    <div className="text-gray-200 font-sans min-h-screen relative bg-[#050505]">
      {/* Navbar Fixed */}
      <nav className="fixed top-0 left-0 w-full z-[100] glass-panel border-b border-white/10 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-9 h-9 rounded bg-blue-600 flex items-center justify-center text-white shadow-[0_0_20px_#2563EB] group-hover:shadow-[0_0_30px_#00F0FF] transition duration-500">
                <i className="fa-solid fa-shield-halved text-lg"></i>
            </div>
            <div className="flex flex-col">
                <span className="font-display font-bold text-xl tracking-wider text-white leading-none">SAFE<span className="text-[#00F0FF]">GROWTH</span></span>
                <span className="text-[9px] text-gray-400 tracking-[0.3em] mt-1">URBAN DEFENSE</span>
            </div>
        </div>

        <div className="hidden md:flex gap-10 text-xs font-display font-bold tracking-widest">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button 
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`relative py-2 transition-all duration-300 ${
                    isActive 
                      ? 'text-[#00F0FF] text-shadow-neon' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {item.label}
                  {/* Neon Underline Active State */}
                  <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-[#00F0FF] shadow-[0_0_10px_#00F0FF] transition-transform duration-300 ${isActive ? 'scale-x-100' : 'scale-x-0'}`}></span>
                </button>
              );
            })}
        </div>
        
        <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-[10px] text-gray-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                SYSTEM ONLINE
            </div>
        </div>
      </nav>

      {/* Konten Halaman */}
      <div className="pt-20 min-h-screen">
        <Outlet />
      </div>
    </div>
  );
};

export default UserLayout;