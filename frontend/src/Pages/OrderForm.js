import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './OrderForm.css';
import { ClipboardList, Send, AlertCircle, Upload, FileCheck } from 'lucide-react';

const OrderForm = () => {
    // Helper to get date 2 days from now in YYYY-MM-DDTHH:mm format
    const getDefaultExpiry = () => {
        const date = new Date();
        date.setDate(date.getDate() + 2);
        return date.toISOString().slice(0, 16);
    };

    useEffect(() => {
        let storedId = localStorage.getItem('mediReach_patientId');
        if (!storedId) {
            storedId = 'PAT-' + Math.floor(1000 + Math.random() * 9000);
            localStorage.setItem('mediReach_patientId', storedId);
        }
        setFormData(prev => ({ ...prev, patient_id: storedId }));
    }, []);

    const [formData, setFormData] = useState({
        patient_id: '', // initialized in useEffect
        pharmacy_id: '',
        priority_level: 'Normal',
        expiry_time: getDefaultExpiry(),
        notes: '',
        prescription_image: null
    });

    const [fileName, setFileName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, prescription_image: file });
            setFileName(file.name);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });

            const res = await api.post('/roms/request', data);

            setMessage({ type: 'success', text: 'Order request submitted successfully!' });
            console.log('Order created:', res.data);

            // Reset but keep auto-filled IDs updated
            setFormData({
                ...formData,
                pharmacy_id: '',
                notes: '',
                prescription_image: null,
                expiry_time: getDefaultExpiry()
            });
            setFileName('');
        } catch (error) {
            console.error('Submission Error:', error);
            setMessage({
                type: 'danger',
                text: error.response?.data?.message || error.message || 'Network error: Backend might be down or file is too large.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="header-section">
                <h1>Order Medication</h1>
                <p>Fill out the form below to submit your medication request to our pharmacy network.</p>
            </div>

            <div className="form-card">
                <div className="card-header">
                    <ClipboardList size={22} className="card-icon" />
                    <h2>Request Details</h2>
                </div>

                <form onSubmit={handleSubmit} className="order-form">
                    {message.text && (
                        <div className={`alert alert-${message.type}`}>
                            <AlertCircle size={18} />
                            {message.text}
                        </div>
                    )}

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Patient ID (Auto-filled)</label>
                            <input
                                type="text"
                                name="patient_id"
                                value={formData.patient_id}
                                readOnly
                                className="read-only-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Select Pharmacy</label>
                            <select
                                name="pharmacy_id"
                                value={formData.pharmacy_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">-- Select a Pharmacy --</option>
                                <option value="PHARM-001">Kandy Central Pharmacy</option>
                                <option value="PHARM-002">Galle Fort MedPoint</option>
                                <option value="PHARM-003">Jaffna Community Rx</option>
                                <option value="PHARM-004">Matara Rural Clinic</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Priority Level</label>
                            <select name="priority_level" value={formData.priority_level} onChange={handleChange}>
                                <option value="Normal">Normal</option>
                                <option value="Urgent">Urgent</option>
                                <option value="Emergency">Emergency</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Expiry Time (Auto-generated: 2 days from now)</label>
                            <input
                                type="datetime-local"
                                name="expiry_time"
                                value={formData.expiry_time}
                                onChange={handleChange}
                                readOnly
                                className="read-only-input"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Additional Notes</label>
                        <textarea
                            name="notes"
                            rows="3"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Specify medication names, dosage, or any special instructions..."
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label>Upload Prescription</label>
                        <div className="file-upload-wrapper">
                            <input
                                type="file"
                                id="prescription-upload"
                                onChange={handleFileChange}
                                accept="image/*,.pdf"
                                className="file-input"
                            />
                            <label htmlFor="prescription-upload" className="file-upload-btn">
                                {fileName ? (
                                    <>
                                        <FileCheck size={20} color="var(--success)" />
                                        <span className="file-name">{fileName}</span>
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

                    <div className="form-actions">
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Submitting...' : (
                                <>
                                    <Send size={18} />
                                    Submit Request
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
