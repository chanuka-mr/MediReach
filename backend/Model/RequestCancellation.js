const mongoose = require('mongoose');

const requestCancellationSchema = mongoose.Schema({
    request_id: { type: String, required: true },
    cancelled_by: { type: String, required: true },
    cancel_reason: { type: String, required: true },
    cancelled_at: { type: Date, default: Date.now }
}, {
    timestamps: true
});

const RequestCancellation = mongoose.model('RequestCancellation', requestCancellationSchema);
module.exports = RequestCancellation;
