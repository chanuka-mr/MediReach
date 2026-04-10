import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

//MediReach Pages
import AboutUs from './Component/AboutUs.jsx';
import ContactUs from './Component/ContactUs.jsx';
import Inquiry from './Component/pharmacyUserView/UserInquiryControl.jsx';

// User management imports
import PreHome from './Component/PreHome.jsx';
import AuthPage from './Test/AuthPage';
import UserHome from './Test/UserHome.jsx';
import ProfilePage from './Test/ProfilePage';
import UserNavBar from './Components/UserNavBar';
import AdminNavBar from './Components/AdminNavBar';
import AdminUsersPage from './Test/AdminUsersPage.js';
import AdminDashboard from './Test/AdminDashboard.js';
import UserChats from './Test/UserChats.js';


// Admin/Inventory imports
import InventoryDashboard from './Component/InventoryDashboard';
import MedicineForm from './Component/MedicineAdd';
import MedicineInventory from './Component/MedicineInventory';
import UpdateMedicine from './Component/UpdateMedicine';
import MedicineCardView from './Test/MedicineCardView.js';
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
import PharmacyChats from './Component/pharmacy/PharmacyChats';
import PharmacyUserView from './Component/pharmacyUserView/PharmacyUserView';
import InquiryManagement from './Component/pharmacy/InquiryManagement';
import PharmacyQRUserView from './Component/pharmacyUserView/PharmacyQRUserView';
import PharmacyQRDetail from './Component/pharmacyUserView/PharmacyQRDetail';

//Orders
import OrderDashboard from './Test/OrderDashboard.js';
import OrderForm from './Test/OrderForm.js';
import Orderhistory from './Test/OrderDetails.js';
import Payment from './Test/PaymentUI.js';

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

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("userInfo");
    if (saved) setIsLoggedIn(true);
  }, []);

  const handleLoginSuccess = () => { setIsLoggedIn(true); };
  const savedUserInfo = localStorage.getItem("userInfo");
  const parsedUserInfo = savedUserInfo ? JSON.parse(savedUserInfo) : null;
  const currentUser = parsedUserInfo?.user || parsedUserInfo;
  const isAdmin = currentUser?.role === "admin";
  const defaultHomePath = isAdmin ? "/admin" : "/Home";
  
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - Always accessible */}
        <Route path="/" element={isLoggedIn ? <Navigate to={defaultHomePath} replace /> : <PreHome />} />

        {/* Public Pharmacy QR Routes */}
        <Route path="/pharmacy-qr" element={<PharmacyQRUserView />} />
        <Route path="/pharmacy-qr/:id" element={<PharmacyQRDetail />} />
        
        {/* Authentication Route */}
        {!isLoggedIn && (
          <Route path="/auth" element={<AuthPage onLoginSuccess={handleLoginSuccess} />} />
        )}
        
        {/* Protected Routes - Require Authentication */}
        {isLoggedIn ? (
          <Route element={<AppLayout />}>
            {/* User Management Routes */}
            <Route path="/Home" element={isAdmin ? <Navigate to="/admin" replace /> : <UserHome />} />
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
              <Route path="chats" element={<PharmacyChats />} />
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
              <Route path="chats" element={<UserChats />} />
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
            <Route path="*" element={<Navigate to={defaultHomePath} replace />} />
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
