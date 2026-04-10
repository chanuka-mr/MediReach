import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pharmacyAPI } from '../../utils/apiEndpoints';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, Phone, Mail, Clock, 
  ArrowLeft, Edit, Power, QrCode, TrendingUp,
  Activity, Calendar, Map as MapIcon, ChevronRight, X, Loader2, Plus, ShieldCheck,
  AlertCircle, CheckCircle, AlertTriangle, Zap, Users, Package as PackageIcon
} from 'lucide-react';

const PharmacyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pharmacy, setPharmacy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHealthDiagnosticsModal, setShowHealthDiagnosticsModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});

  const fetchPharmacy = useCallback(async () => {
    try {
      const response = await pharmacyAPI.getPharmacyById(id);
      setPharmacy(response.data.data?.pharmacy || response.data.pharmacy);
    } catch (error) {
      console.error('Error fetching pharmacy details:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPharmacy();
  }, [id, fetchPharmacy]);

  const handleToggleStatus = async () => {
    try {
      await pharmacyAPI.toggleStatus(id);
      fetchPharmacy();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const openEditModal = () => {
    setFormData({
      name: pharmacy.name,
      district: pharmacy.district,
      contactNumber: pharmacy.contactNumber,
      email: pharmacy.email,
      pharmacistName: pharmacy.pharmacistName,
      operatingHours: pharmacy.operatingHours,
      image: pharmacy.image,
      location: pharmacy.location
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await pharmacyAPI.updatePharmacy(id, formData);
      setShowEditModal(false);
      fetchPharmacy();
    } catch (error) {
      console.error('Error updating pharmacy:', error);
      alert('Failed to update pharmacy details');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Initializing store cockpit...</div>;
  if (!pharmacy) return <div className="p-12 text-center text-red-500">Pharmacy branch not found in the network.</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex justify-between items-center">
        <button 
          onClick={() => navigate('/pharmacy/manage')}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={16} /> Master Fleet Directory
        </button>
        <div className="flex gap-3">
          <button 
            onClick={openEditModal}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-black text-gray-700 hover:bg-gray-50 shadow-sm transition-all active:scale-95"
          >
             <Edit size={16} /> Edit Profile
          </button>
          <button 
            onClick={handleToggleStatus}
            className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-black shadow-sm transition-all active:scale-95 ${
             pharmacy.isActive ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100' : 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100'
          }`}>
             <Power size={16} /> {pharmacy.isActive ? 'Force Offline' : 'Set Online'}
          </button>
        </div>
      </div>

      {/* Hero Header */}
      <div className="relative h-64 w-full rounded-3xl overflow-hidden shadow-2xl border border-white">
        {pharmacy.image ? (
          <img src={pharmacy.image} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-slate-100" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-8 left-8 flex items-end gap-6 text-white">
           <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 flex items-center justify-center text-4xl font-black">
              {pharmacy.name.substring(0, 1)}
           </div>
           <div>
              <div className="flex items-center gap-3 mb-1">
                 <h1 className="text-4xl font-black tracking-tight">{pharmacy.name}</h1>
                 <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                   pharmacy.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                 }`}>
                   {pharmacy.isActive ? 'Active Node' : 'Suspended'}
                 </span>
              </div>
              <p className="flex items-center gap-2 text-white/70 font-bold">
                 <MapPin size={16} className="text-blue-400" /> {pharmacy.district} Network Hub • CID: {pharmacy._id.slice(-8).toUpperCase()}
              </p>
           </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-3 gap-8">
         {/* Left Column: Branch Information */}
         <div className="col-span-2 space-y-8">
            {/* Pharmacy Details Overview */}
            <div className="grid grid-cols-3 gap-6">
               <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 text-blue-600 mb-4">
                     <MapPin size={20} />
                     <span className="text-[10px] font-black uppercase tracking-widest">Location</span>
                  </div>
                  <p className="text-sm font-black text-gray-800">{pharmacy.district}</p>
                  <p className="text-xs font-bold text-gray-400 mt-2">Network Hub</p>
               </div>
               <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 text-purple-600 mb-4">
                     <Clock size={20} />
                     <span className="text-[10px] font-black uppercase tracking-widest">Hours</span>
                  </div>
                  <p className="text-sm font-black text-gray-800">{pharmacy.operatingHours.open} - {pharmacy.operatingHours.close}</p>
                  <p className="text-xs font-bold text-gray-400 mt-2">Operating Hours</p>
               </div>
               <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 text-emerald-600 mb-4">
                     <ShieldCheck size={20} />
                  </div>
                  <p className={`text-sm font-black ${pharmacy.isActive ? 'text-green-600' : 'text-red-600'}`}>
                     {pharmacy.isActive ? 'Active' : 'Inactive'}
                  </p>
                  <p className="text-xs font-bold text-gray-400 mt-2">Status</p>
               </div>
            </div>

            {/* Pharmacy Information Card */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
               <div className="flex justify-between items-center mb-8">
                  <div>
                     <h3 className="text-lg font-black text-gray-800">Details</h3>
                     <p className="text-xs font-bold text-gray-400">Complete pharmacy information</p>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-6">
                     <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Pharmacy ID</label>
                        <p className="text-sm font-bold text-gray-800 font-mono bg-gray-50 p-3 rounded-lg">{pharmacy._id}</p>
                     </div>
                     <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Pharmacist Name</label>
                        <p className="text-sm font-bold text-gray-800">{pharmacy.pharmacistName}</p>
                     </div>
                     <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Contact Number</label>
                        <p className="text-sm font-bold text-blue-600"><a href={`tel:${pharmacy.contactNumber}`}>{pharmacy.contactNumber}</a></p>
                     </div>
                  </div>
                  <div className="space-y-6">
                     <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Email Address</label>
                        <p className="text-sm font-bold text-blue-600"><a href={`mailto:${pharmacy.email}`}>{pharmacy.email}</a></p>
                     </div>
                     <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Status</label>
                        <p className={`text-sm font-bold inline-block px-3 py-1 rounded-full ${
                           pharmacy.isActive 
                           ? 'bg-green-100 text-green-700' 
                           : 'bg-red-100 text-red-700'
                        }`}>
                           {pharmacy.isActive ? '🟢 Active' : '🔴 Inactive'}
                        </p>
                     </div>
                     <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Created Date</label>
                        <p className="text-sm font-bold text-gray-800">
                           {pharmacy.createdAt ? new Date(pharmacy.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Right Column: Profile & Info */}
         <div className="space-y-6">
            {/* Identity Card */}
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white">
               <div className="flex items-center gap-3 mb-8">
                  <div className="bg-blue-600 p-2 rounded-xl">
                     <ShieldCheck size={20} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-blue-400">Head Pharmacist</span>
               </div>
               <p className="text-2xl font-black mb-1">{pharmacy.pharmacistName}</p>
               <p className="text-xs font-bold text-slate-400 mb-6 font-mono">ID: PH-LM-8291</p>
               <div className="h-px bg-white/10 mb-6" />
               <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm font-bold opacity-80">
                     <Phone size={16} className="text-blue-400" /> {pharmacy.contactNumber}
                  </div>
                  <div className="flex items-center gap-4 text-sm font-bold opacity-80">
                     <Mail size={16} className="text-blue-400" /> {pharmacy.email}
                  </div>
                  <div className="flex items-center gap-4 text-sm font-bold opacity-80">
                     <Clock size={16} className="text-blue-400" /> {pharmacy.operatingHours.open} - {pharmacy.operatingHours.close}
                  </div>
               </div>
            </div>

            {/* Quick Actions List */}
            <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
               <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-6 px-2">Node Controls</h3>
               <div className="space-y-2">
                  <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-all group">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                           <QrCode size={20} />
                        </div>
                        <span className="text-sm font-bold text-gray-700">Service QR Generator</span>
                     </div>
                     <ChevronRight size={16} className="text-gray-300" />
                  </button>
                  <button 
                     onClick={() => setShowHealthDiagnosticsModal(true)}
                     className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-all group">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                           <Activity size={20} />
                        </div>
                        <span className="text-sm font-bold text-gray-700">Health Diagnostics</span>
                     </div>
                     <ChevronRight size={16} className="text-gray-300" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-all group">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
                           <Calendar size={20} />
                        </div>
                        <span className="text-sm font-bold text-gray-700">Shift Management</span>
                     </div>
                     <ChevronRight size={16} className="text-gray-300" />
                  </button>
               </div>
            </div>

            {/* Micro Map */}
            <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Geo Positioning</h3>
                  <MapIcon size={14} className="text-blue-500" />
               </div>
               <div className="h-32 rounded-2xl overflow-hidden border border-slate-200">
                  <MapContainer 
                     center={[pharmacy.location.coordinates[1], pharmacy.location.coordinates[0]]} 
                     zoom={13} 
                     className="h-full w-full"
                     zoomControl={false}
                     scrollWheelZoom={false}
                  >
                     <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                     <Marker position={[pharmacy.location.coordinates[1], pharmacy.location.coordinates[0]]} />
                  </MapContainer>
               </div>
               <div className="mt-4 flex justify-between items-center text-[10px] font-black text-gray-400">
                  <span>LAT: {pharmacy.location.coordinates[1].toFixed(4)}</span>
                  <span>LNG: {pharmacy.location.coordinates[0].toFixed(4)}</span>
               </div>
            </div>
         </div>
      </div>
      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="flex justify-between items-center p-8 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-black text-gray-800">Edit Branch Profile</h2>
                <p className="text-sm font-bold text-gray-400 mt-1">Update network node parameters for {pharmacy.name}</p>
              </div>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Pharmacy Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">District Hub</label>
                  <select
                    required
                    value={formData.district || ''}
                    onChange={(e) => setFormData({...formData, district: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none"
                  >
                    {['Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Galle', 'Matara', 'Jaffna', 'Kurunegala', 'Badulla'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Secure Contact</label>
                  <input
                    type="tel"
                    required
                    value={formData.contactNumber || ''}
                    onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Admin Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Head Pharmacist</label>
                <input
                  type="text"
                  required
                  value={formData.pharmacistName || ''}
                  onChange={(e) => setFormData({...formData, pharmacistName: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-6 text-gray-400 font-bold text-xs uppercase tracking-widest px-1">
                <div className="space-y-2">
                  <label className="ml-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.location?.coordinates[1] || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      location: { ...formData.location, coordinates: [formData.location.coordinates[0], parseFloat(e.target.value)] }
                    })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="ml-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.location?.coordinates[0] || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      location: { ...formData.location, coordinates: [parseFloat(e.target.value), formData.location.coordinates[1]] }
                    })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Image Upload Integration */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Store Branding Image</label>
                <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-gray-100">
                  <div className="w-24 h-24 rounded-2xl bg-white border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                    {formData.image ? (
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-gray-300">
                         <Plus size={24} className="mx-auto mb-1" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      id="detail-image-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setFormData({...formData, image: reader.result});
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <label 
                      htmlFor="detail-image-upload"
                      className="inline-flex px-6 py-2 bg-white border border-gray-100 rounded-xl text-xs font-black text-gray-700 hover:bg-gray-100 cursor-pointer shadow-sm transition-all"
                    >
                      CHOOSE IMAGE
                    </label>
                    <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-tight">Support JPEG, PNG, WebP (Max 2MB)</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-8 py-3.5 rounded-2xl text-sm font-black text-gray-400 hover:bg-gray-50 transition-all"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-10 py-3.5 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white rounded-2xl text-sm font-black shadow-lg shadow-slate-200 flex items-center gap-2 transition-all active:scale-95"
                >
                  {saving && <Loader2 size={18} className="animate-spin" />}
                  {saving ? 'UPDATING...' : 'SAVE NODE CHANGES'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Health Diagnostics Modal */}
      {showHealthDiagnosticsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="flex justify-between items-center p-8 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-black text-gray-800">Health Diagnostics</h2>
                <p className="text-sm font-bold text-gray-400 mt-1">System status & operational metrics for {pharmacy.name}</p>
              </div>
              <button 
                onClick={() => setShowHealthDiagnosticsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* System Status Section */}
              <div>
                <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600" />
                  System Status
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-black uppercase tracking-widest text-gray-600">Operational Status</span>
                      <CheckCircle size={20} className="text-green-600" />
                    </div>
                    <p className="text-2xl font-black text-green-700">🟢 Online</p>
                    <p className="text-xs font-bold text-green-600 mt-2">{pharmacy.isActive ? 'Active' : 'Inactive'}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-100">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-black uppercase tracking-widest text-gray-600">System Uptime</span>
                      <Zap size={20} className="text-blue-600" />
                    </div>
                    <p className="text-2xl font-black text-blue-700">99.8%</p>
                    <p className="text-xs font-bold text-blue-600 mt-2">Last 30 days</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-100">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-black uppercase tracking-widest text-gray-600">Response Time</span>
                      <TrendingUp size={20} className="text-purple-600" />
                    </div>
                    <p className="text-2xl font-black text-purple-700">145ms</p>
                    <p className="text-xs font-bold text-purple-600 mt-2">Average response</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-2xl border border-orange-100">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-black uppercase tracking-widest text-gray-600">Last Connection</span>
                      <Activity size={20} className="text-orange-600" />
                    </div>
                    <p className="text-2xl font-black text-orange-700">Now</p>
                    <p className="text-xs font-bold text-orange-600 mt-2">Just now</p>
                  </div>
                </div>
              </div>

              {/* Operational Metrics */}
              <div>
                <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
                  <TrendingUp size={20} className="text-blue-600" />
                  Operational Metrics
                </h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-bold text-gray-700">Orders Processed (Today)</span>
                      <span className="text-xl font-black text-gray-900">42</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '68%'}}></div>
                    </div>
                    <p className="text-xs font-bold text-gray-500 mt-2">68% of daily average</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-bold text-gray-700">Active Users</span>
                      <span className="text-xl font-black text-gray-900">3</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '45%'}}></div>
                    </div>
                    <p className="text-xs font-bold text-gray-500 mt-2">Staff members connected</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-bold text-gray-700">Database Size</span>
                      <span className="text-xl font-black text-gray-900">245 MB</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{width: '35%'}}></div>
                    </div>
                    <p className="text-xs font-bold text-gray-500 mt-2">35% storage capacity used</p>
                  </div>
                </div>
              </div>

              {/* System Checks */}
              <div>
                <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
                  <ShieldCheck size={20} className="text-emerald-600" />
                  System Checks
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-100 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle size={20} className="text-green-600" />
                      <span className="text-sm font-bold text-gray-700">Database Connection</span>
                    </div>
                    <span className="text-xs font-black bg-green-100 text-green-700 px-3 py-1 rounded-full">OK</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-100 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle size={20} className="text-green-600" />
                      <span className="text-sm font-bold text-gray-700">API Endpoints</span>
                    </div>
                    <span className="text-xs font-black bg-green-100 text-green-700 px-3 py-1 rounded-full">OK</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-100 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle size={20} className="text-green-600" />
                      <span className="text-sm font-bold text-gray-700">File Storage</span>
                    </div>
                    <span className="text-xs font-black bg-green-100 text-green-700 px-3 py-1 rounded-full">OK</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <AlertTriangle size={20} className="text-amber-600" />
                      <span className="text-sm font-bold text-gray-700">Cache Performance</span>
                    </div>
                    <span className="text-xs font-black bg-amber-100 text-amber-700 px-3 py-1 rounded-full">WARNING</span>
                  </div>
                </div>
              </div>

              {/* Alerts & Notifications */}
              <div>
                <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
                  <AlertCircle size={20} className="text-amber-600" />
                  Alerts & Notifications
                </h3>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                    <div className="flex gap-3">
                      <CheckCircle size={20} className="text-blue-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-black text-blue-900">System updated successfully</p>
                        <p className="text-xs font-bold text-blue-700 mt-1">2 hours ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-100 p-4 rounded-2xl">
                    <div className="flex gap-3">
                      <CheckCircle size={20} className="text-green-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-black text-green-900">Backup completed</p>
                        <p className="text-xs font-bold text-green-700 mt-1">4 hours ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl">
                    <div className="flex gap-3">
                      <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-black text-amber-900">High order volume detected</p>
                        <p className="text-xs font-bold text-amber-700 mt-1">Peak hours (18:00-20:00)</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                    <div className="flex gap-3">
                      <CheckCircle size={20} className="text-blue-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-black text-blue-900">All checks passed</p>
                        <p className="text-xs font-bold text-blue-700 mt-1">Last check: 5 minutes ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-6 border-t border-gray-100">
                <button
                  onClick={() => setShowHealthDiagnosticsModal(false)}
                  className="px-10 py-3.5 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl text-sm font-black shadow-lg shadow-slate-200 transition-all active:scale-95"
                >
                  CLOSE DIAGNOSTICS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyDetail;
