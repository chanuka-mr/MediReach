import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

const C = {
  success: "#0E7C5B", lilacAsh: "#4C6EF5",
  danger: "#C0392B", techBlue: "#023E8A",
  techBlueDark: "#012d65", leafGreen: "#5ab348",
};

const NAV_LINKS = ["Home", "Services", "Doctors", "About", "Contact"];

const SERVICES = [
  { icon: "🩺", title: "Primary Care",   desc: "Comprehensive assessments and preventive care from board-certified physicians with personalised treatment plans across 40+ specialties.", tag: "Foundation" },
  { icon: "🧬", title: "Diagnostics",    desc: "ISO-certified lab testing and imaging delivering precision results in under 4 hours — from blood panels to advanced genomic screening.", tag: "Precision" },
  { icon: "💊", title: "Pharmacy",       desc: "Same-day home delivery and medication management reviewed by clinical pharmacists optimising regimens for 200+ chronic conditions.", tag: "Integrated" },
  { icon: "🧠", title: "Mental Health",  desc: "Confidential counselling and psychiatric support in 12 languages. Evidence-based CBT, EMDR, and mindfulness with same-week access.", tag: "Holistic" },
  { icon: "🫀", title: "Cardiology",     desc: "Remote ECG monitoring, cardiac screening, and post-surgical follow-up integrated directly into your health record by world-class cardiologists.", tag: "Specialised" },
  { icon: "🏥", title: "Telemedicine",   desc: "24/7 virtual consultations worldwide. Board-certified physicians respond in under 15 minutes — 98% of conditions resolved remotely.", tag: "Always-on" },
];

const STATS = [
  { value: "50K+", label: "Patients Served",     sub: "28 countries" },
  { value: "200+", label: "Specialist Doctors",  sub: "Board-certified" },
  { value: "15+",  label: "Years of Excellence", sub: "Est. 2009" },
  { value: "98%",  label: "Satisfaction Rate",   sub: "Verified reviews" },
];

const TESTIMONIALS = [
  { name: "Sarah Mitchell", role: "Patient since 2021", avatar: "SM", condition: "Cardiac Care",
    text: "MediReach transformed how I manage my health. Cardiology results reviewed within 3 hours of uploading. Truly exceptional.", rating: 5 },
  { name: "James Okonkwo",  role: "Patient since 2020", avatar: "JO", condition: "Diabetes Management",
    text: "Specialist consultation booked and confirmed within hours. Managing my diabetes remotely has genuinely changed my quality of life.", rating: 5 },
  { name: "Priya Nair",     role: "Patient since 2022", avatar: "PN", condition: "Mental Wellness",
    text: "From diagnostics to follow-ups, everything is seamless. The mental health team — compassionate, professional, always available.", rating: 5 },
];

const SOCIAL_LINKS = [
  { name: "Email", href: "mailto:hello@medireach.com",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg> },
  { name: "Facebook", href: "#",
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> },
  { name: "Instagram", href: "#",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg> },
  { name: "YouTube", href: "#",
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75,15.02 15.5,12 9.75,8.98 9.75,15.02" fill="white"/></svg> },
  { name: "Twitter / X", href: "#",
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
  { name: "LinkedIn", href: "#",
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg> },
];

function MediReachLogo({ size = 44 }) {
  return (
    <img 
      src="/logo.png" 
      alt="MediReach Logo" 
      width={size} 
      height={size}
      style={{ borderRadius: '8px' }}
    />
  );
}

function useReveal() {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) setOn(true); }, { threshold: 0.1 });
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, []);
  return [ref, on];
}

