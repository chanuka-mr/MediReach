import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Stethoscope, Clock, Building2, ShoppingBag, ChevronRight } from 'lucide-react';

//MediReach Pages
import AboutUs from './Component/AboutUs.jsx';
import ContactUs from './Component/ContactUs.jsx';
import Inquiry from './Component/pharmacyUserView/UserInquiryControl.jsx';

// User management imports
import PreHome from './Component/PreHome.jsx';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import UserNavBar from './components/UserNavBar';
import AdminNavBar from './components/AdminNavBar';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminDashboard from './pages/AdminDashboard';

// Admin/Inventory imports
import InventoryDashboard from './Component/InventoryDashboard';
import MedicineForm from './Component/MedicineAdd';
import MedicineInventory from './Component/MedicineInventory';
import UpdateMedicine from './Component/UpdateMedicine';
import MedicineCardView from './pages/MedicineCardView';
import MedicineOrder from './Component/PharmacyOrders.js';

// Pharmacy Management imports
import PharmacyManagement from './Component/pharmacy/PharmacyManagement';
import PharmacyDashboard from './Component/pharmacy/PharmacyDashboard';
import PharmacyLayout from './Component/pharmacy/PharmacyLayout';
import PharmacyReports from './Component/pharmacy/PharmacyReports';
import PharmacyNetworkMap from './Component/pharmacy/PharmacyNetworkMap.jsx';
import PharmacyDetail from './Component/pharmacy/PharmacyDetail.jsx';
import OpenNowPharmacies from './Component/pharmacy/OpenNowPharmacies';
import TwentyFourSevenPharmacies from './Component/pharmacy/TwentyFourSevenPharmacies';
import PharmacyUserView from './Component/pharmacyUserView/PharmacyUserView';
import InquiryManagement from './Component/pharmacy/InquiryManagement';
import UserInquiryControl from './Component/pharmacyUserView/UserInquiryControl';
import PharmacyQRUserView from './Component/pharmacyUserView/PharmacyQRUserView';
import PharmacyQRDetail from './Component/pharmacyUserView/PharmacyQRDetail';

//Orders
import OrderDashboard from './pages/OrderDashboard.js';
import OrderForm from './pages/OrderForm.js';
import Orderhistory from './pages/OrderDetails.js';
import Payment from './pages/PaymentUI.js';

// Layout Component
function AppLayout() {
  const saved = localStorage.getItem("userInfo");
  const userInfo = saved ? JSON.parse(saved) : null;
  const user = userInfo?.user || userInfo;
  
  // Conditionally render layout based on role
  if (user?.role === "admin") {
    return <AdminNavBar />;
  }
  return <UserNavBar />;
}



// Placeholder Components
const OrdersPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
    <p className="text-gray-500 mt-2">View and manage orders</p>
  </div>
);

const Notifications = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
    <p className="text-gray-500 mt-2">System notifications</p>
  </div>
);

const Settings = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
    <p className="text-gray-500 mt-2">Application settings</p>
  </div>
);

// Patient Portal Home
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
          <Link to="/user/contact" className="px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all">
            Contact Us
          </Link>
        </div>
      </div>
      <div className="flex-1 relative">
        <div className="w-full aspect-square bg-gradient-to-br from-blue-50 to-emerald-50 rounded-[3rem] rotate-3 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center scale-150 opacity-10">
            <Stethoscope size={200} />
          </div>
        </div>
        <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 flex items-center gap-4">
           <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white">
              <Clock size={24} />
           </div>
           <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Open Now</p>
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("userInfo");
    if (saved) setIsLoggedIn(true);
  }, []);

  const handleLoginSuccess = () => { setIsLoggedIn(true); };
  
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - Always accessible */}
        {!isLoggedIn ? (
          <Route path="/" element={<PreHome />} />
        ) : (
          <Route path="/Home" element={<HomePage />} />
        )}
        
        {/* Authentication Route */}
        {!isLoggedIn && (
          <Route path="/auth" element={<AuthPage onLoginSuccess={handleLoginSuccess} />} />
        )}
        
        {/* Protected Routes - Require Authentication */}
        {isLoggedIn ? (
          <Route element={<AppLayout />}>
            {/* User Management Routes */}
            <Route path="/Home" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/about" element={<AboutUs />} />
            
            {/* Admin Dashboard Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            
            {/* Pharmacy Management Routes */}
            <Route path="/pharmacy" element={<PharmacyLayout />}>
              <Route index element={<PharmacyDashboard />} />
              <Route path="manage" element={<PharmacyManagement />} />
              <Route path="reports" element={<PharmacyReports />} />
              <Route path="map" element={<PharmacyNetworkMap />} />
              <Route path="open-now" element={<OpenNowPharmacies />} />
              <Route path="24-7" element={<TwentyFourSevenPharmacies />} />
              <Route path=":id" element={<PharmacyDetail />} />
              
            </Route>
            
            {/* Admin/Inventory Routes */}
            <Route path="/inventory" element={<InventoryDashboard />} />
            <Route path="/medicineAdd" element={<MedicineForm />} />
            <Route path="/medicineInventory" element={<MedicineInventory />} />
            <Route path="/orders" element={<MedicineOrder />} />
            <Route path="/updateMedicine/:id" element={<UpdateMedicine />} />
            <Route path="/medicineshop" element={<MedicineCardView />} />
            
            {/* User Portal Protected Routes */}
            <Route path="/user">
              <Route path="inquiries" element={<Inquiry />} />
              <Route path="order" element={<div className="p-8"><h1>Order Now</h1></div>} />
              <Route path="chats" element={<div className="p-8"><h1>Pharmacy Chats</h1></div>} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<Settings />} />
              <Route path="pharmacies" element={<PharmacyUserView />} />
            </Route>
            
            {/* Other Protected Routes */}
            <Route path="/inquiries" element={<InquiryManagement />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* Order Routes */}
            <Route path="/OrderDashboard" element={<OrderDashboard />} />
            <Route path="/orderform" element={<OrderForm />} />
            <Route path="/orderhistory" element={<Orderhistory />} />
            <Route path="/payment" element={<Payment />} />
            
            {/* Catch all for authenticated users */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        ) : (
          /* Redirect unauthenticated users to auth for protected routes */
          <Route path="*" element={<Navigate to="/auth" replace />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
