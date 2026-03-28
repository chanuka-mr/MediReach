import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/* ── Pull user from localStorage ── */
function useUserInfo() {
  const saved = localStorage.getItem("userInfo");
  const userInfo = saved ? JSON.parse(saved) : null;
  const user = userInfo?.user || userInfo;
  const userName = user?.name || "Guest User";
  const firstName = userName.split(" ")[0];
  const initials = userName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return { userName, firstName, initials, email: user?.email || "user@medireach.lk", role: user?.role || "USER" };
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const QUICK_ACTIONS = [
  { icon: "🩺", label: "Book Appointment",  sub: "Find & schedule a doctor",      color: "#0E7C5B", bg: "rgba(14,124,91,0.1)",  path: "/medicineshop" },
  { icon: "💊", label: "Order Medicine",    sub: "Browse pharmacy catalogue",      color: "#3B82F6", bg: "rgba(59,130,246,0.1)", path: "/medicineshop" },
  { icon: "🏥", label: "Find Pharmacy",     sub: "Locate nearby pharmacies",       color: "#8B5CF6", bg: "rgba(139,92,246,0.1)", path: "/user/pharmacies" },
  { icon: "💬", label: "Message Pharmacy",  sub: "Chat with your pharmacist",      color: "#F59E0B", bg: "rgba(245,158,11,0.1)", path: "/user/chats" },
  { icon: "📦", label: "My Orders",         sub: "Track current orders",           color: "#EF4444", bg: "rgba(239,68,68,0.1)",  path: "/orderhistory" },
  { icon: "🧠", label: "Health Tips",       sub: "Personalised wellness advice",   color: "#06B6D4", bg: "rgba(6,182,212,0.1)",  path: "/" },
];

const UPCOMING_APPTS = [
  { doc: "Dr. Amara Kwesi",   spec: "Cardiology",    time: "Today",     slot: "10:30 AM", init: "AK", color: "#0E7C5B", mode: "Video" },
  { doc: "Dr. Sofia Reyes",   spec: "Neurology",     time: "Tomorrow",  slot: "09:00 AM", init: "SR", color: "#3B82F6", mode: "In-person" },
  { doc: "Dr. Marcus Ndiaye", spec: "Oncology",      time: "Mar 30",    slot: "11:00 AM", init: "MN", color: "#8B5CF6", mode: "Video" },
];

const RECENT_ORDERS = [
  { id: "#MR-4821", item: "Metformin 500mg × 60",   status: "Delivered",  date: "Mar 22", color: "#0E7C5B" },
  { id: "#MR-4756", item: "Atorvastatin 20mg × 30", status: "In Transit", date: "Mar 25", color: "#F59E0B" },
  { id: "#MR-4690", item: "Vitamin D3 1000 IU × 90",status: "Processing", date: "Mar 27", color: "#3B82F6" },
];

const HEALTH_METRICS = [
  { label: "Heart Rate",    value: "72",  unit: "bpm",   icon: "🫀", change: "+2",  good: true,  bar: 72 },
  { label: "Blood Pressure",value: "118", unit: "/78",   icon: "💉", change: "−3",  good: true,  bar: 78 },
  { label: "Health Score",  value: "92",  unit: "/100",  icon: "⭐", change: "+5",  good: true,  bar: 92 },
  { label: "Steps Today",   value: "6.2", unit: "K",     icon: "🚶", change: "−0.8",good: false, bar: 62 },
];

const TIPS = [
  { icon: "💧", tip: "Drink at least 8 glasses of water today to stay hydrated.", tag: "Hydration" },
  { icon: "🥗", tip: "Add leafy greens to your next meal — rich in folate and iron.", tag: "Nutrition" },
  { icon: "🧘", tip: "A 10-minute mindfulness break reduces cortisol by up to 30%.", tag: "Mental Health" },
];

function useReveal() {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) setOn(true); }, { threshold: 0.08 });
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, []);
  return [ref, on];
}

