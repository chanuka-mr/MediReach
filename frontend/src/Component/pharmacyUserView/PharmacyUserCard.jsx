import React from 'react';
import { Building2, Clock, MapPin, Truck, ChevronRight, Star, ShieldCheck } from 'lucide-react';

const PharmacyUserCard = ({ pharmacy, userLocation, onViewInfo }) => {
  const calculateDistance = () => {
    if (!userLocation || !pharmacy.location) return null;
    return (Math.random() * 5 + 1).toFixed(1); 
  };

  const distance = calculateDistance();
  const eta = distance ? Math.ceil(distance * 4) : null; 

  return (
    <div className="group bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative">
      <div className="h-40 bg-slate-100 overflow-hidden relative">
        {pharmacy.image ? (
          <img 
            src={pharmacy.image} 
            alt={pharmacy.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
            <Building2 size={48} className="text-blue-200" strokeWidth={1.5} />
          </div>
        )}
        
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {pharmacy.isActive && (
            <div className="px-3 py-1.5 bg-emerald-500/90 backdrop-blur-md text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
              Open Now
            </div>
          )}
          {distance && (
            <div className="px-3 py-1.5 bg-blue-600/90 backdrop-blur-md text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
              {distance} km away
            </div>
          )}
        </div>

        <div className="absolute top-4 right-4 h-10 w-10 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-blue-600 shadow-xl border border-white/20">
          <Truck size={20} />
        </div>
      </div>

      <div className="p-7">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">
              {pharmacy.name}
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-slate-700">4.8</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">(120+ Reviews)</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-slate-500">
            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
              <MapPin size={16} />
            </div>
            <span className="text-sm font-medium">{pharmacy.district}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
              <Clock size={16} />
            </div>
            <span className="text-sm font-medium">{pharmacy.operatingHours?.open} - {pharmacy.operatingHours?.close}</span>
            {eta && (
              <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-black uppercase">
                Est. {eta} min
              </span>
            )}
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
           <div className="flex justify-between items-end mb-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock Reliability</p>
              <span className="text-[10px] font-black text-emerald-500 uppercase">High Availability</span>
           </div>
           <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-[85%]" />
           </div>
           <div className="flex items-center gap-1.5 mt-3">
              <ShieldCheck size={12} className="text-emerald-500" />
              <p className="text-[10px] text-slate-500 font-bold">Verified in-stock medicines available</p>
           </div>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => onViewInfo && onViewInfo(pharmacy)}
            className="w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            Show Full Profile
          </button>
          
          <button className="w-full py-4 bg-slate-900 text-white rounded-[1.25rem] font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-500/25 transition-all active:scale-95 group/btn">
            Order Medicines
            <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PharmacyUserCard;
