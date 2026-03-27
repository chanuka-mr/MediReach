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
        setTimeout(() => {
            setPaid(true);
        }, 1500);
    };

    if (loading) return <div className="text-center py-40 font-semibold text-primary-deep">Loading secure checkout...</div>;

    if (paid) {
        return (
            <div className="max-w-[500px] mx-auto my-[100px] text-center bg-white p-16 rounded-custom shadow-custom flex flex-col items-center gap-6 animate-fade-in">
                <CheckCircle2 className="text-success" size={64} />
                <h2 className="text-3xl font-bold m-0">Payment Successful!</h2>
                <p className="text-text-muted text-lg">Your order #{orderId?.substring(orderId.length - 8).toUpperCase()} is now being processed for delivery.</p>
                <div className="w-full bg-bg-color p-5 rounded-xl mb-4">
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
            <button className="bg-transparent border-none flex items-center gap-2 font-bold text-text-muted cursor-pointer mb-8 p-2 rounded-lg transition-all hover:bg-white hover:text-primary-deep" onClick={() => navigate(-1)}>
                <ChevronLeft size={18} />
                Back
            </button>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="flex-[1.5] w-full">
                    <div className="bg-white border border-border-custom rounded-custom shadow-custom p-8">
                        <div className="flex items-center gap-4 mb-8 border-b border-border-custom pb-5">
                            <CreditCard size={20} className="text-primary-light" />
                            <h3 className="text-xl font-bold m-0 text-primary-deep">Payment Method</h3>
                        </div>

                        <form className="flex flex-col" onSubmit={handlePayment}>
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
                                <input type="text" placeholder="John Doe" required className={inputClasses} />
                            </div>

                            <div className="mb-5 flex flex-col gap-2">
                                <label className="font-semibold text-sm text-text-muted">Card Number</label>
                                <input type="text" placeholder="0000 0000 0000 0000" required className={inputClasses} />
                            </div>

                            <div className="flex gap-6 mb-6">
                                <div className="flex-1 flex flex-col gap-2">
                                    <label className="font-semibold text-sm text-text-muted">Expiry Date</label>
                                    <input type="text" placeholder="MM / YY" required className={inputClasses} />
                                </div>
                                <div className="flex-1 flex flex-col gap-2 relative">
                                    <label className="font-semibold text-sm text-text-muted">CVC / CVV</label>
                                    <input type={cvcVisible ? 'text' : 'password'} placeholder="***" required className={inputClasses} />
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

                            <button type="submit" className="w-full flex items-center justify-center gap-3 bg-primary-deep text-white p-4 rounded-xl font-bold text-lg cursor-pointer transition-all shadow-lg hover:bg-[#022c61] hover:-translate-y-0.5 hover:shadow-xl">
                                <Wallet size={18} />
                                Confirm & Pay LKR 2,450.00
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
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-text-muted font-medium">Request ID</span>
                                <span className="text-text-main font-bold">#{orderId?.substring(orderId.length - 8).toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-muted font-medium">Status</span>
                                <span className={`font-bold ${
                                    order?.status === 'Ready' ? 'text-success' : 
                                    order?.status === 'Approved' ? 'text-primary-light' : 'text-text-main'
                                }`}>{order?.status}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-muted font-medium">Priority</span>
                                <span className="text-text-main font-bold">{order?.priority_level}</span>
                            </div>
                            <hr className="border-none border-t border-border-custom my-4" />
                            <div className="flex justify-between text-xl font-extrabold text-primary-deep">
                                <span>Total Payable</span>
                                <span>LKR 2,450.00</span>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-8">
                            <input type="text" placeholder="Promo Code" className="flex-grow p-2.5 px-4 border border-border-custom rounded-lg text-sm bg-slate-50" />
                            <button className="p-2.5 px-5 bg-primary-light text-white border-none rounded-lg font-bold text-sm cursor-pointer transition-all hover:bg-primary-deep">Apply</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentUI;
