import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './PaymentUI.css';
import {
    CreditCard,
    ShieldCheck,
    Lock,
    ChevronLeft,
    CheckCircle2,
    ReceiptText,
    Wallet
} from 'lucide-react';

const PaymentUI = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paid, setPaid] = useState(false);
    const [cvcVisible, setCvcVisible] = useState(false);

    const fetchOrder = async () => {
        if (!orderId) {
            setLoading(false);
            return;
        }
        try {
            const res = await api.get(`/roms/request/${orderId}`);
            setOrder(res.data);
        } catch (error) {
            console.error('Error fetching order for payment:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    const handlePayment = (e) => {
        e.preventDefault();
        // Simulate payment process
        setTimeout(() => {
            setPaid(true);
        }, 1500);
    };

    if (loading) return <div className="payment-loading">Loading secure checkout...</div>;

    if (paid) {
        return (
            <div className="payment-success-card">
                <CheckCircle2 color="var(--success)" size={64} />
                <h2>Payment Successful!</h2>
                <p>Your order #{orderId?.substring(orderId.length - 8).toUpperCase()} is now being processed for delivery.</p>
                <div className="receipt-summary">
                    <div className="sum-row">
                        <span>Transaction ID</span>
                        <span>TRX-{Math.random().toString(36).substring(7).toUpperCase()}</span>
                    </div>
                </div>
                <button className="btn-primary" onClick={() => navigate('/order-details')}>
                    Back to My Orders
                </button>
            </div>
        );
    }

    return (
        <div className="payment-page">
            <button className="btn-back" onClick={() => navigate(-1)}>
                <ChevronLeft size={18} />
                Back
            </button>

            <div className="payment-layout">
                <div className="payment-main">
                    <div className="payment-section-card">
                        <div className="section-header">
                            <CreditCard size={20} className="header-icon" />
                            <h3>Payment Method</h3>
                        </div>

                        <form className="payment-form" onSubmit={handlePayment}>
                            <div className="card-selector">
                                <div className="card-option active">
                                    <div className="card-radio"></div>
                                    <span className="card-name">Credit / Debit Card</span>
                                    <div className="card-logos">
                                        <div className="logo visa"></div>
                                        <div className="logo master"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group full">
                                <label>Cardholder Name</label>
                                <input type="text" placeholder="John Doe" required />
                            </div>

                            <div className="form-group full">
                                <label>Card Number</label>
                                <input type="text" placeholder="0000 0000 0000 0000" required />
                            </div>

                            <div className="form-row">
                                <div className="form-group half">
                                    <label>Expiry Date</label>
                                    <input type="text" placeholder="MM / YY" required />
                                </div>
                                <div className="form-group half cvc-group">
                                    <label>CVC / CVV</label>
                                    <input type={cvcVisible ? 'text' : 'password'} placeholder="***" required />
                                    <button
                                        type="button"
                                        className="btn-toggle-cvc"
                                        onClick={() => setCvcVisible(!cvcVisible)}
                                    >
                                        <Lock size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="security-notice">
                                <ShieldCheck size={16} />
                                <span>Your transaction is encrypted and secure</span>
                            </div>

                            <button type="submit" className="btn-pay-now">
                                <Wallet size={18} />
                                Confirm & Pay LKR 2,450.00
                            </button>
                        </form>
                    </div>
                </div>

                <div className="payment-sidebar">
                    <div className="order-summary-card">
                        <div className="section-header">
                            <ReceiptText size={20} className="header-icon" />
                            <h3>Order Summary</h3>
                        </div>
                        <div className="summary-details">
                            <div className="summary-item">
                                <span className="item-label">Request ID</span>
                                <span className="item-value">#{orderId?.substring(orderId.length - 8).toUpperCase()}</span>
                            </div>
                            <div className="summary-item">
                                <span className="item-label">Status</span>
                                <span className={`item-value status-${order?.status?.toLowerCase()}`}>{order?.status}</span>
                            </div>
                            <div className="summary-item">
                                <span className="item-label">Priority</span>
                                <span className="item-value">{order?.priority_level}</span>
                            </div>
                            <hr className="divider" />
                            <div className="summary-total">
                                <span>Total Payable</span>
                                <span>LKR 2,450.00</span>
                            </div>
                        </div>
                        <div className="promo-box">
                            <input type="text" placeholder="Promo Code" />
                            <button>Apply</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentUI;
