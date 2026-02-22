const express = require('express');
const router = express.Router();
const pharmacyController = require('../Controllers/pharmacyController');

// Log when routes are accessed
router.use((req, res, next) => {
    console.log(`📨 Pharmacy Route: ${req.method} ${req.url}`);
    next();
});

// GET route for fetching all pharmacies
router.get('/', pharmacyController.getAllPharmacies);

// POST route for creating pharmacy
router.post('/', pharmacyController.createPharmacy);

// Test route to verify router is working
router.get('/test', (req, res) => {
    console.log("✅ Test route accessed");
    res.json({ 
        status: 'success',
        message: 'Pharmacy routes are working!' 
    });
});

module.exports = router;