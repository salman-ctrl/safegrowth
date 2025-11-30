import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';

const LoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authService.login(formData.username, formData.password);
            // Jika sukses, redirect ke dashboard admin
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.message || "Login Gagal. Cek username/password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#020204] relative overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-[#FF2A6D]/20 rounded-full blur-[100px]"></div>

            <div className="glass-panel w-full max-w-md p-8 rounded-xl border border-white/10 shadow-2xl z-10 animate-[fadeIn_0.5s_ease-out]">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#FF2A6D] rounded mx-auto flex items-center justify-center text-white text-3xl shadow-[0_0_20px_#FF2A6D] mb-4">
                        <i className="fa-solid fa-shield-cat"></i>
                    </div>
                    <h1 className="font-display font-bold text-2xl text-white tracking-widest">SG<span className="text-[#FF2A6D]">ADMIN</span></h1>
                    <p className="text-xs text-gray-500 tracking-[0.3em] mt-1">RESTRICTED ACCESS</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-xs font-bold rounded text-center animate-pulse">
                        <i className="fa-solid fa-triangle-exclamation mr-2"></i> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Username</label>
                        <div className="relative">
                            <i className="fa-solid fa-user absolute left-4 top-3.5 text-gray-500"></i>
                            <input 
                                type="text" 
                                placeholder="Masukkan username..."
                                className="w-full bg-[#050505] border border-white/10 rounded p-3 pl-12 text-sm text-white focus:border-[#FF2A6D] outline-none transition"
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Password</label>
                        <div className="relative">
                            <i className="fa-solid fa-lock absolute left-4 top-3.5 text-gray-500"></i>
                            <input 
                                type="password" 
                                placeholder="Masukkan password..."
                                className="w-full bg-[#050505] border border-white/10 rounded p-3 pl-12 text-sm text-white focus:border-[#FF2A6D] outline-none transition"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                        </div>
                    </div>

                    <button 
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-[#FF2A6D] to-pink-600 text-white font-bold py-3.5 rounded shadow-[0_0_20px_rgba(255,42,109,0.4)] hover:shadow-[0_0_30px_rgba(255,42,109,0.6)] hover:scale-[1.02] transition flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <><i className="fa-solid fa-right-to-bracket"></i> LOGIN SYSTEM</>}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <a href="/" className="text-xs text-gray-500 hover:text-white transition flex items-center justify-center gap-2">
                        <i className="fa-solid fa-arrow-left"></i> Kembali ke Halaman Warga
                    </a>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;