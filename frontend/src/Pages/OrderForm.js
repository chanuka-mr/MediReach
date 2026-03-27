import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { ClipboardList, Send, AlertCircle, Upload, FileCheck } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';

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

    const [fileName, setFileName] = useState('');
    const [loading, setLoading] = useState(false);
    const [initLoading, setInitLoading] = useState(!!editId);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const loadInitialData = async () => {
            let storedId = localStorage.getItem('mediReach_patientId');
            if (!storedId) {
                storedId = 'PAT-' + Math.floor(1000 + Math.random() * 9000);
                localStorage.setItem('mediReach_patientId', storedId);
            }

            if (editId) {
                try {
                    const res = await api.get(`/roms/request/${editId}`);
                    const order = res.data;
                    setFormData({
                        patient_id: order.patient_id,
                        pharmacy_id: order.pharmacy_id,
                        priority_level: order.priority_level,
                        expiry_time: new Date(order.expiry_time).toISOString().slice(0, 16),
                        notes: order.notes,
                        prescription_image: null
                    });
                    if (order.prescription_image) setFileName('Current Prescription (Keep to maintain)');
                } catch (err) {
                    setMessage({ type: 'danger', text: 'Failed to load order for editing' });
                } finally {
                    setInitLoading(false);
                }
            } else {
                setFormData(prev => ({ ...prev, patient_id: storedId }));
                setInitLoading(false);
            }
        };

        loadInitialData();
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
                if (key === 'prescription_image' && !(formData[key] instanceof File)) {
                    return;
                }
                data.append(key, formData[key]);
            });

            if (editId) {
                await api.put(`/roms/request/${editId}`, data);
                setMessage({ type: 'success', text: 'Order updated! Redirecting...' });
                setTimeout(() => navigate('/order-details'), 1500);
            } else {
                await api.post('/roms/request', data);
                setMessage({ type: 'success', text: 'Order submitted! Redirecting...' });
                setTimeout(() => navigate('/order-details'), 1500);
            }

            if (!editId) {
                setFormData({
                    ...formData,
                    pharmacy_id: '',
                    notes: '',
                    prescription_image: null,
                    expiry_time: getDefaultExpiry()
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

    const inputClasses = "p-3 px-4 border-[1.5px] border-border-custom rounded-[10px] text-base transition-all bg-[#fafbfc] focus:outline-none focus:border-primary-light focus:ring-2 focus:ring-primary-light/10 focus:bg-white";
    const readOnlyClasses = "p-3 px-4 border-[1.5px] border-border-custom rounded-[10px] text-base transition-all bg-[#f1f4f9] cursor-not-allowed text-text-muted";

    if (initLoading) {
        return (
            <div className="max-w-[1000px] mx-auto my-12 px-6">
                <div className="mb-10">
                    <h1 className="text-4xl font-bold mb-2 text-primary-deep">{editId ? 'Edit Medication Order' : 'Order Medication'}</h1>
                    <p className="text-text-muted text-lg">{editId ? 'Loading order details...' : 'Fill out the form below to submit your medication request to our pharmacy network.'}</p>
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
                <h1 className="text-4xl font-bold mb-2 text-primary-deep">{editId ? 'Edit Medication Order' : 'Order Medication'}</h1>
                <p className="text-text-muted text-lg">{editId ? 'Update your pending request details below.' : 'Fill out the form below to submit your medication request to our pharmacy network.'}</p>
            </div>

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

                        <div className="flex flex-col gap-2">
                            <label className="font-semibold text-text-main text-sm">Select Pharmacy</label>
                            <select
                                name="pharmacy_id"
                                value={formData.pharmacy_id}
                                onChange={handleChange}
                                required
                                className={inputClasses}
                            >
                                <option value="">-- Select a Pharmacy --</option>
                                <option value="PHARM-001">Kandy Central Pharmacy</option>
                                <option value="PHARM-002">Galle Fort MedPoint</option>
                                <option value="PHARM-003">Jaffna Community Rx</option>
                                <option value="PHARM-004">Matara Rural Clinic</option>
                            </select>
                        </div>

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

                        <div className="flex flex-col gap-2">
                            <label className="font-semibold text-text-main text-sm">Expiry Time (Auto-generated: 2 days from now)</label>
                            <input
                                type="datetime-local"
                                name="expiry_time"
                                value={formData.expiry_time}
                                onChange={handleChange}
                                readOnly
                                className={readOnlyClasses}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 mb-6">
                        <label className="font-semibold text-text-main text-sm">Additional Notes</label>
                        <textarea
                            name="notes"
                            rows="3"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Specify medication names, dosage, or any special instructions..."
                            className={inputClasses}
                        ></textarea>
                    </div>

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
                            <label htmlFor="prescription-upload" className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-border-custom rounded-custom bg-[#fafbfc] cursor-pointer transition-all font-semibold text-text-muted hover:border-primary-light hover:bg-primary-light/5 hover:text-primary-light">
                                {fileName ? (
                                    <>
                                        <FileCheck size={20} className="text-success" />
                                        <span className="text-text-main text-sm max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap">{fileName}</span>
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

                    <div className="flex justify-end mt-4">
                        <button type="submit" className="flex items-center gap-2 bg-primary-deep text-white py-3 px-7 rounded-[10px] font-bold text-lg transition-all hover:bg-[#022c61] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:bg-text-muted disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none" disabled={loading}>
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
