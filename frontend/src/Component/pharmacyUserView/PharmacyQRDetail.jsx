import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { pharmacyAPI } from '../../utils/apiEndpoints';
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
  Activity,
  Pill,
  Award,
  Heart,
  Zap,
  Microscope,
  Download,
  Share2,
  ChevronRight,
  Lock,
  Truck,
  CreditCard
} from 'lucide-react';

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
      const response = await pharmacyAPI.getPharmacyById(id);
      setPharmacy(response.data.data?.pharmacy || response.data.pharmacy);
    } catch (err) {
      console.error('Error fetching pharmacy details:', err);
      setError('Failed to load pharmacy details');
    } finally {
      setLoading(false);
    }
  };

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedService, setSelectedService] = useState(null);
  const [isUserSignedUp, setIsUserSignedUp] = useState(false);

  // Check if user is signed up on component mount
  useEffect(() => {
    const userToken = localStorage.getItem('userToken');
    const userId = localStorage.getItem('userId');
    setIsUserSignedUp(!!(userToken && userId));
  }, []);

  const handleOrderNow = () => {
    if (!isUserSignedUp) {
      alert('You need to sign up to place an order');
      return;
    }
    // If user is signed up, redirect to order page
    window.location.href = '/user/order';
  };

  const openMaps = () => {
    if (pharmacy?.address) {
      window.open(`https://maps.google.com/?q=${encodeURIComponent(pharmacy.address)}`, '_blank');
    }
  };

  const handleDownloadPrescription = () => {
    alert('Download functionality coming soon');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: pharmacy.name,
        text: `Check out ${pharmacy.name} on MediReach`,
        url: window.location.href
      });
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
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100">
       
       {/* HERO SECTION WITH OVERLAY */}
       <div className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
          {/* Background Layer */}
          <div className="absolute inset-0 z-0">
             {pharmacy.image || pharmacy.imageUrl ? (
               <img src={pharmacy.image || pharmacy.imageUrl} alt="" className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900" />
             )}
             <div className="absolute inset-0 bg-black/40" />
          </div>

          {/* Top Action Bar */}
          <div className="absolute top-0 left-0 right-0 z-30 p-6 flex justify-between items-center">
             <button onClick={() => window.history.back()} className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full transition-all text-white">
                <ChevronRight size={20} className="rotate-180" />
             </button>
             <div className="flex gap-3">
                <button onClick={handleShare} className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full transition-all text-white">
                   <Share2 size={20} />
                </button>
                <button onClick={handleDownloadPrescription} className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full transition-all text-white">
                   <Download size={20} />
                </button>
             </div>
          </div>

          {/* Hero Content */}
          <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 text-white">
             <div className="space-y-4">
                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                   <div className="px-3 py-1.5 bg-emerald-500/90 backdrop-blur-xl rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> OPEN NOW
                   </div>
                   <div className="px-3 py-1.5 bg-blue-500/90 backdrop-blur-xl rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                      ⭐ 4.9 Rating
                   </div>
                   <div className="px-3 py-1.5 bg-purple-500/90 backdrop-blur-xl rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                      ✓ Verified
                   </div>
                </div>

                {/* Pharmacy Name & Location */}
                <div>
                   <h1 className="text-5xl font-black tracking-tight mb-2">{pharmacy.name}</h1>
                   <div className="flex items-center gap-2 text-sm font-semibold">
                      <MapPin size={16} /> {pharmacy.district}, Sri Lanka
                   </div>
                </div>
             </div>
          </div>
       </div>

       {/* MAIN CONTENT */}
       <div className="max-w-6xl mx-auto px-6 pb-32">
          
          {/* TAB NAVIGATION */}
          <div className="relative z-20 -mt-8 bg-white rounded-2xl shadow-xl border border-slate-200 sticky top-6 z-40 p-1 flex gap-1 overflow-x-auto scrollbar-hide">
             {['overview', 'services', 'reviews'].map(tab => (
                <button
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-wider whitespace-nowrap transition-all ${
                      activeTab === tab
                         ? 'bg-blue-600 text-white shadow-lg'
                         : 'text-slate-600 hover:bg-slate-100'
                   }`}
                >
                   {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
             ))}
          </div>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
             <div className="space-y-8 mt-8">
                
                {/* KEY METRICS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                   <div className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all group">
                      <div className="flex items-center justify-between mb-3">
                         <p className="text-xs font-black uppercase text-slate-400 tracking-wider">Patient Rating</p>
                         <Star className="text-amber-500 fill-amber-500 group-hover:scale-110 transition-transform" size={18} />
                      </div>
                      <p className="text-4xl font-black text-slate-900">4.9</p>
                      <p className="text-xs text-slate-500 mt-2">(2,340+ reviews)</p>
                   </div>

                   <div className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-lg hover:border-emerald-300 transition-all group">
                      <div className="flex items-center justify-between mb-3">
                         <p className="text-xs font-black uppercase text-slate-400 tracking-wider">Inventory Sync</p>
                         <CheckCircle2 className="text-emerald-500 group-hover:scale-110 transition-transform" size={18} />
                      </div>
                      <p className="text-4xl font-black text-slate-900">98%</p>
                      <p className="text-xs text-slate-500 mt-2">Real-time updated</p>
                   </div>

                   <div className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-lg hover:border-rose-300 transition-all group">
                      <div className="flex items-center justify-between mb-3">
                         <p className="text-xs font-black uppercase text-slate-400 tracking-wider">Response Time</p>
                         <Zap className="text-rose-500 group-hover:scale-110 transition-transform" size={18} />
                      </div>
                      <p className="text-4xl font-black text-slate-900">&lt;2m</p>
                      <p className="text-xs text-slate-500 mt-2">Average response</p>
                   </div>

                   <div className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-lg hover:border-indigo-300 transition-all group">
                      <div className="flex items-center justify-between mb-3">
                         <p className="text-xs font-black uppercase text-slate-400 tracking-wider">Verified Years</p>
                         <Award className="text-indigo-500 group-hover:scale-110 transition-transform" size={18} />
                      </div>
                      <p className="text-4xl font-black text-slate-900">12+</p>
                      <p className="text-xs text-slate-500 mt-2">In operation</p>
                   </div>
                </div>

                {/* DETAILS SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   
                   {/* CONTACT & LOCATION */}
                   <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                         <h3 className="font-black text-lg uppercase tracking-wider">Contact & Location</h3>
                      </div>
                      <div className="p-6 space-y-4 divide-y divide-slate-100">
                         <div className="flex gap-4 cursor-pointer hover:bg-slate-50 p-3 rounded-lg transition-all" onClick={openMaps}>
                            <Navigation className="text-blue-600 flex-shrink-0" size={24} />
                            <div className="flex-1">
                               <p className="text-xs font-bold uppercase text-slate-500 mb-1">Address</p>
                               <p className="font-semibold text-slate-900">{pharmacy.address}</p>
                            </div>
                            <ChevronRight className="text-slate-400" size={20} />
                         </div>
                         
                         {pharmacy.contactNumber && (
                           <div className="pt-4 flex gap-4 cursor-pointer hover:bg-slate-50 p-3 rounded-lg transition-all" onClick={() => window.location.href=`tel:${pharmacy.contactNumber}`}>
                              <Phone className="text-indigo-600 flex-shrink-0" size={24} />
                              <div className="flex-1">
                                 <p className="text-xs font-bold uppercase text-slate-500 mb-1">Phone</p>
                                 <p className="font-black text-slate-900 text-lg">{pharmacy.contactNumber}</p>
                              </div>
                              <ChevronRight className="text-slate-400" size={20} />
                           </div>
                         )}

                         {pharmacy.email && (
                           <div className="pt-4 flex gap-4 cursor-pointer hover:bg-slate-50 p-3 rounded-lg transition-all" onClick={() => window.location.href=`mailto:${pharmacy.email}`}>
                              <Mail className="text-rose-600 flex-shrink-0" size={24} />
                              <div className="flex-1">
                                 <p className="text-xs font-bold uppercase text-slate-500 mb-1">Email</p>
                                 <p className="font-semibold text-slate-900 truncate">{pharmacy.email}</p>
                              </div>
                              <ChevronRight className="text-slate-400" size={20} />
                           </div>
                         )}
                      </div>
                   </div>

                   {/* OPERATING HOURS & SERVICES */}
                   <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white">
                         <h3 className="font-black text-lg uppercase tracking-wider">Operating Details</h3>
                      </div>
                      <div className="p-6 space-y-4 divide-y divide-slate-100">
                         <div className="flex gap-4">
                            <Clock className="text-emerald-600 flex-shrink-0" size={24} />
                            <div className="flex-1">
                               <p className="text-xs font-bold uppercase text-slate-500 mb-2">Hours</p>
                               <p className="font-semibold text-slate-900">{pharmacy.operatingHours?.open || '08:00 AM'} - {pharmacy.operatingHours?.close || '10:00 PM'}</p>
                               <div className="flex items-center gap-2 mt-2">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                  <span className="text-xs font-bold text-emerald-600">OPEN NOW</span>
                               </div>
                            </div>
                         </div>

                         <div className="pt-4 flex gap-4">
                            <Truck className="text-blue-600 flex-shrink-0" size={24} />
                            <div className="flex-1">
                               <p className="text-xs font-bold uppercase text-slate-500 mb-2">Delivery</p>
                               <p className="font-semibold text-slate-900">Within 2 Hours</p>
                               <p className="text-xs text-slate-500 mt-1">Available in service area</p>
                            </div>
                         </div>

                         <div className="pt-4 flex gap-4">
                            <CreditCard className="text-purple-600 flex-shrink-0" size={24} />
                            <div className="flex-1">
                               <p className="text-xs font-bold uppercase text-slate-500 mb-2">Payment</p>
                               <div className="flex gap-2 flex-wrap">
                                  <span className="px-2 py-1 bg-slate-100 text-xs font-bold rounded">Cash</span>
                                  <span className="px-2 py-1 bg-slate-100 text-xs font-bold rounded">Card</span>
                                  <span className="px-2 py-1 bg-slate-100 text-xs font-bold rounded">Digital</span>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                {/* PHARMACIST INFO CARD */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-8 text-white border border-slate-700">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                         <div className="flex items-center gap-2 mb-4">
                            <ShieldCheck size={24} className="text-blue-400" />
                            <p className="text-xs font-black uppercase tracking-wider text-blue-400">Certified Pharmacist</p>
                         </div>
                         <h3 className="text-3xl font-black mb-2">{pharmacy.pharmacistName || 'Licensed Pharmacist'}</h3>
                         <p className="text-slate-300 mb-4">Professional healthcare provider with certifications and extensive experience in pharmaceutical care.</p>
                         <div className="flex gap-2">
                            <Lock size={16} className="text-emerald-400 flex-shrink-0" />
                            <p className="text-xs text-slate-300">GDPR Compliant Data Protection</p>
                         </div>
                      </div>
                      <div className="flex flex-col justify-center">
                         <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                               <p className="text-2xl font-black text-blue-400 mb-1">15+</p>
                               <p className="text-xs text-slate-300 uppercase font-bold">Years Experience</p>
                            </div>
                            <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                               <p className="text-2xl font-black text-emerald-400 mb-1">2.4k+</p>
                               <p className="text-xs text-slate-300 uppercase font-bold">Trusted Patients</p>
                            </div>
                            <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                               <p className="text-2xl font-black text-rose-400 mb-1">100%</p>
                               <p className="text-xs text-slate-300 uppercase font-bold">Verified</p>
                            </div>
                            <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                               <p className="text-2xl font-black text-amber-400 mb-1">24/7</p>
                               <p className="text-xs text-slate-300 uppercase font-bold">Support</p>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          )}

          {/* SERVICES TAB */}
          {activeTab === 'services' && (
             <div className="space-y-8 mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {[
                      { icon: Pill, title: 'Prescription Fulfillment', desc: 'Fast & accurate medication dispensing', color: 'blue' },
                      { icon: Activity, title: 'Health Consulting', desc: 'Professional advice from certified staff', color: 'emerald' },
                      { icon: Heart, title: 'Wellness Programs', desc: 'Comprehensive health monitoring', color: 'rose' },
                      { icon: Microscope, title: 'Lab Services', desc: 'Quick health check-up services', color: 'indigo' },
                      { icon: Truck, title: 'Home Delivery', desc: 'Fast delivery within 2 hours', color: 'amber' },
                      { icon: ShoppingBag, title: 'OTC Products', desc: 'Wide range of health products', color: 'purple' }
                   ].map((service, idx) => {
                      const colorClasses = {
                         blue: 'from-blue-600 to-blue-700',
                         emerald: 'from-emerald-600 to-emerald-700',
                         rose: 'from-rose-600 to-rose-700',
                         indigo: 'from-indigo-600 to-indigo-700',
                         amber: 'from-amber-600 to-amber-700',
                         purple: 'from-purple-600 to-purple-700'
                      };
                      const Icon = service.icon;
                      return (
                         <div 
                            key={idx}
                            onClick={() => setSelectedService(selectedService === idx ? null : idx)}
                            className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
                         >
                            <div className={`bg-gradient-to-r ${colorClasses[service.color]} p-6 text-white`}>
                               <Icon size={32} className="mb-3 group-hover:scale-110 transition-transform" />
                               <h3 className="font-black text-lg">{service.title}</h3>
                            </div>
                            <div className="p-6">
                               <p className="text-slate-600 font-semibold mb-4">{service.desc}</p>
                               {selectedService === idx && (
                                  <div className="pt-4 border-t border-slate-200">
                                     <p className="text-sm text-slate-500">Available 24/7 with professional guidance. Call or visit for more information.</p>
                                  </div>
                               )}
                            </div>
                         </div>
                      );
                   })}
                </div>
             </div>
          )}

          {/* REVIEWS TAB */}
          {activeTab === 'reviews' && (
             <div className="space-y-8 mt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                   <div className="bg-white p-6 rounded-xl border border-slate-200 text-center">
                      <p className="text-5xl font-black text-amber-500 mb-2">4.9</p>
                      <div className="flex justify-center gap-1 mb-2">
                         {[...Array(5)].map((_, i) => <Star key={i} size={20} className="fill-amber-500 text-amber-500" />)}
                      </div>
                      <p className="text-sm text-slate-600">Based on 2,340 reviews</p>
                   </div>
                   <div className="bg-white p-6 rounded-xl border border-slate-200">
                      <div className="space-y-3">
                         {[5, 4, 3, 2, 1].map(stars => (
                            <div key={stars} className="flex items-center gap-2">
                               <span className="text-sm font-bold text-slate-600 w-8">{stars}★</span>
                               <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-amber-500" style={{width: `${(6-stars)*15}%`}}></div>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                   <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
                      <div className="text-center">
                         <p className="text-2xl font-black text-emerald-600 mb-1">98%</p>
                         <p className="text-xs font-bold text-slate-600">WOULD RECOMMEND</p>
                      </div>
                      <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all text-sm">
                         Leave Review
                      </button>
                   </div>
                </div>

                <div className="space-y-4">
                   {[1, 2, 3].map(i => (
                      <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all">
                         <div className="flex justify-between items-start mb-3">
                            <div>
                               <p className="font-bold text-slate-900">Sarah Johnson</p>
                               <p className="text-xs text-slate-500">Verified Customer</p>
                            </div>
                            <div className="flex gap-1">
                               {[...Array(5)].map((_, j) => <Star key={j} size={14} className="fill-amber-500 text-amber-500" />)}
                            </div>
                         </div>
                         <p className="text-slate-700 text-sm mb-2">Excellent service and very professional staff. They answered all my health-related questions and helped me find the right medication.</p>
                         <p className="text-xs text-slate-500">2 weeks ago</p>
                      </div>
                   ))}
                </div>
             </div>
          )}
       </div>

       {/* FLOATING ACTION BAR */}
       <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent z-50">
          <div className="max-w-2xl mx-auto flex gap-3">
             <button 
                onClick={() => window.location.href=`tel:${pharmacy.contactNumber}`}
                className="flex-1 py-4 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-black uppercase tracking-wide text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg"
             >
                <Phone size={18} /> Call Now
             </button>
             <button 
                onClick={handleOrderNow}
                className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-black uppercase tracking-wide text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg"
             >
                <ShoppingBag size={18} /> Order Now
             </button>
          </div>
       </div>

    </div>
  );
};

export default PharmacyQRDetail;
