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
    const [captcha, setCaptcha] = useState({ q: '', a: 0, input: '' });
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        generateCaptcha();
    }, []);

    const generateCaptcha = () => {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        setCaptcha({ q: `${num1} + ${num2}`, a: num1 + num2, input: '' });
    };

    useEffect(() => {
        if (location.state?.pickedLocation) {
            const { lat, lng } = location.state.pickedLocation;
            setForm(prev => ({ ...prev, lat, lng, location: "Mengambil data lokasi..." }));

            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
                .then(res => res.json())
                .then(data => {
                    let address = data.display_name.split(',')[0];
                    if(data.address.road) address = data.address.road;
                    else if (data.address.suburb) address = data.address.suburb;
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

    const handleVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Browser Anda tidak mendukung input suara.");
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.lang = 'id-ID';
        recognition.interimResults = false; 
        recognition.maxAlternatives = 1;

        setIsListening(true);

        recognition.onresult = (event) => {
            const lastResultIdx = event.results.length - 1;
            const result = event.results[lastResultIdx];

            if (result.isFinal) {
                const transcript = result[0].transcript.trim();
                setForm(prev => ({ 
                    ...prev, 
                    desc: prev.desc ? `${prev.desc} ${transcript}` : transcript 
                }));
                setIsListening(false);
            }
        };

        recognition.onerror = () => {
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!form.lat || !form.lng) return alert("Lokasi wajib diisi! Gunakan tombol GPS atau Klik Peta.");
        
        if (parseInt(captcha.input) !== captcha.a) {
            alert("Verifikasi Gagal! Jawaban matematika salah.");
            generateCaptcha();
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
            formData.append('locationName', form.location);
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
        <section className="relative w-full h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] flex justify-center items-center overflow-hidden">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <MapContainer 
                    center={[-0.9471, 100.4172]} 
                    zoom={13} 
                    zoomControl={false} 
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                </MapContainer>
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-[1]"></div>
            </div>

            <div className="glass-panel w-full max-w-lg rounded-xl p-5 shadow-2xl relative z-10 mx-4 border-l-4 border-l-[#FF2A6D] animate-[fadeIn_0.5s_ease-out] overflow-y-auto max-h-[85vh] bg-black/60 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                    <div>
                        <h2 className="text-lg font-display font-bold text-white tracking-wide">LAPOR INSIDEN</h2>
                        <p className="text-[10px] text-gray-400 mt-1">Laporan terenkripsi & anonim.</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#FF2A6D]/20 flex items-center justify-center text-[#FF2A6D] animate-pulse shadow-[0_0_15px_#FF2A6D]">
                        <i className="fa-solid fa-triangle-exclamation text-sm"></i>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#00F0FF] tracking-widest uppercase">Lokasi Kejadian (Wajib)</label>
                        <div className="flex gap-2 group">
                            <div className="relative w-full cursor-pointer" onClick={handleOpenMapPicker}>
                                <i className="fa-solid fa-location-crosshairs absolute left-4 top-2.5 text-gray-500 transition group-hover:text-[#00F0FF]"></i>
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={form.location}
                                    placeholder="Klik untuk pilih lokasi di peta..." 
                                    className="w-full bg-[#050505]/80 border border-white/20 rounded p-2 pl-10 text-xs text-white focus:border-[#00F0FF] focus:shadow-[0_0_10px_#00F0FF] outline-none cursor-pointer hover:bg-white/5 transition"
                                />
                            </div>
                            <button type="button" onClick={handleOpenMapPicker} className="px-3 bg-blue-600 text-white rounded font-bold hover:bg-blue-500 transition shadow-[0_0_10px_#2563EB] whitespace-nowrap text-xs">
                                <i className="fa-solid fa-map-location-dot"></i>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { id: 'danger', label: 'BEGAL', icon: 'fa-person-harassing', color: 'peer-checked:bg-[#FF2A6D] peer-checked:border-[#FF2A6D]' },
                            { id: 'lamp', label: 'GELAP', icon: 'fa-lightbulb', color: 'peer-checked:bg-yellow-400 peer-checked:text-black peer-checked:border-yellow-400' },
                            { id: 'road', label: 'RUSAK', icon: 'fa-road', color: 'peer-checked:bg-orange-500 peer-checked:border-orange-500' },
                            { id: 'other', label: 'LAIN', icon: 'fa-circle-info', color: 'peer-checked:bg-blue-600 peer-checked:border-blue-600' }
                        ].map((cat) => (
                            <label key={cat.id} className="cursor-pointer relative group">
                                <input type="radio" name="cat" value={cat.id} className="peer sr-only" onChange={(e) => setForm({...form, category: e.target.value})} checked={form.category === cat.id} />
                                <div className={`border border-white/10 bg-[#050505]/80 p-2 rounded text-center hover:border-white/30 transition-all duration-300 ${cat.color} peer-checked:text-white peer-checked:shadow-[0_0_15px_rgba(255,255,255,0.3)]`}>
                                    <i className={`fa-solid ${cat.icon} text-base mb-1 group-hover:scale-110 transition-transform`}></i>
                                    <div className="text-[8px] font-bold tracking-wider">{cat.label}</div>
                                </div>
                            </label>
                        ))}
                    </div>

                    <div className="relative">
                        <textarea 
                            className="w-full bg-[#050505]/80 border border-white/20 rounded p-3 text-xs text-white focus:border-[#00F0FF] outline-none h-20 placeholder-gray-600 resize-none pr-10" 
                            placeholder="Detail kejadian (waktu, ciri pelaku, dll)..." 
                            value={form.desc} 
                            onChange={(e) => setForm({...form, desc: e.target.value})}
                        ></textarea>
                        <button 
                            type="button"
                            onClick={handleVoiceInput}
                            className={`absolute right-2 bottom-2 w-7 h-7 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-500 animate-pulse text-white' : 'bg-white/10 text-gray-400 hover:bg-[#00F0FF] hover:text-white'}`}
                            title="Bicara untuk mengetik"
                        >
                            <i className={`fa-solid ${isListening ? 'fa-microphone-lines' : 'fa-microphone'} text-xs`}></i>
                        </button>
                    </div>

                    <div 
                        className="relative border-2 border-dashed border-white/20 rounded bg-[#050505]/50 h-24 flex flex-col items-center justify-center text-center hover:border-[#00F0FF] hover:bg-white/5 transition cursor-pointer overflow-hidden group" 
                        onClick={() => document.getElementById('file-upload').click()}
                        style={preview ? { backgroundImage: `url(${preview})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                    >
                        {preview && <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] group-hover:bg-black/30 transition"></div>}
                        
                        <div className="relative z-10 flex flex-col items-center">
                            <i className={`fa-solid ${preview ? 'fa-pen-to-square' : 'fa-cloud-arrow-up'} text-xl mb-1 ${preview ? 'text-white' : 'text-gray-500'} group-hover:text-[#00F0FF] transition transform group-hover:scale-110`}></i>
                            <p className={`text-[9px] ${preview ? 'text-white font-bold' : 'text-gray-400'} group-hover:text-white`}>
                                {preview ? 'Ganti Foto' : 'Upload Bukti Foto'}
                            </p>
                        </div>
                        <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>

                    <div className="flex items-center gap-3 bg-white/5 p-2 rounded border border-white/10">
                        <div className="text-[10px] text-gray-400 uppercase font-bold flex-1 flex items-center gap-2">
                            <i className="fa-solid fa-robot text-[#FF2A6D]"></i> 
                            <span>Verifikasi</span>
                        </div>
                        <div className="bg-black px-2 py-1 rounded text-[#00F0FF] font-mono font-bold text-xs tracking-widest border border-[#00F0FF]/30">{captcha.q} = ?</div>
                        <input 
                            type="number" 
                            className="w-12 bg-[#050505] border border-white/20 rounded p-1 text-center text-white focus:border-[#00F0FF] outline-none font-bold text-xs"
                            placeholder="..."
                            value={captcha.input}
                            onChange={(e) => setCaptcha({...captcha, input: e.target.value})}
                        />
                    </div>

                    <button disabled={loading} className="w-full bg-gradient-to-r from-[#FF2A6D] to-pink-600 text-white font-bold py-2.5 rounded shadow-[0_0_20px_#FF2A6D] hover:shadow-[0_0_40px_#FF2A6D] hover:scale-[1.01] transition flex justify-center items-center gap-3 disabled:opacity-50 text-xs tracking-wider">
                        {loading ? <><i className="fa-solid fa-spinner fa-spin"></i> MEMPROSES...</> : <><span>KIRIM LAPORAN</span><i className="fa-solid fa-paper-plane"></i></>}
                    </button>
                </form>
            </div>
        </section>
    );
};

export default ReportPage;