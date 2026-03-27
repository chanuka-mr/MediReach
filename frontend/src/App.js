import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import UserNavBar from './components/UserNavBar';
import AdminNavBar from './components/AdminNavBar';
import AdminUsersPage from './pages/AdminUsersPage';

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
        {!isLoggedIn ? (
          <Route path="*" element={<AuthPage onLoginSuccess={handleLoginSuccess} />} />
        ) : (
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
