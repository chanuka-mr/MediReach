import React, { useState, useEffect, useRef } from 'react';
import { pharmacyAPI } from '../../utils/apiEndpoints';
import { QRCodeSVG } from 'qrcode.react';
import {
   Building2,
   MapPin,
   Search,
   QrCode,
   X,
   ShieldCheck,
   Navigation,
   Activity,
   Phone,
   Globe2,
   Download
} from 'lucide-react';

const HOST_URL = window.location.origin;

const PharmacyQRUserView = () => {
   const [pharmacies, setPharmacies] = useState([]);
   const [loading, setLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState('');
   const [selectedPharmacy, setSelectedPharmacy] = useState(null);
   const [activeDistrict, setActiveDistrict] = useState('');
   const qrCodeRef = useRef();

   useEffect(() => {
      fetchPharmacies();
   }, []);

   const downloadQRCode = () => {
      const qrElement = qrCodeRef.current;
      if (!qrElement) {
         alert('QR code is not yet ready. Please wait a moment and try again.');
         return;
      }

      try {
         // Get the SVG element
         const svg = qrElement.querySelector('svg');
         if (!svg) {
            alert('QR code is still loading. Please try again.');
            return;
         }

         // Convert SVG to image
         const svgData = new XMLSerializer().serializeToString(svg);
         const canvas = document.createElement('canvas');
         const ctx = canvas.getContext('2d');
         const img = new Image();
         const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
         const url = URL.createObjectURL(svgBlob);

         img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            const pngUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = pngUrl;
            link.download = `${selectedPharmacy.name.replace(/\s+/g, '_')}_QR_Code.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
         };

         img.onerror = () => {
            alert('Failed to download QR code. Please try again.');
            URL.revokeObjectURL(url);
         };

         img.src = url;
      } catch (error) {
         console.error('Download error:', error);
         alert('Error downloading QR code. Please try again.');
      }
   };

   const fetchPharmacies = async () => {
      try {
         const response = await pharmacyAPI.getAllPharmacies();
         const pharms = response.data.data?.pharmacies || response.data.pharmacies || [];
         setPharmacies(pharms);
         const dists = [...new Set(pharms.map(p => p.district).filter(Boolean))];
         if (dists.length > 0) setActiveDistrict(dists[0]);
      } catch (error) {
         console.error('Error fetching pharmacies:', error);
      } finally {
         setLoading(false);
      }
   };

   const getGroupedPharmacies = () => {
      let filtered = pharmacies;
      if (searchTerm) {
         filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.district || 'Unspecified').toLowerCase().includes(searchTerm.toLowerCase())
         );
      }

      const grouped = filtered.reduce((acc, pharmacy) => {
         const district = pharmacy.district || 'Unspecified';
         if (!acc[district]) acc[district] = [];
         acc[district].push(pharmacy);
         return acc;
      }, {});

      return Object.keys(grouped).sort().reduce((acc, key) => {
         acc[key] = grouped[key];
         return acc;
      }, {});
   };

   const groupedData = getGroupedPharmacies();
   const districtKeys = Object.keys(groupedData);

   const scrollToDistrict = (dist) => {
      setActiveDistrict(dist);
      const element = document.getElementById(`dist-${dist}`);
      if (element) {
         const yOffset = -100;
         const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
         window.scrollTo({ top: y, behavior: 'smooth' });
      }
   };

   return (
      <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-500/30 overflow-x-hidden">

         {/* ── COMPLEX HERO ── */}
         <section className="relative bg-slate-900 overflow-hidden pt-28 pb-32 border-b border-slate-800">
            {/* Animated Background Mesh */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-blue-600/20 rotate-12 blur-[120px] mix-blend-screen animate-pulse" />
            <div className="absolute bottom-[-50%] right-[-10%] w-[60%] h-[150%] bg-indigo-600/20 -rotate-12 blur-[100px] mix-blend-screen" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />

            <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-16">
               <div className="flex-1 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-400/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-widest mb-8 backdrop-blur-md">
                     <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping absolute" />
                     <span className="w-1.5 h-1.5 rounded-full bg-blue-400 relative" />
                     Global Pharmacy Locator 2.0
                  </div>

                  <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter mb-6 leading-[1.1]">
                     Connect with local <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">healthcare</span> hubs.
                  </h1>
                  <p className="text-lg lg:text-xl text-slate-400 font-medium max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                     Search, filter, and instantly generate mobile hand-off bridging codes. Scan anywhere to invoke our native-level detail overlays.
                  </p>

                  {/* Advanced Search Bar Component */}
                  <div className="relative max-w-2xl mx-auto lg:mx-0 group">
                     <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl blur opacity-30 group-focus-within:opacity-60 transition-opacity duration-500" />
                     <div className="relative bg-slate-800/80 backdrop-blur-2xl border border-slate-700/50 rounded-3xl p-2 flex items-center shadow-2xl">
                        <div className="pl-4 pr-3 text-slate-400">
                           <Search size={22} className="group-focus-within:text-blue-400 transition-colors" />
                        </div>
                        <input
                           type="text"
                           placeholder="Search regions: e.g. Western, Colombo..."
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           className="w-full bg-transparent border-none text-white focus:outline-none focus:ring-0 placeholder:text-slate-500 font-medium text-lg py-3"
                        />
                        <div className="pr-3 pl-3 border-l border-slate-700 hidden sm:flex items-center gap-2">
                           <kbd className="px-2 py-1 bg-slate-900 rounded-lg text-xs font-bold text-slate-400 border border-slate-700 shadow-inner">CTRL</kbd>
                           <kbd className="px-2 py-1 bg-slate-900 rounded-lg text-xs font-bold text-slate-400 border border-slate-700 shadow-inner">K</kbd>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Floating Visual Metric Cards */}
               <div className="hidden lg:flex flex-1 relative h-[300px] items-center justify-center">
                  <div className="absolute top-0 right-10 bg-white/10 backdrop-blur-2xl border border-white/10 p-5 rounded-[2rem] shadow-2xl shadow-black/50 hover:-translate-y-2 transition-transform duration-500 z-20">
                     <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/30">
                           <Activity size={20} className="animate-pulse" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Network Status</p>
                           <p className="text-xl font-black text-white">99.9% Up</p>
                        </div>
                     </div>
                  </div>

                  <div className="absolute bottom-4 left-4 bg-slate-800/80 backdrop-blur-2xl border border-slate-700 p-6 rounded-[2rem] shadow-2xl hover:scale-105 transition-transform duration-500 z-30">
                     <div className="flex justify-between items-center mb-4">
                        <h4 className="text-white font-bold">Total Hubs</h4>
                        <Globe2 className="text-blue-400" size={18} />
                     </div>
                     <div className="text-4xl font-black text-white">{pharmacies.length}</div>
                     <div className="mt-2 w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div className="w-3/4 bg-gradient-to-r from-blue-400 to-indigo-500 h-full rounded-full" />
                     </div>
                  </div>

                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-slate-800/50 backdrop-blur-3xl rounded-full border-[8px] border-slate-800/50 flex items-center justify-center shadow-inner z-10">
                     <QrCode size={64} className="text-slate-600 opacity-50" />
                  </div>
               </div>
            </div>
         </section>

         {/* ── MAIN LAYOUT (SIDEBAR + GRID) ── */}
         <section className="max-w-7xl mx-auto px-6 py-12 relative flex flex-col md:flex-row gap-12 items-start z-20 -mt-10">

            {/* SIDEBAR NAVIGATION (Sticky Sticky Sidebar) */}
            <div className="w-full md:w-64 shrink-0 md:sticky md:top-6 bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-200 flex flex-col hidden md:flex h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
               <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                  <Navigation size={14} /> District Index
               </h3>

               {loading ? (
                  <div className="space-y-4">
                     {[1, 2, 3, 4].map(i => <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />)}
                  </div>
               ) : districtKeys.length === 0 ? (
                  <p className="text-sm font-medium text-slate-500">No districts match search.</p>
               ) : (
                  <div className="space-y-2">
                     {districtKeys.map(dist => {
                        const isActive = activeDistrict === dist;
                        return (
                           <button
                              key={dist}
                              onClick={() => scrollToDistrict(dist)}
                              className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-between group ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                           >
                              <span className="truncate pr-4">{dist}</span>
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-colors ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500 group-hover:bg-slate-300'}`}>
                                 {groupedData[dist].length}
                              </div>
                           </button>
                        );
                     })}
                  </div>
               )}
            </div>

            {/* CONTENT FEED */}
            <div className="flex-1 w-full pb-32">
               {loading ? (
                  <div className="flex justify-center py-20">
                     <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                  </div>
               ) : districtKeys.length === 0 ? (
                  <div className="text-center py-24 bg-white/50 backdrop-blur-md rounded-[3rem] border border-dashed border-slate-300 shadow-sm">
                     <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6"><Building2 size={32} /></div>
                     <h3 className="text-2xl font-black text-slate-900 mb-2">Zero Matches Found</h3>
                     <p className="text-slate-500 font-medium">Clear your search parameters and try again.</p>
                  </div>
               ) : (
                  <div className="space-y-16">
                     {districtKeys.map(district => (
                        <div key={district} id={`dist-${district}`} className="scroll-mt-24">

                           {/* District Section Header */}
                           <div className="flex items-center gap-4 mb-8 sticky top-6 md:static bg-slate-50/90 backdrop-blur-xl md:bg-transparent py-4 md:py-0 z-30 -mx-6 px-6 md:mx-0 md:px-0">
                              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center text-blue-600">
                                 <MapPin size={20} strokeWidth={2.5} />
                              </div>
                              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{district}</h2>
                              <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent ml-4 hidden sm:block" />
                           </div>

                           {/* Complex Pharmacy Cards Grid */}
                           <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                              {groupedData[district].map((p) => (
                                 <div
                                    key={p._id}
                                    onClick={() => setSelectedPharmacy(p)}
                                    className="group relative bg-slate-50 rounded-[2rem] p-6 shadow-sm border border-blue-300 hover:shadow-2xl hover:shadow-blue-300/20 hover:border-blue-400 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[180px]"
                                 >
                                    {/* Card Graphic Top Right corner */}
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-white to-transparent rounded-bl-full -mr-10 -mt-10 opacity-50 transition-colors duration-500" />

                                    <div className="relative z-10 flex items-start justify-between">
                                       <div>
                                          <div className="flex items-center gap-2 mb-3">
                                             <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[9px] font-black uppercase tracking-widest border border-emerald-200 flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> NETWORK
                                             </span>
                                             <span className="px-2 py-1 bg-white text-slate-500 rounded-md text-[9px] font-black uppercase tracking-widest border border-slate-100 shadow-sm">
                                                ID: {p._id.substring(18, 24).toUpperCase()}
                                             </span>
                                          </div>
                                          <h4 className="text-2xl font-black text-blue-600 mb-1 truncate max-w-[200px] sm:max-w-xs">{p.name}</h4>
                                          <p className="text-sm font-semibold text-slate-500 flex items-center gap-1.5 truncate max-w-[200px] sm:max-w-xs">
                                             <Phone size={14} className="text-slate-400" /> {p.contactNumber || 'No phone listed'}
                                          </p>
                                       </div>
                                    </div>

                                    {/* Bottom Row: Metric logic and Action */}
                                    <div className="relative z-10 flex items-end justify-between mt-8 pt-5 border-t border-slate-200 border-dashed">
                                       <div className="flex items-center gap-4">
                                          <div>
                                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Capacity</p>
                                             <div className="flex gap-1">
                                                <div className="w-1.5 h-3 bg-blue-500 rounded-sm" />
                                                <div className="w-1.5 h-3 bg-blue-500 rounded-sm" />
                                                <div className="w-1.5 h-3 bg-blue-500 rounded-sm" />
                                                <div className="w-1.5 h-3 bg-slate-200 rounded-sm" />
                                             </div>
                                          </div>
                                       </div>
                                       <div className="flex items-center gap-3 text-white font-bold text-sm bg-blue-600 px-5 py-2.5 rounded-[0.8rem] hover:bg-blue-700 transition-colors duration-300 shadow-md shadow-blue-500/20">
                                          View Code <QrCode size={18} />
                                       </div>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </section>

         {/* ── ULTRA-COMPLEX QR MODAL ── */}
         {selectedPharmacy && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <div
                  className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl transition-all duration-500 ease-out animate-in fade-in"
                  onClick={() => setSelectedPharmacy(null)}
               />

               <div className="relative bg-white w-full max-w-[420px] max-h-[90vh] overflow-y-auto custom-scrollbar rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] p-0 animate-in zoom-in-95 font-sans duration-300 ease-out flex flex-col border border-white/50 ring-1 ring-slate-900/5">

                  {/* Modal Header Cover */}
                  <div className="relative shrink-0 h-40 bg-slate-900 w-full overflow-hidden p-8">
                     <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 mix-blend-screen" />
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05]" />
                     <button
                        onClick={() => setSelectedPharmacy(null)}
                        className="absolute top-6 right-6 p-2 bg-white/10 text-white hover:bg-white/20 rounded-full transition-colors backdrop-blur-md z-20"
                     >
                        <X size={20} strokeWidth={2.5} />
                     </button>

                     <div className="relative z-10 flex items-start justify-between h-full">
                        <div>
                           <div className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-lg text-[10px] font-black uppercase tracking-widest mb-3 inline-flex items-center gap-1.5 shadow-sm">
                              <ShieldCheck size={12} className="text-emerald-400" /> Authenticated Node
                           </div>
                           <h3 className="text-2xl font-black text-white leading-tight mb-1 truncate max-w-[240px]">{selectedPharmacy.name}</h3>
                           <p className="text-slate-300 text-sm font-semibold flex items-center gap-1.5"><MapPin size={14} className="text-blue-400" /> {selectedPharmacy.district}</p>
                        </div>
                     </div>
                  </div>

                  {/* Modal Body: The QR Code */}
                  <div className="p-8 sm:p-10 flex flex-col items-center bg-white relative z-20 -mt-6 rounded-t-[2.5rem]">

                     <div className="relative group mb-8" ref={qrCodeRef}>
                        {/* Bounding box glow */}
                        <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 opacity-20 group-hover:opacity-40 blur-xl transition-opacity duration-700" />

                        <div className="relative bg-white p-4 sm:p-6 rounded-[2rem] border-2 border-slate-100 shadow-2xl flex items-center justify-center transform transition-transform duration-500 group-hover:scale-[1.02]">
                           <QRCodeSVG
                              value={`${HOST_URL}/pharmacy-qr/${selectedPharmacy._id}`}
                              size={220}
                              bgColor={"#ffffff"}
                              fgColor={"#0f172a"}
                              level={"M"}
                              includeMargin={true}
                           />
                           {/* Custom Tracker crosshairs */}
                           <div className="absolute top-2 left-2 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-xl" />
                           <div className="absolute top-2 right-2 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-xl" />
                           <div className="absolute bottom-2 left-2 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-xl" />
                           <div className="absolute bottom-2 right-2 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-xl" />
                        </div>
                     </div>

                     <p className="text-slate-500 font-medium text-sm text-center max-w-[280px] mb-8">
                        Point your mobile camera at the symbol above to establish a direct connection to this facility.
                     </p>

                     {/* Download Button */}
                     <button
                        onClick={() => downloadQRCode()}
                        className="w-full relative py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-[0_10px_40px_-10px_rgba(37,99,235,0.5)] group/btn"
                     >
                        <Download size={16} className="group-hover/btn:translate-y-1 transition-transform" />
                        Download QR Code
                     </button>
                  </div>

               </div>
            </div>
         )}

         {/* Global styles for custom scrollbar hidden in Tailwind sometimes */}
         <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #e2e8f0;
          border-radius: 20px;
        }
      `}</style>
      </div>
   );
};

export default PharmacyQRUserView;
