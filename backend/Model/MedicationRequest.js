const mongoose = require('mongoose');

const medicationRequestSchema = mongoose.Schema({
    patient_id: { type: String, required: true },
    pharmacy_id: { type: String },
    request_date: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Ready', 'Expired', 'Cancelled', 'Dispatched'],
        default: 'Pending'
    },
    priority_level: {
        type: String,
        enum: ['Normal', 'Urgent', 'Emergency'],
        default: 'Normal'
    },
    expiry_time: { type: Date, required: true },
    notes: { type: String },
    rejectionReason: { type: String },
    prescription_image: { type: String },
    medicines: [{
        medicine_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
        medicine_name: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1 },
        unit_price: { type: Number, required: true },
        total_price: { type: Number, required: true }
    }]
}, {
    timestamps: true
});

const MedicationRequest = mongoose.model('MedicationRequest', medicationRequestSchema);
module.exports = MedicationRequest;
