const mongoose = require('mongoose');

const requestRoutingSchema = mongoose.Schema({
    request_id: { type: String, required: true },
    pharmacy_id: { type: String, required: true },
    route_status: {
        type: String,
        enum: ['Pending','Accepted', 'Rejected','Dispatched'],
        default: 'Pending'
    },
    routed_at: { type: Date, default: Date.now },
    response_time: { type: Number } // in minutes
}, {
    timestamps: true
});

const RequestRouting = mongoose.model('RequestRouting', requestRoutingSchema);
module.exports = RequestRouting;
