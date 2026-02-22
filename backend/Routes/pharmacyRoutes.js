const express = require('express');
const router = express.Router();
const pharmacyController = require('../Controllers/pharmacyController');

// Log when routes are accessed
router.use((req, res, next) => {
    console.log(`📨 Pharmacy Route: ${req.method} ${req.url}`);
    next();
});

// 📖 READ ROUTES
// Get all pharmacies with pagination and filters
router.get('/', pharmacyController.getAllPharmacies);

// Search pharmacies
router.get('/search', pharmacyController.searchPharmacies);

// Get pharmacies by district
router.get('/district/:district', pharmacyController.getPharmaciesByDistrict);

// Get single pharmacy by ID (this must come AFTER specific routes)
router.get('/:id', pharmacyController.getPharmacyById);

// Test route
router.get('/test', (req, res) => {
    console.log("✅ Test route accessed");
    res.json({ 
        status: 'success',
        message: 'Pharmacy routes are working!' 
    });
});

// ✏️ CREATE ROUTE
router.post('/', pharmacyController.createPharmacy);

module.exports = router;