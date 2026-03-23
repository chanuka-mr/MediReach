import React, { useState } from 'react';
import { Users, Search, Filter, Plus, Mail, Phone, MapPin, Building2, Shield, HeartPulse, Clock } from 'lucide-react';

const PharmacyStaff = () => {
  return (
    <div className="p-8 pb-20 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Staff & Personnel</h1>
          <p className="text-slate-500 font-medium mt-1">Manage pharmacists, riders, and cashiers across the network</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold tracking-wide shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-transform active:scale-95">
          <Plus size={20} /> Register Staff
        </button>
      </div>

      <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm p-6 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
         <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search by name, ID, or email..." className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-slate-400" />
         </div>
         <div className="flex gap-3 w-full md:w-auto">
            <select className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-48 appearance-none cursor-pointer hover:bg-slate-50 transition-colors">
               <option value="All Roles">All Roles</option>
               <option value="Pharmacist">Head Pharmacists</option>
               <option value="Cashier">Cashiers</option>
               <option value="Delivery">Delivery Riders</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
               <Filter size={18} /> Filters
            </button>
         </div>
      </div>

      {/* Staff Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {/* Placeholder Cards */}
         {[
           { name: 'Dr. Sarah Perera', role: 'Head Pharmacist', branch: 'Colombo Central', email: 'sarah.p@medireach.lk', phone: '+94 77 123 4567', active: true, color: 'purple' },
           { name: 'Dr. Kevin Silva', role: 'Pharmacist', branch: 'Gampaha South', email: 'kevin.s@medireach.lk', phone: '+94 71 987 6543', active: true, color: 'purple' },
           { name: 'Amal Fernando', role: 'Delivery Rider', branch: 'Colombo Central', email: 'amal.f@medireach.lk', phone: '+94 72 333 4444', active: true, color: 'teal' },
           { name: 'Nadeesha Kumara', role: 'Cashier', branch: 'Kandy West', email: 'nadeesha.k@medireach.lk', phone: '+94 75 555 6666', active: false, color: 'amber' },
         ].map((staff, i) => (
           <div key={i} className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden">
             
             {/* Colorful Banner top bar */}
             <div className={`absolute top-0 left-0 w-full h-2 ${
               staff.color === 'purple' ? 'bg-gradient-to-r from-purple-500 to-indigo-500' :
               staff.color === 'teal' ? 'bg-gradient-to-r from-teal-400 to-emerald-500' :
               'bg-gradient-to-r from-amber-400 to-orange-500'
             }`}></div>

             <div className="flex justify-between items-start mb-5 pt-2">
               <div className="flex gap-4">
                 <div className="relative">
                   <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${staff.name}&backgroundColor=f8fafc`} alt="Avatar" className="w-14 h-14 rounded-2xl bg-slate-100 border-2 border-slate-200 shadow-sm group-hover:scale-105 transition-transform" />
                   {staff.active && <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>}
                 </div>
                 <div>
                   <h3 className="font-extrabold text-slate-800 text-lg leading-tight">{staff.name}</h3>
                   <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 mt-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                     staff.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                     staff.color === 'teal' ? 'bg-teal-100 text-teal-700' :
                     'bg-amber-100 text-amber-700'
                   }`}>
                     {staff.role === 'Head Pharmacist' ? <HeartPulse size={12} /> : staff.role === 'Delivery Rider' ? <Shield size={12} /> : <Clock size={12}/>}
                     {staff.role}
                   </div>
                 </div>
               </div>
             </div>

             <div className="space-y-3 mb-6">
               <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
                 <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                   <Building2 size={16} />
                 </div>
                 {staff.branch}
               </div>
               <div className="flex items-center gap-3 text-sm font-semibold text-slate-500 cursor-pointer hover:text-blue-600 transition-colors">
                 <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                   <Mail size={16} />
                 </div>
                 {staff.email}
               </div>
               <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
                 <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                   <Phone size={16} />
                 </div>
                 {staff.phone}
               </div>
             </div>

             <div className="flex gap-2">
               <button className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 py-2 rounded-xl text-sm font-bold border border-slate-200 transition-colors">View Profile</button>
               <button className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-xl text-sm font-bold border border-blue-100 transition-colors">Message</button>
             </div>
           </div>
         ))}
      </div>
    </div>
  );
};

export default PharmacyStaff;
