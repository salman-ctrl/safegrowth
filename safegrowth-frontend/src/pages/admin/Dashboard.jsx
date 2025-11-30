import React, { useEffect, useState } from 'react';
import { reportService } from '../../services/api';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

const Dashboard = () => {
    const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0, rejected: 0 });
    const [reports, setReports] = useState([]);

    const loadData = async () => {
        try {
            const data = await reportService.getAll();
            setReports(data);
            setStats({
                total: data.length,
                pending: data.filter(r => r.status === 'pending').length,
                verified: data.filter(r => r.status === 'verified').length,
                rejected: data.filter(r => r.status === 'rejected').length,
            });
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // --- CHART CONFIG (Dummy Data for visual) ---
    const chartData = {
        labels: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
        datasets: [
          {
            fill: true,
            label: 'Laporan Masuk',
            data: [12, 19, 3, 5, 2, 30, 15],
            borderColor: '#00F0FF',
            backgroundColor: 'rgba(37, 99, 235, 0.5)',
          },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
             x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
             y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } }
        }
    };

    return (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <h2 className="text-2xl font-display font-bold text-white mb-6">STATISTIK KEAMANAN</h2>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-panel p-5 rounded-lg border-t-4 border-t-blue-600">
                    <p className="text-gray-400 text-xs uppercase tracking-widest">Total Laporan</p>
                    <h3 className="text-3xl font-display font-bold text-white mt-1">{stats.total}</h3>
                </div>
                <div className="glass-panel p-5 rounded-lg border-t-4 border-t-yellow-500">
                    <p className="text-gray-400 text-xs uppercase tracking-widest">Perlu Validasi</p>
                    <h3 className="text-3xl font-display font-bold text-white mt-1">{stats.pending}</h3>
                </div>
                <div className="glass-panel p-5 rounded-lg border-t-4 border-t-[#FF2A6D]">
                    <p className="text-gray-400 text-xs uppercase tracking-widest">Zona Merah</p>
                    <h3 className="text-3xl font-display font-bold text-white mt-1">{stats.verified}</h3>
                </div>
                 <div className="glass-panel p-5 rounded-lg border-t-4 border-t-gray-500">
                    <p className="text-gray-400 text-xs uppercase tracking-widest">Ditolak</p>
                    <h3 className="text-3xl font-display font-bold text-white mt-1">{stats.rejected}</h3>
                </div>
            </div>

            {/* Charts & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-panel p-6 rounded-xl">
                     <h3 className="text-sm font-bold text-white mb-4"><i className="fa-solid fa-chart-area mr-2 text-cyan-400"></i>VOLUME LAPORAN</h3>
                     <div className="h-64">
                        <Line options={chartOptions} data={chartData} />
                     </div>
                </div>
                <div className="lg:col-span-1 glass-panel p-6 rounded-xl overflow-y-auto max-h-[350px]">
                     <h3 className="text-sm font-bold text-white mb-4"><i className="fa-solid fa-list mr-2 text-blue-600"></i>LOG TERBARU</h3>
                     <div className="space-y-3">
                        {reports.slice(0, 5).map(report => (
                            <div key={report.id} className="border-b border-white/5 pb-2">
                                <p className="text-white text-sm font-bold">{report.title}</p>
                                <p className="text-[10px] text-gray-500">{new Date(report.created_at).toLocaleString()}</p>
                                <span className={`text-[9px] uppercase font-bold ${report.status === 'verified' ? 'text-green-400' : 'text-yellow-400'}`}>{report.status}</span>
                            </div>
                        ))}
                     </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;