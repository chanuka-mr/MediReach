import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ForgotPasswordPage from "./ForgotPasswordPage";

// ── Icons ────────────────────────────────────────────
const GridIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const BuildingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);
const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.92 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const EyeIcon = ({ open }) => open ? (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const ActivityIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);
const CrosshairIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/>
    <line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/>
  </svg>
);
const ShieldIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const LicenseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/>
    <line x1="9" y1="21" x2="9" y2="9"/>
  </svg>
);

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"
      className="animate-spin">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  );
}

// ── Reusable input field ──────────────────────────────
function Field({ icon, type = "text", placeholder, value, onChange, fk, focused, setFocused, right, name }) {
  const isFocused = focused === fk;
  return (
    <div
      className="flex items-center gap-[9px] rounded-[10px] px-3 transition-all duration-200"
      style={{
        border: `1.5px solid ${isFocused ? "#4C6EF5" : "#DDE3ED"}`,
        background: isFocused ? "#F8FAFF" : "#F7F9FC",
        boxShadow: isFocused ? "0 0 0 3px rgba(76,110,245,0.1)" : "none",
      }}
    >
      <span className="flex flex-shrink-0" style={{ color: isFocused ? "#4C6EF5" : "#94A3B8" }}>
        {icon}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(fk)}
        onBlur={() => setFocused(null)}
        autoComplete={name}
        name={name}
        className="flex-1 border-none outline-none bg-transparent text-[13px] text-[#0F172A] py-[11px] font-sans"
      />
      {right}
    </div>
  );
}

const stats = [
  { label: "Pharmacies Active", value: "08",    icon: <CrosshairIcon />, color: "#0E7C5B" },
  { label: "Orders Dispatched", value: "1,284", icon: <ActivityIcon />,  color: "#4C6EF5" },
  { label: "Pending Orders",    value: "37",    icon: <CrosshairIcon />, color: "#B45309" },
];

const INDIGO = "#4C6EF5";
const NAVY   = "#023E8A";

