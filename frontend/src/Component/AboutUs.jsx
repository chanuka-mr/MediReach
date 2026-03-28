import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Clock, 
  Truck, 
  Zap,
  ChevronDown,
  Activity,
  Award,
  Globe,
  Database,
  Lock,
  Layers,
  Mail,
  Quote
} from 'lucide-react';

// ── SVG Social Icons (replacing removed lucide-react brand icons) ──
const FacebookIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedinIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const AboutUs = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  const timeline = [
    { year: "2023 Q1", title: "Inception & Vision", desc: "A task-force of doctors and software engineers ideated the MediReach protocol to solve the last-mile healthcare gap." },
    { year: "2023 Q3", title: "Alpha Prototype", desc: "Successfully bridged the first 10 pharmacies in Colombo with live database synchronization." },
    { year: "2024 Q1", title: "Market Scaling", desc: "Network expanded to 5 major districts, supporting over 120 partner branches with 10k daily users." },
    { year: "2024 Q4", title: "Tech Pinnacle", desc: "Introduction of AI-driven stock prediction and a unified Patient Portal for all-in-one health management." }
  ];

  const services = [
    { icon: Search, title: "Precision Search", desc: "Advanced algorithmic lookup that considers inventory levels, store ratings, and your real-time GPS coordinates.", color: "#3B82F6" },
    { icon: Clock, title: "Mission Critical Uptime", desc: "99.9% availability for emergency checks. Our cloud architecture ensures you're always connected when it matters.", color: "#EC4899" },
    { icon: Truck, title: "Medi-Express Logistics", desc: "A specialized fleet routing system optimized for speed and cold-chain integrity for temperature-sensitive meds.", color: "#10B981" },
    { icon: ShieldCheck, title: "Quality Governance", desc: "Rigorous 24-step verification for every branch joining the network, audited by regional health authorities.", color: "#6366F1" }
  ];

  const leaders = [
    { name: "Dr. Lihini Jayawardena", role: "Chief Medical Officer", bio: "Former Health Ministry consultant with 15+ years in public health logistics.", img: "LJ" },
    { name: "Sameera Perera", role: "Head of Engineering", bio: "Tech visionary specializing in distributed systems and healthcare interoperability.", img: "SP" },
    { name: "Amali Silva", role: "Operations Director", bio: "Expert in supply chain management and pharmacy network expansion strategies.", img: "AS" }
  ];

  const testimonials = [
    { text: "MediReach has transformed how we manage our urgent medication needs. The real-time accuracy is a lifesaver.", author: "Sunil de Silva", role: "Chronic Patient" },
    { text: "Adding our pharmacy to the network increased our visibility and helped us serve 40% more emergency clients.", author: "City Care Pharmacy", role: "Partner Branch" }
  ];

  const techStack = [
    { icon: Globe, label: "CDN Global", desc: "Low-latency edge delivery" },
    { icon: Database, label: "Real-time Sync", desc: "PostgreSQL with Redis caching" },
    { icon: Lock, label: "Zero Trust", desc: "SOC2 compliant security" },
    { icon: Layers, label: "Microservices", desc: "Scaleable Node.js clusters" }
  ];

  const faqs = [
    { q: "Is MediReach a licensed medical provider?", a: "We are a technology infrastructure platform that connects patients with licensed, SLMC-authorized pharmacies. We ensure the bridge is secure and the data is accurate." },
    { q: "How secure is my medical data?", a: "We implement AES-256 encryption at rest and TLS 1.3 in transit. Your prescription data is stored in a decentralized manner to prioritize patient privacy." },
    { q: "Can I use the platform for emergency 24/7 needs?", a: "Yes, our '24/7 Service' indicator is verified daily via a live heart-beat check from branch terminals." }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 overflow-x-hidden">
      <style>{`
        @keyframes subtle-float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-15px) rotate(1deg); } }
        @keyframes scroll-text { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .float-anim { animation: subtle-float 8s ease-in-out infinite; }
        .scroll-anim { animation: scroll-text 30s linear infinite; }
        .glass-morphism { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.4); }
        .tech-gradient { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); }
      `}</style>

      {/* ── SECTION 1: FUTURISTIC HERO ── */}
      <section className="relative pt-40 pb-56 tech-gradient overflow-hidden">
        <div className="absolute top-0 right-0 w-[1200px] h-[1200px] bg-blue-600/10 rounded-full blur-[160px] translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-emerald-600/5 rounded-full blur-[140px] -translate-x-1/2 translate-y-1/2" />
        
        <div className="max-w-7xl mx-auto px-8 relative z-10 flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-8">
               <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em]">Industry Pioneers Since 2023</span>
            </div>
            <h1 className="text-[5.5rem] leading-[0.9] font-black text-white tracking-[0.05em] mb-8">
              Reliable Health <br/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Engineering.</span>
            </h1>
            <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-12">
              MediReach bridges the critical gap in emergency medicine accessibility using state-of-the-art networking and real-time inventory protocols.
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
               <button className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-[0.1em] text-sm shadow-2xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95">
                  Launch Platform
               </button>
               <button className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-white/10 transition-all">
                  Documentation
               </button>
            </div>
          </div>
          
          <div className="flex-1 relative hidden lg:block">
             <div className="relative w-full aspect-square float-anim">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-emerald-500/20 rounded-[4rem] rotate-6 border border-white/10" />
                <div className="absolute inset-8 glass-morphism rounded-[3.5rem] shadow-2xl flex items-center justify-center -rotate-3 overflow-hidden">
                   <div className="w-full h-full p-10 flex flex-col gap-6">
                      <div className="flex justify-between items-center">
                         <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600"><Activity/></div>
                         <div className="px-4 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black">STABLE</div>
                      </div>
                      <div className="space-y-3">
                         <div className="h-4 w-2/3 bg-slate-100 rounded-full" />
                         <div className="h-4 w-full bg-slate-50 rounded-full" />
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-4">
                         {[1,2,3].map(i => <div key={i} className="aspect-square bg-slate-50 rounded-2xl border border-slate-100" />)}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: MARQUEE STATS ── */}
      <div className="bg-white border-y border-slate-100 py-10 relative overflow-hidden">
        <div className="flex whitespace-nowrap scroll-anim">
           {[...Array(2)].map((_, i) => (
             <div key={i} className="flex gap-20 items-center px-10">
                {["120+ PARTNER BRANCHES", "99.9% NETWORK UPTIME", "45 MIN AVG DELIVERY", "10K+ DAILY USERS", "9 DISTRICT COVERAGE"].map((text, j) => (
                   <span key={j} className="text-[10px] font-black text-slate-400 tracking-[0.4em] flex items-center gap-4">
                      <Zap size={10} className="text-blue-500 fill-blue-500" /> {text}
                   </span>
                ))}
             </div>
           ))}
        </div>
      </div>

      {/* ── SECTION 3: CORE TEAM ── */}
      <section className="py-32 max-w-7xl mx-auto px-8">
        <div className="text-center mb-24">
           <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-4">The Visionary Core</h2>
           <h3 className="text-4xl font-black text-slate-900 tracking-tight">Meet the Architects of Your Health Network.</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
           {leaders.map((L, i) => (
             <div key={i} className="group relative pt-12">
                <div className="absolute top-0 left-12 w-24 h-24 bg-slate-900 rounded-3xl z-10 flex items-center justify-center text-white text-3xl font-black shadow-2xl transition-transform group-hover:scale-110">
                   {L.img}
                </div>
                <div className="bg-white p-12 pt-16 rounded-[3rem] border border-slate-100 shadow-sm group-hover:shadow-2xl transition-all duration-500">
                   <h4 className="text-2xl font-black text-slate-900 mb-1">{L.name}</h4>
                   <p className="text-blue-600 font-bold text-sm mb-6">{L.role}</p>
                   <p className="text-slate-500 text-sm leading-relaxed font-medium">{L.bio}</p>
                   <div className="mt-8 flex gap-4">
                      <LinkedinIcon size={18} className="text-slate-300 hover:text-blue-600 cursor-pointer transition-colors" />
                      <TwitterIcon size={18} className="text-slate-300 hover:text-blue-400 cursor-pointer transition-colors" />
                   </div>
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* ── SECTION 4: TECH STACK GRID ── */}
      <section className="py-32 bg-slate-100">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
           <div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-6">Hyper-Scale Technology.</h2>
              <p className="text-lg text-slate-500 font-medium mb-10 leading-relaxed">
                 We've engineered MediReach from the ground up to handle massive concurrent traffic with zero-latency synchronization. Our clinical-grade architecture ensures data integrity for life-saving operations.
              </p>
              <div className="grid grid-cols-2 gap-6">
                 {techStack.map((tech, i) => (
                   <div key={i} className="flex gap-4 p-5 bg-white rounded-2xl shadow-sm border border-slate-200">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><tech.icon size={20}/></div>
                      <div>
                         <h5 className="font-black text-slate-800 text-xs mb-1">{tech.label}</h5>
                         <p className="text-[10px] text-slate-400 font-bold uppercase">{tech.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
           
           {/* TIMELINE MINI-WIDGET */}
           <div className="p-12 glass-morphism rounded-[3rem] shadow-xl relative overflow-hidden">
              <h4 className="text-xl font-black text-slate-800 mb-10">Our Milestones</h4>
              <div className="space-y-10 relative">
                 <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-blue-100" />
                 {timeline.map((item, i) => (
                   <div key={i} className="relative flex gap-8 group">
                      <div className="w-5 h-5 rounded-full bg-white border-2 border-blue-500 z-10 group-hover:scale-125 transition-transform" />
                      <div>
                         <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">{item.year}</p>
                         <h5 className="font-black text-slate-800 mb-1">{item.title}</h5>
                         <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </section>

      {/* ── SECTION 5: SERVICES & TESTIMONIALS ── */}
      <section className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-8">
           <div className="text-center mb-24">
              <h2 className="text-5xl font-black text-slate-900 mb-6">Service Excellence Hub</h2>
              <p className="text-slate-500 font-medium text-xl max-w-2xl mx-auto">Proprietary protocols designed for reliability, speed, and trust.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
              {services.map((s, i) => (
                <div key={i} className="p-10 rounded-[2.5rem] border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 group">
                   <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-lg transition-transform group-hover:scale-110" style={{ background: s.color }}>
                      <s.icon size={26} className="text-white" />
                   </div>
                   <h4 className="text-xl font-black text-slate-900 mb-4">{s.title}</h4>
                   <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">{s.desc}</p>
                   <div className="h-1 w-8 bg-slate-200 group-hover:w-full transition-all duration-500" style={{ background: i % 2 === 0 ? s.color : '#e2e8f0' }} />
                </div>
              ))}
           </div>
           
           {/* TESTIMONIALS WIDGET */}
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-slate-900 p-16 rounded-[4rem] text-white overflow-hidden relative">
              <div className="absolute top-[-10%] left-[-5%] w-64 h-64 bg-blue-600/10 rounded-full blur-[80px]" />
              <div className="lg:col-span-4">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">
                    <Quote size={12} className="fill-blue-400" /> Community Trust
                 </div>
                 <h3 className="text-4xl font-black mb-4">Patient & Partner First.</h3>
                 <p className="text-slate-400 font-medium leading-relaxed">Join thousands who have optimized their healthcare journey through our platform.</p>
              </div>
              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                 {testimonials.map((t, i) => (
                   <div key={i} className="p-10 bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-sm">
                      <div className="flex gap-1 mb-8">
                         {[1,2,3,4,5].map(star => <div key={star} className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />)}
                      </div>
                      <p className="text-lg font-bold italic mb-8 leading-relaxed opacity-90">"{t.text}"</p>
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-black text-xs">{t.author[0]}</div>
                         <div>
                            <p className="font-black text-sm">{t.author}</p>
                            <p className="text-[10px] font-black uppercase text-slate-500">{t.role}</p>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </section>

      {/* ── SECTION 6: FAQ ACCORDION ── */}
      <section className="py-40 bg-slate-50">
        <div className="max-w-4xl mx-auto px-8">
           <div className="text-center mb-20">
              <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">Frequently Asked Questions</h2>
              <p className="text-slate-500 font-medium max-w-xl mx-auto">Get answers to technical and operational queries about our healthcare network.</p>
           </div>
           <div className="space-y-4">
              {faqs.map((f, i) => (
                <div key={i} className="glass-morphism rounded-3xl overflow-hidden transition-all duration-300">
                   <button 
                     onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                     className="w-full flex items-center justify-between p-8 text-left hover:bg-white transition-colors"
                   >
                      <span className="font-black text-slate-800 text-lg leading-tight">{f.q}</span>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${activeFaq === i ? 'bg-blue-600 text-white rotate-180' : 'bg-slate-100 text-slate-400'}`}>
                         <ChevronDown size={20} />
                      </div>
                   </button>
                   <div className={`transition-all duration-500 ease-in-out font-medium text-slate-500 leading-relaxed ${activeFaq === i ? 'max-h-96 p-8 pt-0 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                      <p className="p-8 bg-white/50 rounded-2xl border border-slate-100">{f.a}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* ── SECTION 7: MEGA FOOTER CTA ── */}
      <section className="relative pt-40 pb-20 tech-gradient text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 relative z-10 text-center">
           <h2 className="text-7xl font-black tracking-[0.05em] mb-12 leading-[0.9]">
              The Future of <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Integrated Care.</span>
           </h2>
           <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto mb-16">
              Ready to experience the next evolution in medicine accessibility? Start your search or join our partner network today.
           </p>
           <div className="flex flex-wrap justify-center gap-8 mb-32">
              <button className="px-12 py-6 bg-blue-600 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all">
                 Join Patient Portal
              </button>
              <button className="px-12 py-6 bg-white/10 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-white/20 transition-all">
                 Partner Pharmacy Program
              </button>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-12 pt-20 border-t border-white/5">
              {[
                { icon: Globe, label: "Coverage", text: "Nationwide" },
                { icon: Award, label: "SLMC Status", text: "Approved" },
                { icon: Mail, label: "Help Center", text: "24/7 Support" },
                { icon: LinkedinIcon, label: "Network", text: "Join Today" }
              ].map((item, i) => (
                <div key={i} className="text-center group cursor-pointer">
                   <div className="w-12 h-12 rounded-xl bg-white/5 text-slate-500 flex items-center justify-center mx-auto mb-4 group-hover:text-blue-400 group-hover:bg-white/10 transition-all">
                      <item.icon size={24} />
                   </div>
                   <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">{item.label}</p>
                   <p className="text-sm font-bold">{item.text}</p>
                </div>
              ))}
           </div>

           <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black">M</div>
                 <span className="font-black text-xl tracking-tighter">MediReach</span>
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">© 2024 MEDIREACH PROTOCOL. ALL RIGHTS RESERVED.</p>
              <div className="flex gap-6">
                 <FacebookIcon size={18} className="text-slate-500 hover:text-white cursor-pointer transition-colors" />
                 <TwitterIcon size={18} className="text-slate-500 hover:text-white cursor-pointer transition-colors" />
                 <LinkedinIcon size={18} className="text-slate-500 hover:text-white cursor-pointer transition-colors" />
              </div>
           </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;