import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './OrderDashboard.css';
import {
    Search,
    Filter,
    RefreshCcw,
    CheckCircle,
    XCircle,
    Clock,
    FileText,
    MoreVertical,
    Check,
    Upload
} from 'lucide-react';

const OrderDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pharmacyId, setPharmacyId] = useState('PHARM-001'); // Mock Admin Pharmacy ID

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/roms/pharmacy-tasks?pharmacy_id=${pharmacyId}`);
            setOrders(res.data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [pharmacyId]);

    const handleAction = async (id, action) => {
        try {
            await api.put(`/roms/${id}/process`, {
                action: action,
                pharmacy_id: pharmacyId,
                notes: `Action ${action} performed by admin.`
            });
            fetchOrders();
        } catch (error) {
            alert('Failed to update order: ' + (error.response?.data?.message || error.message));
        }
    };

    const getStatusColor = (order) => {
        const isExpired = order.status === 'Pending' && new Date(order.expiry_time) < new Date();
        if (isExpired || order.status === 'Expired') return 'status-rejected'; // Use red for expired

        switch (order.status) {
            case 'Pending': return 'status-pending';
            case 'Approved': return 'status-approved';
            case 'Ready': return 'status-ready';
            case 'Rejected': return 'status-rejected';
            case 'Cancelled': return 'status-cancelled';
            default: return '';
        }
    };

    const filteredOrders = orders.filter(order => {
        const patientMatch = (order.patient_id || '').toLowerCase().includes(searchTerm.toLowerCase());
        const statusMatch = (order.status || '').toLowerCase().includes(searchTerm.toLowerCase());
        return patientMatch || statusMatch;
    });

    return (
        <div className="dashboard-container">
            <nav className="dashboard-header">
                <div className="dashboard-title">
                    <h1>Pharmacy Orders Dashboard</h1>
                    <div className="pharmacy-selector-group">
                        <p>Managing orders for:</p>
                        <select
                            className="pharmacy-select-admin"
                            value={pharmacyId}
                            onChange={(e) => setPharmacyId(e.target.value)}
                        >
                            <option value="PHARM-001">Kandy Central Pharmacy</option>
                            <option value="PHARM-002">Galle Fort MedPoint</option>
                            <option value="PHARM-003">Jaffna Community Rx</option>
                            <option value="PHARM-004">Matara Rural Clinic</option>
                        </select>
                    </div>
                </div>
                <div className="dashboard-actions">
                    <button className="btn-icon" onClick={fetchOrders} title="Refresh Dashboard">
                        <RefreshCcw size={18} className={loading ? 'spinning' : ''} />
                    </button>
                </div>
            </nav>

            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-info">
                        <h3>Total Orders</h3>
                        <p className="stat-number">{orders.length}</p>
                    </div>
                    <div className="stat-icon blue">
                        <Clock size={24} />
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <h3>Pending Tasks</h3>
                        <p className="stat-number">{orders.filter(o => o.status === 'Pending').length}</p>
                    </div>
                    <div className="stat-icon orange">
                        <Clock size={24} />
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <h3>Completed Today</h3>
                        <p className="stat-number">{orders.filter(o => o.status === 'Ready').length}</p>
                    </div>
                    <div className="stat-icon green">
                        <CheckCircle size={24} />
                    </div>
                </div>
            </div>

            <div className="table-card">
                <div className="table-controls">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search orders, patients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-actions">
                        <button className="btn-filter"><Filter size={18} /> Filter</button>
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>PATIENT ID</th>
                                <th>REQUEST DATE</th>
                                <th>PRIORITY</th>
                                <th>STATUS</th>
                                <th>EXPIRY</th>
                                <th>PRESCRIPTION</th>
                                <th>NOTES</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="8" className="loading-row">Loading orders...</td></tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr><td colSpan="8" className="empty-row">No orders found</td></tr>
                            ) : filteredOrders.map((order) => (
                                <tr key={order._id}>
                                    <td className="patient-cell">
                                        <div className="patient-avatar">{order.patient_id.substring(0, 2)}</div>
                                        <span>{order.patient_id}</span>
                                    </td>
                                    <td className="date-cell">
                                        <div className="main-val">{new Date(order.request_date).toLocaleDateString()}</div>
                                        <div className="sub-val">{new Date(order.request_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </td>
                                    <td>
                                        <span className={`priority-badge ${order.priority_level.toLowerCase()}`}>
                                            {order.priority_level}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getStatusColor(order)}`}>
                                            {(order.status === 'Pending' && new Date(order.expiry_time) < new Date()) || order.status === 'Expired' ? 'Expired' : order.status}
                                        </span>
                                    </td>
                                    <td className="expiry-cell">
                                        {new Date(order.expiry_time).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                                    </td>
                                    <td>
                                        {order.prescription_image ? (
                                            <a href={order.prescription_image} target="_blank" rel="noopener noreferrer" className="view-link">
                                                <Upload size={14} /> View
                                            </a>
                                        ) : 'None'}
                                    </td>
                                    <td>
                                        <div className="notes-preview" title={order.notes}>
                                            {order.notes || <span className="no-notes">No notes</span>}
                                        </div>
                                    </td>
                                    <td className="actions-cell">
                                        {order.status === 'Pending' && (
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-success-sm"
                                                    title="Approve"
                                                    onClick={() => handleAction(order._id, 'Approve')}
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button
                                                    className="btn-danger-sm"
                                                    title="Reject"
                                                    onClick={() => handleAction(order._id, 'Reject')}
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            </div>
                                        )}
                                        {order.status === 'Approved' && (
                                            <button
                                                className="btn-ready"
                                                onClick={() => handleAction(order._id, 'Ready')}
                                            >
                                                Mark as Ready
                                            </button>
                                        )}
                                        {['Ready', 'Rejected', 'Cancelled', 'Expired'].includes(order.status) && (
                                            <button className="btn-disabled"><MoreVertical size={16} /></button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OrderDashboard;
