import { useState, useEffect } from "react";

// -- Reusing Icons from AuthPage theme --
const GridIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);

const INDIGO = "#4C6EF5";
const NAVY = "#023E8A";
const BORDER = "#DDE3ED";

export default function HomePage() {
  const [user, setUser] = useState({ name: "Guest User", role: "user" });

  useEffect(() => {
    const saved = localStorage.getItem("userInfo");
    if (saved) {
      const parsed = JSON.parse(saved);
      setUser(parsed.user || parsed);
    }
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#F7F9FC] font-sans text-[#0F172A]">


      {/* -- Main Content -- */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* -- Header -- */}
        <header className="h-[72px] border-b bg-white flex items-center justify-between px-8" style={{ borderColor: BORDER }}>
          <h1 className="text-xl font-bold tracking-tight">Welcome back, {user.name ? user.name.split(' ')[0] : "User"}</h1>

          {/* Header right side - now empty as requested */}
          <div className="flex items-center gap-5">
            {/* Removed notification and profile elements */}
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
