import React, { useEffect, useState, useRef } from 'react';
import { reportService } from '../../services/api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';

// Registrasi komponen Chart.js yang dibutuhkan
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const Dashboard = () => {
    const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0, rejected: 0 });
    const [reports, setReports] = useState([]);
    const chartRef = useRef(null);
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [],
    });

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

    // --- SETUP CHART DENGAN GRADIENT ---
    useEffect(() => {
        const chart = chartRef.current;

        if (chart) {
            const ctx = chart.ctx;
            // Buat Gradient: Dari Biru Neon (Atas) ke Transparan (Bawah)
            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, 'rgba(0, 240, 255, 0.5)'); // Warna Awal (Neon Cyan)
            gradient.addColorStop(1, 'rgba(0, 240, 255, 0)');   // Warna Akhir (Transparan)

            setChartData({
                labels: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
                datasets: [
                    {
                        label: 'Laporan Masuk',
                        // Data dummy untuk visualisasi yang cantik (bisa diganti data real nanti)
                        data: [12, 19, 8, 15, 10, 24, 18], 
                        borderColor: '#00F0FF', // Garis Neon Cyan
                        backgroundColor: gradient, // Isi Gradient
                        borderWidth: 3,
                        pointBackgroundColor: '#fff', // Titik Putih
                        pointBorderColor: '#00F0FF',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        fill: true, // AREA CHART AKTIF
                        tension: 0.4, // KURVA MELENGKUNG (Smooth)
                    },
                ],
            });
        }
    }, []);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }, // Sembunyikan legenda
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                titleColor: '#00F0FF',
                bodyColor: '#fff',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                padding: 10,
                displayColors: false,
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: '#64748b' } // Warna teks sumbu X (Slate-500)
            },
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' }, // Grid tipis transparan
                ticks: { color: '#64748b' }, // Warna teks sumbu Y
                beginAtZero: true
            }
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
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
                
                {/* CHART SECTION */}
                <div className="lg:col-span-2 glass-panel p-6 rounded-xl relative overflow-hidden">
                     {/* Efek Glow di belakang chart */}
                     <div className="absolute top-0 left-0 w-full h-full bg-blue-600/5 z-0 pointer-events-none"></div>
                     
                     <div className="relative z-10">
                        <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                            <i className="fa-solid fa-chart-area text-[#00F0FF]"></i> 
                            VOLUME LAPORAN (7 HARI TERAKHIR)
                        </h3>
                        <div className="h-72 w-full">
                            {/* Ref dipasang di sini untuk akses context canvas */}
                            <Line ref={chartRef} options={chartOptions} data={chartData} />
                        </div>
                     </div>
                </div>

                {/* LOG ACTIVITY */}
                <div className="lg:col-span-1 glass-panel p-6 rounded-xl overflow-y-auto max-h-[400px]">
                     <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                        <i className="fa-solid fa-list text-blue-600"></i> LOG TERBARU
                     </h3>
                     <div className="space-y-3">
                        {reports.length === 0 ? (
                            <p className="text-xs text-gray-500 text-center py-4">Belum ada data aktivitas.</p>
                        ) : (
                            reports.slice(0, 5).map(report => (
                                <div key={report.id} className="border-b border-white/5 pb-3 last:border-0 hover:bg-white/5 p-2 rounded transition cursor-default">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-white text-xs font-bold truncate max-w-[150px]" title={report.title}>{report.title}</p>
                                        <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                                            report.status === 'verified' ? 'bg-green-500/20 text-green-400' : 
                                            report.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 
                                            'bg-yellow-500/20 text-yellow-400'
                                        }`}>
                                            {report.status}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 flex items-center gap-1">
                                        <i className="fa-regular fa-clock"></i> {new Date(report.created_at).toLocaleString()}
                                    </p>
                                </div>
                            ))
                        )}
                     </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;