import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Search, RefreshCw, AlertCircle, MapPin } from 'lucide-react';
import PharmacyCard from './PharmacyCard';

const API_URL = 'http://localhost:5000/api';

const PharmacyListView = ({ title, subTitle, type, extraParams = {} }) => {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  
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

  const [manualCoords, setManualCoords] = useState({ lat: '', lng: '' });
  const [showManualInput, setShowManualInput] = useState(false);

  const fetchWithLocation = useCallback((lat, lng) => {
    fetchPharmacies({ lat, lng, radius: 10 });
  }, [fetchPharmacies]);

  const requestGeolocation = useCallback(() => {
    if ('geolocation' in navigator) {
      setError(null);
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWithLocation(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          console.warn('Geolocation denied, showing manual input fallback.');
          setError('Location access was denied. You can reset it in your browser settings, or enter your coordinates manually below.');
          setShowManualInput(true);
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser. Please enter coordinates manually.');
      setShowManualInput(true);
      setLoading(false);
    }
  }, [fetchWithLocation]);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    if (type === 'nearby') {
      requestGeolocation();
    } else {
      fetchPharmacies();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <p className="text-gray-500 mt-1">{subTitle}</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search in results..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Districts</option>
          {districts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <button
          onClick={() => fetchPharmacies()}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <RefreshCw size={40} className="animate-spin text-blue-600 mb-4" />
          <p className="text-gray-500 font-medium tracking-wide">Fetching pharmacies...</p>
        </div>
      ) : error ? (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
            <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={24} />
            <div className="flex-1">
              <h3 className="text-red-800 font-bold">Location Access Error</h3>
              <p className="text-red-700 mt-1 text-sm">{error}</p>
              <div className="flex gap-3 mt-4 flex-wrap">
                {type === 'nearby' && (
                  <button
                    onClick={requestGeolocation}
                    className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all"
                  >
                    🔄 Retry Auto-Detect Location
                  </button>
                )}
                {type !== 'nearby' && (
                  <button
                    onClick={() => fetchPharmacies()}
                    className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-all"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Manual Coordinate Entry for Nearby */}
          {type === 'nearby' && showManualInput && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                <MapPin size={18} className="text-blue-600" /> Enter Your Location Manually
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                You can find your coordinates at <a href="https://www.latlong.net" target="_blank" rel="noreferrer" className="text-blue-600 underline">latlong.net</a> or Google Maps (right-click → "What's here?").
              </p>
              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 6.9271"
                    value={manualCoords.lat}
                    onChange={(e) => setManualCoords({ ...manualCoords, lat: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 79.8612"
                    value={manualCoords.lng}
                    onChange={(e) => setManualCoords({ ...manualCoords, lng: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
                  />
                </div>
                <button
                  onClick={() => {
                    if (manualCoords.lat && manualCoords.lng) {
                      setError(null);
                      setShowManualInput(false);
                      fetchWithLocation(parseFloat(manualCoords.lat), parseFloat(manualCoords.lng));
                    }
                  }}
                  disabled={!manualCoords.lat || !manualCoords.lng}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Search Nearby
                </button>
              </div>
            </div>
          )}
        </div>
      ) : filteredPharmacies.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin size={32} className="text-gray-400" />
          </div>
          <h3 className="text-gray-800 font-bold text-lg">No pharmacies found</h3>
          <p className="text-gray-500 mt-1 max-w-xs mx-auto">We couldn't find any pharmacies matching your current filters or selection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPharmacies.map(pharmacy => (
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
          ))}
        </div>
      )}
    </div>
  );
};

export default PharmacyListView;
