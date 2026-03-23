import React from 'react';
import { 
  X, MapPin, Phone, Mail, Clock, ShieldCheck, 
  Star, Truck, Award, CheckCircle2,
  ChevronRight, Building2
} from 'lucide-react';

const PharmacyUserDetailModal = ({ pharmacy, onClose, onOrder }) => {
  if (!pharmacy) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[2000] p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-white flex flex-col md:flex-row relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 bg-white/20 backdrop-blur-md hover:bg-white/40 rounded-full text-white transition-all border border-white/20"
        >
          <X size={20} />
        </button>

        {/* Left: Visual Sidebar */}
        <div className="w-full md:w-2/5 h-64 md:h-auto relative overflow-hidden">
          {pharmacy.image ? (
            <img src={pharmacy.image} alt={pharmacy.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
               <Building2 size={80} className="text-white/20" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/90 to-transparent p-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                Partner Store
              </span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight leading-tight">{pharmacy.name}</h2>
            <p className="text-slate-300 font-bold text-sm mt-1 flex items-center gap-2">
              <MapPin size={14} className="text-blue-400" /> {pharmacy.district}
            </p>
          </div>
        </div>

        {/* Right: Content Area */}
        <div className="w-full md:w-3/5 p-10 overflow-y-auto bg-slate-50/50">
          <div className="flex flex-wrap gap-8 mb-10">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Trust Score</p>
              <div className="flex items-center gap-2">
                <div className="bg-amber-50 text-amber-600 px-3 py-2 rounded-2xl flex items-center gap-1.5 border border-amber-100">
                  <Star size={16} className="fill-amber-600" />
                  <span className="font-black text-sm">4.9</span>
                </div>
                <span className="text-xs font-bold text-slate-400">1.2k+ Satisfied Orders</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Service Area</p>
              <div className="bg-blue-50 text-blue-600 px-3 py-2 rounded-2xl flex items-center gap-1.5 border border-blue-100">
                <Truck size={16} />
                <span className="font-black text-sm">Home Delivery Available</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <section>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-blue-600" /> Essential Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
                  <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl">
                    <Clock size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-0.5">Operating Hours</p>
                    <p className="text-sm font-bold text-slate-700">{pharmacy.operatingHours?.open || '9AM'} - {pharmacy.operatingHours?.close || '9PM'}</p>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
                  <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl">
                    <Phone size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-0.5">Voice Line</p>
                    <p className="text-sm font-bold text-slate-700">{pharmacy.contactNumber || '+94 77 123 4567'}</p>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
                  <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl">
                    <Mail size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-0.5">Email Support</p>
                    <p className="text-sm font-bold text-slate-700">{pharmacy.email || 'care@example.com'}</p>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
                  <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-0.5">Verified By</p>
                    <p className="text-sm font-bold text-slate-700">Health Board SL</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative group">
              <Award className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 group-hover:rotate-12 transition-transform duration-700" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 uppercase tracking-widest text-[10px] font-black">
                <div className="flex-1">
                  <p className="text-emerald-400 mb-2 flex items-center gap-2">
                    <CheckCircle2 size={12} /> Stock High Reliability
                  </p>
                  <p className="text-lg normal-case font-black text-white mb-1">Guaranteed Medicine Availability</p>
                  <p className="text-slate-400 font-bold opacity-60">This branch maintains 95%+ stock for essential meds.</p>
                </div>
                <button 
                  onClick={() => onOrder(pharmacy._id)}
                  className="px-8 py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center gap-2"
                >
                  Confirm & Order <ChevronRight size={16} />
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyUserDetailModal;
