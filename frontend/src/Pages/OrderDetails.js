import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { romsAPI } from '../utils/apiEndpoints';
import {
    Clock,
    CreditCard,
    ArrowRight,
    MapPin,
    Calendar,
    Stethoscope,
    FileText,
    CheckCircle2,
    XCircle,
    Info,
    AlertCircle,
    Loader2
} from 'lucide-react';

const OrderDetails = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [patientId, setPatientId] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Get logged-in user ID from userInfo (same as ProfilePage and OrderForm)
        let userId = '';
        const savedUserInfo = localStorage.getItem('userInfo');
        if (savedUserInfo) {
            const parsed = JSON.parse(savedUserInfo);
            const user = parsed.user || parsed;
            userId = user._id || user.id || '';
        }
        
        if (userId) {
            setPatientId(userId);
        } else {
            // No user logged in
            setLoading(false);
            // Optionally redirect to login page
            // navigate('/auth?mode=login');
        }
    }, []);

    const fetchMyOrders = async () => {
        if (!patientId) {
            console.log('No patient ID found, cannot fetch orders');
            return;
        }
        setLoading(true);
        try {
            console.log(`Fetching orders for patient: ${patientId}`);
            const res = await romsAPI.getRequestsByPatientId(patientId);
            console.log('Orders fetched:', res.data);
            setOrders(res.data || []);
        } catch (error) {
            console.error('Failed to fetch user orders:', error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (patientId) {
            fetchMyOrders();
        }
    }, [patientId]);

    const handlePayment = (orderId) => {
        navigate(`/payment?id=${orderId}`);
    };

    const handleDelete = async (orderId) => {
        if (!window.confirm('Are you sure you want to delete this order?')) return;
        try {
            await romsAPI.deleteRequest(orderId);
            fetchMyOrders();
        } catch (error) {
            alert('Failed to delete order: ' + (error.response?.data?.message || error.message));
        }
    };

    const pharmacyMap = {
        'PHARM-001': 'Kandy Central Pharmacy',
        'PHARM-002': 'Galle Fort MedPoint',
        'PHARM-003': 'Jaffna Community Rx',
        'PHARM-004': 'Matara Rural Clinic'
    };

    const getStatusInfo = (status, expiryTime) => {
        const isExpired = status === 'Pending' && new Date(expiryTime) < new Date();

        if (isExpired) {
            return { color: 'text-danger', bg: 'bg-danger/10', icon: <AlertCircle size={16} />, label: 'Expired' };
        }

        switch (status) {
            case 'Pending': return { color: 'text-warning', bg: 'bg-warning/10', icon: <Clock size={16} />, label: 'Under Review' };
            case 'Approved': return { color: 'text-primary-light', bg: 'bg-primary-light/10', icon: <CheckCircle2 size={16} />, label: 'Approved' };
            case 'Ready': return { color: 'text-success', bg: 'bg-success/10', icon: <CheckCircle2 size={16} />, label: 'Ready for Payment' };
            case 'VerificationPending': return { color: 'text-warning', bg: 'bg-warning/10', icon: <Clock size={16} />, label: 'Verification Pending' };
            case 'Rejected': return { color: 'text-danger', bg: 'bg-danger/10', icon: <XCircle size={16} />, label: 'Rejected' };
            case 'Cancelled': return { color: 'text-text-muted', bg: 'bg-slate-100', icon: <XCircle size={16} />, label: 'Cancelled' };
            case 'Expired': return { color: 'text-danger', bg: 'bg-danger/10', icon: <AlertCircle size={16} />, label: 'Expired' };
            default: return { color: 'text-text-main', bg: 'bg-slate-100', icon: <Clock size={16} />, label: status };
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto my-12 px-6 animate-fade-in">
            <div className="mb-10">
                <h1 className="text-4xl font-bold mb-2 text-primary-deep">My Medication Orders</h1>
                <p className="text-text-muted text-lg">
                    {patientId ? `Track your medication requests and complete payments for prepared orders.` : 'Please log in to view your orders.'}
                </p>
                {patientId && (
                    <div className="mt-2 text-sm text-text-muted">
                        Patient ID: {patientId}
                    </div>
                )}
            </div>

            {!patientId ? (
                <div className="col-span-full text-center py-20 bg-white rounded-custom border border-border-custom border-dashed flex flex-col items-center gap-4">
                    <AlertCircle size={48} className="text-slate-300" />
                    <h3 className="text-2xl font-bold text-primary-deep m-0">Authentication Required</h3>
                    <p className="text-text-muted mb-6">Please log in to view your medication orders.</p>
                    <button className="flex items-center gap-2 bg-primary-deep text-white py-3 px-6 rounded-lg font-bold transition-all hover:bg-[#022c61]" onClick={() => navigate('/auth?mode=login')}>
                        Log In to View Orders
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full text-center py-20 bg-white rounded-custom border border-border-custom border-dashed flex flex-col items-center gap-4">
                            <Loader2 className="animate-spin text-primary-deep" size={32} />
                            <p className="text-text-muted">Loading your orders...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="col-span-full text-center py-20 bg-white rounded-custom border border-border-custom border-dashed flex flex-col items-center gap-4">
                            <FileText size={48} className="text-slate-300" />
                            <h3 className="text-2xl font-bold text-primary-deep m-0">No orders found</h3>
                            <p className="text-text-muted mb-6">You haven't submitted any medication requests yet.</p>
                            <button className="flex items-center gap-2 bg-primary-deep text-white py-3 px-6 rounded-lg font-bold transition-all hover:bg-[#022c61]" onClick={() => navigate('/medicineshop')}>
                                Place New Order
                            </button>
                        </div>
                    ) : (
                        orders.map((order) => {
                            const statusInfo = getStatusInfo(order.status, order.expiry_time);
                            return (
                                <div key={order._id} className="bg-white border border-border-custom rounded-custom shadow-custom p-6 transition-all duration-300 flex flex-col hover:-translate-y-2 hover:shadow-2xl hover:border-primary-light">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex flex-col">
                                            <span className="text-[0.75rem] font-extrabold text-text-muted tracking-wider mb-1 uppercase">REQUEST ID</span>
                                            <span className="font-mono font-bold text-primary-deep text-sm md:text-base">#{order._id.substring(order._id.length - 8).toUpperCase()}</span>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className={`p-1.5 px-3 rounded-full text-[0.75rem] font-bold flex items-center gap-2 ${statusInfo.bg} ${statusInfo.color}`}>
                                                {statusInfo.icon}
                                                <span>{statusInfo.label}</span>
                                            </div>
                                            {order.status === 'Pending' && new Date(order.expiry_time) > new Date() && (
                                                <div className="flex gap-2">
                                                    <button
                                                        className="bg-transparent border border-primary-light text-primary-light py-1 px-3 rounded-md text-[0.75rem] font-bold flex items-center gap-1.5 cursor-pointer transition-all hover:bg-primary-light hover:text-white"
                                                        onClick={(e) => { e.stopPropagation(); navigate(`/orderform?id=${order._id}`); }}
                                                        title="Edit Order"
                                                    >
                                                        <Info size={14} /> Edit  
                                                    </button>
                                                    <button
                                                        className="bg-transparent border border-danger text-danger py-1 px-3 rounded-md text-[0.75rem] font-bold flex items-center gap-1.5 cursor-pointer transition-all hover:bg-danger hover:text-white"
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(order._id); }}
                                                        title="Delete Order"
                                                    >
                                                        <XCircle size={14} /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-grow">
                                        <div className="flex items-center gap-4 text-text-muted mt-4">
                                            <MapPin size={18} className="text-primary-light opacity-80" />
                                            <div className="flex flex-col">
                                                <span className="text-[0.8rem] font-semibold text-text-muted">Pharmacy</span>
                                                <span className="font-semibold text-text-main text-[0.9rem]">{pharmacyMap[order.pharmacy_id] || order.pharmacy_id || 'Not Assigned'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-text-muted mt-4">
                                            <Calendar size={18} className="text-primary-light opacity-80" />
                                            <div className="flex flex-col">
                                                <span className="text-[0.8rem] font-semibold text-text-muted">Date Submitted</span>
                                                <span className="font-semibold text-text-main text-[0.9rem]">
                                                    {new Date(order.request_date).toLocaleDateString()} at {new Date(order.request_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-text-muted mt-4">
                                            <Stethoscope size={18} className="text-primary-light opacity-80" />
                                            <div className="flex flex-col">
                                                <span className="text-[0.8rem] font-semibold text-text-muted">Priority Level</span>
                                                <span className={`font-semibold text-[0.9rem] ${order.priority_level === 'Emergency' ? 'text-danger' : 'text-text-main'}`}>
                                                    {order.priority_level}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-text-muted mt-4">
                                            <CreditCard size={18} className="text-primary-light opacity-80" />
                                            <div className="flex flex-col">
                                                <span className="text-[0.8rem] font-semibold text-text-muted">Total Amount</span>
                                                <span className="font-semibold text-[0.9rem] text-primary-deep">
                                                    LKR {order.total_amount?.toLocaleString() || '0'}
                                                </span>
                                            </div>
                                        </div>

                                        {order.notes && (
                                            <div className="mt-4 bg-[#f8fafc] p-3 px-4 rounded-lg border-l-[3px] border-primary-light">
                                                <span className="text-[0.8rem] font-semibold text-text-muted">Additional Notes:</span>
                                                <p className="text-[0.85rem] mt-1.5 leading-relaxed text-text-muted">{order.notes}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 mt-4 border-t border-border-custom">
                                        {(order.status === 'Approved' || order.status === 'Ready') ? (
                                            <button className="w-full flex items-center justify-center gap-3 bg-primary-light text-white p-4 rounded-[10px] font-bold text-base transition-all hover:bg-primary-deep hover:-translate-y-0.5 hover:shadow-lg [&>svg:last-child]:hover:translate-x-1" 
                                            onClick={() => navigate(`/payment?orderId=${order._id}`)}>
                                                <CreditCard size={18} />
                                                <span>Proceed to Payment</span>
                                                <ArrowRight size={16} />
                                            </button>
                                        ) : (order.status === 'Pending' && new Date(order.expiry_time) > new Date()) ? (
                                            <div className="flex items-center justify-center gap-2.5 font-semibold text-[0.85rem] p-3 rounded-lg bg-warning/5 text-warning">
                                                <Clock size={16} />
                                                <span>Waiting for pharmacist approval</span>
                                            </div>
                                        ) : (order.status === 'Rejected') ? (
                                            <div className="flex items-center justify-center gap-2.5 font-semibold text-[0.85rem] p-3 rounded-lg bg-danger/5 text-danger">
                                                <XCircle size={16} />
                                                <span>Rejected</span>
                                            </div>
                                        ) : (order.status === 'Approved') ? (
                                            <div className="flex items-center justify-center gap-2.5 font-semibold text-[0.85rem] p-3 rounded-lg bg-success/5 text-success">
                                                <CheckCircle2 size={16} />
                                                <span>Approved</span>
                                            </div>
                                        ) : (order.status === 'Pending' && new Date(order.expiry_time) < new Date()) || order.status === 'Expired' ? (
                                            <div className="flex items-center justify-center gap-2.5 font-semibold text-[0.85rem] p-3 rounded-lg bg-danger/5 text-danger">
                                                <AlertCircle size={16} />
                                                <span>Expired</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-2.5 font-semibold text-[0.85rem] p-3 rounded-lg bg-slate-50 text-text-muted">
                                                <Info size={16} />
                                                <span>No further actions required</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

export default OrderDetails;
