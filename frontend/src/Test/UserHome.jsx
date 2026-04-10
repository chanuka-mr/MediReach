import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const QUICK_ACTIONS = [
  { icon: "🩺", label: "Book Consultation", sub: "Available now", accent: "#38BDF8", path: "/medicineshop" },
  { icon: "💊", label: "Order Medicine", sub: "Same-day delivery", accent: "#34D399", path: "/medicineshop" },
  { icon: "🏥", label: "Find Pharmacy", sub: "28 locations", accent: "#F472B6", path: "/user/pharmacies" },
  { icon: "💬", label: "Message Us", sub: "Avg. 4 min reply", accent: "#FBBF24", path: "/user/chats" },
];

const SERVICES = [
  { icon: "🩺", title: "Primary Care", desc: "Board-certified GPs available 24/7 for comprehensive consultations and preventive care.", tag: "Always Open" },
  { icon: "🧬", title: "Diagnostics", desc: "ISO-certified lab results in under 4 hours. From blood panels to advanced genomic screening.", tag: "4-hr Results" },
  { icon: "💊", title: "Pharmacy", desc: "Same-day home delivery reviewed by clinical pharmacists for 200+ chronic conditions.", tag: "Same Day" },
  { icon: "🧠", title: "Mental Health", desc: "Confidential counselling in 12 languages. Evidence-based therapy with same-week access.", tag: "12 Languages" },
  { icon: "🫀", title: "Cardiology", desc: "Remote ECG monitoring, cardiac screening, and post-surgical follow-up by world-class cardiologists.", tag: "Specialist" },
  { icon: "🌐", title: "Telemedicine", desc: "24/7 virtual consultations worldwide. Board-certified physicians respond in under 15 minutes.", tag: "15 min" },
];

const DOCTORS = [
  { init: "AK", name: "Dr. Amara Kwesi", spec: "Cardiology", exp: "18 yrs", rating: "4.97", status: "Available", accent: "#38BDF8" },
  { init: "SR", name: "Dr. Sofia Reyes", spec: "Neurology", exp: "14 yrs", rating: "4.95", status: "In session", accent: "#A78BFA" },
  { init: "MN", name: "Dr. Marcus Ndiaye", spec: "Oncology", exp: "22 yrs", rating: "4.98", status: "Available", accent: "#34D399" },
  { init: "LC", name: "Dr. Lena Cho", spec: "Mental Health", exp: "11 yrs", rating: "4.96", status: "Available", accent: "#FBBF24" },
];

const STATS = [
  { value: "50K+", label: "Patients Served", icon: "👥" },
  { value: "200+", label: "Specialists", icon: "🩺" },
  { value: "28", label: "Countries", icon: "🌍" },
  { value: "98%", label: "Satisfaction", icon: "⭐" },
];

const TIPS = [
  "💧 Drink 8 glasses of water daily to stay hydrated",
  "🚶 30 minutes of walking reduces cardiovascular risk by 35%",
  "😴 7-9 hours of sleep is essential for immune function",
  "🥗 A Mediterranean diet reduces chronic disease risk",
  "🧘 10 minutes of mindfulness daily lowers cortisol levels",
];

const TRUST_ITEMS = [
  "24/7 Emergency Triage",
  "AI-Assisted Diagnostics",
  "Same-Day Prescriptions",
  "12 Languages Supported",
  "Encrypted Records",
  "200+ Specialists",
  "Mental Health First Access",
];

