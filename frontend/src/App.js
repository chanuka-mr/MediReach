import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Stethoscope, Clock, Building2, ShoppingBag, ChevronRight } from 'lucide-react';
import AdminNavBar from './Component/AdminNavBar';
import PharmacyManagement from './Component/pharmacy/PharmacyManagement';
import PharmacyDashboard from './Component/pharmacy/PharmacyDashboard';
import PharmacyLayout from './Component/pharmacy/PharmacyLayout';
import PharmacyReports from './Component/pharmacy/PharmacyReports';
import PharmacyNetworkMap from './Component/pharmacy/PharmacyNetworkMap.jsx';
import PharmacyDetail from './Component/pharmacy/PharmacyDetail.jsx';
import OpenNowPharmacies from './Component/pharmacy/OpenNowPharmacies';
import TwentyFourSevenPharmacies from './Component/pharmacy/TwentyFourSevenPharmacies';
import UserNavBar from './Component/pharmacyUserView/UserNavBar';
import PharmacyUserView from './Component/pharmacyUserView/PharmacyUserView';

// Main Admin Dashboard
const HomeDashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
      <p className="text-gray-500 mt-1">Welcome to MediReach Admin Panel</p>
      
      <div className="mt-8 bg-white rounded-lg shadow p-6 max-w-2xl">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/pharmacy" className="p-4 border border-blue-100 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
               <span className="text-xl">🏥</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Pharmacy Network</h3>
              <p className="text-sm text-gray-500">View stats and manage</p>
            </div>
          </Link>
          
          <Link to="/inventory" className="p-4 border border-green-100 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
               <span className="text-xl">📦</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Inventory System</h3>
              <p className="text-sm text-gray-500">Coming soon...</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Inventory Page
const Inventory = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
    <p className="text-gray-500 mt-2">Coming Soon...</p>
  </div>
);

// Orders Page
const Orders = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
    <p className="text-gray-500 mt-2">Coming Soon...</p>
  </div>
);

// Notifications Page
const Notifications = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
    <p className="text-gray-500 mt-2">Coming Soon...</p>
  </div>
);

// Settings Page
const Settings = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
    <p className="text-gray-500 mt-2">Coming Soon...</p>
  </div>
);

// Patient Portal Home — Premium Design
const UserHome = () => (
  <div className="p-12 max-w-5xl mx-auto">
    <div className="flex flex-col md:flex-row items-center gap-12 mb-16">
      <div className="flex-1">
        <h1 className="text-6xl font-black text-slate-900 mb-6 tracking-tight leading-[1.1]">
          Healthcare <span className="text-blue-600">at your fingertips.</span>
        </h1>
        <p className="text-xl text-slate-500 mb-8 leading-relaxed font-medium">
          Manage prescriptions, find the best pharmacies, and get professional care instantly. Your journey to wellness starts here.
        </p>
        <div className="flex items-center gap-4">
          <Link to="/user/pharmacies" className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/25 hover:bg-blue-700 hover:-translate-y-1 transition-all">
            Find Pharmacies
          </Link>
          <Link to="/user/about" className="px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all">
            Learn More
          </Link>
        </div>
      </div>
      <div className="flex-1 relative">
        <div className="w-full aspect-square bg-gradient-to-br from-blue-50 to-emerald-50 rounded-[3rem] rotate-3 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center scale-150 opacity-10">
            <Stethoscope size={200} />
          </div>
        </div>
        <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 flex items-center gap-4 animate-bounce-subtle">
           <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white">
              <Clock size={24} />
           </div>
           <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Open Now</p>
              <p className="text-lg font-black text-slate-800">24 Branches</p>
           </div>
        </div>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Link to="/user/pharmacies" className="group relative bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200 hover:shadow-2xl hover:-translate-y-2 transition-all overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[5rem] -mr-8 -mt-8 transition-transform group-hover:scale-110" />
         <div className="relative z-10 w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-blue-200">
            <Building2 size={32} />
         </div>
         <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Pharmacy Network</h3>
         <p className="text-slate-500 font-medium leading-relaxed">Explore verified pharmacies. Check categories like Open Now and 24/7 service instantly.</p>
         <div className="mt-8 flex items-center gap-2 text-blue-600 font-bold group-hover:gap-4 transition-all">
            Browse Branches <ChevronRight size={20} />
         </div>
      </Link>
      
      <Link to="/user/order" className="group relative bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200 hover:shadow-2xl hover:-translate-y-2 transition-all overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[5rem] -mr-8 -mt-8 transition-transform group-hover:scale-110" />
         <div className="relative z-10 w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-emerald-200">
            <ShoppingBag size={32} />
         </div>
         <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Express Orders</h3>
         <p className="text-slate-500 font-medium leading-relaxed">Skip the queue. Upload your prescription and get your medications delivered to your doorstep.</p>
         <div className="mt-8 flex items-center gap-2 text-emerald-600 font-bold group-hover:gap-4 transition-all">
            Order Medicine <ChevronRight size={20} />
         </div>
      </Link>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminNavBar />}>
          {/* Dashboard - Main Admin Home */}
          <Route index element={<HomeDashboard />} />
          
          {/* Pharmacy Routes */}
          <Route path="pharmacy" element={<PharmacyLayout />}>
            <Route index element={<PharmacyDashboard />} />
            <Route path="manage" element={<PharmacyManagement />} />
            <Route path="reports" element={<PharmacyReports />} />
            <Route path="map" element={<PharmacyNetworkMap />} />
            <Route path="open-now" element={<OpenNowPharmacies />} />
            <Route path="24-7" element={<TwentyFourSevenPharmacies />} />
            <Route path=":id" element={<PharmacyDetail />} />
          </Route>
          
          {/* Other Routes */}
          <Route path="inventory" element={<Inventory />} />
          <Route path="order" element={<Orders />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* User Portal Routes */}
        <Route path="/user" element={<UserNavBar />}>
          <Route index element={<UserHome />} />
          <Route path="about" element={<div className="p-8"><h1>About Us</h1></div>} />
          <Route path="contact" element={<div className="p-8"><h1>Contact Us</h1></div>} />
          <Route path="pharmacies" element={<PharmacyUserView />} />
          <Route path="order" element={<div className="p-8"><h1>Order Now</h1></div>} />
          <Route path="chats" element={<div className="p-8"><h1>Pharmacy Chats</h1></div>} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;