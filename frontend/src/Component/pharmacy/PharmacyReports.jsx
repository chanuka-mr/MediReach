import React, { useState, useRef } from 'react';
import { Download, Calendar, Filter, ChevronDown, PieChart, Loader2 } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const PharmacyReports = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState({
    orders: '14,208',
    revenue: 'Rs. 8.4M',
    missed: '42'
  });
  const printRef = useRef(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate API fetch delay
    setTimeout(() => {
      // Slightly randomize to show it "worked"
      setReportData({
        orders: (14000 + Math.floor(Math.random() * 500)).toLocaleString(),
        revenue: 'Rs. ' + (8.0 + Math.random()).toFixed(1) + 'M',
        missed: Math.floor(Math.random() * 60).toString()
      });
      setIsGenerating(false);
    }, 1500);
  };

  const handleDownloadPdf = () => {
    const element = printRef.current;
    if (!element) return;

    const opt = {
      margin: 10,
      filename: 'MediReach_Network_Report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="p-8 pb-20 max-w-7xl mx-auto flex gap-8">
      {/* Sidebar Filters */}
      <div className="w-80 shrink-0">
        <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm p-6 sticky top-24">
          <h2 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-2">
            <Filter size={20} className="text-blue-600" /> Report Configuration
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Report Type</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
                <option>Network Health Summary</option>
                <option>Financial Revenue Scan</option>
                <option>Stock Depletion Review</option>
                <option>Delivery SLA Analytics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Date Range</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" defaultValue="Last 30 Days (Mar 2026)" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer" readOnly />
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Target District</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
                <option>All Districts (National)</option>
                <option>Colombo District</option>
                <option>Gampaha District</option>
                <option>Kandy District</option>
              </select>
            </div>

            <hr className="border-slate-100" />

            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3.5 rounded-xl font-extrabold tracking-wide shadow-lg shadow-blue-600/30 flex justify-center items-center gap-2 transition-transform active:scale-95"
            >
               {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <PieChart size={18} strokeWidth={2.5} />} 
               {isGenerating ? 'Analyzing Data...' : 'Generate Report UI'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Document View */}
      <div className="flex-1">
        {/* Toolbar */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Report Viewer</h1>
            <p className="text-slate-500 font-medium mt-1">Previewing: Network Health Summary (Last 30 Days)</p>
          </div>
          <button onClick={handleDownloadPdf} className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold tracking-wide shadow-md flex items-center gap-2 transition-all">
            <Download size={18} /> Export as PDF
          </button>
        </div>

        {/* The "A4 Document" preview */}
        <div ref={printRef} className="bg-white rounded-lg shadow-xl shadow-slate-200/50 min-h-[800px] border border-slate-200 p-12">
           <div className="border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-end">
             <div>
               <div className="flex items-center gap-2 mb-4">
                 <div className="w-10 h-10 bg-slate-800 rounded flex items-center justify-center">
                   <span className="text-xl">🏥</span>
                 </div>
                 <h2 className="text-2xl font-black text-slate-800 tracking-tighter">MediReach Corp.</h2>
               </div>
               <h3 className="text-3xl font-light tracking-tight text-slate-600">Network Health Summary</h3>
               <p className="text-slate-400 font-bold mt-1 text-sm uppercase tracking-widest">Confidential System Report</p>
             </div>
             <div className="text-right">
               <p className="text-sm font-bold text-slate-800">Generated: Mar 22, 2026</p>
               <p className="text-sm font-bold text-slate-500">Author: System Administrator</p>
               <p className="text-sm font-bold text-slate-500">Target: All Districts</p>
             </div>
           </div>

           {/* Mock Document Content */}
           <div className="grid grid-cols-3 gap-6 mb-12">
              <div className="bg-slate-50 p-6 border-l-4 border-blue-600 rounded">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Fulfilled Orders</p>
                <p className="text-3xl font-black text-slate-800">{reportData.orders}</p>
                <p className="text-sm font-bold text-green-600 mt-2">+12.4% vs last reporting period</p>
              </div>
              <div className="bg-slate-50 p-6 border-l-4 border-emerald-500 rounded">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Gross Revenue</p>
                <p className="text-3xl font-black text-slate-800">{reportData.revenue}</p>
                <p className="text-sm font-bold text-green-600 mt-2">+5.2% vs last reporting period</p>
              </div>
              <div className="bg-slate-50 p-6 border-l-4 border-amber-500 rounded">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">SLA Missed Deliveries</p>
                <p className="text-3xl font-black text-slate-800">{reportData.missed}</p>
                <p className="text-sm font-bold text-red-600 mt-2">-2.1% vs last reporting period</p>
              </div>
           </div>

           <h4 className="text-lg font-extrabold text-slate-800 border-b border-slate-200 pb-2 mb-4">Executive Summary</h4>
           <div className="space-y-4 text-slate-600 font-medium leading-relaxed">
             <p>During the evaluated period, the MediReach Pharmacy Network demonstrated robust operational sustainability with an uptime of 99.8%. The network successfully processed 14,208 independent prescriptions, representing a 12.4% surge in volume over the trailing 30-day period.</p>
             <p>Stock accuracy ratings remain firmly within acceptable SLA limitations across the Colombo and Gampaha nodes. Delivery turnaround times averaged 42 minutes, easily satisfying the 60-minute target SLA.</p>
           </div>
           
           <div className="mt-16 text-center text-slate-400 font-bold text-sm">
             --- End of Automated Report ---
           </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyReports;
