const express = require('express');
const router = express.Router();
const {
    createRequest,
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

const upload = require('../Config/cloudinaryConfig');

// Patient routes
router.post('/request', upload.single('prescription_image'), validateRequest(schemas.createMedRequest), createRequest);
router.get('/request', getAllRequests);
router.get('/request/:id', getRequestById);
router.put('/request/:id', upload.single('prescription_image'), updateRequest);
router.delete('/request/:id', deleteRequest);

router.post('/:id/cancel', validateRequest(schemas.cancelRequest), cancelRequest);

// Pharmacist routes
router.get('/pharmacy-tasks', getPharmacyRequests);
router.put('/:id/process', validateRequest(schemas.processAction), processRequest);

module.exports = router;
