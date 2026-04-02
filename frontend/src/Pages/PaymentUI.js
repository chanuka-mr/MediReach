import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import {
    CreditCard,
    ShieldCheck,
    Lock,
    ChevronLeft,
    CheckCircle2,
    ReceiptText,
    Wallet,
    AlertCircle,
    MapPin,
    Calendar,
    Stethoscope
} from 'lucide-react';

const PaymentUI = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paid, setPaid] = useState(false);
    const [cvcVisible, setCvcVisible] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

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
    

    const handlePayment = async (e) => {
        e.preventDefault();
        
        try {
            // Update order status to VerificationPending
            await api.put(`/roms/${orderId}/process`, {
                action: 'payment',
                status: 'VerificationPending'
            });
            
            setPaid(true);
        } catch (error) {
            console.error('Error updating order status:', error);
            setMessage({ type: 'danger', text: 'Payment processing failed. Please try again.' });
        }
    };

    // Get total amount from order (stored in database)
    const totalAmount = order?.total_amount || 0;

    // Format date from database
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) return <div className="text-center py-40 font-semibold text-primary-deep">Loading secure checkout...</div>;

    if (paid) {
        return (
            <div className="max-w-[500px] mx-auto my-[100px] text-center bg-white p-16 rounded-custom shadow-custom flex flex-col items-center gap-6 animate-fade-in">
                <CheckCircle2 className="text-success" size={64} />
                <h2 className="text-3xl font-bold m-0">Payment Successful!</h2>
                <p className="text-text-muted text-lg">Your order #{orderId?.substring(orderId.length - 8).toUpperCase()} is now being processed for delivery.</p>
                <div className="w-full bg-bg-color p-5 rounded-xl mb-4">
                    <div className="flex justify-between text-sm font-semibold text-text-muted mb-2">
                        <span>Amount Paid</span>
                        <span className="text-primary-deep font-bold text-base">LKR {totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold text-text-muted">
                        <span>Transaction ID</span>
                        <span>TRX-{Math.random().toString(36).substring(7).toUpperCase()}</span>
                    </div>
                </div>
                <button className="flex items-center gap-2 bg-primary-deep text-white py-3 px-6 rounded-lg font-bold transition-all hover:bg-[#022c61]" onClick={() => navigate('/order-details')}>
                    Back to My Orders
                </button>
            </div>
        );
    }

    const inputClasses = "p-3.5 px-5 border-[1.5px] border-border-custom rounded-[10px] text-base transition-all bg-[#fafbfc] focus:outline-none focus:border-primary-light focus:ring-4 focus:ring-primary-light/5 focus:bg-white";

    return (
        <div className="max-w-[1200px] mx-auto my-8 px-6 animate-fade-in">
            {/* Amount Banner */}
            <div className="bg-gradient-to-r from-primary-deep to-primary-light text-white p-6 rounded-xl mb-6 shadow-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <Wallet size={24} />
                        </div>
                        <div>
                            <p className="text-sm opacity-90 mb-1">Total Amount Due</p>
                            <h2 className="text-3xl font-bold">LKR {totalAmount.toLocaleString()}</h2>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm opacity-90">Order #{orderId?.substring(orderId.length - 8).toUpperCase()}</p>
                        <p className="text-xs opacity-75">Secure Payment</p>
                    </div>
                </div>
            </div>

            <button className="bg-transparent border-none flex items-center gap-2 font-bold text-text-muted cursor-pointer mb-8 p-2 rounded-lg transition-all hover:bg-white hover:text-primary-deep" onClick={() => navigate(-1)}>
                <ChevronLeft size={18} />
                Back
            </button>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="flex-[1.5] w-full">
                    <div className="bg-white border border-border-custom rounded-custom shadow-custom p-8">
                        <div className="flex items-center gap-4 mb-8 border-b border-border-custom pb-5">
                            <CreditCard size={20} className="text-primary-light" />
                            <div className="flex flex-col">
                                <h3 className="text-xl font-bold m-0 text-primary-deep">Payment Method</h3>
                                <span className="text-sm text-text-muted">Complete your payment of <span className="font-bold text-primary-deep">LKR {totalAmount.toLocaleString()}</span></span>
                            </div>
                        </div>

                        <form className="flex flex-col" onSubmit={handlePayment}>
                            {message.text && (
                                <div className={`flex items-center gap-2 p-3 rounded-lg mb-6 text-sm font-semibold ${
                                    message.type === 'danger' ? 'bg-danger/10 text-danger border border-danger/20' : 'bg-success/10 text-success border border-success/20'
                                }`}>
                                    <AlertCircle size={16} />
                                    {message.text}
                                </div>
                            )}
                            <div className="mb-8">
                                <div className="flex items-center gap-4 p-5 border-2 border-primary-light rounded-xl bg-primary-light/5 relative">
                                    <div className="w-[22px] h-[22px] border-2 border-primary-light rounded-full relative after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-3 after:h-3 after:bg-primary-light after:rounded-full"></div>
                                    <span className="font-bold text-text-main flex-grow">Credit / Debit Card</span>
                                    <div className="flex gap-2">
                                        <div className="w-10 h-6 bg-slate-100 rounded bg-contain bg-no-repeat bg-center" style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/d/d6/Visa_2021.svg')" }}></div>
                                        <div className="w-10 h-6 bg-slate-100 rounded bg-contain bg-no-repeat bg-center" style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg')" }}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-5 flex flex-col gap-2">
                                <label className="font-semibold text-sm text-text-muted">Cardholder Name</label>
                                <input 
                                    type="text" 
                                    name="cardholderName"
                                    placeholder="John Doe" 
                                    required 
                                    autoComplete="off"
                                    data-lpignore="true"
                                    className={inputClasses} 
                                />
                            </div>

                            <div className="mb-5 flex flex-col gap-2">
                                <label className="font-semibold text-sm text-text-muted">Card Number</label>
                                <input 
                                    type="text" 
                                    name="cardNumber"
                                    placeholder="0000 0000 0000 0000" 
                                    required 
                                    autoComplete="off"
                                    data-lpignore="true"
                                    className={inputClasses} 
                                />
                            </div>

                            <div className="flex gap-6 mb-6">
                                <div className="flex-1 flex flex-col gap-2">
                                    <label className="font-semibold text-sm text-text-muted">Expiry Date</label>
                                    <input 
                                        type="text" 
                                        name="expiryDate"
                                        placeholder="MM / YY" 
                                        required 
                                        autoComplete="off"
                                        data-lpignore="true"
                                        className={inputClasses} 
                                    />
                                </div>
                                <div className="flex-1 flex flex-col gap-2 relative">
                                    <label className="font-semibold text-sm text-text-muted">CVC / CVV</label>
                                    <input 
                                        type={cvcVisible ? 'text' : 'password'} 
                                        name="cvc"
                                        placeholder="***" 
                                        required 
                                        autoComplete="off"
                                        data-lpignore="true"
                                        className={inputClasses} 
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-4 top-[38px] bg-transparent border-none text-slate-300 cursor-pointer"
                                        onClick={() => setCvcVisible(!cvcVisible)}
                                    >
                                        <Lock size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-2.5 p-4 bg-success/5 text-success rounded-xl border border-success/10 text-sm font-semibold mb-8">
                                <ShieldCheck size={16} />
                                <span>Your transaction is encrypted and secure</span>
                            </div>

                            <button type="submit" className="w-full flex flex-col items-center justify-center gap-1 bg-primary-deep text-white p-4 rounded-xl font-bold text-lg cursor-pointer transition-all shadow-lg hover:bg-[#022c61] hover:-translate-y-0.5 hover:shadow-xl">
                                <div className="flex items-center gap-3">
                                    <Wallet size={18} />
                                    <span>Confirm & Pay</span>
                                </div>
                                <span className="text-sm font-semibold opacity-90">LKR {totalAmount.toLocaleString()}</span>
                            </button>
                        </form>
                    </div>
                </div>

                <div className="flex-1 w-full order-first lg:order-last">
                    <div className="bg-white border border-border-custom rounded-custom shadow-custom p-8">
                        <div className="flex items-center gap-4 mb-8 border-b border-border-custom pb-5">
                            <ReceiptText size={20} className="text-primary-light" />
                            <h3 className="text-xl font-bold m-0 text-primary-deep">Order Summary</h3>
                        </div>
                        
                        {/* Medicines Breakdown */}
                        {order?.medicines && order.medicines.length > 0 && (
                            <div className="mb-4 bg-[#f8fafc] p-4 rounded-lg">
                                <h4 className="text-sm font-bold text-text-muted mb-3 uppercase tracking-wider">Medicines</h4>
                                <div className="flex flex-col gap-2">
                                    {order.medicines.map((medicine, index) => (
                                        <div key={index} className="flex justify-between items-center text-sm py-1 border-b border-border-custom last:border-0">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-text-main">{medicine.medicine_name}</span>
                                                <span className="text-xs text-text-muted">Qty: {medicine.quantity} × LKR {medicine.unit_price?.toLocaleString()}</span>
                                            </div>
                                            <span className="font-bold text-primary-deep">LKR {medicine.total_price?.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <div className="flex flex-col gap-4">
                            {/* Request ID from database */}
                            <div className="flex justify-between text-sm">
                                <span className="text-text-muted font-medium flex items-center gap-2">
                                    <ReceiptText size={14} />
                                    Request ID
                                </span>
                                <span className="text-text-main font-bold">#{order?._id?.substring(order._id.length - 8).toUpperCase() || orderId?.substring(orderId.length - 8).toUpperCase()}</span>
                            </div>
                            
                            {/* Status from database */}
                            <div className="flex justify-between text-sm">
                                <span className="text-text-muted font-medium flex items-center gap-2">
                                    <CheckCircle2 size={14} />
                                    Status
                                </span>
                                <span className={`font-bold px-2 py-1 rounded text-xs ${
                                    order?.status === 'Ready' ? 'bg-success/10 text-success' : 
                                    order?.status === 'Approved' ? 'bg-primary-light/10 text-primary-light' : 
                                    order?.status === 'VerificationPending' ? 'bg-warning/10 text-warning' :
                                    'bg-text-muted/10 text-text-muted'
                                }`}>{order?.status || 'Pending'}</span>
                            </div>
                            
                            {/* Priority from database */}
                            <div className="flex justify-between text-sm">
                                <span className="text-text-muted font-medium flex items-center gap-2">
                                    <Stethoscope size={14} />
                                    Priority
                                </span>
                                <span className={`font-bold ${
                                    order?.priority_level === 'Emergency' ? 'text-danger' : 
                                    order?.priority_level === 'Urgent' ? 'text-warning' : 
                                    'text-text-main'
                                }`}>{order?.priority_level || 'Normal'}</span>
                            </div>
                            
                            {/* Pharmacy from database */}
                            {order?.pharmacy_id && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-muted font-medium flex items-center gap-2">
                                        <MapPin size={14} />
                                        Pharmacy
                                    </span>
                                    <span className="text-text-main font-bold">{order.pharmacy_id}</span>
                                </div>
                            )}
                            
                            {/* Request Date from database */}
                            {order?.request_date && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-muted font-medium flex items-center gap-2">
                                        <Calendar size={14} />
                                        Order Date
                                    </span>
                                    <span className="text-text-main font-bold">{formatDate(order.request_date)}</span>
                                </div>
                            )}
                            
                            <hr className="border-none border-t border-border-custom my-4" />
                            
                            {/* Total Amount from database */}
                            <div className="flex justify-between text-xl font-extrabold text-primary-deep">
                                <span>Total Payable</span>
                                <span>LKR {totalAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentUI;
