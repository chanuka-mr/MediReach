import React, { useState, useEffect } from 'react';
import { Plus, Search, RefreshCw, X, ArrowLeft, Download, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { pharmacyAPI } from '../../utils/apiEndpoints';
import PharmacyCard from './PharmacyCard';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
};

const PharmacyManagement = () => {
  const navigate = useNavigate();
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [editingPharmacy, setEditingPharmacy] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [qrPharmacyName, setQrPharmacyName] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [formData, setFormData] = useState({
    name: '',
    district: 'Colombo',
    location: { type: 'Point', coordinates: [79.8612 + (Math.random() * 0.05), 6.9271 + (Math.random() * 0.05)] },
    contactNumber: '',
    email: '',
    operatingHours: { open: '08:00', close: '22:00' },
    pharmacistName: '',
    image: null
  });

  const [imagePreview, setImagePreview] = useState(null);

  const districts = ['Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Galle', 'Matara', 'Jaffna', 'Kurunegala', 'Badulla'];

  // Fetch all pharmacies
  const fetchPharmacies = async () => {
    setLoading(true);
    try {
      const response = await pharmacyAPI.getAllPharmacies();
      setPharmacies(response.data.data?.pharmacies || response.data.pharmacies || (Array.isArray(response.data) ? response.data : []));
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacies();
  }, []);

  // Create or Update pharmacy
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPharmacy) {
        await pharmacyAPI.updatePharmacy(editingPharmacy._id, formData);
      } else {
        await pharmacyAPI.createPharmacy(formData);
      }
      fetchPharmacies();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving pharmacy:', error);
      alert(error.response?.data?.message || 'Error saving pharmacy');
    }
  };

  // Delete pharmacy
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this pharmacy?')) {
      try {
        await pharmacyAPI.deletePharmacy(id);
        fetchPharmacies();
      } catch (error) {
        console.error('Error deleting pharmacy:', error);
        alert(error.response?.data?.message || 'Error deleting pharmacy');
      }
    }
  };

  // Toggle status
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await pharmacyAPI.toggleStatus(id);
      fetchPharmacies();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  // Generate QR Code
  const handleGenerateQR = async (id, name) => {
    try {
      const response = await pharmacyAPI.generateQRCode(id);
      setQrCode(response.data.data.qrCode);
      setQrPharmacyName(name);
      setShowQRModal(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Error generating QR code');
    }
  };

  // Edit pharmacy
  const handleEdit = (pharmacy) => {
    setEditingPharmacy(pharmacy);
    setFormData({
      name: pharmacy.name,
      district: pharmacy.district,
      location: pharmacy.location,
      contactNumber: pharmacy.contactNumber,
      email: pharmacy.email,
      operatingHours: pharmacy.operatingHours,
      pharmacistName: pharmacy.pharmacistName,
      image: pharmacy.image
    });
    setImagePreview(pharmacy.image);
    setShowModal(true);
  };

  // Handle Image Change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB Limit
        alert('Image size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset form
  const resetForm = () => {
    setEditingPharmacy(null);
    setFormData({
      name: '',
      district: 'Colombo',
      location: { type: 'Point', coordinates: [79.8612 + (Math.random() * 0.05), 6.9271 + (Math.random() * 0.05)] },
      contactNumber: '',
      email: '',
      operatingHours: { open: '08:00', close: '22:00' },
      pharmacistName: '',
      image: null
    });
    setImagePreview(null);
  };

  // Filter pharmacies
  const filteredPharmacies = pharmacies.filter(pharmacy => {
    const matchesSearch = pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pharmacy.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDistrict = selectedDistrict === 'All' || pharmacy.district === selectedDistrict;
    return matchesSearch && matchesDistrict;
  });

  const exportToCSV = () => {
    if (filteredPharmacies.length === 0) return;
    
    const headers = ['Name', 'District', 'Contact Number', 'Email', 'Pharmacist', 'Status', 'Latitude', 'Longitude'];
    const csvData = filteredPharmacies.map(p => [
      `"${p.name}"`,
      `"${p.district}"`,
      `"${p.contactNumber}"`,
      `"${p.email}"`,
      `"${p.pharmacistName}"`,
      `"${p.isActive ? 'Active' : 'Inactive'}"`,
      p.location?.coordinates[1] || '',
      p.location?.coordinates[0] || ''
    ]);
    
    const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pharmacies_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const handleToggleSelect = (id) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} pharmacies?`)) return;
    try {
      await pharmacyAPI.bulkDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
      fetchPharmacies();
    } catch (error) {
      console.error('Error bulk deleting:', error);
      alert('Failed to delete pharmacies');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <button 
            onClick={() => navigate('/pharmacy')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-4 transition-colors font-medium cursor-pointer"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Pharmacy Management</h1>
          <p className="text-gray-500 mt-1">Manage all pharmacies in the network</p>
        </div>
        <div className="flex items-center gap-3 self-end">
          <button
            onClick={exportToCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Download size={18} /> Export CSV
          </button>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={18} /> Add New Pharmacy
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search pharmacies..."
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
          onClick={fetchPharmacies}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Pharmacy Cards Grid */}
      {loading ? (
        <div className="text-center py-12">Loading pharmacies...</div>
      ) : filteredPharmacies.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No pharmacies found</div>
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
                isSelected={selectedIds.has(pharmacy._id)}
                onToggleSelect={() => handleToggleSelect(pharmacy._id)}
              />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">{editingPharmacy ? 'Edit Pharmacy' : 'Add New Pharmacy'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pharmacy Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                  <select
                    required
                    value={formData.district}
                    onChange={(e) => setFormData({...formData, district: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                    placeholder="0771234567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pharmacist Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.pharmacistName}
                    onChange={(e) => setFormData({...formData, pharmacistName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {/* Image Upload */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pharmacy Image</label>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-24 h-24 rounded-lg bg-white border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center text-gray-400">
                           <Plus size={24} className="mx-auto mb-1" />
                           <span className="text-[10px] font-bold uppercase tracking-wider">Image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="pharmacy-image-upload"
                      />
                      <label
                        htmlFor="pharmacy-image-upload"
                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors shadow-sm"
                      >
                        Choose Image
                      </label>
                      <p className="text-xs text-gray-500 mt-2 font-medium">PNG, JPG or WebP. Max 2MB recommended.</p>
                      {imagePreview && (
                        <button 
                          type="button"
                          onClick={() => { setFormData({ ...formData, image: null }); setImagePreview(null); }}
                          className="text-xs font-bold text-red-600 mt-2 hover:underline"
                        >
                          Remove Image
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location Map (Click to set coordinates)</label>
                  <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-300 relative z-0">
                    <MapContainer 
                      center={[formData.location.coordinates[1], formData.location.coordinates[0]]} 
                      zoom={12} 
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        attribution='&amp;copy <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <LocationMarker 
                        position={[formData.location.coordinates[1], formData.location.coordinates[0]]}
                        setPosition={(pos) => setFormData({
                          ...formData,
                          location: { type: 'Point', coordinates: [pos[1], pos[0]] }
                        })}
                      />
                    </MapContainer>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 font-medium">
                    Latitude: {formData.location.coordinates[1].toFixed(4)}, Longitude: {formData.location.coordinates[0].toFixed(4)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Open Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.operatingHours.open}
                    onChange={(e) => setFormData({
                      ...formData,
                      operatingHours: { ...formData.operatingHours, open: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Close Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.operatingHours.close}
                    onChange={(e) => setFormData({
                      ...formData,
                      operatingHours: { ...formData.operatingHours, close: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingPharmacy ? 'Update' : 'Create'} Pharmacy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{qrPharmacyName} - QR Code</h2>
              <button onClick={() => setShowQRModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            {/* Pharmacy Preview in Modal */}
            {pharmacies.find(p => p.name === qrPharmacyName)?.image && (
              <div className="mb-6 h-32 w-full rounded-xl overflow-hidden border border-gray-100 shadow-inner">
                <img 
                  src={pharmacies.find(p => p.name === qrPharmacyName).image} 
                  alt="" 
                  className="w-full h-full object-cover" 
                />
              </div>
            )}

            <div className="flex justify-center">
              <img src={qrCode} alt="QR Code" className="w-64 h-64" />
            </div>
            <p className="text-center text-gray-500 mt-4">Scan to view pharmacy details</p>
            <button
              onClick={() => setShowQRModal(false)}
              className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      {/* Floating Action Bar for Bulk Operations */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white px-6 py-4 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 flex items-center gap-6 z-40">
          <span className="font-bold text-blue-600">{selectedIds.size} selected</span>
          <div className="h-6 w-px bg-gray-300"></div>
          <button 
            onClick={handleBulkDelete}
            className="flex items-center gap-2 text-red-600 font-medium hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
          >
            <Trash2 size={18} /> Delete Selected
          </button>
          <button 
            onClick={() => setSelectedIds(new Set())}
            className="flex items-center gap-2 text-gray-500 font-medium hover:bg-gray-50 px-3 py-1.5 rounded-lg transition"
          >
            <X size={18} /> Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default PharmacyManagement;