function Reveal({ children, delay = 0, style = {} }) {
  const [ref, on] = useReveal();
  return (
    <div ref={ref} style={{ opacity: on ? 1 : 0, transform: on ? "translateY(0)" : "translateY(32px)", transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

const DOCTORS = [
  { init:"AK", name:"Dr. Amara Kwesi",   spec:"Cardiology",    exp:"18 yrs", rating:"4.97", bg:"rgba(14,124,91,0.15)",  cl:"#0E7C5B" },
  { init:"SR", name:"Dr. Sofia Reyes",   spec:"Neurology",     exp:"14 yrs", rating:"4.95", bg:"rgba(59,130,246,0.15)", cl:"#3B82F6" },
  { init:"MN", name:"Dr. Marcus Ndiaye", spec:"Oncology",      exp:"22 yrs", rating:"4.98", bg:"rgba(139,92,246,0.15)", cl:"#8B5CF6" },
  { init:"LC", name:"Dr. Lena Cho",      spec:"Mental Health", exp:"11 yrs", rating:"4.96", bg:"rgba(245,158,11,0.15)", cl:"#D97706" },
];

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const HOST_URL = window.location.origin;

export default function PreHome() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeNav, setActiveNav] = useState("Home");
  const [ticker, setTicker] = useState(0);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrPharmacies, setQrPharmacies] = useState([]);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState("");
  const [selectedQRPharmacy, setSelectedQRPharmacy] = useState(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTicker(p => p + 1), 3000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!showQRModal) return undefined;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onEsc = (event) => {
      if (event.key === 'Escape') {
        setShowQRModal(false);
      }
    };
    window.addEventListener('keydown', onEsc);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener('keydown', onEsc);
    };
  }, [showQRModal]);

  const openQRModal = async () => {
    setShowQRModal(true);
    if (qrPharmacies.length > 0) return;

    setQrLoading(true);
    setQrError('');
    try {
      const response = await fetch(`${API_URL}/pharmacies`);
      const data = await response.json();
      const pharmacies = data?.data?.pharmacies || data?.pharmacies || [];
      if (!Array.isArray(pharmacies) || pharmacies.length === 0) {
        setQrError('No pharmacy records are available right now.');
        return;
      }
      setQrPharmacies(pharmacies);
      setSelectedQRPharmacy(pharmacies[0]);
    } catch (error) {
      setQrError('Unable to load pharmacy QR data at the moment.');
    } finally {
      setQrLoading(false);
    }
  };

  const liveStats = [
    `${(50241 + ticker * 3).toLocaleString()} patients served globally`,
    `${200 + (ticker % 3)} specialists available now`,
    `Average response: ${14 - (ticker % 4)} minutes`,
    `98.2% satisfaction this month`,
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{
          --ink:#04111f; --mist:#f0f4f8; --fog:#e4eaf2;
          --techBlue:#023E8A; --techDk:#012d65; --techLt:#034fa8;
          --green:#0E7C5B; --greenLt:#12a077; --leaf:#5ab348;
          --snow:#ffffff; --border:rgba(2,62,138,.1);
          --serif:'Cormorant Garamond',Georgia,serif;
          --sans:'Plus Jakarta Sans',sans-serif;
          --mono:'JetBrains Mono',monospace;
          --r:16px; --rLg:22px;
        }
        html{scroll-behavior:smooth;}
        body{font-family:var(--sans);background:var(--snow);color:var(--ink);overflow-x:hidden;}

        /* ── TICKER ── */
        .tk-bar{background:var(--ink);padding:8px 0;overflow:hidden;}
        .tk-inner{display:flex;animation:tkScroll 20s linear infinite;white-space:nowrap;}
        .tk-item{display:inline-flex;align-items:center;gap:8px;padding:0 44px;font-family:var(--mono);font-size:.63rem;color:rgba(255,255,255,.42);letter-spacing:.5px;flex-shrink:0;}
        .tk-dot{width:5px;height:5px;border-radius:50%;background:var(--leaf);flex-shrink:0;animation:pip 2s infinite;}
        @keyframes tkScroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes pip{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes blink{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.5)}}

        /* ── HEADER ── */
        .hdr{position:fixed;top:33px;left:0;right:0;z-index:200;padding:0 2rem;transition:top .3s,background .3s,box-shadow .3s;}
        .hdr.scrolled{top:0;background:rgba(1,22,54,.97);backdrop-filter:blur(22px);box-shadow:0 1px 0 rgba(255,255,255,.06);}
        .hdr:not(.scrolled){background:rgba(1,29,75,.6);backdrop-filter:blur(12px);}
        .hdr-i{max-width:1280px;margin:0 auto;display:flex;align-items:center;height:68px;gap:24px;}
        .logo-w{display:flex;align-items:center;gap:10px;text-decoration:none;flex-shrink:0;}
        .logo-txt{display:flex;flex-direction:column;}
        .logo-nm{font-family:var(--sans);font-weight:800;font-size:1.18rem;color:#fff;letter-spacing:-.2px;line-height:1;}
        .logo-nm b{color:var(--leaf);}
        .logo-sub{font-size:.55rem;color:rgba(255,255,255,.3);letter-spacing:.6px;margin-top:3px;font-family:var(--mono);text-transform:uppercase;}
        nav{display:flex;align-items:center;gap:2px;flex:1;justify-content:center;}
        .nb{padding:7px 15px;background:none;border:none;color:rgba(255,255,255,.55);font-family:var(--sans);font-size:.8rem;font-weight:600;cursor:pointer;transition:color .2s,background .2s;letter-spacing:.2px;border-radius:8px;}
        .nb:hover{color:#fff;background:rgba(255,255,255,.07);}
        .nb.act{color:var(--leaf);}
        .hdr-auth{display:flex;align-items:center;gap:9px;flex-shrink:0;}
        .btn-login{padding:8px 20px;border-radius:9px;background:transparent;border:1.5px solid rgba(255,255,255,.22);color:rgba(255,255,255,.8);font-family:var(--sans);font-size:.8rem;font-weight:600;cursor:pointer;transition:all .2s;}
        .btn-login:hover{border-color:rgba(255,255,255,.5);color:#fff;background:rgba(255,255,255,.06);}
        .btn-signup{padding:8px 22px;border-radius:9px;background:var(--green);border:none;color:#fff;font-family:var(--sans);font-size:.8rem;font-weight:700;cursor:pointer;transition:all .2s;box-shadow:0 4px 16px rgba(14,124,91,.35);}
        .btn-signup:hover{background:var(--greenLt);transform:translateY(-1px);box-shadow:0 6px 22px rgba(14,124,91,.45);}
        .burger{display:none;flex-direction:column;gap:5px;cursor:pointer;background:none;border:none;padding:4px;}
        .burger span{display:block;width:24px;height:2px;background:#fff;border-radius:2px;transition:all .3s;}
        .mob-m{position:fixed;top:0;left:0;right:0;bottom:0;background:var(--techDk);padding:90px 2rem 2rem;z-index:199;transform:translateX(100%);transition:transform .35s cubic-bezier(.4,0,.2,1);}
        .mob-m.open{transform:translateX(0);}
        .mob-nav{display:flex;flex-direction:column;gap:2px;margin-bottom:24px;}
        .mob-auth{display:flex;gap:10px;}
        .mob-auth .btn-login,.mob-auth .btn-signup{flex:1;text-align:center;padding:12px;}

        /* ── HERO ── */
        .hero{min-height:100vh;background:var(--techDk);position:relative;overflow:hidden;display:flex;align-items:center;padding-top:101px;}
        .hero-grid{position:absolute;inset:0;opacity:.04;background-image:linear-gradient(rgba(255,255,255,.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.8) 1px,transparent 1px);background-size:64px 64px;}
        .hero-glow{position:absolute;top:-200px;right:-200px;width:900px;height:900px;border-radius:50%;background:radial-gradient(circle,rgba(90,179,72,.12) 0%,transparent 65%);pointer-events:none;}
        .hero-glow2{position:absolute;bottom:-300px;left:-200px;width:700px;height:700px;border-radius:50%;background:radial-gradient(circle,rgba(2,62,138,.5) 0%,transparent 65%);pointer-events:none;}
        .hero-diag{position:absolute;right:0;top:0;bottom:0;width:42%;background:rgba(255,255,255,.018);clip-path:polygon(12% 0,100% 0,100% 100%,0% 100%);border-left:1px solid rgba(255,255,255,.05);}
        .hero-i{max-width:1280px;margin:0 auto;padding:70px 2rem 100px;position:relative;z-index:1;width:100%;display:grid;grid-template-columns:1fr 420px;gap:60px;align-items:center;}
        .eyebrow{font-family:var(--mono);font-size:.65rem;color:var(--leaf);letter-spacing:2.5px;text-transform:uppercase;margin-bottom:20px;display:flex;align-items:center;gap:10px;animation:fadeUp .8s ease both;}
        .eyebrow::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,rgba(90,179,72,.4),transparent);}
        .hero-h{font-family:var(--serif);font-size:clamp(2.8rem,5vw,4.4rem);font-weight:700;color:#fff;line-height:1.05;letter-spacing:-1px;margin-bottom:22px;animation:fadeUp .85s ease .1s both;}
        .hero-h em{font-style:italic;color:#8be07a;}
        .hero-desc{font-size:.9rem;color:rgba(255,255,255,.52);line-height:1.85;max-width:480px;margin-bottom:32px;animation:fadeUp .85s ease .22s both;}
        .hero-trust{display:flex;align-items:center;gap:14px;margin-top:28px;animation:fadeUp .85s ease .36s both;}
        .avs{display:flex;}
        .av{width:32px;height:32px;border-radius:50%;border:2px solid var(--techDk);margin-left:-8px;background:linear-gradient(135deg,var(--green),var(--techLt));display:flex;align-items:center;justify-content:center;font-size:.56rem;font-weight:700;color:#fff;font-family:var(--sans);}
        .av:first-child{margin-left:0;}
        .trust-txt{font-size:.76rem;color:rgba(255,255,255,.45);line-height:1.4;}
        .trust-txt strong{color:#8be07a;}
        .hero-facts{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.07);border-radius:var(--rLg);overflow:hidden;margin-top:30px;animation:fadeUp .85s ease .48s both;}
        .hf{padding:16px 18px;background:rgba(255,255,255,.03);transition:background .2s;}
        .hf:hover{background:rgba(255,255,255,.07);}
        .hf-v{font-family:var(--serif);font-size:1.8rem;font-weight:700;color:#fff;line-height:1;}
        .hf-v em{font-style:normal;color:var(--leaf);}
        .hf-l{font-family:var(--mono);font-size:.6rem;color:rgba(255,255,255,.32);letter-spacing:.8px;margin-top:4px;text-transform:uppercase;}
        .hero-right{animation:fadeRight .9s ease .2s both;}
        .hero-quick-qr{margin-bottom:14px;padding:16px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.11);border-radius:16px;box-shadow:0 14px 36px rgba(1,12,35,.35);}
        .quick-qr-title{font-size:.84rem;color:rgba(255,255,255,.78);line-height:1.6;margin-bottom:12px;font-weight:600;}
        .quick-qr-btn{width:100%;padding:11px 14px;border-radius:10px;border:1px solid rgba(90,179,72,.45);background:linear-gradient(135deg,rgba(14,124,91,.95),rgba(18,160,119,.95));color:#fff;font-family:var(--sans);font-size:.78rem;font-weight:700;cursor:pointer;transition:all .2s;letter-spacing:.2px;}
        .quick-qr-btn:hover{transform:translateY(-1px);box-shadow:0 8px 22px rgba(14,124,91,.35);}
        .status-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);border-radius:var(--rLg);overflow:hidden;backdrop-filter:blur(10px);}
        .sc-head{padding:14px 18px;border-bottom:1px solid rgba(255,255,255,.07);display:flex;align-items:center;justify-content:space-between;}
        .sc-title{font-family:var(--mono);font-size:.62rem;color:rgba(255,255,255,.35);letter-spacing:1.5px;text-transform:uppercase;}
        .live-badge{display:flex;align-items:center;gap:5px;font-family:var(--mono);font-size:.6rem;color:#8be07a;}
        .live-dot{width:6px;height:6px;border-radius:50%;background:#8be07a;animation:pip 1.5s infinite;}
        .sc-body{padding:10px;}
        .doc-row{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:10px;margin-bottom:3px;transition:background .2s;}
        .doc-row:hover{background:rgba(255,255,255,.05);}
        .d-av{width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.74rem;flex-shrink:0;font-family:var(--sans);}
        .d-nm{font-size:.82rem;font-weight:600;color:#fff;font-family:var(--sans);}
        .d-sp{font-size:.65rem;color:rgba(255,255,255,.35);margin-top:1px;font-family:var(--mono);}
        .d-rt{font-family:var(--serif);font-size:1.05rem;font-weight:700;color:#f5c842;}
        .d-exp{font-size:.6rem;color:rgba(255,255,255,.28);font-family:var(--mono);}
        .sc-foot{padding:10px 18px;border-top:1px solid rgba(255,255,255,.07);background:rgba(14,124,91,.06);font-family:var(--mono);font-size:.62rem;color:rgba(255,255,255,.32);text-align:center;letter-spacing:.3px;}
        .sc-foot span{color:#8be07a;}
        .hero-ticker{position:absolute;bottom:0;left:0;right:0;border-top:1px solid rgba(255,255,255,.06);background:rgba(0,0,0,.28);overflow:hidden;z-index:2;}
        .hero-ticker-inner{display:flex;animation:tkScroll 22s linear infinite;white-space:nowrap;}
        .hero-tick-item{display:inline-flex;align-items:center;gap:8px;padding:9px 44px;font-family:var(--mono);font-size:.63rem;color:rgba(255,255,255,.36);letter-spacing:.5px;flex-shrink:0;}

        .qr-modal{position:fixed;inset:0;z-index:260;display:flex;align-items:center;justify-content:center;padding:20px;}
        .qr-modal-backdrop{position:absolute;inset:0;background:rgba(2,14,33,.76);backdrop-filter:blur(6px);}
        .qr-modal-panel{position:relative;z-index:1;width:min(920px,100%);max-height:90vh;overflow:auto;border-radius:24px;border:1px solid rgba(255,255,255,.12);background:linear-gradient(155deg,#02295f,#01316f 44%,#012555);box-shadow:0 35px 80px rgba(1,12,35,.55);padding:22px;}
        .qr-modal-close{position:absolute;top:16px;right:16px;width:36px;height:36px;border-radius:50%;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08);color:#fff;font-size:1.2rem;cursor:pointer;}
        .qr-modal-head{padding-right:50px;margin-bottom:16px;}
        .qr-modal-kicker{font-family:var(--mono);font-size:.62rem;letter-spacing:1.7px;color:#8be07a;text-transform:uppercase;}
        .qr-modal-title{font-family:var(--serif);font-size:2rem;color:#fff;line-height:1.1;margin-top:8px;}
        .qr-modal-sub{font-size:.83rem;line-height:1.7;color:rgba(255,255,255,.6);margin-top:10px;}
        .qr-modal-grid{display:grid;grid-template-columns:280px 1fr;gap:16px;}
        .qr-list{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:8px;max-height:420px;overflow:auto;}
        .qr-list-btn{width:100%;text-align:left;background:transparent;border:1px solid transparent;color:#fff;padding:10px 12px;border-radius:12px;cursor:pointer;transition:all .2s;margin-bottom:6px;}
        .qr-list-btn:last-child{margin-bottom:0;}
        .qr-list-btn:hover{background:rgba(255,255,255,.08);}
        .qr-list-btn.active{border-color:rgba(139,224,122,.45);background:rgba(90,179,72,.18);}
        .qr-list-name{font-size:.8rem;font-weight:700;line-height:1.35;}
        .qr-list-district{font-family:var(--mono);font-size:.63rem;letter-spacing:.6px;color:rgba(255,255,255,.5);text-transform:uppercase;margin-top:3px;}
        .qr-card{background:#fff;border-radius:18px;padding:22px;min-height:420px;display:flex;flex-direction:column;align-items:center;justify-content:center;}
        .qr-code-wrap{padding:14px;border-radius:18px;background:#fff;border:1px solid #dce6f5;box-shadow:0 12px 30px rgba(2,62,138,.14);}
        .qr-empty{color:#0b2e66;font-size:.84rem;text-align:center;line-height:1.7;max-width:290px;}
        .qr-selected-name{font-family:var(--serif);font-size:1.55rem;color:#062f66;margin-top:14px;line-height:1.2;text-align:center;}
        .qr-selected-district{font-family:var(--mono);font-size:.68rem;letter-spacing:.9px;color:#2f5a94;text-transform:uppercase;margin-top:8px;}
        .qr-actions{display:flex;gap:10px;margin-top:16px;flex-wrap:wrap;justify-content:center;}
        .qr-all-btn{padding:10px 16px;border:1px solid #8bb2e0;border-radius:10px;background:#fff;color:#0d3a75;font-size:.76rem;font-weight:700;cursor:pointer;}
        .qr-state{font-size:.82rem;color:rgba(255,255,255,.72);padding:14px 4px;}
        .qr-state.error{color:#ffd3c7;}

        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeRight{from{opacity:0;transform:translateX(36px)}to{opacity:1;transform:translateX(0)}}

        /* ── MARQUEE ── */
        .mq-band{background:var(--green);padding:12px 0;overflow:hidden;}
        .mq-inner{display:flex;animation:tkScroll 24s linear infinite;white-space:nowrap;}
        .mq-item{display:inline-flex;align-items:center;gap:12px;padding:0 36px;font-family:var(--mono);font-size:.7rem;color:rgba(255,255,255,.65);letter-spacing:.5px;flex-shrink:0;}

        /* ── SECTION SHARED ── */
        .sec-wrap{max-width:1280px;margin:0 auto;}
        section{padding:100px 2rem;}
        .eyebrow-dk{font-family:var(--mono);font-size:.63rem;color:var(--green);letter-spacing:2.5px;text-transform:uppercase;margin-bottom:16px;display:flex;align-items:center;gap:10px;}
        .eyebrow-dk::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,rgba(14,124,91,.3),transparent);}
        .sec-h{font-family:var(--serif);font-size:clamp(2rem,3vw,3rem);font-weight:700;color:var(--ink);line-height:1.08;letter-spacing:-.5px;margin-bottom:14px;}
        .sec-h em{font-style:italic;color:var(--green);}
        .sec-p{font-size:.88rem;color:#4a5568;line-height:1.85;max-width:520px;}

        /* ── ABOUT ── */
        .about-sec{background:var(--snow);}
        .about-grid{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:start;}
        .about-p{font-size:.88rem;color:#4a5568;line-height:1.88;margin-bottom:16px;}
        .mission-box{margin-top:30px;padding:22px 26px;background:var(--techDk);border-radius:var(--r);position:relative;overflow:hidden;}
        .mission-box::before{content:'';position:absolute;top:0;left:0;width:4px;height:100%;background:linear-gradient(180deg,var(--green),var(--leaf));}
        .mission-label{font-family:var(--mono);font-size:.6rem;color:rgba(255,255,255,.3);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px;}
        .mission-text{font-family:var(--serif);font-size:1.02rem;font-style:italic;color:rgba(255,255,255,.72);line-height:1.65;}
        .tl{position:relative;padding-left:26px;}
        .tl::before{content:'';position:absolute;left:0;top:6px;bottom:0;width:1px;background:linear-gradient(180deg,var(--green),rgba(14,124,91,.05));}
        .tl-item{position:relative;margin-bottom:28px;}
        .tl-dot{position:absolute;left:-31px;top:5px;width:11px;height:11px;border-radius:50%;background:var(--green);border:2px solid var(--snow);box-shadow:0 0 0 3px rgba(14,124,91,.18);}
        .tl-year{font-family:var(--mono);font-size:.65rem;color:var(--green);letter-spacing:1px;margin-bottom:4px;}
        .tl-event{font-size:.84rem;color:#4a5568;line-height:1.62;}

        /* ── SERVICES ── */
        .srv-sec{background:var(--mist);}
        .srv-head{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:end;margin-bottom:52px;}
        .srv-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--fog);border:1px solid var(--fog);border-radius:var(--rLg);overflow:hidden;}
        .srv-card{background:var(--snow);padding:32px 26px;position:relative;transition:background .22s;}
        .srv-card:hover{background:#f0faf7;}
        .srv-num{position:absolute;top:18px;right:20px;font-family:var(--mono);font-size:.7rem;color:rgba(2,62,138,.1);}
        .srv-ico-wrap{width:50px;height:50px;border-radius:13px;display:flex;align-items:center;justify-content:center;background:var(--mist);font-size:1.5rem;margin-bottom:16px;border:1px solid var(--fog);}
        .srv-tag{font-family:var(--mono);font-size:.58rem;color:var(--green);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px;}
        .srv-t{font-family:var(--serif);font-size:1.18rem;font-weight:700;color:var(--ink);margin-bottom:9px;}
        .srv-d{font-size:.83rem;color:#4a5568;line-height:1.72;}

        /* ── STATS ── */
        .stats-band{background:var(--techDk);padding:0 2rem;}
        .stats-i{max-width:1280px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);}
        .st-cell{padding:50px 22px;border-right:1px solid rgba(255,255,255,.07);text-align:center;}
        .st-cell:last-child{border-right:none;}
        .st-val{font-family:var(--serif);font-size:2.8rem;font-weight:700;color:#fff;line-height:1;margin-bottom:5px;}
        .st-val em{font-style:normal;color:var(--leaf);}
        .st-lbl{font-size:.8rem;color:rgba(255,255,255,.5);}
        .st-sub{font-family:var(--mono);font-size:.6rem;color:rgba(255,255,255,.22);letter-spacing:.5px;margin-top:3px;}

        /* ── DOCTORS ── */
        .docs-sec{background:var(--snow);}
        .docs-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:48px;}
        .doc-card{border:1px solid var(--fog);border-radius:var(--rLg);padding:26px 20px;transition:all .25s;background:var(--snow);}
        .doc-card:hover{box-shadow:0 14px 44px rgba(2,62,138,.1);transform:translateY(-4px);border-color:rgba(14,124,91,.18);}
        .dc-av{width:60px;height:60px;border-radius:15px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1rem;margin-bottom:14px;font-family:var(--sans);}
        .dc-name{font-family:var(--serif);font-size:1rem;font-weight:700;color:var(--ink);margin-bottom:3px;}
        .dc-spec{font-family:var(--mono);font-size:.62rem;color:var(--green);letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;}
        .dc-divider{height:1px;background:var(--fog);margin-bottom:12px;}
        .dc-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;}
        .dc-key{font-family:var(--mono);font-size:.58rem;color:rgba(74,85,104,.45);letter-spacing:.5px;text-transform:uppercase;}
        .dc-val{font-size:.8rem;font-weight:600;color:var(--ink);}
        .dc-val.gold{color:#D97706;}

        /* ── TESTIMONIALS ── */
        .t-sec{background:var(--mist);}
        .t-head{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:end;margin-bottom:50px;}
        .t-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;}
        .t-card{background:var(--snow);border:1px solid var(--fog);border-radius:var(--rLg);padding:28px;transition:all .28s;}
        .t-card:hover{box-shadow:0 14px 44px rgba(2,62,138,.07);transform:translateY(-3px);}
        .t-cond{font-family:var(--mono);font-size:.58rem;color:var(--green);letter-spacing:1.5px;text-transform:uppercase;padding:3px 9px;border:1px solid rgba(14,124,91,.2);border-radius:100px;display:inline-block;margin-bottom:12px;}
        .t-stars{display:flex;gap:2px;margin-bottom:12px;}
        .t-star{color:#f5c842;font-size:.72rem;}
        .t-body{font-family:var(--serif);font-size:1.02rem;font-style:italic;color:#4a5568;line-height:1.68;margin-bottom:20px;}
        .t-author{display:flex;align-items:center;gap:10px;border-top:1px solid var(--fog);padding-top:14px;}
        .t-av{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--green),var(--techBlue));display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.68rem;color:#fff;font-family:var(--sans);}
        .t-nm{font-size:.84rem;font-weight:700;color:var(--ink);}
        .t-rl{font-size:.66rem;color:rgba(74,85,104,.45);font-family:var(--mono);}

        /* ── CTA ── */
        .cta-sec{background:var(--snow);padding:100px 2rem;text-align:center;}
        .cta-box{max-width:680px;margin:0 auto;background:var(--techDk);border-radius:var(--rLg);padding:60px 40px;position:relative;overflow:hidden;}
        .cta-box::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(90,179,72,.16),transparent 60%);}
        .cta-h{font-family:var(--serif);font-size:clamp(1.8rem,3vw,2.6rem);font-weight:700;color:#fff;line-height:1.1;margin-bottom:14px;position:relative;}
        .cta-h em{font-style:italic;color:#8be07a;}
        .cta-p{font-size:.88rem;color:rgba(255,255,255,.45);line-height:1.78;max-width:440px;margin:0 auto 28px;position:relative;}
        .cta-btns{display:flex;justify-content:center;gap:12px;flex-wrap:wrap;position:relative;}
        .cta-btn-p{padding:13px 30px;border-radius:11px;background:var(--green);border:none;color:#fff;font-family:var(--sans);font-size:.88rem;font-weight:700;cursor:pointer;transition:all .22s;box-shadow:0 5px 20px rgba(14,124,91,.35);}
        .cta-btn-p:hover{background:var(--greenLt);transform:translateY(-2px);}
        .cta-btn-s{padding:13px 28px;border-radius:11px;background:rgba(255,255,255,.08);border:1.5px solid rgba(255,255,255,.2);color:#fff;font-family:var(--sans);font-size:.88rem;font-weight:500;cursor:pointer;transition:all .22s;}
        .cta-btn-s:hover{background:rgba(255,255,255,.15);}

        /* ── ACCRED ── */
        .accred-sec{background:var(--snow);padding:70px 2rem;border-top:1px solid var(--fog);}
        .accred-label{font-family:var(--mono);font-size:.62rem;color:rgba(74,85,104,.35);letter-spacing:2px;text-transform:uppercase;text-align:center;margin-bottom:32px;}
        .accred-row{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;}
        .accred-item{padding:16px 36px;border-right:1px solid var(--fog);text-align:center;}
        .accred-item:last-child{border-right:none;}
        .accred-nm{font-family:var(--serif);font-size:1.05rem;font-weight:700;color:var(--ink);}
        .accred-desc{font-family:var(--mono);font-size:.58rem;color:rgba(74,85,104,.35);letter-spacing:.5px;margin-top:2px;}

        /* ── FOOTER ── */
        footer{background:#010f24;border-top:1px solid rgba(255,255,255,.06);padding:64px 2rem 26px;color:rgba(255,255,255,.4);font-family:var(--sans);}
        .ft-i{max-width:1280px;margin:0 auto;}
        .ft-top{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:42px;margin-bottom:48px;}
        .ft-tg{font-size:.84rem;line-height:1.72;margin-bottom:20px;max-width:245px;margin-top:12px;}
        .soc-r{display:flex;gap:8px;flex-wrap:wrap;}
        .soc-a{width:35px;height:35px;border-radius:9px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.09);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.4);text-decoration:none;transition:all .2s;}
        .soc-a:hover{background:var(--green);border-color:var(--green);color:#fff;}
        .ft-col h4{font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:1.8px;color:rgba(255,255,255,.7);margin-bottom:14px;}
        .ft-list{list-style:none;display:flex;flex-direction:column;gap:8px;}
        .ft-list a{font-size:.84rem;color:rgba(255,255,255,.34);text-decoration:none;transition:color .2s;}
        .ft-list a:hover{color:#8be07a;}
        .ft-bot{border-top:1px solid rgba(255,255,255,.06);padding-top:20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;}
        .ft-copy{font-size:.74rem;}
        .ft-bls{display:flex;gap:20px;}
        .ft-bls a{font-size:.74rem;color:rgba(255,255,255,.28);text-decoration:none;transition:color .2s;}
        .ft-bls a:hover{color:#8be07a;}

        /* ── RESPONSIVE ── */
        @media(max-width:1100px){
          .about-grid,.hero-i{grid-template-columns:1fr;}
          .hero-right{display:none;}
          .qr-modal-grid{grid-template-columns:1fr;}
          .qr-card{min-height:360px;}
          .srv-head{grid-template-columns:1fr;}
          .srv-grid{grid-template-columns:repeat(2,1fr);}
          .docs-grid{grid-template-columns:repeat(2,1fr);}
          .t-head{grid-template-columns:1fr;}
          .t-grid{grid-template-columns:1fr;}
          .ft-top{grid-template-columns:1fr 1fr;}
        }
        @media(max-width:768px){
          nav,.hdr-auth{display:none;}
          .burger{display:flex;}
          .hdr{top:0;}
          .hdr:not(.scrolled){background:rgba(1,22,54,.9);}
          .hero{padding-top:68px;}
          .stats-i{grid-template-columns:repeat(2,1fr);}
          .st-cell{border-right:none;border-bottom:1px solid rgba(255,255,255,.07);}
          .docs-grid{grid-template-columns:1fr;}
          .accred-item{border-right:none;border-bottom:1px solid var(--fog);width:100%;}
          .ft-top{grid-template-columns:1fr;gap:26px;}
          .ft-bot{flex-direction:column;text-align:center;}
          .cta-box{padding:40px 18px;}
          section{padding:72px 1.5rem;}
          .qr-modal-panel{padding:16px;}
          .qr-modal-title{font-size:1.65rem;}
        }
      `}</style>

      {/* ── TICKER ── */}
      <div className="tk-bar">
        <div className="tk-inner">
          {[...liveStats, ...liveStats, ...liveStats, ...liveStats].map((s, i) => (
            <span key={i} className="tk-item">
              <span className="tk-dot" />{s}
            </span>
          ))}
        </div>
      </div>

      {/* ── HEADER ── */}
      <header className={`hdr ${scrolled ? "scrolled" : ""}`}>
        <div className="hdr-i">
          <a className="logo-w" href="#">
            <MediReachLogo size={42} />
            <div className="logo-txt">
              <span className="logo-nm"><b>Medi</b>Reach</span>
              <span className="logo-sub">Est. 2009 · Global Healthcare</span>
            </div>
          </a>
          <nav>
            {NAV_LINKS.map(l => (
              <button key={l} className={`nb ${activeNav === l ? "act" : ""}`} onClick={() => setActiveNav(l)}>{l}</button>
            ))}
          </nav>
          <div className="hdr-auth">
            <button className="btn-login" onClick={() => navigate('/LoginHome')}>Log In</button>
            <button className="btn-signup" onClick={() => navigate('/LoginHome')}>Sign Up</button>
          </div>
          <button className="burger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span style={menuOpen ? { transform:"rotate(45deg) translate(5px,5px)" } : {}} />
            <span style={menuOpen ? { opacity:0 } : {}} />
            <span style={menuOpen ? { transform:"rotate(-45deg) translate(5px,-5px)" } : {}} />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`mob-m ${menuOpen ? "open" : ""}`}>
        <div className="mob-nav">
          {NAV_LINKS.map(l => (
            <button key={l} className="nb"
              style={{ fontSize:"1.25rem", fontFamily:"var(--serif)", fontWeight:700, padding:"14px 0", color:"rgba(255,255,255,.75)", borderRadius:0, borderBottom:"1px solid rgba(255,255,255,.06)" }}
              onClick={() => { setActiveNav(l); setMenuOpen(false); }}>{l}
            </button>
          ))}
        </div>
        <div className="mob-auth">
          <button className="btn-login" onClick={() => navigate('/LoginHome')}>Log In</button>
          <button className="btn-signup" onClick={() => navigate('/LoginHome')}>Sign Up</button>
        </div>
      </div>

      {/* ══ HERO ══ */}
      <section className="hero">
        <div className="hero-grid" />
        <div className="hero-glow" />
        <div className="hero-glow2" />
        <div className="hero-diag" />
        <div className="hero-i">
          <div>
            <div className="eyebrow">Trusted Worldwide Since 2009</div>
            <h1 className="hero-h">World-Class Healthcare,<br /><em>Wherever You Are</em></h1>
            <p className="hero-desc">
              MediReach connects you with 200+ board-certified specialists across cardiology, oncology, neurology, mental health, and beyond — with same-day virtual consultations, advanced diagnostics, and integrated pharmacy in one secure platform.
            </p>
            <div className="hero-trust">
              <div className="avs">{["SK","AM","RP","LJ","TC"].map(i => <div key={i} className="av">{i}</div>)}</div>
              <div className="trust-txt"><strong>50,000+</strong> patients trust MediReach<br />across 28 countries worldwide</div>
            </div>
            <div className="hero-facts">
              <div className="hf"><div className="hf-v">50<em>K+</em></div><div className="hf-l">Patients globally</div></div>
              <div className="hf"><div className="hf-v">200<em>+</em></div><div className="hf-l">Specialist doctors</div></div>
              <div className="hf"><div className="hf-v"><em>28</em></div><div className="hf-l">Countries served</div></div>
              <div className="hf"><div className="hf-v">98<em>%</em></div><div className="hf-l">Satisfaction rate</div></div>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-quick-qr">
              <p className="quick-qr-title">Want to explore pharmacy details before logging in?</p>
              <button className="quick-qr-btn" onClick={openQRModal}>View Pharmacy QR</button>
            </div>
            <div className="status-card">
              <div className="sc-head">
                <span className="sc-title">Specialists Online Now</span>
                <div className="live-badge"><span className="live-dot" />LIVE</div>
              </div>
              <div className="sc-body">
                {DOCTORS.map(d => (
                  <div key={d.name} className="doc-row">
                    <div className="d-av" style={{ background: d.bg, color: d.cl }}>{d.init}</div>
                    <div style={{ flex:1 }}>
                      <div className="d-nm">{d.name}</div>
                      <div className="d-sp">{d.spec}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div className="d-rt">★ {d.rating}</div>
                      <div className="d-exp">{d.exp} exp.</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="sc-foot">Next slot: <span>Today at 10:15 AM</span> · Log in to book</div>
            </div>
          </div>
        </div>

        {/* Ticker at hero bottom */}
        <div className="hero-ticker">
          <div className="hero-ticker-inner">
            {[...liveStats, ...liveStats, ...liveStats, ...liveStats].map((s, i) => (
              <span key={i} className="hero-tick-item">
                <span style={{ width:"5px",height:"5px",borderRadius:"50%",background:"var(--leaf)",display:"inline-block" }} />
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {showQRModal && (
        <div className="qr-modal" role="dialog" aria-modal="true" aria-label="Pharmacy QR details preview">
          <div className="qr-modal-backdrop" onClick={() => setShowQRModal(false)} />
          <div className="qr-modal-panel">
            <button className="qr-modal-close" onClick={() => setShowQRModal(false)} aria-label="Close pharmacy QR modal">×</button>
            <div className="qr-modal-head">
              <div className="qr-modal-kicker">Public Pharmacy Access</div>
              <h3 className="qr-modal-title">Scan To Open Pharmacy Details</h3>
              <p className="qr-modal-sub">Select a branch and scan the QR code to open pharmacy details instantly without logging in.</p>
            </div>

            {qrLoading ? (
              <div className="qr-state">Loading pharmacy QR data...</div>
            ) : qrError ? (
              <div className="qr-state error">{qrError}</div>
            ) : (
              <div className="qr-modal-grid">
                <div className="qr-list">
                  {qrPharmacies.slice(0, 10).map((pharmacy) => (
                    <button
                      key={pharmacy._id}
                      className={`qr-list-btn ${selectedQRPharmacy?._id === pharmacy._id ? 'active' : ''}`}
                      onClick={() => setSelectedQRPharmacy(pharmacy)}
                    >
                      <div className="qr-list-name">{pharmacy.name}</div>
                      <div className="qr-list-district">{pharmacy.district || 'Unspecified district'}</div>
                    </button>
                  ))}
                </div>

                <div className="qr-card">
                  {selectedQRPharmacy ? (
                    <>
                      <div className="qr-code-wrap">
                        <QRCodeSVG
                          value={`${HOST_URL}/pharmacy-qr/${selectedQRPharmacy._id}`}
                          size={210}
                          bgColor="#ffffff"
                          fgColor="#0f172a"
                          level="M"
                          includeMargin={true}
                        />
                      </div>
                      <div className="qr-selected-name">{selectedQRPharmacy.name}</div>
                      <div className="qr-selected-district">{selectedQRPharmacy.district || 'Unspecified district'}</div>
                      <div className="qr-actions">
                        <button
                          className="qr-all-btn"
                          onClick={() => {
                            setShowQRModal(false);
                            navigate('/pharmacy-qr');
                          }}
                        >
                          Browse All QR Pharmacies
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="qr-empty">Choose a pharmacy from the list to generate its QR code and preview details.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MARQUEE ── */}
      <div className="mq-band">
        <div className="mq-inner">
          {["ISO 15189 Accredited","HIPAA Compliant","24/7 Emergency Triage","AI-Assisted Diagnostics","Same-Day Prescriptions","12 Languages Supported","Encrypted Records","200+ Specialists","Mental Health First Access","Evidence-Based Protocols",
            "ISO 15189 Accredited","HIPAA Compliant","24/7 Emergency Triage","AI-Assisted Diagnostics","Same-Day Prescriptions","12 Languages Supported","Encrypted Records","200+ Specialists","Mental Health First Access","Evidence-Based Protocols"
          ].map((s, i) => <span key={i} className="mq-item">{s} <span style={{ color:"rgba(255,255,255,.25)" }}>·</span></span>)}
        </div>
      </div>

      {/* ══ ABOUT ══ */}
      <section className="about-sec">
        <div className="sec-wrap">
          <div className="about-grid">
            <Reveal>
              <div>
                <div className="eyebrow-dk">About MediReach</div>
                <h2 className="sec-h">Healthcare Built on<br /><em>Trust & Precision</em></h2>
                <p className="about-p">Founded in Geneva in 2009, MediReach was built on a conviction that world-class medical care should not depend on geography or wealth. Today we operate one of the world's most comprehensive digital health ecosystems, serving 50,000+ patients across 28 countries.</p>
                <p className="about-p">Our platform is fully HIPAA and GDPR compliant, ISO 15189 certified for diagnostics, and audited annually by independent clinical bodies. Every physician undergoes a rigorous 14-step credentialing process including license verification, peer review, and continuous performance monitoring.</p>
                <p className="about-p">We serve patients in 18 languages with specialised care pathways for 200+ conditions. Our integrated technology connects your primary care doctor, specialists, lab, and pharmacy in real time — eliminating fragmented, frustrating healthcare.</p>
                <div className="mission-box">
                  <div className="mission-label">Our Mission</div>
                  <div className="mission-text">"To make world-class healthcare universally accessible — without compromise on quality, dignity, or speed."</div>
                </div>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="tl">
                {[
                  { year:"2009", event:"Founded in Geneva with 12 physicians and a vision to democratize specialist care globally." },
                  { year:"2013", event:"Launched telemedicine — one of the first in Europe. 10,000 virtual consultations completed." },
                  { year:"2016", event:"Opened diagnostic labs in 6 countries. ISO 15189 accreditation achieved in 18 months." },
                  { year:"2019", event:"Mental Health division launched. 80+ certified therapists across 3 continents." },
                  { year:"2022", event:"50,000 patients milestone. AI diagnostics reduced report turnaround by 60%." },
                  { year:"2025", event:"28 countries, 200+ specialists. Rated #1 Digital Health Platform in 7 markets." },
                ].map(m => (
                  <div key={m.year} className="tl-item">
                    <div className="tl-dot" />
                    <div className="tl-year">{m.year}</div>
                    <div className="tl-event">{m.event}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ SERVICES ══ */}
      <section className="srv-sec">
        <div className="sec-wrap">
          <div className="srv-head">
            <Reveal>
              <div>
                <div className="eyebrow-dk">What We Offer</div>
                <h2 className="sec-h">Comprehensive Care,<br /><em>One Platform</em></h2>
              </div>
            </Reveal>
            <Reveal delay={90}>
              <p className="sec-p">From routine visits to complex specialist interventions — MediReach integrates every dimension of healthcare into a single seamlessly connected experience. No referral delays. No missing records.</p>
            </Reveal>
          </div>
          <Reveal delay={60}>
            <div className="srv-grid">
              {SERVICES.map((s, i) => (
                <div key={s.title} className="srv-card">
                  <div className="srv-num">0{i+1}</div>
                  <div className="srv-ico-wrap">{s.icon}</div>
                  <div className="srv-tag">{s.tag}</div>
                  <div className="srv-t">{s.title}</div>
                  <p className="srv-d">{s.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <div className="stats-band">
        <Reveal>
          <div className="stats-i">
            {STATS.map(s => (
              <div key={s.label} className="st-cell">
                <div className="st-val">{s.value.replace(/[+%]/g,"")}<em>{s.value.match(/[+%]/)?.[0] || ""}</em></div>
                <div className="st-lbl">{s.label}</div>
                <div className="st-sub">{s.sub}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      {/* ══ DOCTORS ══ */}
      <section className="docs-sec">
        <div className="sec-wrap">
          <Reveal>
            <div style={{ maxWidth:560, marginBottom:48 }}>
              <div className="eyebrow-dk">Featured Specialists</div>
              <h2 className="sec-h">Meet Our <em>Physicians</em></h2>
              <p className="sec-p">Every MediReach physician is board-certified, peer-reviewed, and continuously monitored. Our credentialing is the most rigorous in digital health — because your life depends on it.</p>
            </div>
          </Reveal>
          <div className="docs-grid">
            {DOCTORS.map((d, i) => (
              <Reveal key={d.name} delay={i * 80}>
                <div className="doc-card">
                  <div className="dc-av" style={{ background: d.bg, color: d.cl }}>{d.init}</div>
                  <div className="dc-name">{d.name}</div>
                  <div className="dc-spec">{d.spec}</div>
                  <div className="dc-divider" />
                  <div className="dc-row"><span className="dc-key">Experience</span><span className="dc-val">{d.exp}</span></div>
                  <div className="dc-row"><span className="dc-key">Rating</span><span className="dc-val gold">★ {d.rating}</span></div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section className="t-sec">
        <div className="sec-wrap">
          <div className="t-head">
            <Reveal><div><div className="eyebrow-dk">Patient Stories</div><h2 className="sec-h">Trusted by <em>Thousands</em></h2></div></Reveal>
            <Reveal delay={90}><p className="sec-p">Real experiences from verified patients — unfiltered and unedited. Every review is authenticated against a completed consultation or order.</p></Reveal>
          </div>
          <div className="t-grid">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 80}>
                <div className="t-card">
                  <span className="t-cond">{t.condition}</span>
                  <div className="t-stars">{[...Array(t.rating)].map((_,j) => <span key={j} className="t-star">★</span>)}</div>
                  <p className="t-body">"{t.text}"</p>
                  <div className="t-author">
                    <div className="t-av">{t.avatar}</div>
                    <div><div className="t-nm">{t.name}</div><div className="t-rl">{t.role}</div></div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="cta-sec">
        <Reveal>
          <div className="cta-box">
            <div className="eyebrow-dk" style={{ justifyContent:"center", marginBottom:12 }}>Start Today</div>
            <h2 className="cta-h">Ready to Take Control<br />of Your <em>Health?</em></h2>
            <p className="cta-p">Join 50,000+ patients who've made MediReach their trusted healthcare partner. Get started in under 3 minutes.</p>
            <div className="cta-btns">
              <button className="cta-btn-p" onClick={() => navigate('/LoginHome')}>Create Free Account →</button>
              <button className="cta-btn-s" onClick={() => navigate('/LoginHome')}>Log In to Dashboard</button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ══ ACCREDITATIONS ══ */}
      <section className="accred-sec">
        <div className="sec-wrap">
          <div className="accred-label">Certifications & Accreditations</div>
          <div className="accred-row">
            {[
              { nm:"HIPAA", desc:"Data Privacy" },
              { nm:"GDPR", desc:"EU Certified" },
              { nm:"ISO 15189", desc:"Lab Standards" },
              { nm:"JCI", desc:"Hospital Standards" },
              { nm:"URAC", desc:"Digital Health" },
              { nm:"SOC 2", desc:"Security Type II" },
            ].map(a => (
              <div key={a.nm} className="accred-item">
                <div className="accred-nm">{a.nm}</div>
                <div className="accred-desc">{a.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer>
        <div className="ft-i">
          <div className="ft-top">
            <div>
              <a className="logo-w" href="#" style={{ textDecoration:"none" }}>
                <MediReachLogo size={40} />
                <div className="logo-txt">
                  <span className="logo-nm"><b>Medi</b>Reach</span>
                  <span className="logo-sub">Your Health, Within Reach</span>
                </div>
              </a>
              <p className="ft-tg">Connecting patients with exceptional healthcare professionals across every specialty, everywhere.</p>
              <div className="soc-r">
                {SOCIAL_LINKS.map(s => <a key={s.name} href={s.href} className="soc-a" title={s.name} aria-label={s.name}>{s.icon}</a>)}
              </div>
            </div>
            <div className="ft-col"><h4>Services</h4><ul className="ft-list">{["Primary Care","Telemedicine","Lab Testing","Mental Health","Pharmacy","Cardiology"].map(l=><li key={l}><a href="#">{l}</a></li>)}</ul></div>
            <div className="ft-col"><h4>Company</h4><ul className="ft-list">{["About Us","Our Doctors","Careers","Press","Blog","Partners"].map(l=><li key={l}><a href="#">{l}</a></li>)}</ul></div>
            <div className="ft-col"><h4>Support</h4><ul className="ft-list">{["Help Center","Privacy Policy","Terms of Service","Cookie Policy","Accessibility","Contact Us"].map(l=><li key={l}><a href="#">{l}</a></li>)}</ul></div>
          </div>
          <div className="ft-bot">
            <div className="ft-copy">© 2025 MediReach Health Technologies. All rights reserved.</div>
            <div className="ft-bls"><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Cookies</a><a href="#">Sitemap</a></div>
          </div>
        </div>
      </footer>
    </>
  );
}