import React, { useState, useEffect } from 'react';
import { inquiryAPI } from '../../utils/apiEndpoints';
import { 
  Mail, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Search, 
  ChevronRight,
  AtSign,
  Calendar,
  MessageSquare,
  Quote,
  RotateCcw
} from 'lucide-react';

const InquiryManagement = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await inquiryAPI.getAllInquiries();
      setInquiries(response.data.data?.inquiries || response.data.inquiries || []);
    } catch (err) {
      console.error('Error fetching inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const response = await inquiryAPI.updateInquiry(id, { status: newStatus });
      setInquiries(inquiries.map(inq => inq._id === id ? response.data.data.inquiry : inq));
      if (selectedInquiry?._id === id) setSelectedInquiry(response.data.data.inquiry);
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const deleteInquiry = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this inquiry?')) return;
    try {
      await inquiryAPI.deleteInquiry(id);
      setInquiries(inquiries.filter(inq => inq._id !== id));
      if (selectedInquiry?._id === id) setSelectedInquiry(null);
    } catch (err) {
      console.error('Error deleting inquiry:', err);
    }
  };

  const filteredInquiries = inquiries.filter(inq => {
    const matchesFilter = filter === 'All' || inq.status === filter;
    const matchesSearch = inq.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inq.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inq.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'In Progress': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Archived': return 'bg-slate-50 text-slate-500 border-slate-100';
      default: return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans pt-24">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
           <div>
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white"><Mail size={16}/></div>
                 <h1 className="text-3xl font-black text-slate-900 tracking-tight">Inquiry Management</h1>
              </div>
              <p className="text-slate-500 font-medium">Monitor and respond to patient &amp; partner communications.</p>
           </div>
           
           <div className="flex flex-wrap gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none md:w-64">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                    type="text" 
                    placeholder="Search messages..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-slate-800"
                 />
              </div>
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-800 outline-none cursor-pointer"
              >
                 <option>All</option>
                 <option>Pending</option>
                 <option>In Progress</option>
                 <option>Resolved</option>
                 <option>Archived</option>
              </select>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* TABLE LISTING */}
           <div className={`lg:col-span-8 ${selectedInquiry ? 'hidden lg:block' : ''}`}>
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Sender</th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Subject/Preview</th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {loading ? (
                         <tr><td colSpan="4" className="px-8 py-20 text-center font-bold text-slate-400">Initializing Data Stream...</td></tr>
                       ) : filteredInquiries.length === 0 ? (
                         <tr><td colSpan="4" className="px-8 py-20 text-center font-bold text-slate-400">No matching inquiries found.</td></tr>
                       ) : (
                         filteredInquiries.map((inq) => (
                           <tr 
                             key={inq._id} 
                             onClick={() => setSelectedInquiry(inq)}
                             className={`group cursor-pointer hover:bg-blue-50/30 transition-colors ${selectedInquiry?._id === inq._id ? 'bg-blue-50/50' : ''}`}
                           >
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs uppercase">
                                       {inq.name.charAt(0)}
                                    </div>
                                    <div>
                                       <p className="font-black text-slate-900 text-sm">{inq.name}</p>
                                       <p className="text-xs text-slate-500 font-medium">{inq.email}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <p className="font-black text-slate-800 text-sm mb-1">{inq.subject}</p>
                                 <p className="text-xs text-slate-500 font-medium truncate max-w-[200px]">{inq.message}</p>
                              </td>
                              <td className="px-8 py-6">
                                 <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${getStatusColor(inq.status)}`}>
                                    {inq.status}
                                 </span>
                              </td>
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-2 transition-opacity">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); deleteInquiry(inq._id); }}
                                      className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                                    >
                                       <Trash2 size={18} />
                                    </button>
                                    <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                                       <ChevronRight size={18} />
                                    </button>
                                 </div>
                              </td>
                           </tr>
                         ))
                       )}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* DETAILS PANEL */}
           <div className={`lg:col-span-4 ${!selectedInquiry ? 'hidden lg:block' : ''}`}>
              {selectedInquiry ? (
                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden sticky top-32 animate-in slide-in-from-right-4 duration-500">
                   <div className="p-10 border-b border-slate-50 bg-slate-50/30">
                      <div className="flex justify-between items-start mb-8">
                         <div className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest">Detailed Record</div>
                         <button onClick={() => setSelectedInquiry(null)} className="lg:hidden p-2 text-slate-400">&times;</button>
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{selectedInquiry.subject}</h3>
                      <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
                        <Calendar size={14}/> {new Date(selectedInquiry.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                   </div>
                   
                   <div className="p-10 space-y-8">
                      <div className="flex gap-6">
                         <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-black text-xl">
                            {selectedInquiry.name.charAt(0)}
                         </div>
                         <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Inquiry From</p>
                            <h4 className="font-black text-slate-900 text-lg">{selectedInquiry.name}</h4>
                            <p className="text-sm text-blue-600 font-bold flex items-center gap-2"><AtSign size={14}/> {selectedInquiry.email}</p>
                         </div>
                      </div>

                      <div className="p-8 bg-slate-50 rounded-[2.5rem] relative">
                         <Quote className="absolute top-6 left-6 text-blue-100" size={40} />
                         <p className="relative z-10 text-slate-700 font-medium leading-relaxed italic">
                            {selectedInquiry.message}
                         </p>
                      </div>

                      <div className="space-y-4">
                         <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Lifecycle Actions</p>

                         {/* Row 1: In Progress + Resolve */}
                         <div className="grid grid-cols-2 gap-4">
                            <button 
                              onClick={() => updateStatus(selectedInquiry._id, 'In Progress')}
                              className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${selectedInquiry.status === 'In Progress' ? 'bg-amber-100 text-amber-700 border-2 border-amber-200' : 'bg-slate-50 text-slate-600 border border-slate-100 hover:bg-amber-50 hover:text-amber-600'}`}
                            >
                               <Clock size={14}/> In Progress
                            </button>
                            <button 
                              onClick={() => updateStatus(selectedInquiry._id, 'Resolved')}
                              className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${selectedInquiry.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-200' : 'bg-slate-50 text-slate-600 border border-slate-100 hover:bg-emerald-50 hover:text-emerald-600'}`}
                            >
                               <CheckCircle size={14}/> Resolved
                            </button>
                         </div>

                         {/* Row 2: Revert to Pending */}
                         <button 
                           onClick={() => updateStatus(selectedInquiry._id, 'Pending')}
                           className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${selectedInquiry.status === 'Pending' ? 'bg-blue-100 text-blue-700 border-2 border-blue-200' : 'bg-slate-50 text-slate-500 border border-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100'}`}
                         >
                           <RotateCcw size={14}/> Revert to Pending
                         </button>

                         {/* Row 3: Delete */}
                         <button 
                            onClick={() => deleteInquiry(selectedInquiry._id)}
                            className="w-full py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-100"
                         >
                            Archive &amp; Purge Record
                         </button>
                      </div>
                   </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-[3rem] border border-dashed border-slate-200">
                   <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-6"><MessageSquare size={32}/></div>
                   <h4 className="font-black text-slate-400 text-lg mb-2">Select an Inquiry</h4>
                   <p className="text-slate-400 font-medium text-sm">Review full message details and manage resolution lifecycle states.</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default InquiryManagement;