function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setVisible(true);
    }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function Reveal({ children, delay = 0, style = {} }) {
  const [ref, on] = useReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: on ? 1 : 0,
        transform: on ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function LiveTicker({ items }) {
  return (
    <div style={{ overflow: "hidden", background: "rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.16)" }}>
      <div style={{ display: "flex", animation: "ticker 28s linear infinite", whiteSpace: "nowrap" }}>
        {[...items, ...items, ...items, ...items].map((item, i) => (
          <span
            key={i}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 36px",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.62rem",
              color: "rgba(255,255,255,0.78)",
              letterSpacing: "0.5px",
              flexShrink: 0,
            }}
          >
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#34D399", display: "inline-block" }} />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function QuickActionCard({ action, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? `${action.accent}14` : "rgba(255,255,255,0.08)",
        border: `1px solid ${hov ? `${action.accent}44` : "rgba(255,255,255,0.18)"}`,
        borderRadius: 18,
        padding: "20px 18px",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
        transform: hov ? "translateY(-3px)" : "none",
        boxShadow: hov ? `0 12px 32px ${action.accent}18` : "none",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{ fontSize: "1.8rem", lineHeight: 1 }}>{action.icon}</div>
      <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>{action.label}</div>
      <div style={{ fontSize: "0.7rem", color: action.accent, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.3px" }}>
        {action.sub} →
      </div>
    </button>
  );
}

function ServiceCard({ svc, index }) {
  const [hov, setHov] = useState(false);
  return (
    <Reveal delay={index * 60}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: hov ? "#f8fcff" : "#ffffff",
          border: `1px solid ${hov ? "rgba(2,62,138,0.25)" : "rgba(2,62,138,0.12)"}`,
          borderRadius: 20,
          padding: "28px 24px",
          cursor: "default",
          transition: "all 0.28s ease",
          transform: hov ? "translateY(-4px)" : "none",
          boxShadow: hov ? "0 16px 40px rgba(2,62,138,0.12)" : "0 2px 10px rgba(2,62,138,0.05)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {hov && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,#38BDF8,#A78BFA,#34D399)", borderRadius: 1 }} />}
        <div style={{ fontSize: "1.6rem", marginBottom: 12 }}>{svc.icon}</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", color: "#38BDF8", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8 }}>
          {svc.tag}
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem", fontWeight: 700, color: "#0f294e", marginBottom: 10 }}>{svc.title}</div>
        <p style={{ fontSize: "0.82rem", color: "rgba(15,41,78,0.72)", lineHeight: 1.72, fontFamily: "'DM Sans', sans-serif" }}>{svc.desc}</p>
      </div>
    </Reveal>
  );
}

