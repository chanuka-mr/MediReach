import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// -- Reusing Icons from AuthPage theme --
const GridIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
  </svg>
);
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const LogOutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const INDIGO = "#4C6EF5";
const NAVY = "#023E8A";
const BORDER = "#DDE3ED";

export default function HomePage() {
  const [user, setUser] = useState({ name: "Guest User", role: "user" });
  const [showProfile, setShowProfile] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("userInfo");
    if (saved) {
      const parsed = JSON.parse(saved);
      setUser(parsed.user || parsed);
    }

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    window.location.href = "/";
  };

  const menuItems = ["Dashboard", "Inventory", "Orders", "Analytics", "Settings"];

  return (
    <div className="flex h-screen w-full bg-[#F7F9FC] font-sans text-[#0F172A]">


      {/* -- Main Content -- */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* -- Header -- */}
        <header className="h-[72px] border-b bg-white flex items-center justify-between px-8" style={{ borderColor: BORDER }}>
          <h1 className="text-xl font-bold tracking-tight">Welcome back, {user.name ? user.name.split(' ')[0] : "User"}</h1>

          <div className="flex items-center gap-5">
            <button className="relative p-2 text-[#64748B] hover:bg-gray-50 rounded-full transition-colors">
              <BellIcon />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-gray-50 transition-colors border"
                style={{ borderColor: showProfile ? INDIGO : BORDER }}
              >
                <div className="w-8 h-8 rounded-full bg-[#E2E8F0] flex items-center justify-center text-[#64748B]">
                  <UserIcon />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-[13px] font-bold leading-none">{user.name}</p>
                  <p className="text-[11px] text-[#94A3B8] capitalize">{user.role}</p>
                </div>
              </button>

              {showProfile && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border z-50 py-2 overflow-hidden" style={{ borderColor: BORDER }}>
                  <div className="px-4 py-3 border-b mb-1" style={{ borderColor: BORDER }}>
                    <p className="text-[12px] text-[#94A3B8]">Signed in as</p>
                    <p className="text-[13px] font-bold truncate">{user.email || "user@medireach.com"}</p>
                  </div>
                  <button onClick={() => { setShowProfile(false); navigate("/profile"); }} className="w-full text-left px-4 py-2 text-[13px] text-[#64748B] hover:bg-gray-50 flex items-center gap-2">
                    <UserIcon /> View Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-[13px] text-red-500 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOutIcon /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* -- Content Area -- */}
        <div className="p-8 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { label: "Pending Orders", value: "12", color: INDIGO },
              { label: "Fulfilled Today", value: "48", color: "#0E7C5B" },
              { label: "Active Connections", value: "06", color: NAVY }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border shadow-sm" style={{ borderColor: BORDER }}>
                <p className="text-[12px] font-bold text-[#94A3B8] uppercase tracking-wide mb-1">{stat.label}</p>
                <h3 className="text-3xl font-extrabold" style={{ color: stat.color }}>{stat.value}</h3>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border min-h-[400px]" style={{ borderColor: BORDER }}>
            <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: BORDER }}>
              <h3 className="font-bold">Recent Network Activity</h3>
              <button className="text-[13px] font-semibold" style={{ color: INDIGO }}>View All</button>
            </div>
            <div className="flex flex-col items-center justify-center h-[300px] text-center p-6">
              <div className="w-16 h-16 bg-[#F7F9FC] rounded-full flex items-center justify-center mb-4">
                <GridIcon />
              </div>
              <p className="text-[#94A3B8] text-sm">No recent notifications to display.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
