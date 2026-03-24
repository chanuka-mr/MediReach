import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  History,
  Search,
  Edit3,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  User,
  AtSign,
  MessageSquare,
  Save,
  X,
  ShieldAlert
} from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const UserInquiryControl = () => {
  const [email, setEmail] = useState('');
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({ subject: '', message: '' });
  const [hasSearched, setHasSearched] = useState(false);

  const fetchUserInquiries = async (searchEmail) => {
    if (!searchEmail) return;
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/inquiries/by-email/${searchEmail}`);
      if (response.data.status === 'success') {
        setInquiries(response.data.data.inquiries);
        setHasSearched(true);
      }
    } catch (err) {
      setError('Could not retrieve inquiries. Please verify your email and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLookup = (e) => {
    e.preventDefault();
    fetchUserInquiries(email);
  };

  const startEditing = (inq) => {
    if (inq.status !== 'Pending') return;
    setEditingId(inq._id);
    setEditFormData({ subject: inq.subject, message: inq.message });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditFormData({ subject: '', message: '' });
  };

  const handleUpdate = async (id) => {
    try {
      const response = await axios.patch(`${API_URL}/inquiries/user/${id}`, editFormData);
      if (response.data.status === 'success') {
        setInquiries(inquiries.map(inq => inq._id === id ? response.data.data.inquiry : inq));
        setEditingId(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently withdraw this inquiry?')) return;
    try {
      const response = await axios.delete(`${API_URL}/inquiries/user/${id}`);
      if (response.status === 204) {
        setInquiries(inquiries.filter(inq => inq._id !== id));
      }
    } catch (err) {
      alert('Deletion failed');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Resolved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'In Progress': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pt-24 pb-20">
      <style>{`
        .glass-card { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.5); }
        .gradient-border { position: relative; border-radius: 2rem; background: linear-gradient(white, white) padding-box, linear-gradient(135deg, #3b82f6, #10b981) border-box; border: 2px solid transparent; }
      `}</style>

      <div className="max-w-5xl mx-auto px-8">
        {/* HEADER */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
            <History size={14} /> Communication Tracking Protocals
          </div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-4">My Inquiries</h1>
          <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto">
            Monitor the resolution lifecycle of your submissions, initiate edits, or withdraw active tickets.
          </p>
        </div>

        {/* LOOKUP PANEL */}
        <section className="mb-12">
          <div className="p-8 lg:p-12 gradient-border bg-white shadow-2xl">
            <form onSubmit={handleLookup} className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative flex-1 w-full">
                <AtSign className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input
                  required
                  type="email"
                  placeholder="Retrieve inquiries via your email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-slate-900 text-lg shadow-inner"
                />
              </div>
              <button
                disabled={loading}
                type="submit"
                className="w-full md:w-auto px-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Interrogating Database...' : <><Search size={18} /> Access Logs</>}
              </button>
            </form>
            {error && <p className="mt-6 text-sm font-bold text-rose-500 flex items-center gap-2"><AlertCircle size={16} /> {error}</p>}
          </div>
        </section>

        {/* INQUIRY LIST */}
        <div className="space-y-6">
          {loading ? (
            <div className="py-20 text-center font-black text-slate-300 uppercase tracking-widest animate-pulse">Synchronizing Data...</div>
          ) : !hasSearched ? (
            <div className="py-24 text-center glass-card rounded-[3rem] border-dashed border-2 border-slate-200">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-6"><AtSign size={32} /></div>
              <h3 className="text-xl font-black text-slate-400">Initialize Identity Verification</h3>
              <p className="text-slate-400 font-medium mt-2">Submit your primary email to retrieve your correspondence history.</p>
            </div>
          ) : inquiries.length === 0 ? (
            <div className="py-24 text-center glass-card rounded-[3rem] border-dashed border-2 border-slate-200">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-6"><MessageSquare size={32} /></div>
              <h3 className="text-xl font-black text-slate-400">No Historical Records Found</h3>
              <p className="text-slate-400 font-medium mt-2">We couldn't find any inquiries associated with this identity.</p>
            </div>
          ) : (
            inquiries.map((inq) => (
              <div key={inq._id} className="group glass-card p-10 rounded-[3rem] border border-slate-100 hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                  <div className="flex items-center gap-4">
                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border tracking-widest ${getStatusStyle(inq.status)}`}>
                      {inq.status}
                    </div>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-tight flex items-center gap-2">
                      <Clock size={12} /> {new Date(inq.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {inq.status === 'Pending' && (
                      <button
                        onClick={() => startEditing(inq)}
                        className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 hover:shadow-lg transition-all"
                      >
                        <Edit3 size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(inq._id)}
                      className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-rose-500 hover:shadow-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {editingId === inq._id ? (
                  <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                    <input
                      type="text"
                      value={editFormData.subject}
                      onChange={(e) => setEditFormData({ ...editFormData, subject: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                    />
                    <textarea
                      rows="4"
                      value={editFormData.message}
                      onChange={(e) => setEditFormData({ ...editFormData, message: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all resize-none"
                    />
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleUpdate(inq._id)}
                        className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 active:scale-95"
                      >
                        <Save size={14} /> Save Modifications
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all active:scale-95"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h4 className="text-2xl font-black text-slate-900 tracking-tight mb-4 group-hover:text-blue-600 transition-colors">
                      {inq.subject}
                    </h4>
                    <p className="text-slate-600 font-medium leading-relaxed mb-8">
                      {inq.message}
                    </p>
                    <div className="flex items-center gap-3 pt-8 border-t border-slate-50 text-slate-400">
                      <AtSign size={14} />
                      <span className="text-xs font-bold tracking-tight">{inq.email}</span>
                      <span className="mx-2">•</span>
                      <User size={14} />
                      <span className="text-xs font-bold tracking-tight">{inq.name}</span>
                    </div>
                  </>
                )}

                {inq.status !== 'Pending' && (
                  <div className="absolute top-0 right-0 p-8 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="px-3 py-1 bg-amber-50 rounded-lg flex items-center gap-2 border border-amber-100">
                      <ShieldAlert className="text-amber-500" size={14} />
                      <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest">Locked for Audit</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* FOOTER AD */}
        <div className="mt-20 p-12 bg-slate-900 rounded-[3.5rem] relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 w-full h-full bg-blue-600/10 blur-[100px]" />
          <h5 className="text-white text-3xl font-black mb-4 relative z-10">Complex Inquiries?</h5>
          <p className="text-slate-400 font-medium mb-10 relative z-10">Our regulatory compliance team can handle PHI and enterprise-level partner requests.</p>
          <div className="flex justify-center relative z-10">
            <button className="px-10 py-4 bg-white text-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95">Open Partner Protocol</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInquiryControl;
