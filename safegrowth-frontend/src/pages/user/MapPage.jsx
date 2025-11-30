import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { useLocation, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { reportService } from '../../services/api';

const createCustomIcon = (type, status) => {
    const color = type === 'danger' ? '#FF2A6D' : '#Facc15';
    let statusIndicator = status === 'verified' 
        ? `<div class="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-[8px] text-black border border-white"><i class="fa-solid fa-check"></i></div>`
        : `<div class="absolute -top-2 -right-2 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-[8px] text-black border border-white"><i class="fa-solid fa-clock"></i></div>`;

    return L.divIcon({
        className: 'custom-icon',
        html: `
            <div class="relative flex items-center justify-center group">
                 <i class="fa-solid fa-location-dot text-3xl drop-shadow-md relative z-10 transition transform group-hover:-translate-y-1" style="color: ${color}; filter: drop-shadow(0 0 5px ${color});"></i>
                 ${statusIndicator}
                 <div class="absolute -bottom-1 w-4 h-2 bg-black/50 rounded-full blur-[2px] animate-pulse-shadow"></div>
            </div>`,
        iconSize: [30, 40],
        iconAnchor: [15, 38]
    });
};

const searchIcon = L.divIcon({
    className: 'custom-icon',
    html: `
        <div class="relative flex items-center justify-center">
             <div class="absolute w-12 h-12 bg-cyan-400/30 rounded-full animate-ping"></div>
             <div class="absolute w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_15px_#00F0FF] border-2 border-white z-20"></div>
             <div class="absolute bottom-6 bg-black/80 text-cyan-400 text-[10px] px-2 py-1 rounded border border-cyan-400 whitespace-nowrap font-bold">LOKASI DICARI</div>
             <div class="w-0.5 h-8 bg-cyan-400 absolute bottom-0 z-10"></div>
        </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40]
});

const SearchBar = ({ onSearchResult }) => {
    const map = useMap();
    const [query, setQuery] = useState('');
    const [searching, setSearching] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query) return;
        setSearching(true);
        
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ", Padang")}`);
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon, display_name } = data[0];
                const latNum = parseFloat(lat);
                const lonNum = parseFloat(lon);
                
                map.flyTo([latNum, lonNum], 16, { duration: 1.5 });
                onSearchResult({ lat: latNum, lng: lonNum, name: display_name });
            } else {
                alert("Lokasi tidak ditemukan di area Padang.");
            }
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setSearching(false);
        }
    };

    return (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-[95%] md:w-[90%] max-w-md z-[1000]">
            <form onSubmit={handleSearch} className="glass-panel p-1 rounded-full flex items-center shadow-2xl border border-white/20 bg-[#050505]/80 backdrop-blur-md">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 ml-1">
                    {searching ? <i className="fa-solid fa-circle-notch fa-spin text-cyan-400"></i> : <i className="fa-solid fa-magnifying-glass"></i>}
                </div>
                <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Cari area..." 
                    className="bg-transparent w-full outline-none text-sm text-white px-2 font-medium placeholder-gray-500" 
                />
                <button type="submit" className="px-4 py-2 bg-blue-600 rounded-full text-[10px] md:text-xs font-bold text-white hover:bg-blue-500 transition mr-1 shadow-[0_0_10px_#2563EB]">
                    CARI
                </button>
            </form>
        </div>
    );
};

