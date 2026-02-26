const mongoose = require('mongoose');

const medicationRequestSchema = mongoose.Schema({
    patient_id: { type: String, required: true },
    pharmacy_id: { type: String },
    request_date: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Ready', 'Expired', 'Cancelled'],
        default: 'Pending'
    },
    priority_level: {
        type: String,
        enum: ['Normal', 'Urgent', 'Emergency'],
        default: 'Normal'
    },
    expiry_time: { type: Date, required: true },
    notes: { type: String },
    prescription_image: { type: String }
}, {
    timestamps: true
});

const MedicationRequest = mongoose.model('MedicationRequest', medicationRequestSchema);
module.exports = MedicationRequest;
