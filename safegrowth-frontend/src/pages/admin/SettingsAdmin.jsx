import React from 'react';

const SettingsAdmin = () => {

    const handleResetSystem = () => {
      
        if(confirm("PERINGATAN KERAS:\n\nTindakan ini akan MENGHAPUS SEMUA LAPORAN dan data validasi dari database secara PERMANEN.\n\nApakah Anda yakin ingin melakukan Factory Reset?")) {
            alert("Perintah Reset dikirim ke server. (Implementasikan endpoint DELETE ALL di backend untuk fungsi ini)");
        }
    };

    return (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <h2 className="text-2xl font-display font-bold text-white mb-6">PENGATURAN SISTEM</h2>
            
            <div className="glass-panel p-6 rounded-xl border-l-4 border-red-600 mb-6 relative overflow-hidden">
                 <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-red-600/10 rounded-full blur-xl pointer-events-none"></div>
                 
                 <h3 className="text-lg font-bold text-white mb-2 text-red-500 flex items-center gap-2">
                    <i className="fa-solid fa-triangle-exclamation"></i> DANGER ZONE
                 </h3>
                 <p className="text-xs text-gray-400 mb-6 max-w-xl">
                    Area ini berisi pengaturan sensitif. Menghapus data sistem tidak dapat dibatalkan dan akan menghilangkan semua histori laporan kriminalitas dari peta publik.
                 </p>
                 
                 <button 
                    onClick={handleResetSystem} 
                    className="bg-red-900/40 hover:bg-red-600 text-red-200 hover:text-white border border-red-600/50 hover:border-red-600 px-6 py-3 rounded text-sm font-bold transition flex items-center gap-3 group"
                 >
                     <i className="fa-solid fa-dumpster-fire group-hover:animate-bounce"></i> 
                     RESET PABRIK (HAPUS SEMUA DATA)
                 </button>
            </div>

            <div className="glass-panel p-6 rounded-xl">
                 <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-server text-blue-500"></i> Informasi Server
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                     <div className="p-4 bg-white/5 rounded border border-white/5">
                        <div className="text-gray-500 text-xs mb-1">Versi Aplikasi</div>
                        <div className="text-white font-mono font-bold">v2.0.0 (React + Node.js)</div>
                     </div>
                     <div className="p-4 bg-white/5 rounded border border-white/5">
                        <div className="text-gray-500 text-xs mb-1">Database Engine</div>
                        <div className="text-white font-mono font-bold">MySQL (Relational)</div>
                     </div>
                     <div className="p-4 bg-white/5 rounded border border-white/5">
                        <div className="text-gray-500 text-xs mb-1">API Endpoint</div>
                        <div className="text-cyan-400 font-mono text-xs">http://localhost:3000/api</div>
                     </div>
                     <div className="p-4 bg-white/5 rounded border border-white/5">
                        <div className="text-gray-500 text-xs mb-1">Status Koneksi</div>
                        <div className="text-green-400 font-bold flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            ONLINE
                        </div>
                     </div>
                 </div>
            </div>
        </div>
    );
};

export default SettingsAdmin;