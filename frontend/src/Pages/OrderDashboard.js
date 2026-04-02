import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import {
    Search,
    Filter,
    RefreshCcw,
    CheckCircle,
    XCircle,
    Clock,
    MoreVertical,
    Check,
    Upload,
    StickyNote,
    X
} from 'lucide-react';

const OrderDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pharmacyId, setPharmacyId] = useState('ALL');
    const [showNote, setShowNote] = useState(null);

    const fetchOrders = async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const res = await api.get(`/roms/pharmacy-tasks?pharmacy_id=${pharmacyId}&t=${Date.now()}`);
            setOrders(res.data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            if (!isSilent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        // Add 10s interval for faster "live" updates during testing
        const interval = setInterval(() => {
            fetchOrders(true);
        }, 10000);
        return () => clearInterval(interval);
    }, [pharmacyId]);

    const handleAction = async (orderId, pharmacyIdForOrder, action) => {
        try {
            await api.put(`/roms/${orderId}/process`, {
                action: action,
                pharmacy_id: pharmacyIdForOrder,
                // Removed generic notes to preserve patient's original instructions
            });
            
            fetchOrders(true);
        } catch (error) {
            alert('Failed to update order: ' + (error.response?.data?.message || error.message));
        }
    };

    const getStatusColor = (order) => {
        const isExpired = order.status === 'Pending' && new Date(order.expiry_time) < new Date();
        if (isExpired || order.status === 'Expired') return 'bg-danger/10 text-danger';

        switch (order.status) {
            case 'Pending': return 'bg-warning/10 text-warning';
            case 'Accepted': return 'bg-primary-light/10 text-primary-light';
            case 'Approved': return 'bg-primary-light/10 text-primary-light';
            case 'Ready': return 'bg-success/10 text-success';
            case 'Rejected': return 'bg-danger/10 text-danger';
            case 'Cancelled': return 'bg-slate-100 text-slate-500';
            default: return '';
        }
    };

    const filteredOrders = orders.filter(order => {
        const patientMatch = (order.patient_id || '').toLowerCase().includes(searchTerm.toLowerCase());
        const statusMatch = (order.status || '').toLowerCase().includes(searchTerm.toLowerCase());
        return patientMatch || statusMatch;
    });

    useEffect(() => {
        if (showNote) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [showNote]);

    return (
        <>
            {/* Additional Note Popup (Moved to top level to avoid stacking context issues) */}
            {showNote && (
                <div className="fixed inset-0 w-full h-full bg-black/40 backdrop-blur-[4px] z-[999999] flex items-center justify-center p-4">
                    <div 
                        className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] max-w-[550px] w-full overflow-hidden border border-border-custom relative scale-100 opacity-100"
                        style={{ animation: 'scaleIn 0.2s ease-out' }}
                    >
                        <div className="flex items-center justify-between p-7 px-8 border-b border-border-custom bg-[#f8f9fa]">
                            <div className="flex items-center gap-4">
                                <StickyNote className="text-primary-deep" size={24} />
                                <h3 className="m-0 text-xl font-extrabold text-primary-deep">Additional Notes</h3>
                            </div>
                            <button onClick={() => setShowNote(null)} className="p-2 rounded-lg hover:bg-black/5 text-text-muted transition-all">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-10">
                            <div className="bg-[#f8fbff] p-8 rounded-2xl border border-primary-light/10 min-h-[160px] text-[1.1rem] text-text-main leading-relaxed shadow-inner">
                                {showNote.notes || <span className="italic text-text-muted">No additional instructions provided for this order.</span>}
                            </div>
                            <div className="mt-10 flex justify-end">
                                <button 
                                    onClick={() => setShowNote(null)}
                                    className="bg-primary-deep text-white px-10 py-3.5 rounded-xl font-bold text-lg transition-all hover:bg-[#022c61] shadow-xl"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-12 max-w-[1400px] mx-auto animate-fade-in">
            <nav className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="flex flex-col">
                    <h1 className="text-4xl font-bold mb-1 text-primary-deep">Pharmacy Orders Dashboard</h1>
                    <div className="flex items-center gap-3 mt-2">
                        <p className="m-0 text-sm font-semibold text-text-muted">Managing orders for:</p>
                        <select
                            className="p-1.5 px-3 rounded-lg border-[1.5px] border-border-custom font-bold text-primary-deep bg-[#f1f4f9] cursor-pointer transition-all focus:outline-none focus:border-primary-light focus:bg-white focus:ring-2 focus:ring-primary-light/10"
                            value={pharmacyId}
                            onChange={(e) => setPharmacyId(e.target.value)}
                        >
                            <option value="ALL">🌍 Show All Branches</option>
                            <option value="PHARM-001">Kandy Central Pharmacy</option>
                            <option value="PHARM-002">Galle Fort MedPoint</option>
                            <option value="PHARM-003">Jaffna Community Rx</option>
                            <option value="PHARM-004">Matara Rural Clinic</option>
                        </select>
                    </div>
                </div>
                <div className="flex gap-4 items-center">
                    <button className="w-11 h-11 flex items-center justify-center bg-white border border-border-custom rounded-[10px] text-text-muted transition-all hover:bg-bg-color hover:text-primary-light" onClick={fetchOrders} title="Refresh Dashboard">
                        <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </nav>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 px-8 rounded-custom border border-border-custom flex justify-between items-center shadow-custom">
                    <div className="flex flex-col">
                        <h3 className="text-sm text-text-muted mb-2 font-semibold">Total Orders</h3>
                        <p className="text-4xl font-extrabold m-0 text-primary-deep">{orders.length}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary-deep/10 text-primary-deep">
                        <Clock size={24} />
                    </div>
                </div>
                <div className="bg-white p-6 px-8 rounded-custom border border-border-custom flex justify-between items-center shadow-custom">
                    <div className="flex flex-col">
                        <h3 className="text-sm text-text-muted mb-2 font-semibold">Pending Tasks</h3>
                        <p className="text-4xl font-extrabold m-0 text-primary-deep">{orders.filter(o => o.status === 'Pending').length}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-warning/10 text-warning">
                        <Clock size={24} />
                    </div>
                </div>
                <div className="bg-white p-6 px-8 rounded-custom border border-border-custom flex justify-between items-center shadow-custom">
                    <div className="flex flex-col">
                        <h3 className="text-sm text-text-muted mb-2 font-semibold">Completed Today</h3>
                        <p className="text-4xl font-extrabold m-0 text-primary-deep">{orders.filter(o => o.status === 'Ready').length}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-success/10 text-success">
                        <CheckCircle size={24} />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-custom border border-border-custom shadow-custom overflow-hidden">
                <div className="p-6 px-8 flex flex-col md:flex-row justify-between items-center border-b border-border-custom bg-[#fcfdfe] gap-4">
                    <div className="flex items-center gap-3 bg-[#f1f4f9] p-2.5 px-5 rounded-[10px] w-full md:w-[350px] border border-transparent transition-all focus-within:bg-white focus-within:border-primary-light focus-within:ring-2 focus-within:ring-primary-light/10">
                        <Search size={18} className="text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search orders, patients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border-none bg-transparent outline-none w-full text-[0.95rem] color-text-main"
                        />
                    </div>
                    <div className="flex gap-4">
                        <button className="flex items-center gap-2 bg-white border-[1.5px] border-border-custom p-2.5 px-5 rounded-[10px] font-semibold text-text-main"><Filter size={18} /> Filter</button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr>
                                <th className="p-5 px-8 bg-[#f8fafc] text-text-muted text-[0.8rem] font-bold uppercase tracking-wider border-b border-border-custom">ORDER ID</th>
                                <th className="p-5 px-8 bg-[#f8fafc] text-text-muted text-[0.8rem] font-bold uppercase tracking-wider border-b border-border-custom">PATIENT ID</th>
                                <th className="p-5 px-8 bg-[#f8fafc] text-text-muted text-[0.8rem] font-bold uppercase tracking-wider border-b border-border-custom">REQUEST DATE</th>
                                <th className="p-5 px-8 bg-[#f8fafc] text-text-muted text-[0.8rem] font-bold uppercase tracking-wider border-b border-border-custom">PRIORITY</th>
                                <th className="p-5 px-8 bg-[#f8fafc] text-text-muted text-[0.8rem] font-bold uppercase tracking-wider border-b border-border-custom">STATUS</th>
                                <th className="p-5 px-8 bg-[#f8fafc] text-text-muted text-[0.8rem] font-bold uppercase tracking-wider border-b border-border-custom">EXPIRY</th>
                                <th className="p-5 px-8 bg-[#f8fafc] text-text-muted text-[0.8rem] font-bold uppercase tracking-wider border-b border-border-custom">PRESCRIPTION</th>
                                <th className="p-5 px-8 bg-[#f8fafc] text-text-muted text-[0.8rem] font-bold uppercase tracking-wider border-b border-border-custom">NOTES</th>
                                <th className="p-5 px-8 bg-[#f8fafc] text-text-muted text-[0.8rem] font-bold uppercase tracking-wider border-b border-border-custom">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="9" className="text-center p-16 text-text-muted italic">Loading orders...</td></tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr><td colSpan="9" className="text-center p-16 text-text-muted italic">No orders found</td></tr>
                            ) : filteredOrders.map((order) => (
                                <tr key={order._id}>
                                    <td className="p-5 px-8 border-b border-border-custom text-[0.95rem] font-bold text-primary-light">
                                        #{order._id.substring(order._id.length - 8).toUpperCase()}
                                    </td>
                                    <td className="p-5 px-8 border-b border-border-custom text-[0.95rem] font-medium">
                                        <div className="flex items-center gap-4">
                                            <div className="w-9 h-9 bg-[#edf2f7] text-primary-deep rounded-lg flex items-center justify-center font-bold text-[0.85rem]">{(order.patient_id || '??').substring(0, 2)}</div>
                                            <span>{order.patient_id || 'Unknown'}</span>
                                        </div>
                                    </td>
                                    <td className="p-5 px-8 border-b border-border-custom text-[0.95rem] font-medium">
                                        <div className="font-bold">{order.request_date ? new Date(order.request_date).toLocaleDateString() : 'N/A'}</div>
                                        <div className="text-[0.8rem] text-text-muted">{order.request_date ? new Date(order.request_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                                    </td>
                                    <td className="p-5 px-8 border-b border-border-custom text-[0.95rem] font-medium">
                                        <span className={`font-bold text-[0.75rem] ${
                                            order.priority_level === 'Urgent' ? 'text-warning' : 
                                            order.priority_level === 'Emergency' ? 'text-danger font-extrabold' : 'text-slate-500'
                                        }`}>
                                            {order.priority_level}
                                        </span>
                                    </td>
                                    <td className="p-5 px-8 border-b border-border-custom text-[0.95rem] font-medium">
                                        <span className={`p-1.5 px-3 rounded-full text-[0.8rem] font-bold inline-block ${getStatusColor(order)}`}>
                                            {(order.status === 'Pending' && new Date(order.expiry_time) < new Date()) || order.status === 'Expired' ? 'Expired' : order.status}
                                        </span>
                                    </td>
                                    <td className="p-5 px-8 border-b border-border-custom text-[0.95rem] font-medium">
                                        {order.expiry_time ? new Date(order.expiry_time).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : 'N/A'}
                                    </td>
                                    <td className="p-5 px-8 border-b border-border-custom text-[0.95rem] font-medium">
                                        {order.prescription_image ? (
                                            <a href={order.prescription_image} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary-light hover:underline">
                                                <Upload size={14} /> View
                                            </a>
                                        ) : 'None'}
                                    </td>
                                    <td className="p-5 px-8 border-b border-border-custom text-[0.95rem] font-medium">
                                        <button 
                                            onClick={() => setShowNote(order)}
                                            className="flex items-center gap-1.5 bg-primary-deep/5 text-primary-deep px-3 py-1.5 rounded-lg font-bold text-[0.8rem] transition-all hover:bg-primary-deep hover:text-white"
                                        >
                                            <StickyNote size={14} /> Notes
                                        </button>
                                    </td>
                                    <td className="p-5 px-8 border-b border-border-custom">
                                    <div className="flex gap-2">
                                        {order.status === 'Accepted' && (
                                            
                                                <button
                                                    className="w-[34px] h-[34px] rounded-lg border-none flex items-center justify-center transition-all cursor-pointer bg-success/10 text-success hover:bg-success hover:text-white"
                                                    title="Approve"
                                                    onClick={() => handleAction(order._id, order.pharmacy_id, 'Approve')}
                                                >
                                                    <Check size={16} />
                                                </button>
                                                
                                                )}
                                            {order.status === 'Approved' && (
                                            
                                                <button
                                                    className="w-[34px] h-[34px] rounded-lg border-none flex items-center justify-center transition-all cursor-pointer bg-primary-light/10 text-primary-light hover:bg-primary-light hover:text-white"
                                                    title="Payment Verification"
                                                    onClick={() => alert('Payment verification initiated for order: ' + order._id)}
                                                >
                                                    <CheckCircle size={16} />
                                                </button>
                                            
                                            )}
                                            </div>
                                        {['Ready', 'Rejected', 'Cancelled', 'Expired'].includes(order.status) && (
                                            <button className="bg-transparent border-none text-slate-300 cursor-default"><MoreVertical size={16} /></button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </>
    );
};

export default OrderDashboard;
