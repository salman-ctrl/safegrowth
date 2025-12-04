import React from 'react';

const UsersAdmin = () => {
    return (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <h2 className="text-2xl font-display font-bold text-white mb-6">MANAJEMEN PENGGUNA</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="glass-panel p-6 rounded-xl flex items-center gap-4 border border-white/5">
                     <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-500 text-2xl shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                         <i className="fa-solid fa-users"></i>
                     </div>
                     <div>
                         <h3 className="text-3xl font-bold text-white">Guest (Anonim)</h3>
                         <p className="text-gray-400 text-xs mt-1">Tipe Akun Default</p>
                     </div>
                 </div>

                 <div className="glass-panel p-6 rounded-xl border-l-4 border-cyan-400 relative overflow-hidden">
                     <div className="absolute right-0 top-0 p-4 opacity-10 text-6xl text-cyan-400">
                        <i className="fa-solid fa-user-secret"></i>
                     </div>
                     <h4 className="font-bold text-white mb-2 text-lg">Kebijakan Privasi & Keamanan</h4>
                     <p className="text-sm text-gray-400 leading-relaxed">
                        SafeGrowth menggunakan sistem pelaporan anonim demi melindungi identitas pelapor dari potensi ancaman pelaku kriminal. 
                        Identifikasi pengguna hanya dilakukan melalui <strong>UUID Perangkat</strong> dan <strong>Koordinat Lokasi</strong> untuk mencegah spamming, tanpa menyimpan data pribadi (Nama/Email).
                     </p>
                 </div>
            </div>

            <div className="glass-panel p-6 rounded-xl">
                <h3 className="text-sm font-bold text-white mb-4"><i className="fa-solid fa-wifi mr-2 text-green-400"></i>SESI AKTIF SAAT INI</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-400">
                        <thead className="border-b border-white/10 uppercase">
                            <tr>
                                <th className="py-2">User ID (Hash)</th>
                                <th className="py-2">Role</th>
                                <th className="py-2">Status</th>
                                <th className="py-2 text-right">Terakhir Aktif</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {[1,2,3].map((i) => (
                                <tr key={i} className="hover:bg-white/5">
                                    <td className="py-3 font-mono text-gray-500">anon-{Math.random().toString(36).substr(2, 9)}</td>
                                    <td className="py-3"><span className="bg-white/10 px-2 py-0.5 rounded text-[10px]">Warga</span></td>
                                    <td className="py-3 text-green-400">Online</td>
                                    <td className="py-3 text-right">Baru saja</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UsersAdmin;