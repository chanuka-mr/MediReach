const MedicationRequest = require('../Model/MedicationRequest');
const RequestRouting = require('../Model/RequestRouting');
const RequestCancellation = require('../Model/RequestCancellation');

/**
 * 1. Create Medication Request
 */
const createRequest = async (requestData, patient_id) => {
    // Default expiry: 2 days if not provided (matching frontend requirement)
    const expiry_time = requestData.expiry_time || new Date(Date.now() + 48 * 60 * 60 * 1000);
    // Trim IDs to avoid mismatch
    const pharmacy_id_to_assign = (requestData.preferred_pharmacy_id || requestData.pharmacy_id || '').trim();
    const clean_patient_id = (patient_id || '').trim();

    const request = await MedicationRequest.create({
        ...requestData,
        patient_id: clean_patient_id,
        expiry_time,
        pharmacy_id: pharmacy_id_to_assign,
        status: 'Pending'
    });

    // Create a routing entry for the assigned pharmacy
    if (pharmacy_id_to_assign) {
        await RequestRouting.create({
            request_id: request._id,
            pharmacy_id: pharmacy_id_to_assign,
            route_status: 'Sent'
        });
    }

    return request;
};

/**
 * 2. Assign Request to Pharmacy (Logic)
 */
const assignToPharmacy = async (request_id, preferred_id) => {
    let pharmacy_id = preferred_id;

    if (pharmacy_id) {
        await MedicationRequest.findByIdAndUpdate(request_id, { pharmacy_id });
        await RequestRouting.create({
            request_id,
            pharmacy_id,
            route_status: 'Sent'
        });
    }
};

/**
 * 4. Approve or Reject Requests
 */
const updateRequestAction = async (request_id, pharmacy_id, action, notes) => {
    const request = await MedicationRequest.findById(request_id);

    if (!request) throw new Error('Request not found');

    // Null-safe check for pharmacy assignment
    if (!request.pharmacy_id || request.pharmacy_id.toString() !== pharmacy_id.toString()) {
        throw new Error('Not authorized to process this request. This order might not be assigned to your pharmacy.');
    }

    if (action === 'Approve') {
        request.status = 'Approved';
        await RequestRouting.findOneAndUpdate(
            { request_id, pharmacy_id, route_status: 'Sent' },
            { route_status: 'Accepted', response_time: calculateResponseTime(request.createdAt) }
        );
    } else if (action === 'Reject') {
        request.status = 'Rejected';
        await RequestRouting.findOneAndUpdate(
            { request_id, pharmacy_id, route_status: 'Sent' },
            { route_status: 'Rejected', response_time: calculateResponseTime(request.createdAt) }
        );

        // Multi-Pharmacy Fallback
        await fallbackToNextPharmacy(request_id, pharmacy_id);
    } else if (action === 'Ready') {
        request.status = 'Ready';
    }

    if (notes) request.notes = notes; // Append or update notes

    await request.save();
    return request;
};

/**
 * 6. Multi-Pharmacy Fallback Logic
 */
const fallbackToNextPharmacy = async (request_id, rejected_pharmacy_id) => {
    // Logic for finding next pharmacy without User model would go here
    // For now, we set it to null as a placeholder
    const nextPharmacyId = null;

    if (nextPharmacyId) {
        await MedicationRequest.findByIdAndUpdate(request_id, {
            pharmacy_id: nextPharmacyId,
            status: 'Pending'
        });
        await RequestRouting.create({
            request_id,
            pharmacy_id: nextPharmacyId,
            route_status: 'Sent'
        });
    }
};

/**
 * 9. Auto-Expiry Logic
 */
const expireOldRequests = async () => {
    const now = new Date();
    const result = await MedicationRequest.updateMany(
        { status: 'Pending', expiry_time: { $lt: now } },
        { status: 'Expired' }
    );
    return result;
};

/**
 * 10. Cancel Request Logic
 */
const cancelRequest = async (request_id, patient_id, reason) => {
    const request = await MedicationRequest.findById(request_id);

    if (!request) throw new Error('Request not found');
    if (request.patient_id.toString() !== patient_id.toString()) {
        throw new Error('Not authorized to cancel this request');
    }
    if (request.status !== 'Pending') {
        throw new Error('Cannot cancel request once processed');
    }

    request.status = 'Cancelled';
    await request.save();

    await RequestCancellation.create({
        request_id,
        cancelled_by: patient_id,
        cancel_reason: reason
    });

    return request;
};

const calculateResponseTime = (startTime) => {
    const diff = Math.abs(new Date() - new Date(startTime));
    return Math.floor(diff / (1000 * 60)); // minutes
};

module.exports = {
    createRequest,
    updateRequestAction,
    cancelRequest,
    expireOldRequests,
    fallbackToNextPharmacy
};
