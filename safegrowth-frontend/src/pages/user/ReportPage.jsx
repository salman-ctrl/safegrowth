import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer } from 'react-leaflet';
import { reportService } from '../../services/api';

const ReportPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        location: '',
        lat: '',
        lng: '',
        category: 'other',
        desc: '',
        image: null
    });
    const [preview, setPreview] = useState(null);

    // --- CAPTCHA STATE ---
    const [captcha, setCaptcha] = useState({ q: '', a: 0, input: '' });

    // Generate Captcha saat load
    useEffect(() => {
        generateCaptcha();
    }, []);

    const generateCaptcha = () => {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        setCaptcha({ q: `${num1} + ${num2}`, a: num1 + num2, input: '' });
    };

    // --- LOGIC PICK LOCATION (FIXED) ---
    useEffect(() => {
        if (location.state?.pickedLocation) {
            const { lat, lng } = location.state.pickedLocation;
            
            setForm(prev => ({ ...prev, lat, lng, location: "Mengambil data lokasi..." }));

            // Fetch Nama Jalan Real-time
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
                .then(res => res.json())
                .then(data => {
                    let address = data.display_name.split(',')[0]; // Ambil nama gedung/jalan saja biar pendek
                    if(data.address.road) address = data.address.road;
                    else if (data.address.suburb) address = data.address.suburb;
                    
                    // Tambah detail kota
                    if(data.address.city_district) address += `, ${data.address.city_district}`;
                    
                    setForm(prev => ({ ...prev, location: address }));
                })
                .catch(() => {
                    setForm(prev => ({ ...prev, location: `Koordinat: ${lat.toFixed(5)}, ${lng.toFixed(5)}` }));
                });
        }
    }, [location.state]);

    const handleOpenMapPicker = () => { navigate('/map', { state: { picking: true } }); };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setForm(prev => ({ ...prev, image: file }));
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validasi Lokasi
        if (!form.lat || !form.lng) return alert("Lokasi wajib diisi! Gunakan tombol GPS atau Klik Peta.");
        
        // Validasi Captcha (Anti-Bot)
        if (parseInt(captcha.input) !== captcha.a) {
            alert("Verifikasi Gagal! Jawaban matematika salah.");
            generateCaptcha(); // Reset captcha biar bot bingung
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            let title = 'LAPORAN WARGA';
            if(form.category === 'danger') title = 'BEGAL / KRIMINAL';
            if(form.category === 'lamp') title = 'LAMPU JALAN MATI';
            if(form.category === 'road') title = 'JALAN RUSAK';

            formData.append('title', title);
            formData.append('desc', form.desc);
            formData.append('lat', form.lat);
            formData.append('lng', form.lng);
            formData.append('locationName', form.location); // Ini yang disimpan ke DB
            formData.append('type', form.category);
            formData.append('anonymous_id', localStorage.getItem('anon_id') || 'guest');
            if(form.image) formData.append('image', form.image);

            await reportService.create(formData);
            alert("Laporan berhasil dikirim! Menunggu validasi admin.");
            navigate('/map');
        } catch (error) {
            console.error(error);
            alert("Gagal mengirim laporan. Pastikan server backend berjalan.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="relative w-full h-[calc(100vh-80px)] flex justify-center items-center overflow-hidden">
            {/* BACKGROUND MAP DENGAN EFEK BLUR */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <MapContainer 
                    center={[-0.9471, 100.4172]} 
                    zoom={13} 
                    zoomControl={false} 
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                </MapContainer>
                {/* Overlay Blur & Darken */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[1]"></div>
            </div>

            <div className="glass-panel w-full max-w-2xl rounded-xl p-6 shadow-2xl relative z-10 mx-4 border-l-4 border-l-[#FF2A6D] animate-[fadeIn_0.5s_ease-out] overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                    <div>
                        <h2 className="text-xl font-display font-bold text-white tracking-wide">LAPOR INSIDEN</h2>
                        <p className="text-[10px] text-gray-400 mt-1">Data tersimpan aman di server (Secure Encryption).</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#FF2A6D]/20 flex items-center justify-center text-[#FF2A6D] animate-pulse shadow-[0_0_15px_#FF2A6D]">
                        <i className="fa-solid fa-triangle-exclamation text-sm"></i>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Location */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#00F0FF] tracking-widest uppercase">Lokasi Kejadian (Wajib)</label>
                        <div className="flex gap-2 group">
                            <div className="relative w-full cursor-pointer" onClick={handleOpenMapPicker}>
                                <i className="fa-solid fa-location-crosshairs absolute left-4 top-3 text-gray-500 transition group-hover:text-[#00F0FF]"></i>
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={form.location}
                                    placeholder="Klik untuk pilih lokasi di peta..." 
                                    className="w-full bg-[#050505] border border-white/20 rounded p-2.5 pl-10 text-xs text-white focus:border-[#00F0FF] focus:shadow-[0_0_10px_#00F0FF] outline-none cursor-pointer hover:bg-white/5 transition"
                                />
                            </div>
                            <button type="button" onClick={handleOpenMapPicker} className="px-3 bg-blue-600 text-white rounded font-bold hover:bg-blue-500 transition shadow-[0_0_10px_#2563EB] whitespace-nowrap text-xs">
                                <i className="fa-solid fa-map-location-dot"></i>
                            </button>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { id: 'danger', label: 'BEGAL', icon: 'fa-person-harassing', color: 'peer-checked:bg-[#FF2A6D]' },
                            { id: 'lamp', label: 'GELAP', icon: 'fa-lightbulb', color: 'peer-checked:bg-yellow-400 peer-checked:text-black' },
                            { id: 'road', label: 'RUSAK', icon: 'fa-road', color: 'peer-checked:bg-orange-500' },
                            { id: 'other', label: 'LAIN', icon: 'fa-circle-info', color: 'peer-checked:bg-blue-600' }
                        ].map((cat) => (
                            <label key={cat.id} className="cursor-pointer">
                                <input type="radio" name="cat" value={cat.id} className="peer sr-only" onChange={(e) => setForm({...form, category: e.target.value})} checked={form.category === cat.id} />
                                <div className={`border border-white/10 bg-[#050505] p-3 rounded text-center hover:border-white/50 ${cat.color} peer-checked:text-white transition group`}>
                                    <i className={`fa-solid ${cat.icon} text-lg mb-1 group-hover:animate-bounce`}></i>
                                    <div className="text-[9px] font-bold tracking-wider">{cat.label}</div>
                                </div>
                            </label>
                        ))}
                    </div>

                    {/* Description */}
                    <textarea className="w-full bg-[#050505] border border-white/20 rounded p-3 text-xs text-white focus:border-[#00F0FF] outline-none h-20 placeholder-gray-600" placeholder="Detail kejadian (waktu, ciri pelaku, dll)..." value={form.desc} onChange={(e) => setForm({...form, desc: e.target.value})}></textarea>

                    {/* Upload */}
                    <div className="relative border-2 border-dashed border-white/20 rounded bg-[#050505]/50 p-4 text-center hover:border-[#00F0FF] hover:bg-white/5 transition cursor-pointer group" onClick={() => document.getElementById('file-upload').click()}>
                        {preview ? <img src={preview} alt="Preview" className="h-20 mx-auto object-cover rounded shadow-lg" /> : <><i className="fa-solid fa-cloud-arrow-up text-2xl text-gray-500 mb-1 group-hover:text-[#00F0FF]"></i><p className="text-[10px] text-gray-400 group-hover:text-white">Upload Bukti Foto</p></>}
                        <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>

                    {/* CAPTCHA / ANTI-BOT */}
                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded border border-white/10">
                        <div className="text-xs text-gray-400 uppercase font-bold flex-1"><i className="fa-solid fa-robot mr-1"></i> VERIFIKASI KEAMANAN</div>
                        <div className="bg-black px-3 py-1 rounded text-[#00F0FF] font-mono font-bold text-sm tracking-widest border border-[#00F0FF]/30">{captcha.q} = ?</div>
                        <input 
                            type="number" 
                            className="w-16 bg-[#050505] border border-white/20 rounded p-1 text-center text-white focus:border-[#00F0FF] outline-none font-bold"
                            placeholder="..."
                            value={captcha.input}
                            onChange={(e) => setCaptcha({...captcha, input: e.target.value})}
                        />
                    </div>

                    <button disabled={loading} className="w-full bg-gradient-to-r from-[#FF2A6D] to-pink-600 text-white font-bold py-3 rounded shadow-[0_0_20px_#FF2A6D] hover:shadow-[0_0_40px_#FF2A6D] hover:scale-[1.01] transition flex justify-center items-center gap-3 disabled:opacity-50 text-sm">
                        {loading ? <><i className="fa-solid fa-spinner fa-spin"></i> PROSES...</> : <><span>KIRIM LAPORAN</span><i className="fa-solid fa-paper-plane"></i></>}
                    </button>
                </form>
            </div>
        </section>
    );
};

export default ReportPage;