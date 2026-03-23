import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Building2, Wifi, ChevronRight, Activity } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Markers for different statuses
const createCustomIcon = (status) => {
  let color = '#3b82f6'; // Default Blue
  if (status === 'online') color = '#22c55e'; // Success Green
  if (status === 'offline') color = '#ef4444'; // Danger Red
  if (status === 'slow') color = '#f59e0b'; // Warn Amber

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3); transition: transform 0.2s hover:scale-120"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const PharmacyNetworkMap = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const navigate = useNavigate();

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_URL}/pharmacies`);
      setPharmacies(response.data.data.pharmacies);
    } catch (error) {
      console.error('Error fetching map data:', error);
    }
  };

  const getStatus = (pharmacy) => {
    if (!pharmacy.isActive) return 'offline';
    // Logic for "slow" sync based on ID (deterministic mock)
    const sum = String(pharmacy._id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    if (sum % 5 === 0) return 'slow';
    return 'online';
  };

  const filteredPharmacies = pharmacies.filter(p => {
    const status = getStatus(p);
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedFilter === 'All' || 
                       (selectedFilter === 'Online' && status === 'online') ||
                       (selectedFilter === 'Offline' && status === 'offline') ||
                       (selectedFilter === 'Issue' && status === 'slow');
    return matchesSearch && matchesType;
  });

  return (
    <div className="relative flex-1 flex flex-col h-[700px] min-h-[700px]">
       {/* Floating Sidebar Content */}
       <div className="absolute top-6 left-6 z-[1000] w-80 pointer-events-none">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-5 pointer-events-auto backdrop-blur-md bg-white/90">
             <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue-600 p-2 rounded-xl text-white">
                   <Activity size={18} />
                </div>
                <div>
                   <h2 className="text-sm font-black text-gray-800 uppercase tracking-wider">Live Network Status</h2>
                   <p className="text-[10px] font-bold text-gray-400">Monitoring {pharmacies.length} branches</p>
                </div>
             </div>

             <div className="relative mb-5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input 
                   type="text" 
                   placeholder="Find a branch..." 
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                   className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
             </div>

             <div className="space-y-2">
                {['All', 'Online', 'Offline', 'Issue'].map(f => (
                   <button 
                      key={f}
                      onClick={() => setSelectedFilter(f)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${
                         selectedFilter === f ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-gray-50 text-gray-600'
                      }`}
                   >
                      <span className="text-xs font-black">{f}</span>
                      <ChevronRight size={14} />
                   </button>
                ))}
             </div>
          </div>
       </div>

       {/* Map View */}
       <div className="flex-1 z-0">
          <MapContainer 
             center={[7.8731, 80.7718]} 
             zoom={8} 
             style={{ height: '700px', width: '100%', borderRadius: '1.5rem', overflow: 'hidden' }}
             zoomControl={false}
          >
             <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
             />
             <ZoomControl position="bottomright" />
             
             {filteredPharmacies.map(p => {
                if (!p.location || !p.location.coordinates || p.location.coordinates.length < 2) return null;
                const status = getStatus(p);
                return (
                   <Marker 
                      key={p._id}
                      position={[p.location.coordinates[1], p.location.coordinates[0]]}
                      icon={createCustomIcon(status)}
                   >
                      <Popup className="custom-popup">
                         <div className="w-56 overflow-hidden bg-white -m-1">
                            {p.image ? (
                               <img src={p.image} alt="" className="h-24 w-full object-cover" />
                            ) : (
                               <div className="h-24 w-full bg-slate-100 flex items-center justify-center text-slate-300">
                                  <Building2 size={32} />
                               </div>
                            )}
                            <div className="p-3">
                               <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-extrabold text-gray-800 text-sm">{p.name}</h3>
                                  <span className={`w-2 h-2 rounded-full ${
                                     status === 'online' ? 'bg-green-500' : status === 'offline' ? 'bg-red-500' : 'bg-amber-500'
                                  }`} />
                               </div>
                               <div className="space-y-1.5 mb-3">
                                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500">
                                     <MapPin size={10} /> {p.district}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500">
                                     <Wifi size={10} /> Last Sync: {Math.floor(Math.random() * 59) + 1}m ago
                                  </div>
                                </div>
                                <button 
                                   onClick={() => navigate(`/pharmacy/${p._id}`)}
                                   className="w-full py-1.5 bg-slate-800 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-colors"
                                >
                                   View Branch Cockpit
                                </button>
                            </div>
                         </div>
                      </Popup>
                   </Marker>
                );
             })}
          </MapContainer>
       </div>
    </div>
  );
};

export default PharmacyNetworkMap;
