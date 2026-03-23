import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import AdminNavBar from './Component/AdminNavBar';
import PharmacyManagement from './Component/pharmacy/PharmacyManagement';
import PharmacyDashboard from './Component/pharmacy/PharmacyDashboard';
import PharmacyLayout from './Component/pharmacy/PharmacyLayout';
import PharmacyReports from './Component/pharmacy/PharmacyReports';
import PharmacyNetworkMap from './Component/pharmacy/PharmacyNetworkMap.jsx';
import PharmacyDetail from './Component/pharmacy/PharmacyDetail.jsx';
import OpenNowPharmacies from './Component/pharmacy/OpenNowPharmacies';
import TwentyFourSevenPharmacies from './Component/pharmacy/TwentyFourSevenPharmacies';

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;