// ── Main ──────────────────────────────────────────────
export default function AuthPage({ onLoginSuccess }) {
  const [mode, setMode]           = useState("login");
  const [mounted, setMounted]     = useState(false);
  const [focused, setFocused]     = useState(null);
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [remember, setRemember]   = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const [lEmail,    setLEmail]    = useState("");
  const [lPass,     setLPass]     = useState("");
  const [sName,     setSName]     = useState("");
  const [sPhone,    setSPhone]    = useState("");
  const [sEmail,    setSEmail]    = useState("");
  const [sPass,     setSPass]     = useState("");
  const [sConf,     setSConf]     = useState("");
  const [sRole,     setSRole]     = useState("customer");
  const [sPharmacy, setSPharmacy] = useState("");
  const [sLicense,  setSLicense]  = useState("");

  useEffect(() => { 
    // Check URL parameters for mode
    const searchParams = new URLSearchParams(window.location.search);
    const urlMode = searchParams.get('mode');
    if (urlMode === 'signup' || urlMode === 'login') {
      setMode(urlMode);
    }
    setTimeout(() => setMounted(true), 60); 
  }, []);

  const isSignup = mode === "signup";

  const switchMode = (to) => {
    if (mode === to) return;
    setLoading(false);
    setFocused(null);
    setMode(to);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignup) {
        if (!sName || !sEmail || !sPass || !sPhone) { alert("Please fill all required fields"); setLoading(false); return; }
        if (sPass !== sConf) { alert("Passwords do not match"); setLoading(false); return; }
        const payload = { name: sName, email: sEmail, password: sPass, contactNumber: sPhone, role: sRole === "customer" ? "user" : "pharmacy" };
        if (sRole === "pharmacy") { payload.pharmacyName = sPharmacy; payload.licenseNumber = sLicense; }
        const res = await fetch("http://localhost:5000/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const data = await res.json();
        if (res.ok) { alert("Signup successful! Please login."); switchMode("login"); }
        else alert(data.message || "Signup failed");
      } else {
        if (!lEmail || !lPass) { alert("Please enter email and password"); setLoading(false); return; }
        const res = await fetch("http://localhost:5000/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: lEmail, password: lPass }) });
        const data = await res.json();
        if (res.ok) { localStorage.setItem("userInfo", JSON.stringify(data)); if (onLoginSuccess) onLoginSuccess(); }
        else alert(data.message || "Invalid credentials");
      }
    } catch (err) { console.error(err); alert("Something went wrong"); }
    finally { setLoading(false); }
  };

  const eyeBtn = (show, toggle) => (
    <button type="button" onClick={toggle} className="flex items-center bg-transparent border-none cursor-pointer text-[#94A3B8] p-0.5">
      <EyeIcon open={show} />
    </button>
  );

  const DURATION = "0.38s";
  const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

  if (showForgot) {
    return <ForgotPasswordPage onBackToLogin={() => { setShowForgot(false); setMode("login"); }} />;
  }

  return (
    <div
      style={{ position: "relative", height: "100vh", width: "100%", display: "flex", overflow: "hidden", fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#F7F9FC" }}
    >

      {/* ── Ambient background ── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div className="absolute -top-[100px] -left-[80px] w-[480px] h-[480px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(76,110,245,0.055) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-[80px] left-1/4 w-[360px] h-[360px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(14,124,91,0.04) 0%, transparent 70%)" }} />
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-[0.22]">
          <defs>
            <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.2" fill="#DDE3ED" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      {/* ══ NAVY PANEL — z-[1], slides left/right ══ */}
      <div
        style={{
          position: "absolute",
          top: 0, bottom: 0,
          width: "45%",
          zIndex: 1,
          overflow: "hidden",
          background: "linear-gradient(145deg, #011f54 0%, #023E8A 50%, #034fa6 100%)",
          left: isSignup ? "0%" : "55%",
          transition: `left ${DURATION} ${EASE}`,
        }}
      >
        {/* Grid overlay */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-[0.05]">
            <defs>
              <pattern id="pgrid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M60 0L0 0 0 60" fill="none" stroke="white" strokeWidth="0.8"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#pgrid)" />
          </svg>
        </div>
        {/* Glow orbs */}
        <div className="absolute -top-[50px] -right-[50px] w-[240px] h-[240px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(76,110,245,0.22) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[60px] -left-[30px] w-[180px] h-[180px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(14,124,91,0.16) 0%, transparent 70%)" }} />

        {/* ── Panel LOGIN content ── */}
        <div
          className="absolute inset-0 p-12 flex flex-col justify-between"
          style={{
            opacity: isSignup ? 0 : 1,
            transition: `opacity 0.3s ease ${isSignup ? "0s" : "0.35s"}`,
            pointerEvents: isSignup ? "none" : "all",
          }}
        >
          <div>
            {/* Logo */}
            <div className="flex items-center gap-[11px] mb-[52px]">
              <img 
                    src="/logo.png" 
                    alt="MediReach Logo" 
                    width={40} 
                    height={40}
                    className="rounded-[10px]"
                />
              <span className="text-white text-[19px] font-bold tracking-[-0.3px]">MediReach</span>
            </div>

            <p className="text-[rgba(255,255,255,0.4)] text-[10.5px] font-bold tracking-[3px] uppercase mb-3">Pharmacy Network</p>
            <h2 className="text-white text-[30px] font-extrabold leading-[1.22] tracking-[-0.7px] mb-4">
              Real-time dispatch<br />
              <span style={{ color: INDIGO }}>monitoring</span><br />
              across the network.
            </h2>
            <p className="text-[rgba(255,255,255,0.46)] text-[13px] leading-[1.75] max-w-[290px] mb-[30px]">
              Securely manage inventory, track connections, and oversee fulfilment — all in one platform.
            </p>
            <div className="w-10 h-[3px] rounded mb-[26px]"
              style={{ background: `linear-gradient(90deg, ${INDIGO}, transparent)` }} />

            {stats.map((s, i) => (
              <div key={i} className="stat-card"
                style={{
                  marginBottom: i < 2 ? "9px" : 0,
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "none" : "translateX(-12px)",
                  transition: `opacity 0.5s ease ${0.2 + i * 0.1}s, transform 0.5s ease ${0.2 + i * 0.1}s`,
                }}
              >
                <div className="w-8 h-8 rounded-[7px] flex items-center justify-center flex-shrink-0"
                  style={{ background: `${s.color}22`, color: s.color }}>
                  {s.icon}
                </div>
                <div>
                  <div className="text-white text-base font-bold leading-none">{s.value}</div>
                  <div className="text-[rgba(255,255,255,0.38)] text-[11px] mt-[3px]">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-[rgba(255,255,255,0.24)] text-[10.5px]">
            <ShieldIcon /><span>256-bit encrypted · HIPAA compliant · ISO 27001</span>
          </div>
        </div>

        {/* ── Panel SIGNUP content ── */}
        <div
          className="absolute inset-0 p-12 flex flex-col justify-center items-center text-center"
          style={{
            opacity: isSignup ? 1 : 0,
            transition: `opacity 0.3s ease ${isSignup ? "0.35s" : "0s"}`,
            pointerEvents: isSignup ? "all" : "none",
          }}
        >
          <img 
                    src="/logo.png" 
                    alt="MediReach Logo" 
                    width={40} 
                    height={40}
                    className="rounded-[10px] mb-4"
                />
          <span className="text-white text-[19px] font-bold tracking-[-0.3px] block mb-7">MediReach</span>
          <div className="w-10 h-[3px] rounded mb-7"
            style={{ background: `linear-gradient(90deg, ${INDIGO}, transparent)` }} />
          <h3 className="text-white text-[23px] font-extrabold leading-[1.28] tracking-[-0.5px] mb-3.5">
            Already part of<br />the network?
          </h3>
          <p className="text-[rgba(255,255,255,0.48)] text-[13px] leading-[1.75] max-w-[240px] mb-8">
            Sign in to manage your pharmacy operations and stay connected.
          </p>
          <button className="btn-ghost-white" onClick={() => switchMode("login")}>
            Sign In Instead
          </button>
          <div className="mt-12 flex items-center gap-1.5 text-[rgba(255,255,255,0.24)] text-[10.5px]">
            <ShieldIcon /><span>256-bit encrypted · HIPAA compliant</span>
          </div>
        </div>
      </div>

      {/* ══ LOGIN FORM — left 55%, z-[2] ══ */}
      <div
        style={{
          position: "absolute", top: 0, bottom: 0, left: 0,
          width: "55%", zIndex: 2,
          display: "flex", alignItems: "center", justifyContent: "flex-end",
          paddingLeft: "40px", paddingRight: "56px", paddingTop: "40px", paddingBottom: "40px",
          transform: isSignup ? "translateX(-100%)" : "translateX(0)",
          opacity: mounted ? 1 : 0,
          transition: `transform ${DURATION} ${EASE}, opacity 0.5s ease`,
        }}
      >
        <div className="w-full max-w-[380px]">
          <div className="mb-7">
            <h2 className="text-[26px] font-extrabold text-[#0F172A] tracking-[-0.6px] mb-[7px]">Welcome back</h2>
            <p className="text-[#4A5568] text-[13.5px] leading-[1.65]">Sign in to your pharmacy network account.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-[13px]">
              <label className="field-label">Email Address</label>
              <Field icon={<MailIcon />} type="email" placeholder="admin@pharmacy.com"
                value={lEmail} onChange={e => setLEmail(e.target.value)}
                fk="lemail" focused={focused} setFocused={setFocused} name="email" />
            </div>
            <div className="mb-1.5">
              <label className="field-label">Password</label>
              <Field icon={<LockIcon />} type={showPass ? "text" : "password"} placeholder="Enter your password"
                value={lPass} onChange={e => setLPass(e.target.value)}
                fk="lpass" focused={focused} setFocused={setFocused} name="current-password"
                right={eyeBtn(showPass, () => setShowPass(!showPass))} />
            </div>

            <div className="flex justify-between items-center mt-3.5 mb-[22px]">
              <label className="flex items-center gap-[7px] cursor-pointer">
                <div
                  onClick={() => setRemember(!remember)}
                  className="w-[15px] h-[15px] flex-shrink-0 rounded-[4px] flex items-center justify-center cursor-pointer transition-all duration-200"
                  style={{ border: `2px solid ${remember ? INDIGO : "#DDE3ED"}`, background: remember ? INDIGO : "#fff" }}
                >
                  {remember && <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span className="text-[12px] text-[#4A5568] select-none">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-[12px] font-semibold bg-transparent border-none cursor-pointer p-0 font-sans"
                style={{ color: INDIGO }}
              >Forgot password?</button>
            </div>

            <button
              type="submit"
              path="/Home"
              disabled={loading}
              className="w-full py-3 border-none rounded-[10px] text-sm font-bold flex items-center justify-center gap-2 font-sans tracking-[0.3px] transition-all duration-200 text-white"
              style={{
                background: loading ? "#7B96D8" : `linear-gradient(135deg, ${NAVY} 0%, ${INDIGO} 100%)`,
                boxShadow: loading ? "none" : "0 4px 18px rgba(2,62,138,0.3)",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? <><Spinner /> Authenticating...</> : <>Sign In <ArrowRightIcon /></>}
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-[#DDE3ED]" />
            <span className="text-[11px] text-[#A0AEC0]">or</span>
            <div className="flex-1 h-px bg-[#DDE3ED]" />
          </div>

          <button
            className="w-full py-[10px] bg-white rounded-[10px] text-[12.5px] font-semibold text-[#4A5568] flex items-center justify-center gap-2 font-sans transition-colors duration-200 cursor-pointer"
            style={{ border: "1.5px solid #DDE3ED" }}
          >
            <BuildingIcon /> Sign in with Organisation SSO
          </button>

          <p className="text-center text-[12.5px] text-[#4A5568] mt-[18px]">
            No account?{" "}<button className="link-btn" onClick={() => switchMode("signup")}>Sign up free</button>
          </p>
        </div>
      </div>

      {/* ══ SIGNUP FORM — right 55%, z-[2] ══ */}
      <div
        style={{
          position: "absolute", top: 0, bottom: 0, right: 0,
          width: "55%", zIndex: 2,
          display: "flex", alignItems: "center", justifyContent: "flex-start",
          overflowY: "auto",
          paddingLeft: "56px", paddingRight: "40px", paddingTop: "40px", paddingBottom: "40px",
          transform: isSignup ? "translateX(0)" : "translateX(100%)",
          opacity: mounted ? 1 : 0,
          transition: `transform ${DURATION} ${EASE}, opacity 0.5s ease`,
        }}
      >
        <div className="w-full max-w-[420px]">
          <div className="mb-[22px]">
            <h2 className="text-[26px] font-extrabold text-[#0F172A] tracking-[-0.6px] mb-[7px]">Create account</h2>
            <p className="text-[#4A5568] text-[13.5px] leading-[1.65]">Join MediReach and connect your pharmacy network.</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Role selector */}
            <div className="mb-4">
              <label className="field-label">I am a</label>
              <div className="grid grid-cols-2 gap-[10px]">
                {[
                  { val: "customer", label: "Customer", desc: "Order medicines" },
                  { val: "pharmacy", label: "Pharmacy", desc: "Manage & dispatch" },
                ].map(({ val, label, desc }) => {
                  const active = sRole === val;
                  return (
                    <div
                      key={val}
                      onClick={() => setSRole(val)}
                      className="rounded-[10px] px-3.5 py-[11px] flex items-center gap-[10px] cursor-pointer transition-all duration-[180ms]"
                      style={{
                        border: `2px solid ${active ? INDIGO : "#DDE3ED"}`,
                        background: active ? "#F0F4FF" : "#fff",
                        boxShadow: active ? "0 0 0 3px rgba(76,110,245,0.1)" : "none",
                      }}
                    >
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-[180ms]"
                        style={{ border: `2px solid ${active ? INDIGO : "#DDE3ED"}`, background: active ? INDIGO : "#fff" }}
                      >
                        {active && <div className="w-[5px] h-[5px] rounded-full bg-white" />}
                      </div>
                      <div>
                        <div className="text-[12.5px] font-bold" style={{ color: active ? INDIGO : "#374151" }}>{label}</div>
                        <div className="text-[10.5px] text-[#94A3B8] mt-px">{desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Base fields */}
            <div className="grid grid-cols-2 gap-[11px] mb-[11px]">
              <div>
                <label className="field-label">Full Name</label>
                <Field icon={<UserIcon />} placeholder="John Silva" value={sName} onChange={e => setSName(e.target.value)}
                  fk="sname" focused={focused} setFocused={setFocused} name="name" />
              </div>
              <div>
                <label className="field-label">Phone</label>
                <Field icon={<PhoneIcon />} type="tel" placeholder="+94 77 123 4567" value={sPhone} onChange={e => setSPhone(e.target.value)}
                  fk="sphone" focused={focused} setFocused={setFocused} name="tel" />
              </div>
            </div>

            <div className="mb-[11px]">
              <label className="field-label">Email Address</label>
              <Field icon={<MailIcon />} type="email" placeholder="you@pharmacy.com" value={sEmail} onChange={e => setSEmail(e.target.value)}
                fk="semail" focused={focused} setFocused={setFocused} name="email" />
            </div>

            {/* Pharmacy-only fields — animated reveal */}
            <div
              className="overflow-hidden transition-all duration-[320ms] ease-in-out"
              style={{
                maxHeight: sRole === "pharmacy" ? "120px" : "0px",
                opacity: sRole === "pharmacy" ? 1 : 0,
                marginBottom: sRole === "pharmacy" ? "11px" : "0px",
              }}
            >
              <div className="grid grid-cols-2 gap-[11px] pb-0.5">
                <div>
                  <label className="field-label">Pharmacy Name</label>
                  <Field icon={<BuildingIcon />} placeholder="City MedPlus" value={sPharmacy} onChange={e => setSPharmacy(e.target.value)}
                    fk="spharmacy" focused={focused} setFocused={setFocused} name="pharmacy-name" />
                </div>
                <div>
                  <label className="field-label">License Number</label>
                  <Field icon={<LicenseIcon />} placeholder="PH-2024-00123" value={sLicense} onChange={e => setSLicense(e.target.value)}
                    fk="slicense" focused={focused} setFocused={setFocused} name="license" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-[11px] mb-5">
              <div>
                <label className="field-label">Password</label>
                <Field icon={<LockIcon />} type={showPass ? "text" : "password"} placeholder="Create password"
                  value={sPass} onChange={e => setSPass(e.target.value)}
                  fk="spass" focused={focused} setFocused={setFocused} name="new-password"
                  right={eyeBtn(showPass, () => setShowPass(!showPass))} />
              </div>
              <div>
                <label className="field-label">Confirm Password</label>
                <Field icon={<LockIcon />} type={showConf ? "text" : "password"} placeholder="Repeat password"
                  value={sConf} onChange={e => setSConf(e.target.value)}
                  fk="sconf" focused={focused} setFocused={setFocused} name="confirm-password"
                  right={eyeBtn(showConf, () => setShowConf(!showConf))} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 border-none rounded-[10px] text-sm font-bold flex items-center justify-center gap-2 font-sans tracking-[0.3px] transition-all duration-200 text-white"
              style={{
                background: loading ? "#6AAF96" : "linear-gradient(135deg, #0E7C5B 0%, #12A07A 100%)",
                boxShadow: loading ? "none" : "0 4px 18px rgba(14,124,91,0.3)",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? <><Spinner /> Creating account...</> : <>Create Account <ArrowRightIcon /></>}
            </button>
          </form>

          <p className="text-center text-[11px] text-[#A0AEC0] mt-3.5 leading-[1.7]">
            By signing up you agree to our{" "}
            <a href="#" className="font-semibold no-underline" style={{ color: INDIGO }}>Terms</a>
            {" "}&amp;{" "}
            <a href="#" className="font-semibold no-underline" style={{ color: INDIGO }}>Privacy Policy</a>
          </p>

          <p className="text-center text-[12.5px] text-[#4A5568] mt-3.5">
            Already have an account?{" "}
            <button className="link-btn" onClick={() => switchMode("login")}>Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
}