function Reveal({ children, delay = 0 }) {
  const [ref, on] = useReveal();
  return (
    <div ref={ref} style={{ opacity: on ? 1 : 0, transform: on ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms` }}>
      {children}
    </div>
  );
}

export default function UserHome() {
  const navigate = useNavigate();
  const { firstName, initials, email, role } = useUserInfo();
  const [tipIdx, setTipIdx] = useState(0);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTipIdx(i => (i + 1) % TIPS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const timeStr = time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  const dateStr = time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Lora:ital,wght@0,400;0,600;0,700;1,400;1,600&family=JetBrains+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --sans: 'Plus Jakarta Sans', sans-serif;
          --serif: 'Lora', Georgia, serif;
          --mono: 'JetBrains Mono', monospace;
          --ink: #0d1f2d;
          --ink2: #2d4356;
          --muted: #64748b;
          --fog: #f1f5f9;
          --card: #ffffff;
          --border: #e2e8f0;
          --green: #0E7C5B;
          --greenLt: #12a077;
          --leaf: #5ab348;
          --blue: #023E8A;
          --blueLt: #034fa8;
          --r: 16px;
          --rLg: 22px;
        }

        .uh-page {
          min-height: 100vh;
          background: linear-gradient(160deg, #f0f7ff 0%, #f8fafc 40%, #f0fdf4 100%);
          font-family: var(--sans);
          color: var(--ink);
          padding: 28px 32px 60px;
          overflow-x: hidden;
        }

        /* ── Welcome Banner ── */
        .uh-banner {
          background: linear-gradient(120deg, #012d65 0%, #023E8A 55%, #034fa8 100%);
          border-radius: var(--rLg);
          padding: 36px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
          margin-bottom: 28px;
          position: relative;
          overflow: hidden;
          animation: bannerIn 0.7s ease both;
        }
        @keyframes bannerIn { from { opacity:0; transform:translateY(-18px); } to { opacity:1; transform:translateY(0); } }

        .uh-banner::before {
          content: '';
          position: absolute; top: -80px; right: -80px;
          width: 300px; height: 300px; border-radius: 50%;
          background: radial-gradient(circle, rgba(90,179,72,0.18), transparent 70%);
        }
        .uh-banner::after {
          content: '';
          position: absolute; bottom: -60px; left: 30%;
          width: 200px; height: 200px; border-radius: 50%;
          background: radial-gradient(circle, rgba(56,189,248,0.1), transparent 70%);
        }

        .uh-greet-sub {
          font-family: var(--mono);
          font-size: 0.65rem;
          color: rgba(255,255,255,0.45);
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .uh-greet-name {
          font-family: var(--serif);
          font-size: clamp(1.8rem, 3vw, 2.5rem);
          font-weight: 700;
          color: #fff;
          line-height: 1.1;
          margin-bottom: 10px;
        }
        .uh-greet-name em { font-style: italic; color: #8be07a; }
        .uh-greet-msg {
          font-size: 0.88rem;
          color: rgba(255,255,255,0.55);
          line-height: 1.7;
          max-width: 400px;
        }

        .uh-clock {
          text-align: right;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
        }
        .uh-time {
          font-family: var(--mono);
          font-size: 2.4rem;
          font-weight: 500;
          color: #fff;
          letter-spacing: -1px;
          line-height: 1;
        }
        .uh-date {
          font-family: var(--mono);
          font-size: 0.65rem;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.5px;
          margin-top: 6px;
          text-transform: uppercase;
        }
        .uh-health-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(90,179,72,0.18);
          border: 1px solid rgba(90,179,72,0.3);
          border-radius: 100px;
          padding: 5px 12px;
          margin-top: 14px;
          font-size: 0.72rem;
          font-weight: 700;
          color: #8be07a;
          letter-spacing: 0.5px;
        }
        .uh-health-chip::before {
          content: '';
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #8be07a;
          animation: pip 2s infinite;
        }
        @keyframes pip { 0%,100%{opacity:1} 50%{opacity:0.3} }

        /* ── Grid ── */
        .uh-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        .uh-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }
        .uh-grid-full {
          margin-bottom: 20px;
        }

        /* ── Section header ── */
        .uh-sec-title {
          font-family: var(--serif);
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .uh-sec-title::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border);
        }
        .uh-sec-tag {
          font-family: var(--mono);
          font-size: 0.6rem;
          color: var(--green);
          letter-spacing: 1.5px;
          text-transform: uppercase;
          background: rgba(14,124,91,0.08);
          border: 1px solid rgba(14,124,91,0.18);
          padding: 3px 8px;
          border-radius: 100px;
        }

        /* ── Card base ── */
        .uh-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--rLg);
          padding: 22px 24px;
          transition: box-shadow 0.25s;
        }
        .uh-card:hover { box-shadow: 0 8px 32px rgba(2,62,138,0.08); }

        /* ── Quick actions ── */
        .qa-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .qa-item {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 16px 16px;
          border-radius: 14px;
          border: 1px solid var(--border);
          background: var(--card);
          cursor: pointer;
          transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1);
          text-align: left;
          width: 100%;
        }
        .qa-item:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 28px rgba(2,62,138,0.1);
          border-color: transparent;
        }
        .qa-ico {
          width: 44px; height: 44px;
          border-radius: 13px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.3rem;
          flex-shrink: 0;
          transition: transform 0.2s;
        }
        .qa-item:hover .qa-ico { transform: scale(1.12) rotate(-4deg); }
        .qa-label { font-size: 0.85rem; font-weight: 700; color: var(--ink); }
        .qa-sub { font-size: 0.72rem; color: var(--muted); margin-top: 2px; }

        /* ── Appointments ── */
        .appt-item {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 13px 0;
          border-bottom: 1px solid var(--border);
          transition: background 0.2s;
        }
        .appt-item:last-child { border-bottom: none; padding-bottom: 0; }
        .appt-item:first-child { padding-top: 0; }
        .appt-av {
          width: 42px; height: 42px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 0.82rem; color: #fff;
          flex-shrink: 0;
        }
        .appt-doc { font-size: 0.88rem; font-weight: 700; color: var(--ink); }
        .appt-spec { font-size: 0.72rem; color: var(--muted); margin-top: 1px; font-family: var(--mono); }
        .appt-time-badge {
          text-align: right;
          flex-shrink: 0;
        }
        .appt-time-main {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--ink);
          font-family: var(--mono);
        }
        .appt-time-slot {
          font-size: 0.68rem;
          color: var(--muted);
          margin-top: 2px;
          font-family: var(--mono);
        }
        .appt-mode {
          font-size: 0.62rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 100px;
          background: rgba(14,124,91,0.1);
          color: var(--green);
          border: 1px solid rgba(14,124,91,0.2);
          margin-top: 4px;
          display: inline-block;
        }
        .appt-mode.video { background: rgba(59,130,246,0.1); color: #3B82F6; border-color: rgba(59,130,246,0.2); }

        /* ── Metrics ── */
        .metric-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--rLg);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: all 0.25s;
          position: relative;
          overflow: hidden;
        }
        .metric-card:hover { box-shadow: 0 8px 28px rgba(2,62,138,0.09); transform: translateY(-2px); }
        .metric-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--green), var(--leaf));
          border-radius: 99px 99px 0 0;
        }
        .metric-icon { font-size: 1.6rem; }
        .metric-val {
          font-family: var(--serif);
          font-size: 2rem;
          font-weight: 700;
          color: var(--ink);
          line-height: 1;
        }
        .metric-val span { font-size: 1rem; color: var(--muted); font-weight: 400; }
        .metric-label { font-size: 0.75rem; color: var(--muted); font-family: var(--mono); letter-spacing: 0.5px; }
        .metric-change {
          font-size: 0.7rem;
          font-weight: 700;
          font-family: var(--mono);
        }
        .metric-bar-bg { height: 4px; background: var(--fog); border-radius: 99px; overflow: hidden; }
        .metric-bar-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg, var(--green), var(--leaf)); transition: width 1.2s ease; }

        /* ── Orders ── */
        .order-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid var(--border);
        }
        .order-row:last-child { border-bottom: none; padding-bottom: 0; }
        .order-row:first-child { padding-top: 0; }
        .order-id {
          font-family: var(--mono);
          font-size: 0.7rem;
          color: var(--muted);
          flex-shrink: 0;
          width: 70px;
        }
        .order-item { font-size: 0.84rem; font-weight: 600; color: var(--ink); flex: 1; }
        .order-date { font-family: var(--mono); font-size: 0.68rem; color: var(--muted); flex-shrink: 0; }
        .order-status {
          font-size: 0.65rem;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 100px;
          letter-spacing: 0.5px;
          flex-shrink: 0;
        }

        /* ── Health Tip carousel ── */
        .tip-card {
          background: linear-gradient(135deg, #012d65, #023E8A);
          border-radius: var(--rLg);
          padding: 24px 28px;
          display: flex;
          align-items: center;
          gap: 20px;
          position: relative;
          overflow: hidden;
          margin-bottom: 20px;
          animation: bannerIn 0.7s ease 0.2s both;
        }
        .tip-card::before {
          content: '';
          position: absolute; right: -40px; top: -40px;
          width: 160px; height: 160px; border-radius: 50%;
          background: radial-gradient(circle, rgba(90,179,72,0.15), transparent 70%);
        }
        .tip-icon { font-size: 2.8rem; flex-shrink: 0; }
        .tip-tag {
          font-family: var(--mono);
          font-size: 0.6rem;
          color: rgba(139,224,122,0.7);
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .tip-text {
          font-family: var(--serif);
          font-size: 1.02rem;
          font-style: italic;
          color: rgba(255,255,255,0.82);
          line-height: 1.6;
        }
        .tip-dots {
          display: flex;
          gap: 6px;
          margin-top: 12px;
        }
        .tip-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.25);
          transition: all 0.3s;
        }
        .tip-dot.active { background: #8be07a; width: 16px; border-radius: 3px; }

        /* ── Profile summary card ── */
        .profile-summary {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--rLg);
          overflow: hidden;
        }
        .profile-banner {
          height: 64px;
          background: linear-gradient(120deg, #012d65, #023E8A 60%, #0E7C5B);
          position: relative;
        }
        .profile-banner::after {
          content: '';
          position: absolute; bottom: -22px; left: 20px;
          width: 44px; height: 44px; border-radius: 50%;
          background: linear-gradient(135deg, #38BDF8, #A78BFA);
          border: 3px solid #fff;
          display: flex; align-items: center; justify-content: center;
        }
        .profile-av-wrap {
          position: absolute; bottom: -22px; left: 20px;
          width: 44px; height: 44px; border-radius: 50%;
          background: linear-gradient(135deg, #38BDF8, #A78BFA);
          border: 3px solid #fff;
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 0.9rem; color: #fff;
          font-family: var(--sans);
        }
        .profile-body {
          padding: 32px 20px 18px;
        }
        .profile-name {
          font-family: var(--serif);
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--ink);
        }
        .profile-email {
          font-size: 0.72rem;
          color: var(--muted);
          font-family: var(--mono);
          margin-top: 2px;
        }
        .profile-badge {
          display: inline-block;
          margin-top: 8px;
          font-size: 0.62rem;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 100px;
          background: rgba(14,124,91,0.1);
          color: var(--green);
          border: 1px solid rgba(14,124,91,0.25);
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .profile-stats {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 0;
          margin-top: 16px;
          border-top: 1px solid var(--border);
          padding-top: 14px;
        }
        .ps-item { text-align: center; border-right: 1px solid var(--border); padding: 6px 0; }
        .ps-item:last-child { border-right: none; }
        .ps-val { font-family: var(--serif); font-size: 1.3rem; font-weight: 700; color: var(--ink); }
        .ps-label { font-family: var(--mono); font-size: 0.58rem; color: var(--muted); letter-spacing: 0.5px; text-transform: uppercase; margin-top: 2px; }

        /* ── Responsive ── */
        @media (max-width: 1100px) {
          .uh-grid { grid-template-columns: 1fr; }
          .uh-grid-3 { grid-template-columns: repeat(2,1fr); }
          .qa-grid { grid-template-columns: repeat(2,1fr); }
        }
        @media (max-width: 768px) {
          .uh-page { padding: 16px 16px 48px; }
          .uh-banner { flex-direction: column; gap: 20px; padding: 24px 22px; }
          .uh-clock { text-align: left; }
          .uh-grid-3 { grid-template-columns: 1fr; }
          .qa-grid { grid-template-columns: repeat(2,1fr); }
        }
      `}</style>

      <div className="uh-page">

        {/* ── Welcome Banner ── */}
        <div className="uh-banner">
          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="uh-greet-sub">{getGreeting()}</div>
            <div className="uh-greet-name">
              Welcome back, <em>{firstName}</em> 👋
            </div>
            <p className="uh-greet-msg">
              Your health dashboard is up to date. You have <strong style={{ color: "#8be07a" }}>1 appointment today</strong> and <strong style={{ color: "#8be07a" }}>1 order in transit</strong>. Stay on track with your wellness goals.
            </p>
            <div className="uh-health-chip">Health Score: 92/100 — Excellent</div>
          </div>
          <div className="uh-clock" style={{ position: "relative", zIndex: 1 }}>
            <div className="uh-time">{timeStr}</div>
            <div className="uh-date">{dateStr}</div>
          </div>
        </div>

        {/* ── Daily Health Tip ── */}
        <Reveal>
          <div className="tip-card">
            <div className="tip-icon">{TIPS[tipIdx].icon}</div>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div className="tip-tag">💡 Daily Wellness · {TIPS[tipIdx].tag}</div>
              <div className="tip-text">{TIPS[tipIdx].tip}</div>
              <div className="tip-dots">
                {TIPS.map((_, i) => <div key={i} className={`tip-dot ${i === tipIdx ? "active" : ""}`} />)}
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── Quick Actions ── */}
        <Reveal delay={60}>
          <div style={{ marginBottom: 20 }}>
            <div className="uh-sec-title">
              Quick Actions
              <span className="uh-sec-tag">Shortcuts</span>
            </div>
            <div className="qa-grid">
              {QUICK_ACTIONS.map((a, i) => (
                <button key={a.label} className="qa-item" onClick={() => navigate(a.path)}
                  style={{ "--hover-color": a.color } }
                  onMouseEnter={e => (e.currentTarget.style.borderColor = a.color + "44")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "")}>
                  <div className="qa-ico" style={{ background: a.bg }}>
                    {a.icon}
                  </div>
                  <div>
                    <div className="qa-label">{a.label}</div>
                    <div className="qa-sub">{a.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ── Health Metrics ── */}
        <Reveal delay={80}>
          <div style={{ marginBottom: 20 }}>
            <div className="uh-sec-title">
              Health Metrics
              <span className="uh-sec-tag">Last Updated Today</span>
            </div>
            <div className="uh-grid-3" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
              {HEALTH_METRICS.map((m, i) => (
                <div key={m.label} className="metric-card">
                  <div className="metric-icon">{m.icon}</div>
                  <div>
                    <div className="metric-val">{m.value}<span>{m.unit}</span></div>
                    <div className="metric-label">{m.label}</div>
                  </div>
                  <div className="metric-bar-bg">
                    <div className="metric-bar-fill" style={{ width: `${m.bar}%`, background: m.good ? undefined : "linear-gradient(90deg,#F59E0B,#EF4444)" }} />
                  </div>
                  <div className="metric-change" style={{ color: m.good ? "#0E7C5B" : "#EF4444" }}>
                    {m.change} {m.good ? "↑" : "↓"} vs last week
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ── Appointments + Profile ── */}
        <Reveal delay={100}>
          <div className="uh-grid">
            {/* Appointments */}
            <div className="uh-card">
              <div className="uh-sec-title" style={{ marginBottom: 14 }}>
                Upcoming Appointments
                <span className="uh-sec-tag">Next 7 Days</span>
              </div>
              {UPCOMING_APPTS.map((a, i) => (
                <div key={a.doc} className="appt-item">
                  <div className="appt-av" style={{ background: a.color + "22", color: a.color, fontFamily: "var(--sans)" }}>
                    {a.init}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="appt-doc">{a.doc}</div>
                    <div className="appt-spec">{a.spec}</div>
                  </div>
                  <div className="appt-time-badge">
                    <div className="appt-time-main">{a.time}</div>
                    <div className="appt-time-slot">{a.slot}</div>
                    <span className={`appt-mode ${a.mode === "Video" ? "video" : ""}`}>{a.mode}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Profile Summary */}
            <div className="profile-summary">
              <div className="profile-banner">
                <div className="profile-av-wrap" style={{ fontFamily: "var(--sans)" }}>
                  {initials}
                </div>
              </div>
              <div className="profile-body">
                <div className="profile-name">{useUserInfo().userName}</div>
                <div className="profile-email">{email}</div>
                <span className="profile-badge">Verified Patient · {role}</span>
                <div className="profile-stats">
                  <div className="ps-item">
                    <div className="ps-val">3</div>
                    <div className="ps-label">Appts.</div>
                  </div>
                  <div className="ps-item">
                    <div className="ps-val">12</div>
                    <div className="ps-label">Orders</div>
                  </div>
                  <div className="ps-item">
                    <div className="ps-val">92</div>
                    <div className="ps-label">Score</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── Recent Orders ── */}
        <Reveal delay={120}>
          <div className="uh-card">
            <div className="uh-sec-title" style={{ marginBottom: 14 }}>
              Recent Orders
              <span className="uh-sec-tag">Medicine</span>
              <button onClick={() => navigate("/orderhistory")} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--green)", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "var(--sans)" }}>
                View all →
              </button>
            </div>
            {RECENT_ORDERS.map((o, i) => (
              <div key={o.id} className="order-row">
                <div className="order-id">{o.id}</div>
                <div className="order-item">{o.item}</div>
                <div className="order-date">{o.date}</div>
                <div className="order-status" style={{
                  background: o.status === "Delivered" ? "rgba(14,124,91,0.1)" : o.status === "In Transit" ? "rgba(245,158,11,0.1)" : "rgba(59,130,246,0.1)",
                  color: o.status === "Delivered" ? "#0E7C5B" : o.status === "In Transit" ? "#D97706" : "#2563EB",
                  border: `1px solid ${o.status === "Delivered" ? "rgba(14,124,91,0.2)" : o.status === "In Transit" ? "rgba(245,158,11,0.2)" : "rgba(59,130,246,0.2)"}`,
                }}>
                  {o.status}
                </div>
              </div>
            ))}
          </div>
        </Reveal>

      </div>
    </>
  );
}