const DetailCard = ({ report, onClose, onValidate }) => {
    if (!report) return null;
    const validationTags = ['Benar/Valid', 'Memang Gelap', 'Sudah Aman', 'Ada Polisi'];

    return (
        <div className="fixed bottom-0 md:bottom-8 left-0 md:left-auto md:right-8 w-full md:w-[400px] z-[1000] p-0 md:p-4 animate-[fadeIn_0.3s_ease-out]">
            <div className={`glass-panel p-6 rounded-t-2xl md:rounded-xl border-t-4 md:border-t-0 md:border-l-4 ${report.category === 'danger' ? 'border-[#FF2A6D]' : 'border-yellow-400'} shadow-2xl relative bg-[#050505]/95 backdrop-blur-xl md:bg-black/80`}>
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4 md:hidden"></div>

                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition p-2">
                    <i className="fa-solid fa-xmark text-lg"></i>
                </button>
                
                <h3 className="text-lg font-display font-bold text-white mb-1 pr-8">{report.title}</h3>
                <p className="text-xs text-gray-400 mb-3 flex items-center gap-2">
                    <i className="fa-solid fa-location-dot text-[#00F0FF]"></i> 
                    <span className="truncate">{report.location_name}</span>
                </p>
                
                {report.image && (
                    <img src={report.image} alt="Bukti" className="w-full h-32 md:h-40 object-cover rounded mb-4 border border-white/10" />
                )}
                
                <p className="text-sm text-gray-300 mb-4 leading-relaxed line-clamp-3">{report.description}</p>
                
                <div className="pt-4 border-t border-white/10">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <i className="fa-solid fa-users"></i> VALIDASI WARGA
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {validationTags.map(tag => (
                            <button 
                                key={tag} 
                                onClick={() => onValidate(report.id, tag)}
                                className="text-[10px] border border-white/20 bg-black/50 px-3 py-1.5 rounded-full text-gray-400 hover:border-[#00F0FF] hover:text-[#00F0FF] transition flex items-center gap-2 active:scale-95 cursor-pointer touch-manipulation"
                            >
                                <span>{tag}</span>
                                <span className="bg-white/10 px-1.5 rounded text-[9px] text-white font-mono">
                                    {report.validations?.[tag] || 0}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const LocationPicker = ({ onLocationPicked }) => {
    useMapEvents({
        click(e) {
            onLocationPicked(e.latlng);
        },
    });
    return null;
};

const MapPage = () => {
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [searchResult, setSearchResult] = useState(null); 
    const [filter, setFilter] = useState('all'); 
    const position = [-0.9471, 100.4172]; 
    
    const location = useLocation();
    const navigate = useNavigate();
    const isPickingMode = location.state?.picking;

    const fetchReports = async () => {
        try {
            const data = await reportService.getAll();
            setReports(data.filter(r => r.status !== 'rejected'));
        } catch (error) { console.error("Gagal load reports", error); }
    };

    useEffect(() => {
        fetchReports();
        const interval = setInterval(fetchReports, 5000); 
        return () => clearInterval(interval);
    }, []);

    const handleValidate = async (reportId, tag) => {
        try {
            const userId = localStorage.getItem('anon_id') || `guest-${Date.now()}`;
            localStorage.setItem('anon_id', userId);
            await reportService.addValidation({ report_id: reportId, tag_type: tag, user_identifier: userId });
            fetchReports(); 
        } catch (error) { alert(error.response?.data?.message || "Gagal validasi."); }
    };

    const handlePickLocation = (latlng) => {
        navigate('/report', { state: { pickedLocation: { lat: latlng.lat, lng: latlng.lng } } });
    };

    const getVisibleReports = () => {
        if (filter === 'all') return reports;
        if (filter === 'danger') return reports.filter(r => r.category === 'danger');
        if (filter === 'lamp') return reports.filter(r => r.category === 'lamp' || r.category === 'road'); 
        return reports;
    };

    const visibleReports = getVisibleReports();

    return (
        <div className="relative w-full h-[calc(100vh-64px)] md:h-[calc(100vh-80px)]">
            
            {isPickingMode && (
                <div className="absolute top-20 md:top-24 left-1/2 transform -translate-x-1/2 z-[1000] w-[90%] md:w-auto bg-cyan-900/90 border border-cyan-400 text-cyan-400 px-4 py-3 md:px-6 md:py-3 rounded-full shadow-[0_0_20px_#00F0FF] animate-bounce flex items-center justify-center gap-3 font-bold text-xs md:text-sm pointer-events-none text-center">
                    <div className="w-2 h-2 md:w-3 md:h-3 bg-cyan-400 rounded-full animate-ping shrink-0"></div>
                    KLIK PETA UNTUK MEMILIH LOKASI
                </div>
            )}

            <MapContainer 
                center={position} 
                zoom={13} 
                style={{ height: '100%', width: '100%', background: '#050505', cursor: isPickingMode ? 'crosshair' : 'grab' }} 
                zoomControl={false}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                
                {!isPickingMode && <SearchBar onSearchResult={setSearchResult} />}

                {searchResult && (
                    <Marker position={[searchResult.lat, searchResult.lng]} icon={searchIcon} />
                )}

                {!isPickingMode && visibleReports.map((report) => (
                    <Marker 
                        key={report.id}
                        position={[report.latitude, report.longitude]}
                        icon={createCustomIcon(report.category, report.status)}
                        eventHandlers={{ click: () => setSelectedReport(report) }}
                    />
                ))}

                {isPickingMode && <LocationPicker onLocationPicked={handlePickLocation} />}
            </MapContainer>

            {!isPickingMode && (
                <div className="absolute bottom-20 md:bottom-8 left-0 w-full px-4 md:px-6 z-[500] flex justify-center gap-2 md:gap-3 pointer-events-none">
                    <div className="pointer-events-auto flex gap-2 md:gap-3 bg-[#050505]/50 p-1.5 rounded-full backdrop-blur-sm">
                        <button 
                            onClick={() => setFilter('all')}
                            className={`glass-panel px-4 py-2 md:px-6 md:py-2 rounded-full text-[10px] md:text-xs font-bold transition active:scale-95 ${filter === 'all' ? 'text-white border-blue-600 bg-blue-600/20 shadow-[0_0_10px_#2563EB]' : 'text-gray-400 border-transparent hover:text-white'}`}
                        >
                            SEMUA
                        </button>
                        <button 
                            onClick={() => setFilter('danger')}
                            className={`glass-panel px-4 py-2 md:px-6 md:py-2 rounded-full text-[10px] md:text-xs font-bold transition active:scale-95 ${filter === 'danger' ? 'text-[#FF2A6D] border-[#FF2A6D] bg-[#FF2A6D]/20 shadow-[0_0_10px_#FF2A6D]' : 'text-gray-400 hover:text-[#FF2A6D] border-transparent'}`}
                        >
                            BEGAL
                        </button>
                        <button 
                            onClick={() => setFilter('lamp')}
                            className={`glass-panel px-4 py-2 md:px-6 md:py-2 rounded-full text-[10px] md:text-xs font-bold transition active:scale-95 ${filter === 'lamp' ? 'text-yellow-400 border-yellow-400 bg-yellow-400/20 shadow-[0_0_10px_#Facc15]' : 'text-gray-400 hover:text-yellow-400 border-transparent'}`}
                        >
                            GELAP
                        </button>
                    </div>
                </div>
            )}

            {!isPickingMode && <DetailCard report={selectedReport} onClose={() => setSelectedReport(null)} onValidate={handleValidate} />}
        </div>
    );
};

export default MapPage;