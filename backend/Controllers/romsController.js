const romsService = require('../Services/romsService');
const MedicationRequest = require('../Model/MedicationRequest');

const createRequest = async (req, res, next) => {
    try {
        const patient_id = req.user ? req.user._id : req.body.patient_id;

        // Handle file upload
        if (req.file) {
            req.body.prescription_image = req.file.path; // Cloudinary URL
        } else {
            // Remove any malformed or object data that might have come through without being processed correctly
            delete req.body.prescription_image;
        }

        console.log(`Creating order for Patient: ${patient_id}, Pharmacy: ${req.body.pharmacy_id}`);
        const request = await romsService.createRequest(req.body, patient_id);
        res.status(201).json(request);
    } catch (error) {
        console.error('Create Request Error:', error);
        res.status(400);
        next(error);
    }
};


const getPharmacyRequests = async (req, res, next) => {
    try {
        const pharmacy_id = req.query?.pharmacy_id || (req.user ? req.user._id : req.body?.pharmacy_id);
        console.log(`Fetching orders for Pharmacy ID: ${pharmacy_id}`);
        const filter = {};
        
        if (pharmacy_id && pharmacy_id !== 'ALL') {
            // Support both hyphenated and underscore versions interchangeably
            const variations = [
                pharmacy_id,
                pharmacy_id.replace(/-/g, '_'),
                pharmacy_id.replace(/_/g, '-')
            ];
            // Unique set of variations
            const uniqueVariations = [...new Set(variations)];
            filter.pharmacy_id = { $in: uniqueVariations };
        }

        const requests = await MedicationRequest.find(filter).sort({ createdAt: -1 });
        console.log(`Found ${requests.length} orders for ${pharmacy_id || 'ALL'}`);
        res.json(requests);
    } catch (error) {
        console.error('Fetch Pharmacy Requests Error:', error);
        next(error);
    }
};

const processRequest = async (req, res, next) => {
    try {
        const { action, notes } = req.body;
        const pharmacy_id = req.user ? req.user._id : req.body.pharmacy_id;
        const request = await romsService.updateRequestAction(req.params.id, pharmacy_id, action, notes);
        res.json(request);
    } catch (error) {
        res.status(400);
        next(error);
    }
};

const cancelRequest = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const patient_id = req.user ? req.user._id : req.body.patient_id;
        const request = await romsService.cancelRequest(req.params.id, patient_id, reason);
        res.json(request);
    } catch (error) {
        res.status(400);
        next(error);
    }
};

const getAllRequests = async (req, res, next) => {
    try {
        const filter = {};
        const patient_id = req.user ? req.user._id : (req.query?.patient_id || req.body?.patient_id);

        if (patient_id) {
            filter.patient_id = patient_id;
        }

        const requests = await MedicationRequest.find(filter).sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        next(error);
    }
};

const getRequestById = async (req, res, next) => {
    try {
        const request = await MedicationRequest.findById(req.params.id);
        if (!request) {
            res.status(404);
            throw new Error('Request not found');
        }
        res.json(request);
    } catch (error) {
        next(error);
    }
};

const updateRequest = async (req, res, next) => {
    try {
        // Handle potential file upload for existing record update
        if (req.file) {
            req.body.prescription_image = req.file.path; // Cloudinary URL
        } else if (req.body.prescription_image === 'null') {
            // Ensure we don't accidentally save the string 'null'
            delete req.body.prescription_image;
        }

        const request = await MedicationRequest.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!request) {
            res.status(404);
            throw new Error('Request not found');
        }
        res.json(request);
    } catch (error) {
        res.status(400);
        next(error);
    }
};

const deleteRequest = async (req, res, next) => {
    try {
        const request = await MedicationRequest.findByIdAndDelete(req.params.id);
        if (!request) {
            res.status(404);
            throw new Error('Request not found');
        }
        res.json({ message: 'Request deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createRequest,
    getAllRequests,
    getRequestById,
    updateRequest,
    deleteRequest,
    getPharmacyRequests,
    processRequest,
    cancelRequest
};
