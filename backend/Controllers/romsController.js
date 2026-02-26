const romsService = require('../Services/romsService');
const MedicationRequest = require('../Model/MedicationRequest');

const createRequest = async (req, res, next) => {
    try {
        const patient_id = req.user ? req.user._id : req.body.patient_id;
        const request = await romsService.createRequest(req.body, patient_id);
        res.status(201).json(request);
    } catch (error) {
        res.status(400);
        next(error);
    }
};

const getMyRequests = async (req, res, next) => {
    try {
        const patient_id = req.user ? req.user._id : (req.query.patient_id || req.body.patient_id);
        const requests = await MedicationRequest.find({ patient_id })
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        next(error);
    }
};

const getPharmacyRequests = async (req, res, next) => {
    try {
        const pharmacy_id = req.user ? req.user._id : (req.query.pharmacy_id || req.body.pharmacy_id);
        const requests = await MedicationRequest.find({ pharmacy_id })
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
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
        const requests = await MedicationRequest.find({}).sort({ createdAt: -1 });
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
    getMyRequests,
    getAllRequests,
    getRequestById,
    updateRequest,
    deleteRequest,
    getPharmacyRequests,
    processRequest,
    cancelRequest
};
