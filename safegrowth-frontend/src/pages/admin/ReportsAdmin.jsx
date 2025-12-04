import React, { useEffect, useState } from 'react';
import { reportService, getImageUrl } from '../../services/api';

const ReportsAdmin = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); 

    const fetchReports = async () => {
        setLoading(true);
        try {
            const data = await reportService.getAll();
            setReports(data);
        } catch (error) {
            console.error("Gagal load reports", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleStatusUpdate = async (id, status) => {
        try {
            await reportService.updateStatus(id, status);
            fetchReports(); 
        } catch (error) {
            alert("Gagal update status");
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Apakah Anda yakin ingin menghapus laporan ini secara permanen?")) {
            try {
                await reportService.delete(id);
                fetchReports();
            } catch (error) {
                alert("Gagal menghapus laporan");
            }
        }
    };

    const filteredReports = reports.filter(r => filter === 'all' ? true : r.status === filter);

    return (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-display font-bold text-white">MANAJEMEN LAPORAN</h2>
                <div className="flex gap-2">
                    {['all', 'pending', 'verified', 'rejected'].map(f => (
                        <button 
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1 rounded text-xs font-bold uppercase transition ${filter === f ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="glass-panel p-6 rounded-xl overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                    <thead className="text-gray-500 border-b border-white/10 bg-white/5 uppercase font-bold">
                        <tr>
                            <th className="p-3">Waktu</th>
                            <th className="p-3">Judul</th>
                            <th className="p-3">Lokasi</th>
                            <th className="p-3">Bukti</th>
                            <th className="p-3 text-center">Validasi Warga</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan="7" className="p-8 text-center text-gray-500">Memuat data...</td></tr>
                        ) : filteredReports.length === 0 ? (
                            <tr><td colSpan="7" className="p-8 text-center text-gray-500">Tidak ada laporan ditemukan.</td></tr>
                        ) : (
                            filteredReports.map((r) => {
                                const totalVotes = Object.values(r.validations || {}).reduce((a, b) => a + b, 0);
                                
                                return (
                                    <tr key={r.id} className="hover:bg-white/5 transition">
                                        <td className="p-3 font-mono text-gray-400 whitespace-nowrap">
                                            {new Date(r.created_at).toLocaleDateString()}<br/>
                                            {new Date(r.created_at).toLocaleTimeString()}
                                        </td>
                                        <td className="p-3 font-bold text-white">
                                            <div className="flex items-center gap-2">
                                                <i className={`fa-solid ${r.category === 'danger' ? 'fa-triangle-exclamation text-[#FF2A6D]' : 'fa-lightbulb text-yellow-400'}`}></i>
                                                {r.title}
                                            </div>
                                        </td>
                                        <td className="p-3 text-gray-400 max-w-[150px] truncate" title={r.location_name}>{r.location_name}</td>
                                        <td className="p-3">
                                            {r.image ? (
                                                <a href={r.image} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 underline">Lihat Foto</a>
                                            ) : <span className="text-gray-600">-</span>}
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className="bg-white/10 px-2 py-1 rounded text-[10px] font-mono">{totalVotes}</span>
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                                r.status === 'verified' ? 'bg-green-500/20 text-green-400' : 
                                                r.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 
                                                'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right whitespace-nowrap">
                                            <button onClick={() => handleStatusUpdate(r.id, 'verified')} className="p-2 text-green-500 hover:bg-green-500/20 rounded transition mr-1" title="Terima">
                                                <i className="fa-solid fa-check"></i>
                                            </button>
                                            <button onClick={() => handleStatusUpdate(r.id, 'rejected')} className="p-2 text-red-500 hover:bg-red-500/20 rounded transition mr-1" title="Tolak">
                                                <i className="fa-solid fa-ban"></i>
                                            </button>
                                            <button onClick={() => handleDelete(r.id)} className="p-2 text-gray-500 hover:text-white hover:bg-white/20 rounded transition" title="Hapus Permanen">
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReportsAdmin;