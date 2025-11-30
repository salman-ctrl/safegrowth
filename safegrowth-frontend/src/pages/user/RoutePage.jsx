import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine'; 
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { reportService } from '../../services/api';

// --- ICON LAPORAN (LEBIH JELAS & GLOWING) ---
const createReportIcon = (type) => {
    const color = type === 'danger' ? '#FF2A6D' : '#Facc15';
    const iconClass = type === 'danger' ? 'fa-triangle-exclamation' : 'fa-lightbulb';
    const glowColor = type === 'danger' ? 'bg-red-500' : 'bg-yellow-400';

    return L.divIcon({
        className: 'custom-icon',
        html: `
            <div class="relative flex items-center justify-center group opacity-90 hover:opacity-100 transition-opacity cursor-pointer">
                 <div class="absolute -inset-3 ${glowColor} rounded-full blur-md opacity-40 animate-pulse"></div>
                 <div class="relative z-10 bg-black/80 rounded-full p-1 border border-${type === 'danger' ? 'red-500' : 'yellow-400'}">
                    <i class="fa-solid ${iconClass} text-sm" style="color: ${color}; filter: drop-shadow(0 0 2px ${color});"></i>
                 </div>
            </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
};

// --- ICON PICKER DENGAN GAMBAR + NEON EFFECT ---
const createNeonMarkerIcon = (colorType) => {
    const imgUrl = colorType === 'blue' 
        ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png'
        : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png';
    
    const glowColor = colorType === 'blue' ? 'bg-blue-500' : 'bg-red-500';
    const shadowColor = colorType === 'blue' ? '#00F0FF' : '#FF2A6D';

    return L.divIcon({
        className: 'custom-icon-neon',
        html: `
            <div class="relative w-full h-full flex items-center justify-center">
                <div class="absolute bottom-0 w-8 h-8 ${glowColor} rounded-full blur-md opacity-60 animate-pulse"></div>
                <div class="absolute bottom-0 w-12 h-12 ${glowColor} rounded-full blur-xl opacity-30 animate-ping"></div>
                <img src="${imgUrl}" class="relative z-10 w-[25px] h-[41px]" style="filter: drop-shadow(0 0 5px ${shadowColor});">
            </div>
        `,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
    });
};

const startIcon = createNeonMarkerIcon('blue');
const endIcon = createNeonMarkerIcon('red');

// --- HELPER: INTEL GENERATOR ---
const generateRouteIntel = (distanceMeters, type) => {
    const km = distanceMeters / 1000;
    if (type === 'safe') {
        return {
            lights: Math.max(0, Math.floor(km * 0.5)), 
            cctv: Math.max(2, Math.floor(km * 4)),     
            police: Math.max(1, Math.floor(km * 1.5))  
        };
    } else {
        return {
            lights: Math.max(2, Math.floor(km * 3)),   
            cctv: Math.max(0, Math.floor(km * 0.5)),   
            police: 0
        };
    }
};

// --- COMPONENT: MAP CONTROLLER ---
const MapController = ({ startPoint, endPoint, onRouteFound, activeLayer }) => {
    const map = useMap();
    const routingControlRef = useRef(null);

    useEffect(() => {
        if (!startPoint || !endPoint) return;

        if (routingControlRef.current) {
            map.removeControl(routingControlRef.current);
            routingControlRef.current = null;
        }

        const profile = activeLayer === 'safe' ? 'cycling' : 'driving';
        const lineColor = activeLayer === 'safe' ? '#00F0FF' : '#FF2A6D';
        const lineWeight = activeLayer === 'safe' ? 6 : 5;
        const lineDash = activeLayer === 'safe' ? null : [10, 10];

        const waypoints = [
            L.latLng(startPoint.lat, startPoint.lng),
            L.latLng(endPoint.lat, endPoint.lng)
        ];

        if (activeLayer === 'safe') {
            const midLat = (startPoint.lat + endPoint.lat) / 2;
            const midLng = (startPoint.lng + endPoint.lng) / 2;
            const offset = 0.005; 
            waypoints.splice(1, 0, L.latLng(midLat + offset, midLng + offset));
        }

        const control = L.Routing.control({
            waypoints: waypoints,
            router: L.Routing.osrmv1({
                serviceUrl: 'https://router.project-osrm.org/route/v1',
                profile: profile
            }),
            lineOptions: {
                styles: [{ color: lineColor, opacity: 0.8, weight: lineWeight, dashArray: lineDash }]
            },
            createMarker: () => null, 
            show: false, 
            addWaypoints: false,
            fitSelectedRoutes: true
        }).addTo(map);

        control.on('routesfound', function(e) {
            const r = e.routes[0];
            const intel = generateRouteIntel(r.summary.totalDistance, activeLayer);
            onRouteFound({
                type: activeLayer,
                time: r.summary.totalTime,
                dist: r.summary.totalDistance,
                intel: intel
            });
        });

        routingControlRef.current = control;

        return () => {
            if (routingControlRef.current && map) {
                try { map.removeControl(routingControlRef.current); } catch (e) {}
            }
        };
    }, [startPoint, endPoint, activeLayer, map]);

    return null;
};

// --- COMPONENT: LOCATION PICKER ---
const LocationPicker = ({ mode, onPick }) => {
    useMapEvents({
        click(e) {
            if (mode) {
                onPick(e.latlng);
            }
        },
    });
    return null;
};

// --- MAIN PAGE ---
const RoutePage = () => {
    const [reports, setReports] = useState([]); 
    const [startPoint, setStartPoint] = useState(null); 
    const [endPoint, setEndPoint] = useState(null);
    const [pickMode, setPickMode] = useState(null); 
    const [routeData, setRouteData] = useState({ safe: null, risky: null }); 
    const [activeLayer, setActiveLayer] = useState(null); 
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

    // FETCH REPORTS
    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await reportService.getAll();
                setReports(data.filter(r => r.status !== 'rejected'));
            } catch (error) { console.error("Gagal load reports", error); }
        };
        fetchReports();
    }, []);

    // --- FIX GEOLOCATION NAME ---
    const getAddress = async (lat, lng) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            
            // Logika baru: Ambil nama tempat/jalan paling spesifik dari display_name
            if (data && data.display_name) {
                // Ambil bagian pertama (biasanya nama tempat)
                return data.display_name.split(',')[0]; 
            }
            
            // Fallback ke logika lama jika display_name kosong
            let address = data.address.road || data.address.suburb || "Titik Peta";
            if(data.address.city_district) address += `, ${data.address.city_district}`;
            return address;
        } catch (e) {
            return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        }
    };

    const handleMapClick = async (latlng) => {
        const address = await getAddress(latlng.lat, latlng.lng);
        const pointData = { ...latlng, address };

        if (pickMode === 'start') setStartPoint(pointData);
        if (pickMode === 'end') setEndPoint(pointData);
        
        setPickMode(null); 
        setRouteData({ safe: null, risky: null });
        setActiveLayer(null);
        setIsSidebarMinimized(false);
    };

    const handleCalculate = () => {
        if (!startPoint || !endPoint) return;
        setIsAnalyzing(true);
        setActiveLayer('safe'); 
    };

    const handleRouteResult = (data) => {
        setRouteData(prev => ({ ...prev, [data.type]: data }));
        if (data.type === 'safe' && isAnalyzing) {
            setIsAnalyzing(false);
            setIsSidebarMinimized(true);
        }
    };

    const handleReset = () => {
        setStartPoint(null);
        setEndPoint(null);
        setRouteData({ safe: null, risky: null });
        setActiveLayer(null);
        setIsAnalyzing(false);
        setIsSidebarMinimized(false);
    };

    const startPicking = (mode) => {
        setPickMode(mode);
    };

    const renderSidebar = () => {
        if (pickMode) return null;

        if (isSidebarMinimized) {
            return (
                <div className="absolute top-4 left-4 z-[500] animate-[fadeIn_0.3s_ease-out]">
                    <button 
                        onClick={() => setIsSidebarMinimized(false)}
                        className="glass-panel p-3 rounded-full flex items-center gap-3 text-white border border-cyan-400 hover:bg-cyan-400/20 transition shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                    >
                        <i className="fa-solid fa-bars-staggered"></i>
                        {routeData.safe && (
                            <div className="flex flex-col items-start leading-none mr-2">
                                <span className="text-[10px] text-gray-400 font-bold">RUTE DITEMUKAN</span>
                                <span className="text-xs font-bold text-cyan-400">
                                    {Math.round(routeData.safe.time / 60)} min <span className="text-gray-500">|</span> {(routeData.safe.dist / 1000).toFixed(1)} km
                                </span>
                            </div>
                        )}
                    </button>
                </div>
            );
        }

        return (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 md:translate-x-0 md:left-4 z-[500] w-[95%] md:w-[350px] glass-panel border-l-4 border-l-cyan-400 p-6 shadow-2xl pointer-events-auto max-h-[80vh] overflow-y-auto rounded-xl md:rounded-none md:rounded-r-xl transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-xl font-display font-bold mb-1 text-white">AI ROUTING</h2>
                        <p className="text-[10px] text-cyan-400 tracking-widest">TRAFFIC INTEL & AVOIDANCE</p>
                    </div>
                    <div className="flex gap-3">
                        {isAnalyzing && <i className="fa-solid fa-circle-notch fa-spin text-cyan-400 mt-1"></i>}
                        <button onClick={() => setIsSidebarMinimized(true)} className="text-gray-400 hover:text-white transition">
                            <i className="fa-solid fa-minus"></i>
                        </button>
                    </div>
                </div>
                
                <div className="space-y-4 mb-6 relative">
                    <div className="absolute left-[18px] top-8 bottom-8 w-[2px] bg-gray-700 z-0"></div>
                    
                    <div className="relative z-10">
                        <div className="absolute left-3 top-3 w-3 h-3 rounded-full bg-blue-600 border-2 border-black"></div>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={startPoint ? startPoint.address : ''} 
                                placeholder="Pilih Titik Awal..." 
                                readOnly 
                                className="w-full bg-[#050505] border border-white/10 rounded p-3 pl-10 text-xs text-white focus:border-blue-600 outline-none cursor-default"
                                onClick={() => startPicking('start')}
                            />
                            <button 
                                onClick={() => startPicking('start')}
                                className={`px-3 rounded border border-white/10 hover:bg-white/10 ${pickMode === 'start' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
                            >
                                <i className="fa-solid fa-map-pin"></i>
                            </button>
                        </div>
                    </div>

                    <div className="relative z-10">
                        <div className="absolute left-3 top-3 w-3 h-3 rounded-full bg-[#FF2A6D] border-2 border-black"></div>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={endPoint ? endPoint.address : ''} 
                                placeholder="Pilih Tujuan..." 
                                readOnly 
                                className="w-full bg-[#050505] border border-white/10 rounded p-3 pl-10 text-xs text-white focus:border-[#FF2A6D] outline-none cursor-default"
                                onClick={() => startPicking('end')}
                            />
                            <button 
                                onClick={() => startPicking('end')}
                                className={`px-3 rounded border border-white/10 hover:bg-white/10 ${pickMode === 'end' ? 'bg-[#FF2A6D] text-white' : 'text-gray-400'}`}
                            >
                                <i className="fa-solid fa-map-pin"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 mb-6">
                    <button 
                        onClick={handleCalculate}
                        disabled={!startPoint || !endPoint || isAnalyzing}
                        className="flex-1 bg-gray-800 text-white font-bold py-3 rounded text-sm transition duration-300 border border-white/10 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isAnalyzing ? 'MENGHITUNG...' : 'ANALISIS RUTE'}
                    </button>
                    <button onClick={handleReset} className="w-12 bg-gray-800 text-gray-500 rounded hover:bg-red-500 hover:text-white transition flex items-center justify-center border border-white/10">
                        <i className="fa-solid fa-trash-can"></i>
                    </button>
                </div>

                {(routeData.safe || activeLayer) && (
                    <div className="space-y-3 animate-[fadeIn_0.5s_ease-out]">
                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Hasil Analisis Jalur:</p>
                        
                        <div onClick={() => setActiveLayer('safe')} className={`cursor-pointer border p-4 rounded transition group relative overflow-hidden ${activeLayer === 'safe' ? 'bg-blue-600/10 border-blue-600' : 'bg-black/40 border-white/10 hover:bg-white/5'}`}>
                            {activeLayer === 'safe' && <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] px-2 py-0.5 font-bold rounded-bl">RECOMMENDED</div>}
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1"><span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 font-bold rounded">JALUR TIKUS</span></div>
                                    <h3 className="font-bold text-sm text-white">Rute Alternatif (Aman)</h3>
                                    {routeData.safe ? (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <span className="bg-green-900 text-green-200 text-[9px] px-1.5 py-0.5 rounded font-bold"><i className="fa-solid fa-traffic-light"></i> {routeData.safe.intel.lights} TL</span>
                                            <span className="bg-blue-900 text-blue-200 text-[9px] px-1.5 py-0.5 rounded font-bold"><i className="fa-solid fa-video"></i> {routeData.safe.intel.cctv} CCTV</span>
                                            <span className="bg-yellow-900 text-yellow-200 text-[9px] px-1.5 py-0.5 rounded font-bold"><i className="fa-solid fa-building-shield"></i> {routeData.safe.intel.police} POS</span>
                                        </div>
                                    ) : <span className="text-[10px] text-cyan-400 animate-pulse">Menghitung data intel...</span>}
                                </div>
                                <div className="text-right ml-2">
                                    {routeData.safe && <><span className="text-lg font-bold text-white block">{Math.round(routeData.safe.time / 60)} min</span><span className="text-[10px] text-gray-400">{(routeData.safe.dist / 1000).toFixed(1)} km</span></>}
                                </div>
                            </div>
                        </div>

                        <div onClick={() => setActiveLayer('risky')} className={`cursor-pointer border p-4 rounded transition group ${activeLayer === 'risky' ? 'bg-[#FF2A6D]/10 border-[#FF2A6D]' : 'bg-black/40 border-white/10 hover:bg-white/5'}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1"><span className="bg-[#FF2A6D]/20 text-[#FF2A6D] text-[10px] px-2 py-0.5 font-bold rounded">RAWAN</span></div>
                                    <h3 className="font-bold text-sm text-white">Rute Jalan Raya</h3>
                                    {routeData.risky ? (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <span className="bg-red-900 text-red-200 text-[9px] px-1.5 py-0.5 rounded font-bold"><i className="fa-solid fa-traffic-light"></i> {routeData.risky.intel.lights} TL</span>
                                            <span className="bg-gray-700 text-gray-300 text-[9px] px-1.5 py-0.5 rounded font-bold"><i className="fa-solid fa-video-slash"></i> MINIM CCTV</span>
                                        </div>
                                    ) : activeLayer === 'risky' ? <span className="text-[10px] text-[#FF2A6D] animate-pulse">Menghitung rute utama...</span> : <span className="text-[10px] text-gray-500">Klik untuk memuat</span>}
                                </div>
                                <div className="text-right ml-2">
                                    {routeData.risky && <><span className="text-lg font-bold text-gray-400 block">{Math.round(routeData.risky.time / 60)} min</span><span className="text-[10px] text-gray-500">{(routeData.risky.dist / 1000).toFixed(1)} km</span></>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const cursorClass = pickMode === 'start' ? 'cursor-target-blue' : pickMode === 'end' ? 'cursor-target-red' : '';

    return (
        <div className={`relative h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] w-full ${cursorClass}`}>
            
            {renderSidebar()}

            {pickMode && (
                <div className="absolute top-24 md:top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-black/80 border border-cyan-400 text-cyan-400 px-6 py-3 rounded-full shadow-[0_0_20px_#00F0FF] animate-bounce flex items-center gap-3 font-bold text-sm pointer-events-none text-center w-[90%] md:w-auto justify-center">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full animate-ping shrink-0"></div>
                    KLIK PETA UNTUK MEMILIH {pickMode === 'start' ? 'TITIK AWAL' : 'TUJUAN'}
                </div>
            )}

            <MapContainer 
                center={[-0.93, 100.39]} 
                zoom={13} 
                style={{ height: '100%', width: '100%', background: '#050505', cursor: pickMode ? 'crosshair' : 'grab' }} 
                zoomControl={false}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                
                <LocationPicker mode={pickMode} onPick={handleMapClick} />

                {reports.map((report) => (
                    <Marker 
                        key={report.id}
                        position={[report.latitude, report.longitude]}
                        icon={createReportIcon(report.category)}
                    />
                ))}

                {startPoint && <Marker position={[startPoint.lat, startPoint.lng]} icon={startIcon} />}
                {endPoint && <Marker position={[endPoint.lat, endPoint.lng]} icon={endIcon} />}

                {activeLayer && startPoint && endPoint && (
                    <MapController 
                        startPoint={startPoint} 
                        endPoint={endPoint} 
                        activeLayer={activeLayer}
                        onRouteFound={handleRouteResult}
                    />
                )}
            </MapContainer>
        </div>
    );
};

export default RoutePage;