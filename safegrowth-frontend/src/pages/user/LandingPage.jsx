import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../../services/api';

const LandingPage = () => {
    const navigate = useNavigate();
    const [latestAlert, setLatestAlert] = useState(null);
    const [counts, setCounts] = useState({ reports: 0, danger: 0, users: 0 });
    
    useEffect(() => {
        const targets = { reports: 1420, danger: 15, users: 324 };
        const interval = setInterval(() => {
            setCounts(prev => ({
                reports: prev.reports < targets.reports ? prev.reports + 10 : targets.reports,
                danger: prev.danger < targets.danger ? prev.danger + 1 : targets.danger,
                users: prev.users < targets.users ? prev.users + 2 : targets.users
            }));
        }, 20);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const checkAlerts = async () => {
            try {
                const data = await reportService.getAll();
                const visible = data.filter(r => r.status !== 'rejected');
                if (visible.length > 0) setLatestAlert(visible[0]);
            } catch (err) { console.error(err); }
        };
        checkAlerts();
        const interval = setInterval(checkAlerts, 10000); 
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative w-full h-[calc(100vh-80px)] flex flex-col justify-center items-center overflow-hidden">
            
            {/* --- BACKGROUND LAYERS (FIXED Z-INDEX) --- */}
            {/* Kita tidak pakai z-minus, tapi z-0 agar tetap di dalam container */}
            
            {/* 1. Gambar Asli Cyberpunk Room */}
            <div className="absolute inset-0 bg-cover bg-center z-0" 
                 style={{ backgroundImage: "url('https://images.unsplash.com/photo-1555664424-778a6902201b?q=80&w=2070&auto=format&fit=crop')" }}>
            </div>

            {/* 2. Grid Overlay Neon (Agar kesan Cyberpunk kuat) */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
                 style={{
                     backgroundImage: 'linear-gradient(#00F0FF 1px, transparent 1px), linear-gradient(90deg, #00F0FF 1px, transparent 1px)', 
                     backgroundSize: '40px 40px'
                 }}>
            </div>
            
            {/* 3. Gradient Overlay (Agar teks terbaca) */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-blue-600/10 z-0"></div>

            {/* --- CONTENT (Z-INDEX 10) --- */}
            
            {latestAlert && (
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-[90%] max-w-lg glass-panel border-l-4 border-l-[#FF2A6D] p-4 rounded-lg z-20 shadow-[0_0_30px_#FF2A6D] animate-bounce hover:animate-none transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#FF2A6D]/20 flex items-center justify-center text-[#FF2A6D] animate-pulse shrink-0"><i className="fa-solid fa-tower-broadcast text-xl"></i></div>
                        <div className="flex-1">
                            <h4 className="text-[#FF2A6D] font-bold text-[10px] tracking-[0.2em] mb-1 animate-pulse"><i className="fa-solid fa-circle text-[6px] mr-1"></i>SINYAL BAHAYA BARU</h4>
                            <p className="text-white text-sm font-bold leading-tight">{latestAlert.title} di {latestAlert.location_name}</p>
                            <p className="text-[10px] text-gray-400 mt-1"><i className="fa-solid fa-clock mr-1"></i> {new Date(latestAlert.created_at).toLocaleTimeString()}</p>
                        </div>
                        <button onClick={() => setLatestAlert(null)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/20 flex items-center justify-center transition text-gray-400 hover:text-white"><i className="fa-solid fa-xmark"></i></button>
                    </div>
                    <div className="mt-3 flex gap-2">
                         <button onClick={() => navigate('/map')} className="flex-1 bg-[#FF2A6D]/20 hover:bg-[#FF2A6D]/40 border border-[#FF2A6D]/50 text-white text-[10px] font-bold py-1.5 rounded transition"><i className="fa-solid fa-crosshairs mr-1"></i> LACAK LOKASI</button>
                    </div>
                </div>
            )}

            <div className="relative z-10 text-center px-4 max-w-5xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#FF2A6D]/50 bg-[#FF2A6D]/10 text-[#FF2A6D] text-xs font-bold tracking-widest mb-6 animate-pulse shadow-[0_0_15px_#FF2A6D]">
                    <i className="fa-solid fa-shield-virus"></i> SAFE GROWTH PROTECTION
                </div>
                
                <h1 className="text-5xl md:text-8xl font-display font-bold text-white mb-6 leading-tight drop-shadow-2xl">
                    JANGAN BIARKAN <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-blue-600 drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]">BAHAYA</span> MENGINTAI
                </h1>
                
                <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-light font-sans text-shadow-neon">
                    Platform pertahanan sipil berbasis data real-time untuk memetakan zona rawan kriminalitas dan area gelap di kota Anda.
                </p>
                
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <button onClick={() => navigate('/map')} className="group relative px-8 py-4 bg-blue-600 text-white font-bold rounded-none overflow-hidden skew-x-[-10deg] border border-blue-600 hover:shadow-[0_0_30px_#2563EB] transition cursor-pointer">
                        <div className="skew-x-[10deg] flex items-center gap-3"><span>BUKA PETA DIGITAL</span><i className="fa-solid fa-map-location-dot group-hover:translate-x-1 transition"></i></div>
                    </button>
                    <button onClick={() => navigate('/route')} className="group relative px-8 py-4 bg-transparent text-white font-bold rounded-none overflow-hidden skew-x-[-10deg] border border-[#00F0FF]/50 hover:bg-[#00F0FF]/10 transition cursor-pointer">
                        <div className="skew-x-[10deg] flex items-center gap-3"><span>RUTE AMAN</span><i className="fa-solid fa-route group-hover:scale-110 transition"></i></div>
                    </button>
                    <button onClick={() => navigate('/report')} className="group relative px-8 py-4 bg-transparent text-white font-bold rounded-none overflow-hidden skew-x-[-10deg] border border-white/30 hover:bg-white/10 transition cursor-pointer">
                        <div className="skew-x-[10deg] flex items-center gap-3"><span>LAPOR KEJADIAN</span><i className="fa-solid fa-camera group-hover:rotate-12 transition"></i></div>
                    </button>
                </div>
            </div>
            
            <div className="absolute bottom-0 w-full glass-panel border-t border-white/10 py-4 px-6 flex justify-between items-center text-xs z-10">
                <div className="flex gap-8 text-gray-400 font-mono">
                    <span><i className="fa-solid fa-database text-blue-600 mr-2"></i>REPORTS: <span className="text-white font-bold">{counts.reports}</span></span>
                    <span><i className="fa-solid fa-triangle-exclamation text-[#FF2A6D] mr-2"></i>DANGER ZONES: <span className="text-white font-bold">{counts.danger}</span></span>
                    <span className="hidden md:inline"><i className="fa-solid fa-user-shield text-[#00F0FF] mr-2"></i>ACTIVE USERS: <span className="text-white font-bold">{counts.users}</span></span>
                </div>
                <div className="text-[#00F0FF] animate-pulse font-bold flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#00F0FF] rounded-full inline-block"></span> SYSTEM ONLINE
                </div>
            </div>
        </section>
    );
};

export default LandingPage;