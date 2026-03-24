import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ShieldCheck, 
  ShoppingBag,
  Star,
  CheckCircle2,
  Navigation,
  Globe2
} from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const PharmacyQRDetail = () => {
  const { id } = useParams();
  const [pharmacy, setPharmacy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPharmacyDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPharmacyDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/pharmacies/${id}`);
      if (response.data.status === 'success') {
        setPharmacy(response.data.data.pharmacy);
      }
    } catch (err) {
      setError('Connection refused. Invalid scan matrix.');
    } finally {
      setLoading(false);
    }
  };

  const openMaps = () => {
    if (pharmacy?.address) {
      window.open(`https://maps.google.com/?q=${encodeURIComponent(pharmacy.address)}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
         <div className="w-16 h-16 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin mb-6 shadow-xl shadow-emerald-500/20" />
         <p className="font-black text-slate-400 tracking-widest text-xs uppercase animate-pulse">Establishing Secure Uplink</p>
      </div>
    );
  }

  if (error || !pharmacy) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
         <div className="w-24 h-24 bg-rose-100 text-rose-600 rounded-[2rem] flex items-center justify-center mb-8 rotate-3 shadow-inner border border-rose-200">
            <ShieldCheck size={40} />
         </div>
         <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Decryption Failed</h2>
         <p className="text-slate-500 font-medium text-lg max-w-xs">{error}</p>
         <button onClick={() => window.location.href='/pharmacy-qr'} className="mt-10 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-black transition-colors shadow-2xl">
            Return to Directory
         </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-32">
       
       {/* MASSIVE IMMERSIVE HERO */}
       <div className="relative h-[45vh] min-h-[350px] w-full bg-slate-900 rounded-b-[3rem] overflow-hidden shadow-2xl shrink-0">
          {pharmacy.imageUrl ? (
            <img src={pharmacy.imageUrl} alt={pharmacy.name} className="w-full h-full object-cover opacity-60 mix-blend-luminosity scale-105" />
          ) : (
            <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-700 via-slate-900 to-slate-900" />
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
             <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm border border-white/20">
                <Globe2 size={18} className="text-white"/>
             </div>
             <div className="px-3 py-1.5 bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-emerald-300 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
             </div>
          </div>

          <div className="absolute bottom-0 left-0 w-full p-8 pb-10">
             <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter leading-[1.1] mb-2">{pharmacy.name}</h1>
             <p className="text-slate-300 font-bold text-lg flex items-center gap-2">
                <MapPin size={18} className="text-blue-400" /> {pharmacy.district}
             </p>
          </div>
       </div>

       {/* CONTENT BLOCKS (Overlap Hero slightly) */}
       <div className="max-w-lg mx-auto px-6 -mt-8 relative z-10 space-y-6">
          
          {/* Top Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100/50 hover:-translate-y-1 transition-transform">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Trust Score</p>
                <div className="flex items-end gap-2">
                   <span className="text-3xl font-black text-slate-900 leading-none">4.9</span>
                   <span className="text-sm font-bold text-amber-500 mb-1 flex items-center"><Star size={14} className="fill-amber-500 mr-0.5"/> </span>
                </div>
             </div>
             <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100/50 hover:-translate-y-1 transition-transform">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Facility Status</p>
                <div className="flex items-center gap-2">
                   <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <Clock size={20} className="text-emerald-500" />
                   </div>
                   <span className="text-sm font-black text-emerald-600 uppercase tracking-tight">Open<br/>Now</span>
                </div>
             </div>
          </div>

          {/* Core Info - iOS Settings Style Component */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100/80 overflow-hidden divide-y divide-slate-100">
             
             <div className="p-6 sm:p-8 flex items-start gap-5 hover:bg-slate-50 transition-colors cursor-pointer group" onClick={openMaps}>
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 group-hover:scale-110 transition-transform">
                   <Navigation size={24} strokeWidth={2} />
                </div>
                <div>
                   <h4 className="font-black text-slate-900 text-base mb-1">Physical Location</h4>
                   <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-[250px]">{pharmacy.address || 'Street address not officially provided. Tap to search coordinates.'}</p>
                </div>
             </div>

             {pharmacy.contactNumber && (
               <div className="p-6 sm:p-8 flex items-start gap-5 hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => window.location.href=`tel:${pharmacy.contactNumber}`}>
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 group-hover:scale-110 transition-transform">
                     <Phone size={24} strokeWidth={2} />
                  </div>
                  <div className="flex items-center h-14">
                     <div>
                        <h4 className="font-black text-slate-900 text-base mb-1">Voice Communication</h4>
                        <p className="text-slate-500 font-semibold text-lg tracking-tight">{pharmacy.contactNumber}</p>
                     </div>
                  </div>
               </div>
             )}

             {pharmacy.email && (
               <div className="p-6 sm:p-8 flex items-start gap-5 hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => window.location.href=`mailto:${pharmacy.email}`}>
                  <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-600 shrink-0 group-hover:scale-110 transition-transform">
                     <Mail size={24} strokeWidth={2} />
                  </div>
                  <div className="flex items-center h-14 w-full">
                     <div className="w-full">
                        <h4 className="font-black text-slate-900 text-base mb-1">Digital Mail</h4>
                        <p className="text-slate-500 font-medium text-sm truncate mr-2">{pharmacy.email}</p>
                     </div>
                  </div>
               </div>
             )}
          </div>

          {/* Security Banner */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white overflow-hidden relative shadow-2xl shadow-slate-900/20 border border-slate-800">
             <div className="absolute bottom-0 right-0 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl translate-y-1/2 translate-x-1/3" />
             <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl -translate-y-1/2 -translate-x-1/2" />
             
             <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-4 relative z-10">
                <CheckCircle2 size={16} /> Data Encryption Active
             </div>
             <h3 className="text-xl font-black mb-3 relative z-10 tracking-tight">Enterprise Availability</h3>
             <p className="text-slate-400 text-sm leading-relaxed font-medium relative z-10">
                This facility maintains elite stock tiers for immediate prescription fulfillment and over-the-counter provisioning globally.
             </p>
          </div>

       </div>

       {/* FLOATING ACTION BAR (Fixed Bottom iOS style) */}
       <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent pb-8 z-50">
          <div className="max-w-md mx-auto relative group">
             <div className="absolute inset-0 bg-blue-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-300" />
             <button 
                onClick={() => window.location.href='/user/order'}
                className="w-full relative px-8 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] border border-blue-500/50 shadow-2xl"
             >
                <ShoppingBag size={20} /> Proceed to Order
             </button>
          </div>
       </div>

    </div>
  );
};

export default PharmacyQRDetail;
