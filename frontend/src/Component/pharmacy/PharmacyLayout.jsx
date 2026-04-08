import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, FileText, Map, Clock, Activity, MessageSquare } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

const PharmacyLayout = () => {
  const { totalUnreadCount } = useChat();
  const location = useLocation();

  const tabs = [
    { name: 'Dashboard', path: '/pharmacy', icon: LayoutDashboard, exact: true },
    { name: 'Network Management', path: '/pharmacy/manage', icon: Settings },
    { name: 'Open Now', path: '/pharmacy/open-now', icon: Clock },
    { name: '24/7 Pharmacies', path: '/pharmacy/24-7', icon: Activity }, 
    { name: 'Live Map', path: '/pharmacy/map', icon: Map },
    { name: 'Reports', path: '/pharmacy/reports', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {/* Shared Pharmacy Module Header Tabs */}
      <div className="bg-white border-b border-gray-200 px-8 pt-4 sticky top-0 z-30">
        <div className="flex space-x-8">
          {tabs.map(tab => {
            const isActive = tab.exact 
              ? location.pathname === tab.path 
              : location.pathname.startsWith(tab.path);
              
            return (
              <NavLink
                key={tab.name}
                to={tab.path}
                className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition-all font-bold text-sm ${
                  isActive 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {tab.name}
                {tab.badge && totalUnreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white shadow-sm">
                    {totalUnreadCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Renders the specific pharmacy page */}
      <div className="flex-1 flex flex-col min-h-0 bg-[radial-gradient(#e5e7eb_1.5px,transparent_1px)] [background-size:24px_24px]">
        <Outlet />
      </div>
    </div>
  );
};

export default PharmacyLayout;
