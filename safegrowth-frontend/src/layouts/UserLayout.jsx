import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const UserLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'BERANDA', id: 'landing', icon: 'fa-house' },
    { path: '/map', label: 'PETA', id: 'map', icon: 'fa-map-location-dot' },
    { path: '/route', label: 'RUTE', id: 'route', icon: 'fa-route' },
    { path: '/report', label: 'LAPOR', id: 'report', icon: 'fa-camera' },
  ];

  return (
    <div className="text-gray-200 font-sans min-h-screen relative bg-[#050505]">
      
      <nav className="hidden md:flex fixed top-0 left-0 w-full z-[100] glass-panel border-b border-white/10 px-6 py-4 justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-9 h-9 rounded bg-blue-600 flex items-center justify-center text-white shadow-[0_0_20px_#2563EB] group-hover:shadow-[0_0_30px_#00F0FF] transition duration-500">
                <i className="fa-solid fa-shield-halved text-lg"></i>
            </div>
            <div className="flex flex-col">
                <span className="font-display font-bold text-xl tracking-wider text-white leading-none">SAFE<span className="text-[#00F0FF]">GROWTH</span></span>
                <span className="text-[9px] text-gray-400 tracking-[0.3em] mt-1">URBAN DEFENSE</span>
            </div>
        </div>

        <div className="flex gap-10 text-xs font-display font-bold tracking-widest">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button 
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`relative py-2 transition-all duration-300 ${
                    isActive ? 'text-[#00F0FF] text-shadow-neon' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {item.label}
                  <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-[#00F0FF] shadow-[0_0_10px_#00F0FF] transition-transform duration-300 ${isActive ? 'scale-x-100' : 'scale-x-0'}`}></span>
                </button>
              );
            })}
        </div>
        
        <div className="flex items-center gap-2 text-[10px] text-gray-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            ONLINE
        </div>
      </nav>

      <div className="md:hidden fixed top-0 left-0 w-full z-[90] glass-panel border-b border-white/10 px-4 py-3 flex justify-center items-center">
          <div className="flex items-center gap-2" onClick={() => navigate('/')}>
              <i className="fa-solid fa-shield-halved text-[#00F0FF]"></i>
              <span className="font-display font-bold text-lg text-white">SAFE<span className="text-[#00F0FF]">GROWTH</span></span>
          </div>
      </div>

      <div className="pt-16 pb-24 md:pt-20 md:pb-0 min-h-screen">
        <Outlet />
      </div>

      <div className="md:hidden fixed bottom-0 left-0 w-full z-[100] glass-panel border-t border-white/10 px-6 py-3 flex justify-between items-end shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
          {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                  <button 
                      key={item.id}
                      onClick={() => navigate(item.path)}
                      className="flex flex-col items-center gap-1 w-16 transition-all duration-300 group"
                  >
                      <div className={`
                          relative w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-300
                          ${isActive 
                              ? 'bg-blue-600 text-white shadow-[0_0_15px_#2563EB] -translate-y-3 scale-110 border-2 border-[#050505]' 
                              : 'text-gray-500 hover:text-white hover:bg-white/5'}
                      `}>
                          <i className={`fa-solid ${item.icon}`}></i>
                          
                          {isActive && (
                              <span className="absolute -bottom-8 w-1 h-1 bg-[#00F0FF] rounded-full shadow-[0_0_5px_#00F0FF]"></span>
                          )}
                      </div>
                      
                      <span className={`text-[9px] font-bold tracking-wider transition-all duration-300 ${isActive ? 'text-[#00F0FF] opacity-100 translate-y-[-5px]' : 'text-gray-500 opacity-80'}`}>
                          {item.label}
                      </span>
                  </button>
              )
          })}
      </div>

    </div>
  );
};

export default UserLayout;