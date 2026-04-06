import { useState, useEffect, useRef } from "react";
import { authAPI } from '../utils/apiEndpoints';

// ── Icons ─────────────────────────────────────────────
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
const ShieldIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const ArrowLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
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
const KeyIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="5.5"/>
    <path d="m21 2-9.6 9.6"/>
    <path d="m15.5 7.5 3 3L22 7l-3-3"/>
  </svg>
);
const MailSendIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    <path d="M19 10l3-3-3-3"/>
  </svg>
);

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"
      style={{ animation: "spin 0.8s linear infinite" }}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  );
}

// ── Reusable input field ──────────────────────────────
function Field({ icon, type = "text", placeholder, value, onChange, fk, focused, setFocused, right, name }) {
  const isFocused = focused === fk;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "9px",
      borderRadius: "10px", padding: "0 12px",
      border: `1.5px solid ${isFocused ? "#4C6EF5" : "#DDE3ED"}`,
      background: isFocused ? "#F8FAFF" : "#F7F9FC",
      boxShadow: isFocused ? "0 0 0 3px rgba(76,110,245,0.1)" : "none",
      transition: "all 0.2s",
    }}>
      <span style={{ display: "flex", flexShrink: 0, color: isFocused ? "#4C6EF5" : "#94A3B8" }}>{icon}</span>
      <input
        type={type} placeholder={placeholder} value={value} onChange={onChange}
        onFocus={() => setFocused(fk)} onBlur={() => setFocused(null)}
        autoComplete={name} name={name}
        style={{
          flex: 1, border: "none", outline: "none", background: "transparent",
          fontSize: "13px", color: "#0F172A", padding: "11px 0",
          fontFamily: "'DM Sans','Segoe UI',sans-serif",
        }}
      />
      {right}
    </div>
  );
}

// ── OTP digit input ───────────────────────────────────
function OtpInput({ otp, setOtp, shake }) {
  const refs = useRef([]);
  const INDIGO = "#4C6EF5";

  const handleKey = (e, idx) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...otp];
      if (next[idx]) { next[idx] = ""; setOtp(next); }
      else if (idx > 0) { next[idx - 1] = ""; setOtp(next); refs.current[idx - 1]?.focus(); }
    }
  };

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = Array(6).fill("");
    pasted.split("").forEach((c, i) => (next[i] = c));
    setOtp(next);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div style={{ display: "flex", gap: "10px", justifyContent: "center", animation: shake ? "shake 0.4s ease" : "none" }}>
      {otp.map((digit, i) => (
        <input
          key={i}
          ref={el => refs.current[i] = el}
          type="text" inputMode="numeric" maxLength={1} value={digit}
          onChange={e => handleChange(e, i)}
          onKeyDown={e => handleKey(e, i)}
          onPaste={handlePaste}
          onFocus={e => e.target.select()}
          style={{
            width: "46px", height: "54px", textAlign: "center",
            fontSize: "22px", fontWeight: "700", color: "#0F172A",
            border: `2px solid ${digit ? INDIGO : "#DDE3ED"}`,
            borderRadius: "10px",
            background: digit ? "#F0F4FF" : "#F7F9FC",
            outline: "none",
            boxShadow: digit ? "0 0 0 3px rgba(76,110,245,0.1)" : "none",
            transition: "all 0.18s",
            fontFamily: "'DM Sans','Segoe UI',sans-serif",
            caretColor: INDIGO,
          }}
        />
      ))}
    </div>
  );
}

const INDIGO = "#4C6EF5";
const NAVY   = "#023E8A";
const GREEN  = "#0E7C5B";

