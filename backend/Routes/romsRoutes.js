const express = require('express');
const router = express.Router();
const {
    createRequest,
    getMyRequests,
    getAllRequests,
    getRequestById,
    updateRequest,
    deleteRequest,
    getPharmacyRequests,
    processRequest,
    cancelRequest
} = require('../Controllers/romsController');
const { protect, authorize } = require('../Middleware/authMiddleware');
const { validateRequest, schemas } = require('../Middleware/validationMiddleware');

// router.use(protect);

// Patient routes
router.post('/request', authorize('Patient'), validateRequest(schemas.createMedRequest), createRequest);
router.get('/requests', getAllRequests);
router.get('/request/:id', getRequestById);
router.put('/request/:id', updateRequest);
router.delete('/request/:id', deleteRequest);
router.get('/my-requests', authorize('Patient'), getMyRequests);
router.post('/:id/cancel', authorize('Patient'), validateRequest(schemas.cancelRequest), cancelRequest);

// Pharmacist routes
router.get('/pharmacy-tasks', authorize('Pharmacist'), getPharmacyRequests);
router.put('/:id/process', authorize('Pharmacist'), validateRequest(schemas.processAction), processRequest);

module.exports = router;
