import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Search, RefreshCw, AlertCircle, MapPin } from 'lucide-react';
import PharmacyCard from './PharmacyCard';
import PharmacyUserCard from '../pharmacyUserView/PharmacyUserCard';

const API_URL = 'http://localhost:5000/api';

const PharmacyListView = ({ title, subTitle, type, extraParams = {}, isUserView = false, onViewInfo }) => {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [userLocation, setUserLocation] = useState(null);
  
  const districts = ['Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Galle', 'Matara', 'Jaffna', 'Kurunegala', 'Badulla'];

  const fetchPharmacies = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = '';
      let queryParams = { ...extraParams, ...params };

      switch (type) {
        case 'nearby':
          endpoint = '/pharmacies/nearby';
          break;
        case 'open-now':
          endpoint = '/pharmacies/open-now';
          break;
        case '24-7':
          endpoint = '/pharmacies/24-7';
          break;
        default:
          endpoint = '/pharmacies';
      }

      const response = await axios.get(`${API_URL}${endpoint}`, { params: queryParams });
      setPharmacies(response.data.data.pharmacies);
    } catch (err) {
      console.error(`Error fetching ${type} pharmacies:`, err);
      setError(err.response?.data?.message || `Failed to load ${title}.`);
    } finally {
      setLoading(false);
    }
  }, [type, title, extraParams]);


  const fetchWithLocation = useCallback((lat, lng) => {
    setUserLocation({ lat, lng });
    fetchPharmacies({ lat, lng, radius: 10 });
  }, [fetchPharmacies]);

  const requestGeolocation = useCallback(() => {
    if ('geolocation' in navigator) {
      setError(null);
      if (type === 'nearby') setLoading(true);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWithLocation(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          console.warn('Geolocation denied, showing default view.');
          if (type === 'nearby') {
             setError('Location access was denied. You can enable it in your browser settings to see pharmacies near you.');
          } else {
             fetchPharmacies();
          }
          setLoading(false);
        }
      );
    } else {
      if (type === 'nearby') {
         setError('Geolocation is not supported by your browser.');
      } else {
         fetchPharmacies();
      }
      setLoading(false);
    }
  }, [fetchWithLocation, fetchPharmacies, type]);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    if (type === 'nearby' || isUserView) {
      requestGeolocation();
    } else {
      fetchPharmacies();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, isUserView]);

  const filteredPharmacies = pharmacies.filter(pharmacy => {
    const matchesSearch = pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pharmacy.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDistrict = selectedDistrict === 'All' || pharmacy.district === selectedDistrict;
    return matchesSearch && matchesDistrict;
  });

  // Mock functions for PharmacyCard compatibility
  const handleEdit = () => {};
  const handleDelete = () => {};
  const handleToggleStatus = () => {};
  const handleGenerateQR = () => {};
  const handleToggleSelect = () => {};

  return (
    <div className={isUserView ? "p-0" : "p-6"}>
      {!isUserView && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="text-gray-500 mt-1">{subTitle}</p>
        </div>
      )}

      {/* Search and Filter */}
      <div className={`flex flex-wrap gap-4 mb-6 ${isUserView ? 'px-8 pt-8' : ''}`}>
        <div className="flex-1 min-w-[200px]">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search in results..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
            />
          </div>
        </div>
        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          className="px-6 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 appearance-none bg-white cursor-pointer"
        >
          <option value="All">All Districts</option>
          {districts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <button
          onClick={() => fetchPharmacies()}
          className="px-6 py-3 border border-slate-200 rounded-2xl hover:bg-slate-50 flex items-center gap-2 font-bold text-slate-600 transition-all"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <RefreshCw size={48} className="animate-spin text-blue-600 mb-6 opacity-30" />
          <p className="text-slate-400 font-black tracking-widest uppercase text-xs">Fetching pharmacies...</p>
        </div>
      ) : error ? (
        <div className="space-y-4 px-8 pb-8">
          <div className="bg-red-50 border border-red-200 rounded-3xl p-8 flex items-start gap-5">
            <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={28} />
            <div className="flex-1">
              <h3 className="text-red-800 font-black tracking-tight text-lg leading-tight mb-2 uppercase">Location Error</h3>
              <p className="text-red-700/80 mt-1 text-sm font-medium leading-relaxed">{error}</p>
              <div className="flex gap-3 mt-6 flex-wrap">
                <button
                  onClick={requestGeolocation}
                  className="px-6 py-3 bg-red-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-500/20"
                >
                  🔄 Retry Location
                </button>
                {type !== 'nearby' && (
                  <button
                    onClick={() => fetchPharmacies()}
                    className="px-6 py-3 bg-white border border-red-200 text-red-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-50 transition-all"
                  >
                    View Anyway
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : filteredPharmacies.length === 0 ? (
        <div className="mx-8 mb-8 text-center py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
          <div className="w-20 h-20 bg-white shadow-sm rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-6 hover:rotate-0 transition-transform">
            <MapPin size={32} className="text-slate-300" />
          </div>
          <h3 className="text-slate-800 font-black text-2xl tracking-tight mb-2">No pharmacies found</h3>
          <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">We couldn't find any partners matching your current selection in <b>{selectedDistrict}</b>.</p>
        </div>
      ) : (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ${isUserView ? 'px-8 pb-12' : ''}`}>
          {filteredPharmacies.map(pharmacy => (
            isUserView ? (
              <PharmacyUserCard 
                key={pharmacy._id} 
                pharmacy={pharmacy} 
                userLocation={userLocation}
                onViewInfo={onViewInfo}
              />
            ) : (
              <PharmacyCard
                key={pharmacy._id}
                pharmacy={pharmacy}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
                onGenerateQR={handleGenerateQR}
                isSelected={false}
                onToggleSelect={handleToggleSelect}
              />
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default PharmacyListView;
