import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Send, 
  User, 
  AtSign, 
  MessageSquare,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Zap,
  Globe,
  Clock
} from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });

    try {
      const response = await axios.post(`${API_URL}/inquiries`, formData);
      if (response.data.status === 'success') {
        setStatus({ type: 'success', msg: 'Your inquiry has been successfully submitted! We will respond shortly.' });
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (err) {
      setStatus({ 
        type: 'error', 
        msg: err.response?.data?.message || 'Something went wrong. Please check your connection and try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 overflow-x-hidden pt-10">
      
      {/* ── HERO SECTION ── */}
      <section className="relative pt-24 pb-16 bg-white overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-50/50 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-50/50 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
           <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 mb-8 shadow-sm border border-blue-100/50">
             <MessageSquare size={32} strokeWidth={1.5} />
           </div>
           <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
              Get in <span className="text-blue-600">touch.</span>
           </h1>
           <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto">
              Our multidisciplinary team is here to assist with your technical queries, partner integrations, or health support needs.
           </p>
        </div>
      </section>

      {/* ── CONTENT SECTION ── */}
      <section className="pb-32 -mt-8 max-w-7xl mx-auto px-6 relative z-20">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
            
            {/* Left Column: Info Cards */}
            <div className="lg:col-span-5 space-y-6 pt-12">
               
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-200">
                    <Globe className="text-blue-500 mb-4" size={24} />
                    <h4 className="font-bold text-slate-900 mb-1">Global Scale</h4>
                    <p className="text-sm text-slate-500">Service across 9 major districts.</p>
                  </div>
                  <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-200">
                    <Clock className="text-emerald-500 mb-4" size={24} />
                    <h4 className="font-bold text-slate-900 mb-1">Fast SLAs</h4>
                    <p className="text-sm text-slate-500">Expect replies under 24 hours.</p>
                  </div>
                  <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-200">
                    <ShieldCheck className="text-indigo-500 mb-4" size={24} />
                    <h4 className="font-bold text-slate-900 mb-1">Secure</h4>
                    <p className="text-sm text-slate-500">End-to-end data encryption.</p>
                  </div>
                  <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-200">
                    <Zap className="text-amber-500 mb-4" size={24} />
                    <h4 className="font-bold text-slate-900 mb-1">Human-Led</h4>
                    <p className="text-sm text-slate-500">No bots, just real support.</p>
                  </div>
               </div>

               <div className="p-8 bg-blue-600 rounded-[2rem] text-white shadow-xl shadow-blue-600/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                  <HelpCircle size={32} className="mb-4 text-blue-200" strokeWidth={1.5} />
                  <h3 className="text-xl font-bold mb-3">Partner Integration</h3>
                  <p className="text-blue-100 text-sm leading-relaxed mb-6 font-medium">
                     Are you a pharmacy owner wanting to join the MediReach protocol? Or a logistics provider?
                  </p>
                  <button className="px-6 py-2.5 bg-white text-blue-600 rounded-xl text-sm font-bold shadow-sm hover:scale-105 transition-transform">
                    View Network Docs
                  </button>
               </div>
            </div>

            <div className="lg:col-span-1 hidden lg:block" />

            {/* Right Column: The Form */}
            <div className="lg:col-span-6">
               <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200">
                  <h3 className="text-2xl font-bold text-slate-900 mb-8">Send an Inquiry</h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                           <div className="relative">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                              <input 
                                required
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                type="text" 
                                placeholder="Dr. John Smith" 
                                className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                              />
                           </div>
                        </div>

                        <div className="space-y-2">
                           <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                           <div className="relative">
                              <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                              <input 
                                required
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                type="email" 
                                placeholder="john@example.com" 
                                className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                              />
                           </div>
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Subject Matter</label>
                        <div className="relative">
                           <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                           <input 
                              required
                              name="subject"
                              value={formData.subject}
                              onChange={handleChange}
                              type="text" 
                              placeholder="e.g., General Inquiry, Network Issue" 
                              className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                           />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Message Content</label>
                        <textarea 
                           required
                           name="message"
                           value={formData.message}
                           onChange={handleChange}
                           rows="5" 
                           placeholder="How can we assist you today?" 
                           className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900 placeholder:text-slate-400 resize-none"
                        ></textarea>
                     </div>

                     <button 
                        disabled={loading}
                        type="submit" 
                        className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold uppercase tracking-wider text-sm shadow-xl shadow-slate-900/10 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none mt-4"
                     >
                        {loading ? 'Submitting...' : <><Send size={16}/> Send Message</>}
                     </button>

                     {status.msg && (
                        <div className={`mt-6 p-5 rounded-2xl flex items-start gap-4 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-800 border border-rose-100'}`}>
                           {status.type === 'success' ? <CheckCircle2 size={24} className="mt-0.5 shrink-0 text-emerald-500"/> : <AlertCircle size={24} className="mt-0.5 shrink-0 text-rose-500"/>}
                           <div>
                              <p className="text-sm font-bold leading-relaxed">{status.msg}</p>
                              {status.type === 'success' && (
                                 <Link to="/user/inquiries" className="text-xs font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-800 underline mt-2 block transition-colors">
                                    Track Status in My Inquiries →
                                 </Link>
                              )}
                           </div>
                        </div>
                     )}
                  </form>
               </div>
               
               <div className="mt-8 flex justify-center items-center gap-6 text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                     <Mail size={20} />
                     <span className="text-xs font-bold">support@medireach.com</span>
                  </div>
                  <div className="w-px h-8 bg-slate-200" />
                  <div className="flex flex-col items-center gap-2">
                     <Phone size={20} />
                     <span className="text-xs font-bold">+94 11 234 5678</span>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* ── FOOTER EXTENSION ── */}
      <section className="py-20 bg-slate-900 text-white text-center">
         <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-extrabold mb-4">Want real-time updates?</h2>
            <p className="text-slate-400 font-medium mb-8 max-w-xl mx-auto">
               If you want to view network metrics or read our most frequently asked queries, visit the Help Center.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
               <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all border border-white/5">
                 Help Center
               </button>
               <button className="px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-sm font-bold shadow-lg transition-all">
                 System Status
               </button>
            </div>
         </div>
      </section>
    </div>
  );
};

export default ContactUs;
