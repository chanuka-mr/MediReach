import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './OrderDetails.css';
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
    AlertCircle
} from 'lucide-react';

const OrderDetails = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [patientId, setPatientId] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const storedId = localStorage.getItem('mediReach_patientId');
        if (storedId) {
            setPatientId(storedId);
        } else {
            setLoading(false); // No patient ID means no orders yet
        }
    }, []);

    const fetchMyOrders = async () => {
        if (!patientId) return;
        setLoading(true);
        try {
            const res = await api.get(`/roms/request?patient_id=${patientId}`);
            setOrders(res.data);
        } catch (error) {
            console.error('Failed to fetch user orders:', error);
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
            await api.delete(`/roms/request/${orderId}`);
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
            return { color: 'var(--danger)', icon: <AlertCircle size={16} />, label: 'Expired' };
        }

        switch (status) {
            case 'Pending': return { color: 'var(--warning)', icon: <Clock size={16} />, label: 'Under Review' };
            case 'Approved': return { color: 'var(--primary-light)', icon: <CheckCircle2 size={16} />, label: 'Approved' };
            case 'Ready': return { color: 'var(--success)', icon: <CheckCircle2 size={16} />, label: 'Ready for Payment' };
            case 'Rejected': return { color: 'var(--danger)', icon: <XCircle size={16} />, label: 'Rejected' };
            case 'Cancelled': return { color: 'var(--text-muted)', icon: <XCircle size={16} />, label: 'Cancelled' };
            case 'Expired': return { color: 'var(--danger)', icon: <AlertCircle size={16} />, label: 'Expired' };
            default: return { color: 'var(--text-main)', icon: <Clock size={16} />, label: status };
        }
    };

    return (
        <div className="page-container">
            <div className="header-section">
                <h1>My Medication Orders</h1>
                <p>Track your medication requests and complete payments for prepared orders.</p>
            </div>

            <div className="orders-grid">
                {loading ? (
                    <div className="loading-state">
                        <RefreshCcw className="spinning" size={32} />
                        <p>Locating your records...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="empty-state">
                        <FileText size={48} />
                        <h3>No orders found</h3>
                        <p>You haven't submitted any medication requests yet.</p>
                        <button className="btn-primary" onClick={() => navigate('/order-form')}>
                            Place New Order
                        </button>
                    </div>
                ) : (
                    orders.map((order) => {
                        const statusInfo = getStatusInfo(order.status, order.expiry_time);
                        return (
                            <div key={order._id} className="order-item-card">
                                <div className="order-item-header">
                                    <div className="order-id-group">
                                        <span className="order-label">REQUEST ID</span>
                                        <span className="order-id">#{order._id.substring(order._id.length - 8).toUpperCase()}</span>
                                    </div>
                                    <div className="order-status-group">
                                        <div className="order-status" style={{ backgroundColor: `${statusInfo.color}15`, color: statusInfo.color }}>
                                            {statusInfo.icon}
                                            <span>{statusInfo.label}</span>
                                        </div>
                                        {order.status === 'Pending' && new Date(order.expiry_time) > new Date() && (
                                            <div className="action-button-group">
                                                <button
                                                    className="edit-button-inline"
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/order-form?id=${order._id}`); }}
                                                    title="Edit Order"
                                                >
                                                    <Info size={14} /> Edit
                                                </button>
                                                <button
                                                    className="delete-button-inline"
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(order._id); }}
                                                    title="Delete Order"
                                                >
                                                    <XCircle size={14} /> Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="order-item-body">
                                    <div className="info-row">
                                        <MapPin size={18} />
                                        <div className="info-text">
                                            <span className="info-label">Pharmacy</span>
                                            <span className="info-value">{pharmacyMap[order.pharmacy_id] || order.pharmacy_id || 'Not Assigned'}</span>
                                        </div>
                                    </div>
                                    <div className="info-row">
                                        <Calendar size={18} />
                                        <div className="info-text">
                                            <span className="info-label">Date Submitted</span>
                                            <span className="info-value">
                                                {new Date(order.request_date).toLocaleDateString()} at {new Date(order.request_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="info-row">
                                        <Stethoscope size={18} />
                                        <div className="info-text">
                                            <span className="info-label">Priority Level</span>
                                            <span className="info-value" style={{ color: order.priority_level === 'Emergency' ? 'var(--danger)' : 'inherit' }}>
                                                {order.priority_level}
                                            </span>
                                        </div>
                                    </div>

                                    {order.notes && (
                                        <div className="notes-box">
                                            <span className="info-label">Additional Notes:</span>
                                            <p className="notes-text text-muted">{order.notes}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="order-item-footer">
                                    {(order.status === 'Approved' || order.status === 'Ready') ? (
                                        <button className="btn-payment-action" onClick={() => handlePayment(order._id)}>
                                            <CreditCard size={18} />
                                            <span>Proceed to Payment</span>
                                            <ArrowRight size={16} />
                                        </button>
                                    ) : (order.status === 'Pending' && new Date(order.expiry_time) > new Date()) ? (
                                        <div className="status-notice warning">
                                            <Clock size={16} />
                                            <span>Waiting for pharmacist approval</span>
                                        </div>
                                    ) : (order.status === 'Rejected') ? (
                                        <div className="status-notice danger">
                                            <XCircle size={16} />
                                            <span>Rejected</span>
                                        </div>
                                    ) : (order.status === 'Approved') ? (
                                        <div className="status-notice success">
                                            <CheckCircle2 size={16} />
                                            <span>Approved</span>
                                        </div>
                                    ) : (order.status === 'Pending' && new Date(order.expiry_time) < new Date()) || order.status === 'Expired' ? (
                                        <div className="status-notice danger">
                                            <AlertCircle size={16} />
                                            <span>Expired</span>
                                        </div>
                                    ) : (
                                        <div className="status-notice muted">
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
        </div>
    );
};

const RefreshCcw = ({ className, size }) => (
    <div className={className} style={{ width: size, height: size, border: '4px solid #f3f3f3', borderTop: '4px solid #023E8A', borderRadius: '50%', animation: 'spin 2s linear infinite' }}>
        <style>{`
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            .spinning { margin-bottom: 1rem; }
        `}</style>
    </div>
);

export default OrderDetails;