function DoctorCard({ doc, index }) {
  const [hov, setHov] = useState(false);
  const avail = doc.status === "Available";
  return (
    <Reveal delay={index * 80}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: hov ? "#f8fcff" : "#ffffff",
          border: `1px solid ${hov ? `${doc.accent}33` : "rgba(255,255,255,0.2)"}`,
          borderRadius: 20,
          padding: "22px 20px",
          transition: "all 0.28s ease",
          transform: hov ? "translateY(-3px)" : "none",
          boxShadow: hov ? `0 14px 36px ${doc.accent}22` : "0 2px 10px rgba(2,62,138,0.06)",
          cursor: "default",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: `${doc.accent}22`,
              border: `1.5px solid ${doc.accent}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "0.88rem",
              color: doc.accent,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              flexShrink: 0,
              boxShadow: `0 4px 16px ${doc.accent}22`,
            }}
          >
            {doc.init}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f294e", fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.2 }}>{doc.name}</div>
            <div style={{ fontSize: "0.65rem", color: doc.accent, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.8px", textTransform: "uppercase", marginTop: 3 }}>{doc.spec}</div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(2,62,138,0.1)", paddingTop: 12 }}>
          <div>
            <div style={{ fontSize: "0.7rem", color: "rgba(15,41,78,0.5)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.4px", marginBottom: 2 }}>EXP</div>
            <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#0f294e" }}>{doc.exp}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "0.7rem", color: "rgba(15,41,78,0.5)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.4px", marginBottom: 2 }}>RATING</div>
            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#FBBF24" }}>★ {doc.rating}</div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 10px",
              borderRadius: 99,
              background: avail ? "rgba(52,211,153,0.12)" : "rgba(251,191,36,0.1)",
              border: `1px solid ${avail ? "rgba(52,211,153,0.3)" : "rgba(251,191,36,0.25)"}`,
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: avail ? "#34D399" : "#FBBF24", boxShadow: `0 0 6px ${avail ? "#34D399" : "#FBBF24"}` }} />
            <span style={{ fontSize: "0.63rem", fontFamily: "'JetBrains Mono', monospace", color: avail ? "#34D399" : "#FBBF24", letterSpacing: "0.4px" }}>{doc.status}</span>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function HealthTipCard({ tips }) {
  const [curr, setCurr] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setCurr((p) => (p + 1) % tips.length), 4200);
    return () => clearInterval(t);
  }, [tips.length]);
  return (
    <div style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.24)", borderRadius: 18, padding: "22px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34D399", boxShadow: "0 0 10px #34D399" }} />
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", color: "#34D399", letterSpacing: "1.8px", textTransform: "uppercase" }}>Daily Health Tip</span>
      </div>
      <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.72)", lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif", minHeight: 48, transition: "all 0.4s ease" }}>
        {tips[curr]}
      </div>
      <div style={{ display: "flex", gap: 5, marginTop: 14 }}>
        {tips.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurr(i)}
            style={{
              width: i === curr ? 18 : 6,
              height: 6,
              borderRadius: 99,
              background: i === curr ? "#34D399" : "rgba(52,211,153,0.2)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function UserHome() {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [ticker, setTicker] = useState(0);

  useEffect(() => {
    const t1 = setInterval(() => setTime(new Date()), 1000);
    const t2 = setInterval(() => setTicker((p) => p + 1), 3000);
    return () => {
      clearInterval(t1);
      clearInterval(t2);
    };
  }, []);

  const saved = localStorage.getItem("userInfo");
  const userInfo = saved ? JSON.parse(saved) : null;
  const user = userInfo?.user || userInfo;
  const userName = user?.name?.split(" ")[0] || "there";

  const hour = time.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const tickerItems = [
    `${(50241 + ticker * 3).toLocaleString()} patients served globally`,
    `${200 + (ticker % 3)} specialists available now`,
    `Average response: ${14 - (ticker % 4)} min`,
    `98.2% satisfaction this month`,
    "Next available slot: Today 10:15 AM",
  ];

  const fmt = time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const fmtDate = time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,400;1,700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .uh-root {
          min-height: 100vh;
          --techBlue: #023E8A;
          --techDk: #012D65;
          --green: #0E7C5B;
          --greenLt: #12A077;
          --leaf: #8BE07A;
          background: linear-gradient(180deg, #f3f7fb 0%, #ffffff 45%, #f5f9ff 100%);
          color: #0f294e;
          font-family: 'DM Sans', sans-serif;
        }

        .uh-hero-shell {
          background:
            radial-gradient(ellipse 70% 50% at 80% 0%, rgba(90,179,72,0.08) 0%, transparent 55%),
            radial-gradient(ellipse 60% 40% at 5% 85%, rgba(3,79,168,0.2) 0%, transparent 50%),
            linear-gradient(160deg, var(--techDk) 0%, #01295d 42%, #001b43 100%);
        }

        @keyframes ticker { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
        @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(52,211,153,0.4) } 50% { box-shadow: 0 0 0 8px rgba(52,211,153,0) } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }

        .uh-hero-badge { animation: fadeUp 0.7s ease both; }
        .uh-hero-h1 { animation: fadeUp 0.75s ease 0.1s both; }
        .uh-hero-sub { animation: fadeUp 0.75s ease 0.22s both; }
        .uh-hero-ctas { animation: fadeUp 0.75s ease 0.34s both; }
        .uh-quick-grid { animation: fadeUp 0.75s ease 0.45s both; }

        .uh-btn-primary {
          padding: 13px 28px;
          border-radius: 12px;
          background: linear-gradient(135deg,var(--green),var(--greenLt));
          border: none;
          color: #fff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.22s;
          box-shadow: 0 6px 24px rgba(14,124,91,0.35);
          letter-spacing: 0.1px;
        }
        .uh-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(14,124,91,0.5); }

        .uh-btn-ghost {
          padding: 13px 24px;
          border-radius: 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.75);
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.88rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.22s;
        }
        .uh-btn-ghost:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.22); color: #fff; }

        .uh-section { padding: 80px 40px; max-width: 1100px; margin: 0 auto; }

        .uh-section-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.6rem;
          color: var(--leaf);
          letter-spacing: 2.5px;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }
        .uh-section-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, rgba(90,179,72,0.35), transparent);
        }

        .uh-section-h {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.9rem,2.8vw,2.7rem);
          font-weight: 700;
          line-height: 1.08;
          letter-spacing: -0.5px;
          margin-bottom: 12px;
        }
        .uh-section-h em { font-style: italic; color: var(--leaf); }

        .uh-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .uh-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 18px; }
        .uh-grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }

        .uh-divider {
          border: none;
          height: 1px;
          background: linear-gradient(90deg,transparent,rgba(90,179,72,0.18),rgba(2,62,138,0.28),transparent);
          margin: 0 40px;
        }

        .uh-brand-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 14px 40px;
          background: linear-gradient(180deg, #013a83 0%, #012f6c 100%);
          border-bottom: 1px solid rgba(255,255,255,0.14);
        }

        .uh-brand-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .uh-brand-logo {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: linear-gradient(135deg, #38BDF8, #8BE07A);
          box-shadow: 0 4px 14px rgba(56,189,248,0.32);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1.05rem;
          font-weight: 800;
        }

        .uh-brand-name {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1.08rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.3px;
          line-height: 1;
        }

        .uh-brand-sub {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.58rem;
          letter-spacing: 1.4px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.62);
          margin-top: 3px;
        }

        .uh-trust-strip {
          background: linear-gradient(90deg, rgba(14,124,91,0.95), rgba(18,160,119,0.9));
          border-top: 1px solid rgba(255,255,255,0.08);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          overflow: hidden;
        }

        .uh-trust-inner {
          display: flex;
          animation: ticker 30s linear infinite;
          white-space: nowrap;
        }

        .uh-trust-item {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 11px 34px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.67rem;
              color: rgba(255,255,255,0.85);
          letter-spacing: 0.5px;
          flex-shrink: 0;
          text-transform: uppercase;
        }

        @media(max-width:1024px){
          .uh-grid-4 { grid-template-columns: repeat(2,1fr); }
          .uh-grid-3 { grid-template-columns: repeat(2,1fr); }
          .uh-hero-inner { grid-template-columns: 1fr !important; }
          .uh-hero-right { display: none !important; }
        }
        @media(max-width:768px){
          .uh-grid-2 { grid-template-columns: 1fr; }
          .uh-grid-3 { grid-template-columns: 1fr; }
          .uh-grid-4 { grid-template-columns: 1fr 1fr; }
          .uh-section { padding: 60px 20px; }
          .uh-quick-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media(max-width:480px){
          .uh-grid-4 { grid-template-columns: 1fr; }
          .uh-quick-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      <div className="uh-root">
        <div className="uh-brand-top">
          <div className="uh-brand-left">
          </div>
        </div>

        <div className="uh-hero-shell">


          <div style={{ position: "relative", padding: "70px 40px 80px", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ position: "absolute", top: -80, right: -80, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(56,189,248,0.1) 0%,transparent 60%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -60, left: -60, width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle,rgba(167,139,250,0.08) 0%,transparent 60%)", pointerEvents: "none" }} />

          <div className="uh-hero-inner" style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 60, alignItems: "center", position: "relative", zIndex: 1 }}>
            <div>
              <div className="uh-hero-badge" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "6px 16px", borderRadius: 99, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.26)", marginBottom: 24 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34D399", animation: "pulse 2s infinite" }} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "rgba(255,255,255,0.92)", letterSpacing: "1.5px" }}>
                  {fmt} · {fmtDate}
                </span>
              </div>

              <h1 className="uh-hero-h1" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.4rem,4.5vw,3.8rem)", fontWeight: 700, lineHeight: 1.05, letterSpacing: "-1px", marginBottom: 18, color: "#ffffff" }}>
                {greeting},<br />
                <em style={{ fontStyle: "italic", color: "#8BE07A" }}>{userName}</em>.<br />
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "85%", fontWeight: 600 }}>How can we help today?</span>
              </h1>

              <p className="uh-hero-sub" style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.72)", lineHeight: 1.85, maxWidth: 460, marginBottom: 32 }}>
                Your health dashboard is ready. Book consultations, order medicines, connect with pharmacies, and access your complete health record - all in one place.
              </p>

              <div className="uh-hero-ctas" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 44 }}>
                <button className="uh-btn-primary" onClick={() => navigate("/medicineshop")}>Book a Consultation →</button>
                <button className="uh-btn-ghost" onClick={() => navigate("/orderhistory")}>View My Orders</button>
              </div>

              <div className="uh-quick-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                {QUICK_ACTIONS.map((a) => (
                  <QuickActionCard key={a.label} action={a} onClick={() => navigate(a.path)} />
                ))}
              </div>
            </div>

            <div className="uh-hero-right" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <HealthTipCard tips={TIPS} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {STATS.map((s) => (
                  <div key={s.label} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.24)", borderRadius: 14, padding: "16px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: "1.1rem", marginBottom: 4 }}>{s.icon}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.55rem", fontWeight: 700, color: "#fff", lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.58rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.6px", textTransform: "uppercase", marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: "rgba(255,255,255,0.11)", border: "1px solid rgba(255,255,255,0.26)", borderRadius: 18, padding: "20px 20px" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", color: "#A78BFA", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#A78BFA" }} />
                  Upcoming Appointment
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", fontWeight: 700, color: "#fff", marginBottom: 6 }}>Next slot: Today 10:15 AM</div>
                <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", marginBottom: 14 }}>Dr. Amara Kwesi · Cardiology</div>
                <button className="uh-btn-primary" onClick={() => navigate("/user/chats")} style={{ width: "100%", textAlign: "center", fontSize: "0.8rem" }}>
                  Join Consultation →
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>

        <hr className="uh-divider" />

        <div className="uh-section">
          <Reveal>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40, flexWrap: "wrap", gap: 20 }}>
              <div>
                <div className="uh-section-label">What We Offer</div>
                <h2 className="uh-section-h">Comprehensive Care,<br /><em>One Platform</em></h2>
              </div>
              <p style={{ fontSize: "0.85rem", color: "rgba(15,41,78,0.7)", lineHeight: 1.75, maxWidth: 360 }}>
                Every dimension of healthcare integrated seamlessly. No referral delays, no missing records.
              </p>
            </div>
          </Reveal>
          <div className="uh-grid-3">
            {SERVICES.map((s, i) => <ServiceCard key={s.title} svc={s} index={i} />)}
          </div>
        </div>

        <hr className="uh-divider" />

        <div className="uh-section">
          <Reveal>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40, flexWrap: "wrap", gap: 20 }}>
              <div>
                <div className="uh-section-label">Meet The Team</div>
                <h2 className="uh-section-h">Featured <em>Specialists</em></h2>
              </div>
              <button className="uh-btn-ghost" onClick={() => navigate("/medicineshop")}>View all doctors →</button>
            </div>
          </Reveal>
          <div className="uh-grid-4">
            {DOCTORS.map((d, i) => <DoctorCard key={d.name} doc={d} index={i} />)}
          </div>
        </div>

        <hr className="uh-divider" />

        <div className="uh-section">
          <div className="uh-grid-2" style={{ alignItems: "start" }}>
            <Reveal>
              <div style={{ background: "#ffffff", border: "1px solid rgba(2,62,138,0.14)", borderRadius: 24, padding: "36px 32px", position: "relative", overflow: "hidden", boxShadow: "0 8px 24px rgba(2,62,138,0.08)" }}>
                <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle,rgba(244,114,182,0.12) 0%,transparent 65%)", pointerEvents: "none" }} />
                <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>🏥</div>
                <div className="uh-section-label" style={{ marginBottom: 10 }}>Pharmacy Network</div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.75rem", fontWeight: 700, lineHeight: 1.1, marginBottom: 12 }}>
                  Find a <em style={{ fontStyle: "italic", color: "#F472B6" }}>Pharmacy</em><br />Near You
                </h3>
                <p style={{ fontSize: "0.83rem", color: "rgba(15,41,78,0.72)", lineHeight: 1.72, marginBottom: 24 }}>
                  Browse 28+ MediReach-affiliated pharmacies. Scan QR codes for instant access to inventory, pricing, and same-day delivery.
                </p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button className="uh-btn-primary" onClick={() => navigate("/user/pharmacies")} style={{ background: "linear-gradient(135deg,#0E7C5B,#12A077)", boxShadow: "0 6px 20px rgba(14,124,91,0.28)" }}>
                    Browse Pharmacies →
                  </button>
                  <button className="uh-btn-ghost" onClick={() => navigate("/medicineshop")}>Order Medicine</button>
                </div>
              </div>
            </Reveal>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { icon: "💬", label: "Message Your Pharmacy", desc: "Real-time chat with your assigned pharmacist. Average response: 4 min.", accent: "#FBBF24", path: "/user/chats" },
                { icon: "📦", label: "Track Your Orders", desc: "View your complete order history, track deliveries, and reorder favourites.", accent: "#38BDF8", path: "/orderhistory" },
                { icon: "🔔", label: "My Inquiries", desc: "Manage your open and resolved inquiries with our clinical support team.", accent: "#A78BFA", path: "/user/inquiries" },
              ].map((card, i) => (
                <Reveal key={card.label} delay={i * 80}>
                  <div
                    onClick={() => navigate(card.path)}
                    style={{
                      background: "#ffffff",
                      border: `1px solid ${card.accent}33`,
                      borderRadius: 20,
                      padding: "24px 26px",
                      cursor: "pointer",
                      transition: "all 0.25s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: 18,
                      boxShadow: "0 6px 20px rgba(2,62,138,0.06)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.borderColor = `${card.accent}44`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.borderColor = `${card.accent}22`;
                    }}
                  >
                    <div style={{ width: 54, height: 54, borderRadius: 16, background: `${card.accent}14`, border: `1px solid ${card.accent}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>
                      {card.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.95rem", marginBottom: 4, color: "#0f294e" }}>{card.label}</div>
                      <div style={{ fontSize: "0.78rem", color: "rgba(15,41,78,0.72)", lineHeight: 1.5 }}>{card.desc}</div>
                    </div>
                    <div style={{ color: card.accent, fontSize: "1.2rem", marginLeft: "auto" }}>→</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        <hr className="uh-divider" />

        <div style={{ padding: "80px 40px", maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ background: "linear-gradient(135deg,#eaf3ff 0%,#e3efff 45%,#dceaff 100%)", border: "1px solid rgba(2,62,138,0.2)", borderRadius: 28, padding: "52px 48px", position: "relative", overflow: "hidden", textAlign: "center", boxShadow: "0 10px 28px rgba(2,62,138,0.1)" }}>
              <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage: "linear-gradient(rgba(2,62,138,0.28) 1px,transparent 1px),linear-gradient(90deg,rgba(2,62,138,0.28) 1px,transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none" }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", color: "#8BE07A", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 16 }}>
                  Your Health Journey
                </div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.9rem,3vw,2.8rem)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.5px", marginBottom: 14, color: "#0f294e" }}>
                  Everything you need,<br /><em style={{ fontStyle: "italic", color: "#8BE07A" }}>right here</em>.
                </h2>
                <p style={{ fontSize: "0.88rem", color: "rgba(15,41,78,0.72)", lineHeight: 1.8, maxWidth: 440, margin: "0 auto 32px" }}>
                  From booking specialists to managing prescriptions - MediReach keeps your health journey seamless, secure, and always within reach.
                </p>
                <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                  <button className="uh-btn-primary" onClick={() => navigate("/medicineshop")} style={{ fontSize: "0.9rem", padding: "14px 32px" }}>
                    Start a Consultation →
                  </button>
                  <button className="uh-btn-ghost" onClick={() => navigate("/user/pharmacies")} style={{ fontSize: "0.9rem", padding: "14px 28px", color: "#0f294e", borderColor: "rgba(2,62,138,0.2)", background: "#ffffff" }}>
                    Find a Pharmacy
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.14)", background: "#023E8A", padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.62rem", color: "rgba(229,241,255,0.85)", letterSpacing: "0.4px" }}>
            © 2025 MediReach Health Technologies · All rights reserved
          </span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.62rem", color: "#8BE07A", letterSpacing: "0.4px" }}>
            HIPAA · GDPR · ISO 15189 Certified
          </span>
        </div>
      </div>
    </>
  );
}
