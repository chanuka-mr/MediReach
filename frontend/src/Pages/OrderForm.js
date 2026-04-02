import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { ClipboardList, Send, AlertCircle, Upload, FileCheck, Loader2, ShoppingCart, X, Plus, Minus } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';

// ── Same API base used in MedicineAdd ─────────────────────────────
const PHARMACY_API = "http://localhost:5000/api/pharmacies";

const OrderForm = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const editId = searchParams.get('id');

    const getDefaultExpiry = () => {
        const date = new Date();
        date.setDate(date.getDate() + 2);
        return date.toISOString().slice(0, 16);
    };

    const [formData, setFormData] = useState({
        patient_id: '',
        pharmacy_id: '',
        priority_level: 'Normal',
        expiry_time: getDefaultExpiry(),
        notes: '',
        prescription_image: null
    });

    const [fileName, setFileName]         = useState('');
    const [loading, setLoading]           = useState(false);
    const [initLoading, setInitLoading]   = useState(!!editId);
    const [message, setMessage]           = useState({ type: '', text: '' });
    const [cartItems, setCartItems]       = useState([]);

    // ── Pharmacy state — mirrors MedicineAdd exactly ───────────────
    const [pharmaciesList, setPharmaciesList]       = useState([]);
    const [loadingPharmacies, setLoadingPharmacies] = useState(true);
    const [pharmacyError, setPharmacyError]         = useState(null);

    // ── Fetch active pharmacies from DB (same logic as MedicineAdd) ─
    useEffect(() => {
        const fetchPharmacies = async () => {
            setLoadingPharmacies(true);
            setPharmacyError(null);
            try {
                const res  = await fetch(PHARMACY_API);
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to fetch pharmacies");
                const list = data.data?.pharmacies || [];
                // Only active pharmacies — same filter as MedicineAdd
                setPharmaciesList(list.filter(p => p.isActive).map(p => p.name));
            } catch (err) {
                setPharmacyError(err.message);
            } finally {
                setLoadingPharmacies(false);
            }
        };
        fetchPharmacies();
    }, []);

    // ── Load patient ID + edit data ────────────────────────────────
    useEffect(() => {
        const loadInitialData = async () => {
            // Get logged-in user ID from userInfo (same as ProfilePage)
            let userId = '';
            const savedUserInfo = localStorage.getItem('userInfo');
            if (savedUserInfo) {
                const parsed = JSON.parse(savedUserInfo);
                const user = parsed.user || parsed;
                userId = user._id || user.id || '';
            }
            
            // Fallback: if no user logged in, redirect to login
            if (!userId) {
                setMessage({ type: 'warning', text: 'Please log in to place an order.' });
                // Optionally redirect to login
                // navigate('/auth?mode=login');
            }

            if (editId) {
                try {
                    const res   = await api.get(`/roms/request/${editId}`);
                    const order = res.data;
                    setFormData({
                        patient_id:          order.patient_id,
                        pharmacy_id:         order.pharmacy_id,
                        priority_level:      order.priority_level,
                        expiry_time:         new Date(order.expiry_time).toISOString().slice(0, 16),
                        notes:               order.notes,
                        prescription_image:  null
                    });
                    if (order.prescription_image) setFileName('Current Prescription (Keep to maintain)');
                } catch (err) {
                    setMessage({ type: 'danger', text: 'Failed to load order for editing' });
                } finally {
                    setInitLoading(false);
                }
            } else {
                // For new orders, use logged-in user's actual ID
                setFormData(prev => ({ ...prev, patient_id: userId }));
                setInitLoading(false);
            }
        };

        loadInitialData();
    }, [editId]);

    // ── Load cart data from localStorage ─────────────────────────
    useEffect(() => {
        const savedCart = localStorage.getItem('mediReach_cart');
        if (savedCart) {
            try {
                const cartData = JSON.parse(savedCart);
                setCartItems(cartData);
                
                // Auto-fill pharmacy if all items are from same pharmacy
                if (cartData.length > 0) {
                    const firstPharmacy = cartData[0].Pharmacy;
                    const allSamePharmacy = cartData.every(item => item.Pharmacy === firstPharmacy);
                    if (allSamePharmacy) {
                        setFormData(prev => ({ ...prev, pharmacy_id: firstPharmacy }));
                    }
                }
            } catch (error) {
                console.error('Error loading cart:', error);
            }
        }
    }, [editId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, prescription_image: file });
            setFileName(file.name);
        } else {
            setFormData({ ...formData, prescription_image: null });
            setFileName(editId && formData.prescription_image === null ? 'Current Prescription (Keep to maintain)' : '');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'prescription_image' && !(formData[key] instanceof File)) return;
                data.append(key, formData[key]);
            });

            // Add medicines array from cart
            if (cartItems.length > 0) {
                const medicinesArray = cartItems.map(item => ({
                    medicine_id: item._id,
                    medicine_name: item.mediName,
                    quantity: item.quantity,
                    unit_price: item.mediPrice,
                    total_price: item.mediPrice * item.quantity
                }));
                data.append('medicines', JSON.stringify(medicinesArray));
            }

            if (editId) {
                await api.put(`/roms/request/${editId}`, data);
                setMessage({ type: 'success', text: 'Order updated! Redirecting...' });
                setTimeout(() => navigate('/order-details'), 1500);
            } else {
                await api.post('/roms/request', data);
                setMessage({ type: 'success', text: 'Order submitted! Redirecting...' });
                setTimeout(() => navigate('/order-details'), 1500);
            }

            // Clear cart after successful submission
            if (!editId && cartItems.length > 0) {
                localStorage.removeItem('mediReach_cart');
                setCartItems([]);
            }

            if (!editId) {
                setFormData({
                    ...formData,
                    pharmacy_id:        '',
                    notes:              '',
                    prescription_image: null,
                    expiry_time:        getDefaultExpiry()
                });
                setFileName('');
            }
        } catch (error) {
            console.error('Submission Error:', error);
            setMessage({
                type: 'danger',
                text: error.response?.data?.message || error.message || 'Network error: Backend might be down.'
            });
        } finally {
            setLoading(false);
        }
    };

    const inputClasses    = "p-3 px-4 border-[1.5px] border-border-custom rounded-[10px] text-base transition-all bg-[#fafbfc] focus:outline-none focus:border-primary-light focus:ring-2 focus:ring-primary-light/10 focus:bg-white";
    const readOnlyClasses = "p-3 px-4 border-[1.5px] border-border-custom rounded-[10px] text-base transition-all bg-[#f1f4f9] cursor-not-allowed text-text-muted";

    // ── Loading skeleton while editing ────────────────────────────
    if (initLoading) {
        return (
            <div className="max-w-[1000px] mx-auto my-12 px-6">
                <div className="mb-10">
                    <h1 className="text-4xl font-bold mb-2 text-primary-deep">
                        {editId ? 'Edit Medication Order' : 'Order Medication'}
                    </h1>
                    <p className="text-text-muted text-lg">Loading order details...</p>
                </div>
                <div className="bg-white border border-border-custom rounded-custom shadow-custom overflow-hidden">
                    <div className="flex items-center gap-3 px-8 py-6 border-b border-border-custom bg-primary-deep/5">
                        <ClipboardList size={22} className="text-primary-deep" />
                        <h2 className="text-xl font-bold text-primary-deep">Loading...</h2>
                    </div>
                    <div className="p-8 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-deep"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1000px] mx-auto my-12 px-6 animate-fade-in">
            <div className="mb-10">
                <h1 className="text-4xl font-bold mb-2 text-primary-deep">
                    {editId ? 'Edit Medication Order' : 'Order Medication'}
                </h1>
                <p className="text-text-muted text-lg">
                    {editId
                        ? 'Update your pending request details below.'
                        : 'Fill out the form below to submit your medication request to our pharmacy network.'}
                </p>
            </div>

            {/* Cart Section */}
            {cartItems.length > 0 && (
                <div className="bg-white border border-border-custom rounded-custom shadow-custom overflow-hidden mb-6">
                    <div className="flex items-center gap-3 px-8 py-6 border-b border-border-custom bg-primary-deep/5">
                        <ShoppingCart size={22} className="text-primary-deep" />
                        <h2 className="text-xl font-bold text-primary-deep">Medicines from Cart</h2>
                        <span className="text-sm text-text-muted bg-primary-light/10 px-3 py-1 rounded-full">
                            {cartItems.length} items
                        </span>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {cartItems.map((item, index) => (
                                <div key={item._id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                                    <img
                                        src={item.mediImage}
                                        alt={item.mediName}
                                        className="w-16 h-16 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-text-main">{item.mediName}</h4>
                                        <p className="text-sm text-text-muted">{item.Pharmacy}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-500">Qty:</span>
                                                <span className="font-semibold text-primary-deep">{item.quantity}</span>
                                            </div>
                                            <span className="font-semibold text-primary-deep">
                                                LKR {(item.mediPrice * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const newCart = cartItems.filter((_, i) => i !== index);
                                            setCartItems(newCart);
                                            localStorage.setItem('mediReach_cart', JSON.stringify(newCart));
                                        }}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-border-custom">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold text-text-main">Total:</span>
                                <span className="text-2xl font-bold text-primary-deep">
                                    LKR {cartItems.reduce((sum, item) => sum + (item.mediPrice * item.quantity), 0).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white border border-border-custom rounded-custom shadow-custom overflow-hidden">
                <div className="flex items-center gap-3 px-8 py-6 border-b border-border-custom bg-primary-deep/5">
                    <ClipboardList size={22} className="text-primary-deep" />
                    <h2 className="text-xl font-bold text-primary-deep">Request Details</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    {message.text && (
                        <div className={`flex items-center gap-3 p-4 px-6 rounded-[10px] mb-8 font-semibold ${
                            message.type === 'success'
                                ? 'bg-success/10 text-success border border-success/20'
                                : 'bg-danger/10 text-danger border border-danger/20'
                        }`}>
                            <AlertCircle size={18} />
                            {message.text}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Patient ID — read-only */}
                        <div className="flex flex-col gap-2">
                            <label className="font-semibold text-text-main text-sm">Patient ID (Auto-filled)</label>
                            <input
                                type="text"
                                name="patient_id"
                                value={formData.patient_id}
                                readOnly
                                className={readOnlyClasses}
                            />
                        </div>

                        {/* ── Pharmacy select — fetched from DB ── */}
                        <div className="flex flex-col gap-2">
                            <label className="font-semibold text-text-main text-sm">Select Pharmacy</label>

                            {loadingPharmacies ? (
                                /* Loading state — matches MedicineAdd spinner style */
                                <div className={`${readOnlyClasses} flex items-center gap-2`}>
                                    <Loader2 size={15} className="animate-spin text-text-muted shrink-0" />
                                    <span className="text-sm text-text-muted">Loading pharmacies...</span>
                                </div>
                            ) : pharmacyError ? (
                                /* Error state */
                                <div className="flex flex-col gap-1">
                                    <select disabled className={readOnlyClasses}>
                                        <option>Failed to load pharmacies</option>
                                    </select>
                                    <span className="text-xs text-danger font-semibold flex items-center gap-1">
                                        <AlertCircle size={11} strokeWidth={2.5} />
                                        {pharmacyError}
                                    </span>
                                </div>
                            ) : (
                                /* Populated select */
                                <select
                                    name="pharmacy_id"
                                    value={formData.pharmacy_id}
                                    onChange={handleChange}
                                    required
                                    className={inputClasses}
                                >
                                    <option value="">— Select a Pharmacy —</option>
                                    {pharmaciesList.length === 0 ? (
                                        <option disabled>No active pharmacies registered</option>
                                    ) : (
                                        pharmaciesList.map(name => (
                                            <option key={name} value={name}>{name}</option>
                                        ))
                                    )}
                                </select>
                            )}

                            {!loadingPharmacies && !pharmacyError && pharmaciesList.length === 0 && (
                                <p className="text-xs text-danger mt-1">
                                    No pharmacies available. Please check back later.
                                </p>
                            )}
                        </div>

                        {/* Priority Level */}
                        <div className="flex flex-col gap-2">
                            <label className="font-semibold text-text-main text-sm">Priority Level</label>
                            <select
                                name="priority_level"
                                value={formData.priority_level}
                                onChange={handleChange}
                                className={inputClasses}
                            >
                                <option value="Normal">Normal</option>
                                <option value="Urgent">Urgent</option>
                                <option value="Emergency">Emergency</option>
                            </select>
                        </div>

                        {/* Expiry Time — read-only */}
                        <div className="flex flex-col gap-2">
                            <label className="font-semibold text-text-main text-sm">
                                Expiry Time (Auto-generated: 2 days from now)
                            </label>
                            <input
                                type="datetime-local"
                                name="expiry_time"
                                value={formData.expiry_time}
                                readOnly
                                className={readOnlyClasses}
                                required
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="flex flex-col gap-2 mb-6">
                        <label className="font-semibold text-text-main text-sm">Additional Notes</label>
                        <textarea
                            name="notes"
                            rows="3"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Specify medication names, dosage, or any special instructions..."
                            className={inputClasses}
                        />
                    </div>

                    {/* Prescription Upload */}
                    <div className="flex flex-col gap-2 mb-6">
                        <label className="font-semibold text-text-main text-sm">Upload Prescription</label>
                        <div className="relative w-full">
                            <input
                                type="file"
                                id="prescription-upload"
                                onChange={handleFileChange}
                                accept="image/*,.pdf"
                                className="absolute w-0 h-0 opacity-0"
                            />
                            <label
                                htmlFor="prescription-upload"
                                className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-border-custom rounded-custom bg-[#fafbfc] cursor-pointer transition-all font-semibold text-text-muted hover:border-primary-light hover:bg-primary-light/5 hover:text-primary-light"
                            >
                                {fileName ? (
                                    <>
                                        <FileCheck size={20} className="text-success" />
                                        <span className="text-text-main text-sm max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap">
                                            {fileName}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={20} />
                                        <span>Click to upload prescription image</span>
                                    </>
                                )}
                            </label>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end mt-4">
                        <button
                            type="submit"
                            disabled={loading || loadingPharmacies}
                            className="flex items-center gap-2 bg-primary-deep text-white py-3 px-7 rounded-[10px] font-bold text-lg transition-all hover:bg-[#022c61] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:bg-text-muted disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                        >
                            {loading ? (editId ? 'Updating...' : 'Submitting...') : (
                                <>
                                    <Send size={18} />
                                    {editId ? 'Update Order' : 'Submit Request'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OrderForm;