// Steps: "email" | "otp" | "reset" | "done"
export default function ForgotPasswordPage({ onBackToLogin }) {
  const [step, setStep]       = useState("email");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  const [email, setEmail]     = useState("");
  const [emailError, setEmailError] = useState("");

  const [otp, setOtp]         = useState(Array(6).fill(""));
  const [shake, setShake]     = useState(false);
  const [otpError, setOtpError] = useState("");
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend]     = useState(false);

  const [newPass, setNewPass]   = useState("");
  const [confPass, setConfPass] = useState("");
  const [showNew, setShowNew]   = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [passError, setPassError] = useState("");

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  // Resend countdown — resets whenever we land on otp step
  useEffect(() => {
    if (step !== "otp") return;
    setResendTimer(30);
    setCanResend(false);
    const t = setInterval(() => {
      setResendTimer(v => {
        if (v <= 1) { clearInterval(t); setCanResend(true); return 0; }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [step]);

  const goTo = (next) => setStep(next);

  // ── Step 1: Send OTP ──────────────────────────────
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setEmailError("Please enter your email address."); return; }
    setEmailError("");
    setLoading(true);
    try {
      const res = await authAPI.forgotPassword(email);
      goTo("otp");
    } catch (err) {
      setEmailError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Validate OTP against backend before proceeding ──
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) { setOtpError("Please enter all 6 digits."); return; }
    setOtpError("");
    setLoading(true);
    try {
      const res = await authAPI.verifyOTP(email, code);
      goTo("reset");
    } catch (err) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setOtpError(err.response?.data?.message || "Invalid OTP. Please try again.");
      setOtp(Array(6).fill(""));
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Reset password (sends email + otp + newPassword to backend) ──
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!newPass || !confPass) { setPassError("Please fill both fields."); return; }
    if (newPass.length < 6) { setPassError("Password must be at least 6 characters."); return; }
    if (newPass !== confPass) { setPassError("Passwords do not match."); return; }
    setPassError("");
    setLoading(true);
    try {
      const res = await authAPI.resetPassword(email, otp.join(""), newPass);
      goTo("done");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Something went wrong.";
      // If OTP was wrong/expired, go back to OTP step
      if (errorMessage && errorMessage.toLowerCase().includes("otp")) {
        setPassError("");
        setOtp(Array(6).fill(""));
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setOtpError(errorMessage);
        goTo("otp");
      } else {
        setPassError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────
  const handleResend = async () => {
    if (!canResend) return;
    setOtp(Array(6).fill(""));
    setOtpError("");
    try {
      await authAPI.forgotPassword(email);
    } catch { /* silent */ }
    // Timer resets via the useEffect on step "otp" — trigger it by resetting timer manually
    setResendTimer(30);
    setCanResend(false);
    const t = setInterval(() => {
      setResendTimer(v => {
        if (v <= 1) { clearInterval(t); setCanResend(true); return 0; }
        return v - 1;
      });
    }, 1000);
  };

  const eyeBtn = (show, toggle) => (
    <button type="button" onClick={toggle}
      style={{ display:"flex", alignItems:"center", background:"transparent", border:"none", cursor:"pointer", color:"#94A3B8", padding:"2px" }}>
      <EyeIcon open={show} />
    </button>
  );

  // Password strength
  const strength = (() => {
    if (!newPass) return 0;
    let s = 0;
    if (newPass.length >= 8) s++;
    if (/[A-Z]/.test(newPass)) s++;
    if (/[0-9]/.test(newPass)) s++;
    if (/[^A-Za-z0-9]/.test(newPass)) s++;
    return s;
  })();
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#EF4444", "#F59E0B", "#3B82F6", GREEN][strength];

  // ── Panel content per step ───────────────────────
  const panelContent = {
    email: {
      icon: <MailSendIcon />,
      tag: "Account Recovery",
      title: <>Forgot your<br /><span style={{ color: INDIGO }}>password?</span></>,
      body: "No worries — enter your registered email and we'll send a secure one-time code to reset it.",
    },
    otp: {
      icon: <KeyIcon />,
      tag: "Verification",
      title: <>Check your<br /><span style={{ color: INDIGO }}>inbox</span></>,
      body: `We sent a 6-digit code to ${email || "your email"}. Enter it to verify your identity.`,
    },
    reset: {
      icon: <LockIcon />,
      tag: "New Password",
      title: <>Set a new<br /><span style={{ color: INDIGO }}>password</span></>,
      body: "Choose a strong password with at least 6 characters, a number, and a symbol.",
    },
    done: {
      icon: <CheckIcon />,
      tag: "Success",
      title: <>Password<br /><span style={{ color: "#12A07A" }}>reset!</span></>,
      body: "Your password has been updated. You can now sign in with your new credentials.",
    },
  };
  const panel = panelContent[step];
  const steps = ["email", "otp", "reset", "done"];
  const currentIdx = steps.indexOf(step);

  const DURATION = "0.38s";
  const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

  return (
    <div style={{
      position: "relative", height: "100vh", width: "100%",
      display: "flex", overflow: "hidden",
      fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#F7F9FC",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-8px); }
          40%      { transform: translateX(8px); }
          60%      { transform: translateX(-5px); }
          80%      { transform: translateX(5px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        input::placeholder { color: #A0AEC0; }
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>

      {/* ── Ambient background ── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position:"absolute", top:"-100px", left:"-80px", width:"480px", height:"480px", borderRadius:"50%",
          background:"radial-gradient(circle, rgba(76,110,245,0.055) 0%, transparent 70%)" }} />
        <div style={{ position:"absolute", bottom:"-80px", left:"25%", width:"360px", height:"360px", borderRadius:"50%",
          background:"radial-gradient(circle, rgba(14,124,91,0.04) 0%, transparent 70%)" }} />
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.22 }}>
          <defs>
            <pattern id="fp-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.2" fill="#DDE3ED" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#fp-dots)" />
        </svg>
      </div>

      {/* ══ NAVY PANEL — left 45% ══ */}
      <div style={{
        position: "absolute", top: 0, bottom: 0, left: 0,
        width: "45%", zIndex: 1, overflow: "hidden",
        background: "linear-gradient(145deg, #011f54 0%, #023E8A 50%, #034fa6 100%)",
      }}>
        {/* Grid overlay */}
        <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
          <svg width="100%" height="100%" style={{ opacity: 0.05 }}>
            <defs>
              <pattern id="fp-pgrid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M60 0L0 0 0 60" fill="none" stroke="white" strokeWidth="0.8"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#fp-pgrid)" />
          </svg>
        </div>
        <div style={{ position:"absolute", top:"-50px", right:"-50px", width:"240px", height:"240px", borderRadius:"50%", pointerEvents:"none",
          background:"radial-gradient(circle, rgba(76,110,245,0.22) 0%, transparent 70%)" }} />
        <div style={{ position:"absolute", bottom:"60px", left:"-30px", width:"180px", height:"180px", borderRadius:"50%", pointerEvents:"none",
          background:"radial-gradient(circle, rgba(14,124,91,0.16) 0%, transparent 70%)" }} />

        <div style={{ position:"absolute", inset:0, padding:"48px", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
          <div>
            {/* Logo */}
            <div style={{ display:"flex", alignItems:"center", gap:"11px", marginBottom:"52px" }}>
              <img 
                    src="/logo.png" 
                    alt="MediReach Logo" 
                    width={40} 
                    height={40}
                    className="rounded-[10px]"
                />
              <span style={{ color:"white", fontSize:"19px", fontWeight:700, letterSpacing:"-0.3px" }}>MediReach</span>
            </div>

            <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"10.5px", fontWeight:700, letterSpacing:"3px", textTransform:"uppercase", marginBottom:"16px" }}>
              {panel.tag}
            </p>

            {/* Icon badge */}
            <div key={`icon-${step}`} style={{
              width:"64px", height:"64px", borderRadius:"16px", marginBottom:"20px",
              display:"flex", alignItems:"center", justifyContent:"center",
              background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.14)",
              color:"white", animation:"fadeUp 0.45s ease",
            }}>
              {panel.icon}
            </div>

            <h2 key={`title-${step}`} style={{
              color:"white", fontSize:"30px", fontWeight:800,
              lineHeight:1.22, letterSpacing:"-0.7px", marginBottom:"16px",
              animation:"fadeUp 0.45s ease 0.07s both",
            }}>
              {panel.title}
            </h2>
            <div style={{ width:"40px", height:"3px", borderRadius:"2px", marginBottom:"20px",
              background:`linear-gradient(90deg, ${INDIGO}, transparent)` }} />
            <p key={`body-${step}`} style={{
              color:"rgba(255,255,255,0.46)", fontSize:"13px", lineHeight:1.75,
              maxWidth:"280px", animation:"fadeUp 0.45s ease 0.14s both",
            }}>
              {panel.body}
            </p>

            {/* Step progress dots */}
            <div style={{ display:"flex", alignItems:"center", gap:"8px", marginTop:"36px" }}>
              {steps.map((s) => {
                const isActive = s === step;
                const isDone = steps.indexOf(s) < currentIdx;
                return (
                  <div key={s} style={{
                    height:"4px",
                    width: isActive ? "28px" : "14px",
                    borderRadius:"4px",
                    background: isDone ? "rgba(255,255,255,0.5)" : isActive ? INDIGO : "rgba(255,255,255,0.15)",
                    transition:"all 0.35s ease",
                  }} />
                );
              })}
              <span style={{ color:"rgba(255,255,255,0.3)", fontSize:"11px", marginLeft:"4px" }}>
                {currentIdx + 1} / 4
              </span>
            </div>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:"6px", color:"rgba(255,255,255,0.24)", fontSize:"10.5px" }}>
            <ShieldIcon /><span>256-bit encrypted · HIPAA compliant · ISO 27001</span>
          </div>
        </div>
      </div>

      {/* ══ RIGHT PANEL — form ══ */}
      <div style={{
        position:"absolute", top:0, bottom:0, right:0,
        width:"55%", zIndex:2,
        display:"flex", alignItems:"center", justifyContent:"flex-start",
        paddingLeft:"56px", paddingRight:"40px", paddingTop:"40px", paddingBottom:"40px",
        opacity: mounted ? 1 : 0,
        transition:`opacity 0.5s ease`,
        overflowY:"auto",
      }}>
        <div style={{ width:"100%", maxWidth:"380px" }}>

          {/* ── STEP: Email ── */}
          {step === "email" && (
            <div key="email" style={{ animation:"fadeUp 0.4s ease" }}>
              <div style={{ marginBottom:"28px" }}>
                <h2 style={{ fontSize:"26px", fontWeight:800, color:"#0F172A", letterSpacing:"-0.6px", marginBottom:"7px" }}>
                  Reset your password
                </h2>
                <p style={{ color:"#4A5568", fontSize:"13.5px", lineHeight:1.65 }}>
                  Enter your registered email and we'll send you a verification code.
                </p>
              </div>

              <form onSubmit={handleEmailSubmit}>
                <div style={{ marginBottom:"20px" }}>
                  <label style={{ display:"block", fontSize:"11.5px", fontWeight:600, color:"#374151", marginBottom:"6px", letterSpacing:"0.2px" }}>
                    Email Address
                  </label>
                  <Field icon={<MailIcon />} type="email" placeholder="admin@pharmacy.com"
                    value={email} onChange={e => { setEmail(e.target.value); setEmailError(""); }}
                    fk="email" focused={focused} setFocused={setFocused} name="email" />
                  {emailError && (
                    <p style={{ fontSize:"12px", color:"#EF4444", marginTop:"6px", animation:"fadeUp 0.3s ease" }}>
                      {emailError}
                    </p>
                  )}
                </div>

                <button type="submit" disabled={loading || !email}
                  style={{
                    width:"100%", padding:"12px 0", border:"none", borderRadius:"10px",
                    fontSize:"14px", fontWeight:700, letterSpacing:"0.3px",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
                    fontFamily:"'DM Sans','Segoe UI',sans-serif", color:"white",
                    background: (loading || !email) ? "#7B96D8" : `linear-gradient(135deg, ${NAVY} 0%, ${INDIGO} 100%)`,
                    boxShadow: (loading || !email) ? "none" : "0 4px 18px rgba(2,62,138,0.3)",
                    cursor: (loading || !email) ? "not-allowed" : "pointer", transition:"all 0.2s",
                  }}>
                  {loading ? <><Spinner /> Sending code...</> : <>Send Verification Code <ArrowRightIcon /></>}
                </button>
              </form>

              <p style={{ textAlign:"center", fontSize:"12.5px", color:"#4A5568", marginTop:"20px" }}>
                Remember it?{" "}
                <button onClick={onBackToLogin}
                  style={{ background:"none", border:"none", color:INDIGO, fontWeight:600, cursor:"pointer", fontSize:"12.5px", padding:0, fontFamily:"inherit" }}>
                  Back to Sign In
                </button>
              </p>
            </div>
          )}

          {/* ── STEP: OTP ── */}
          {step === "otp" && (
            <div key="otp" style={{ animation:"fadeUp 0.4s ease" }}>
              <div style={{ marginBottom:"28px" }}>
                <button onClick={() => goTo("email")}
                  style={{ display:"flex", alignItems:"center", gap:"6px", background:"none", border:"none",
                    color:"#94A3B8", cursor:"pointer", fontSize:"12.5px", fontWeight:600,
                    padding:0, marginBottom:"20px", fontFamily:"inherit", transition:"color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.color = INDIGO}
                  onMouseLeave={e => e.currentTarget.style.color = "#94A3B8"}>
                  <ArrowLeftIcon /> Back
                </button>
                <h2 style={{ fontSize:"26px", fontWeight:800, color:"#0F172A", letterSpacing:"-0.6px", marginBottom:"7px" }}>
                  Enter the code
                </h2>
                <p style={{ color:"#4A5568", fontSize:"13.5px", lineHeight:1.65 }}>
                  We sent a 6-digit code to <strong style={{ color:"#0F172A" }}>{email}</strong>
                </p>
              </div>

              <form onSubmit={handleOtpSubmit}>
                <div style={{ marginBottom:"8px" }}>
                  <OtpInput otp={otp} setOtp={setOtp} shake={shake} />
                </div>

                {otpError ? (
                  <p style={{ textAlign:"center", fontSize:"12px", color:"#EF4444", margin:"8px 0 12px", animation:"fadeUp 0.3s ease" }}>
                    {otpError}
                  </p>
                ) : <div style={{ height:"28px" }} />}

                <button type="submit" disabled={otp.join("").length < 6 || loading}
                  style={{
                    width:"100%", padding:"12px 0", border:"none", borderRadius:"10px",
                    fontSize:"14px", fontWeight:700, letterSpacing:"0.3px",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
                    fontFamily:"'DM Sans','Segoe UI',sans-serif", color:"white",
                    background: (otp.join("").length < 6 || loading) ? "#7B96D8" : `linear-gradient(135deg, ${NAVY} 0%, ${INDIGO} 100%)`,
                    boxShadow: (otp.join("").length < 6 || loading) ? "none" : "0 4px 18px rgba(2,62,138,0.3)",
                    cursor: (otp.join("").length < 6 || loading) ? "not-allowed" : "pointer", transition:"all 0.2s",
                  }}>
                  {loading ? <><Spinner /> Verifying...</> : <>Verify &amp; Continue <ArrowRightIcon /></>}
                </button>
              </form>

              <p style={{ textAlign:"center", fontSize:"12.5px", color:"#4A5568", marginTop:"20px" }}>
                Didn't receive it?{" "}
                <button onClick={handleResend} disabled={!canResend}
                  style={{ background:"none", border:"none", fontWeight:600, fontSize:"12.5px", padding:0,
                    fontFamily:"inherit", transition:"color 0.2s", cursor: canResend ? "pointer" : "default",
                    color: canResend ? INDIGO : "#A0AEC0" }}>
                  {canResend ? "Resend code" : `Resend in ${resendTimer}s`}
                </button>
              </p>
            </div>
          )}

          {/* ── STEP: Reset Password ── */}
          {step === "reset" && (
            <div key="reset" style={{ animation:"fadeUp 0.4s ease" }}>
              <div style={{ marginBottom:"28px" }}>
                <h2 style={{ fontSize:"26px", fontWeight:800, color:"#0F172A", letterSpacing:"-0.6px", marginBottom:"7px" }}>
                  Create new password
                </h2>
                <p style={{ color:"#4A5568", fontSize:"13.5px", lineHeight:1.65 }}>
                  Choose something strong that you haven't used before.
                </p>
              </div>

              <form onSubmit={handleResetSubmit}>
                <div style={{ marginBottom:"13px" }}>
                  <label style={{ display:"block", fontSize:"11.5px", fontWeight:600, color:"#374151", marginBottom:"6px", letterSpacing:"0.2px" }}>
                    New Password
                  </label>
                  <Field icon={<LockIcon />} type={showNew ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={newPass} onChange={e => { setNewPass(e.target.value); setPassError(""); }}
                    fk="newpass" focused={focused} setFocused={setFocused} name="new-password"
                    right={eyeBtn(showNew, () => setShowNew(!showNew))} />
                  {newPass && (
                    <div style={{ marginTop:"8px" }}>
                      <div style={{ display:"flex", gap:"4px", marginBottom:"5px" }}>
                        {[1,2,3,4].map(i => (
                          <div key={i} style={{
                            flex:1, height:"3px", borderRadius:"4px",
                            background: i <= strength ? strengthColor : "#E2E8F0",
                            transition:"background 0.25s",
                          }} />
                        ))}
                      </div>
                      <span style={{ fontSize:"11px", fontWeight:600, color: strengthColor }}>{strengthLabel}</span>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom:"20px" }}>
                  <label style={{ display:"block", fontSize:"11.5px", fontWeight:600, color:"#374151", marginBottom:"6px", letterSpacing:"0.2px" }}>
                    Confirm Password
                  </label>
                  <Field icon={<LockIcon />} type={showConf ? "text" : "password"}
                    placeholder="Repeat your password"
                    value={confPass} onChange={e => { setConfPass(e.target.value); setPassError(""); }}
                    fk="confpass" focused={focused} setFocused={setFocused} name="confirm-password"
                    right={eyeBtn(showConf, () => setShowConf(!showConf))} />
                </div>

                {passError && (
                  <p style={{ fontSize:"12px", color:"#EF4444", marginBottom:"14px", animation:"fadeUp 0.3s ease" }}>
                    {passError}
                  </p>
                )}

                <button type="submit" disabled={loading}
                  style={{
                    width:"100%", padding:"12px 0", border:"none", borderRadius:"10px",
                    fontSize:"14px", fontWeight:700, letterSpacing:"0.3px",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
                    fontFamily:"'DM Sans','Segoe UI',sans-serif", color:"white",
                    background: loading ? "#6AAF96" : `linear-gradient(135deg, ${GREEN} 0%, #12A07A 100%)`,
                    boxShadow: loading ? "none" : "0 4px 18px rgba(14,124,91,0.3)",
                    cursor: loading ? "not-allowed" : "pointer", transition:"all 0.2s",
                  }}>
                  {loading ? <><Spinner /> Updating...</> : <>Reset Password <ArrowRightIcon /></>}
                </button>
              </form>
            </div>
          )}

          {/* ── STEP: Done ── */}
          {step === "done" && (
            <div key="done" style={{ animation:"fadeUp 0.4s ease", textAlign:"center" }}>
              <div style={{
                width:"72px", height:"72px", borderRadius:"20px", margin:"0 auto 24px",
                display:"flex", alignItems:"center", justifyContent:"center",
                background:`linear-gradient(135deg, ${GREEN} 0%, #12A07A 100%)`,
                boxShadow:"0 8px 28px rgba(14,124,91,0.32)", color:"white",
              }}>
                <CheckIcon />
              </div>
              <h2 style={{ fontSize:"26px", fontWeight:800, color:"#0F172A", letterSpacing:"-0.6px", marginBottom:"10px" }}>
                All done!
              </h2>
              <p style={{ color:"#4A5568", fontSize:"13.5px", lineHeight:1.7, maxWidth:"300px", margin:"0 auto 32px" }}>
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
              <button onClick={onBackToLogin}
                style={{
                  width:"100%", padding:"12px 0", border:"none", borderRadius:"10px",
                  fontSize:"14px", fontWeight:700, letterSpacing:"0.3px",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
                  fontFamily:"'DM Sans','Segoe UI',sans-serif", color:"white",
                  background:`linear-gradient(135deg, ${NAVY} 0%, ${INDIGO} 100%)`,
                  boxShadow:"0 4px 18px rgba(2,62,138,0.3)", cursor:"pointer", transition:"all 0.2s",
                }}>
                Back to Sign In <ArrowRightIcon />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
